import { useState } from "react";
import type { OwnedCar } from "../types";
import { fmtMoney, useGame } from "../game/state";
import { carValue, perceivedValue } from "../game/valuation";
import { CarSpecs } from "./CarSpecs";
import { Modal } from "./ui";

export function Showroom() {
  const { state, dispatch } = useGame();
  const [detailId, setDetailId] = useState<string | null>(null);
  const [wholesaleId, setWholesaleId] = useState<string | null>(null);

  const detail = detailId ? state.inventory.find((o) => o.car.id === detailId) : null;
  const wholesale = wholesaleId ? state.inventory.find((o) => o.car.id === wholesaleId) : null;

  const upgradeCost =
    state.gallerySlots === 4 ? 300000 : state.gallerySlots === 6 ? 600000 : state.gallerySlots === 8 ? 1200000 : null;

  return (
    <div>
      <div className="row between" style={{ marginBottom: 12 }}>
        <strong>
          Vitrin: {state.inventory.length}/{state.gallerySlots} araç
        </strong>
        {upgradeCost && (
          <button
            disabled={state.money < upgradeCost}
            onClick={() => dispatch({ type: "UPGRADE_SLOTS" })}
          >
            🏗️ Galeriyi Büyüt ({fmtMoney(upgradeCost)})
          </button>
        )}
      </div>

      {state.inventory.length === 0 && (
        <div className="empty">
          Vitrin bomboş... 🛒 İlanlar sekmesinden Türkiye'nin dört bir yanındaki araçlara göz atın,
          beğendiğiniz ile gidip pazarlık edin!
        </div>
      )}

      <div className="grid">
        {state.inventory.map((o) => (
          <OwnedCard
            key={o.car.id}
            owned={o}
            onDetail={() => setDetailId(o.car.id)}
            onWholesale={() => setWholesaleId(o.car.id)}
          />
        ))}
      </div>

      {detail && (
        <Modal
          title={`${detail.car.year} ${detail.car.brand} ${detail.car.model}`}
          onClose={() => setDetailId(null)}
          wide
        >
          <CarSpecs car={detail.car} fullInfo />
          <div className="card" style={{ background: "var(--bg2)", marginTop: 10 }}>
            <div className="row between" style={{ fontSize: 13.5 }}>
              <span>Alış: {fmtMoney(detail.boughtPrice)}</span>
              <span>Toplam maliyet: {fmtMoney(detail.totalSpent)}</span>
              <span>
                Piyasa değeri (alıcı gözünden):{" "}
                <strong style={{ color: "var(--accent2)" }}>
                  {fmtMoney(perceivedValue(detail.car, state.marketModifiers, state.day))}
                </strong>
              </span>
            </div>
          </div>
          <div className="close-row">
            <button onClick={() => setDetailId(null)}>Kapat</button>
          </div>
        </Modal>
      )}

      {wholesale && (
        <Modal title="🚛 Toptancıya Sat" onClose={() => setWholesaleId(null)}>
          <p style={{ fontSize: 14 }}>
            Toptancı aracı <strong>hemen, nakit</strong> alır ama gerçek değerinin ~%78'ini öder
            (gizli kusurlar dahil her şeyi görür, kandıramazsınız).
          </p>
          <p className="price">
            Teklif:{" "}
            {fmtMoney(
              Math.round((carValue(wholesale.car, state.marketModifiers, state.day) * 0.78) / 1000) * 1000
            )}
          </p>
          <div className="row" style={{ justifyContent: "flex-end" }}>
            <button onClick={() => setWholesaleId(null)}>Vazgeç</button>
            <button
              className="danger"
              onClick={() => {
                dispatch({ type: "WHOLESALE", carId: wholesale.car.id });
                setWholesaleId(null);
              }}
            >
              Toptancıya Ver
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function OwnedCard({
  owned,
  onDetail,
  onWholesale,
}: {
  owned: OwnedCar;
  onDetail: () => void;
  onWholesale: () => void;
}) {
  const { state, dispatch } = useGame();
  const car = owned.car;
  const pv = perceivedValue(car, state.marketModifiers, state.day);
  const interested = state.customers.filter((c) => c.carId === car.id).length;
  const inTransit = owned.inTransitUntilDay && owned.inTransitUntilDay > state.day;
  const [price, setPrice] = useState(owned.askingPrice);

  return (
    <div className="card">
      <h3>
        {car.year} {car.brand} {car.model}
      </h3>
      <div className="sub">
        Alış: {fmtMoney(owned.boughtPrice)} · Maliyet: {fmtMoney(owned.totalSpent)}
      </div>
      <div className="row" style={{ marginBottom: 8 }}>
        <span className="tag">{car.km.toLocaleString("tr-TR")} km</span>
        <span className="tag yellow">Değer: {fmtMoney(pv)}</span>
        {inTransit && <span className="tag blue">🚚 Nakliyede (yarın gelir)</span>}
        {car.knownFaults.length > 0 && (
          <span className="tag red">⚠️ {car.knownFaults.length} arıza</span>
        )}
        {car.hiddenFaults.length === 0 && car.knownFaults.length === 0 && (
          <span className="tag green">Sorunsuz görünüyor</span>
        )}
        {interested > 0 && <span className="tag green">👥 {interested} ilgili müşteri</span>}
      </div>
      <div className="row" style={{ marginBottom: 8 }}>
        <span style={{ fontSize: 12.5, color: "var(--muted)" }}>Etiket fiyatı:</span>
        <input
          type="number"
          step={5000}
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          style={{ width: 130, padding: "4px 8px", fontSize: 13 }}
        />
        <button
          className="small"
          disabled={price === owned.askingPrice}
          onClick={() => dispatch({ type: "SET_ASKING", carId: car.id, price })}
        >
          Güncelle
        </button>
      </div>
      <div className="row">
        <button className="small" onClick={onDetail}>
          📋 Detay
        </button>
        <button className="small danger" onClick={onWholesale} disabled={!!inTransit}>
          🚛 Toptancıya Sat
        </button>
      </div>
    </div>
  );
}
