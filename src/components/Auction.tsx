import { useEffect, useRef, useState } from "react";
import type { Car } from "../types";
import { cityByPlate, roadDistance } from "../data/cities";
import { aiResponse, makeBidders, type AiBidder } from "../game/auction";
import {
  auctionTransportFor,
  fmtMoney,
  travelCostFor,
  travelHours,
  useGame,
} from "../game/state";
import { sfx } from "../game/sound";
import { CarSpecs } from "./CarSpecs";
import { Modal } from "./ui";

/** İlanlar sekmesinin üstünde görünen mezat duyurusu */
export function AuctionBanner() {
  const { state, dispatch } = useGame();
  const [open, setOpen] = useState(false);
  const a = state.auction;
  if (!a) return null;

  const city = cityByPlate(a.cityPlate);
  const remaining = a.cars.filter((c) => !a.resolved.includes(c.id)).length;

  if (a.day === state.day + 1) {
    return (
      <div className="card" style={{ marginBottom: 12, borderColor: "var(--accent)" }}>
        🔨 <strong>Mezat duyurusu:</strong> Yarın <strong>{city.name}</strong>'de banka mezadı var!{" "}
        {a.cars.length} araç açık artırmayla satılacak. Ekspertiz yok, test sürüşü yok — ucuz ama
        riskli!
      </div>
    );
  }

  if (a.day !== state.day || remaining === 0) return null;

  const here = state.currentCity === a.cityPlate;
  const km = roadDistance(state.currentCity, a.cityPlate);
  const cost = travelCostFor(km, state.level);

  return (
    <>
      <div className="card" style={{ marginBottom: 12, borderColor: "var(--accent)" }}>
        <div className="row between">
          <span>
            🔨 <strong>BUGÜN {city.name}'de mezat!</strong> {remaining} araç kaldı.
          </span>
          {here ? (
            <button
              className="primary"
              onClick={() => {
                sfx.gavel();
                setOpen(true);
              }}
            >
              Mezat Salonuna Gir
            </button>
          ) : (
            <button
              className="primary"
              disabled={state.money < cost}
              onClick={() => {
                sfx.travel();
                dispatch({ type: "TRAVEL", plate: a.cityPlate });
              }}
            >
              🚗 Mezata Git: {city.name} ({km} km, ~{travelHours(km)} saat, {fmtMoney(cost)})
            </button>
          )}
        </div>
      </div>
      {open && here && <AuctionModal onClose={() => setOpen(false)} />}
    </>
  );
}

function AuctionModal({ onClose }: { onClose: () => void }) {
  const { state } = useGame();
  const a = state.auction;
  const [activeCarId, setActiveCarId] = useState<string | null>(null);

  if (!a) return null;
  const remaining = a.cars.filter((c) => !a.resolved.includes(c.id));
  const activeCar = activeCarId ? a.cars.find((c) => c.id === activeCarId) : null;
  const activeIdx = activeCar ? a.cars.indexOf(activeCar) : -1;

  return (
    <Modal title={`🔨 ${cityByPlate(a.cityPlate).name} Banka Mezadı`} onClose={onClose} wide>
      {!activeCar && (
        <>
          <p style={{ color: "var(--muted)", fontSize: 13.5, marginTop: 0 }}>
            Araçlar olduğu gibi satılır: ekspertiz ve test sürüşü yoktur. Açılış fiyatları piyasanın
            çok altında — ama rakip galericiler de burada ve araçların gizli sorunları olabilir.
          </p>
          {remaining.length === 0 && (
            <div className="empty">Mezat bitti — tüm araçlar satıldı.</div>
          )}
          <div className="grid">
            {remaining.map((car) => {
              const idx = a.cars.indexOf(car);
              return (
                <div className="card" key={car.id}>
                  <h3>
                    {car.year} {car.brand} {car.model}
                  </h3>
                  <div className="row" style={{ marginBottom: 8 }}>
                    <span className="tag">{car.km.toLocaleString("tr-TR")} km</span>
                    <span className="tag">{car.color}</span>
                    {car.tramer > 0 && (
                      <span className="tag red">Tramer: {fmtMoney(car.tramer)}</span>
                    )}
                  </div>
                  <div className="row between">
                    <span className="price">Açılış: {fmtMoney(a.startPrices[idx])}</span>
                    <button
                      className="primary"
                      onClick={() => {
                        sfx.gavel();
                        setActiveCarId(car.id);
                      }}
                    >
                      Açık Artırmaya Gir
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="close-row">
            <button onClick={onClose}>Salondan Çık</button>
          </div>
        </>
      )}

      {activeCar && (
        <BiddingRoom
          car={activeCar}
          startPrice={a.startPrices[activeIdx]}
          cityPlate={a.cityPlate}
          onExit={() => setActiveCarId(null)}
        />
      )}
    </Modal>
  );
}

type BidLine = { who: string; amount: number };

function BiddingRoom({
  car,
  startPrice,
  cityPlate,
  onExit,
}: {
  car: Car;
  startPrice: number;
  cityPlate: number;
  onExit: () => void;
}) {
  const { state, dispatch } = useGame();
  const biddersRef = useRef<AiBidder[]>([]);
  if (biddersRef.current.length === 0) biddersRef.current = makeBidders(car);

  const [currentBid, setCurrentBid] = useState(startPrice);
  const [leader, setLeader] = useState<string | null>(null); // null=açılış, "SİZ" veya rakip adı
  const [lines, setLines] = useState<BidLine[]>([]);
  const [status, setStatus] = useState<"open" | "thinking" | "going" | "won" | "lost">("open");
  const timerRef = useRef<number[]>([]);

  useEffect(() => {
    return () => timerRef.current.forEach((t) => clearTimeout(t));
  }, []);

  const inc = currentBid < 200000 ? 5000 : currentBid < 1000000 ? 10000 : 25000;
  const km = roadDistance(cityPlate, state.homeCity);
  const transport = auctionTransportFor(km, state.level);
  const myNextBid = leader === null ? currentBid : currentBid + inc;
  const slotFull = state.inventory.length >= state.gallerySlots;
  const cantAfford = state.money < myNextBid + transport;

  function schedule(fn: () => void, ms: number) {
    timerRef.current.push(window.setTimeout(fn, ms));
  }

  function placeBid() {
    if (status !== "open" || slotFull || cantAfford) return;
    sfx.bid();
    const my = myNextBid;
    setCurrentBid(my);
    setLeader("SİZ");
    setLines((l) => [...l, { who: "SİZ", amount: my }]);
    setStatus("thinking");
    schedule(() => {
      const resp = aiResponse(biddersRef.current, my);
      if (resp) {
        sfx.bid();
        setCurrentBid(resp.bid);
        setLeader(resp.name);
        setLines((l) => [...l, { who: resp.name, amount: resp.bid }]);
        setStatus("open");
      } else {
        setStatus("going");
        schedule(() => {
          sfx.gavel();
          setStatus("won");
          dispatch({ type: "AUCTION_BUY", carId: car.id, price: my });
        }, 1700);
      }
    }, 700 + Math.random() * 900);
  }

  function pass() {
    if (status === "won" || status === "lost") return;
    timerRef.current.forEach((t) => clearTimeout(t));
    setStatus("lost");
    dispatch({ type: "AUCTION_PASS", carId: car.id });
  }

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>
        🔨 {car.year} {car.brand} {car.model}
      </h2>
      <CarSpecs car={car} fullInfo={false} declaredHonest={true} />
      <div style={{ fontSize: 12.5, color: "var(--accent2)", margin: "8px 0" }}>
        ⚠️ Mezat malı: parça durumu ve gizli arızalar bilinmiyor, iade yok!
      </div>

      <div className="chat" style={{ maxHeight: 180 }}>
        <div className="bubble them">
          Açılış fiyatı {fmtMoney(startPrice)}! Artıran var mı? ({biddersRef.current.length} rakip
          galerici salonda)
        </div>
        {lines.map((l, i) => (
          <div key={i} className={`bubble ${l.who === "SİZ" ? "me" : "them"}`}>
            {l.who === "SİZ" ? "Benden" : l.who} — {fmtMoney(l.amount)}
          </div>
        ))}
        {status === "going" && (
          <div className="bubble them">
            Satıyorum... satıyorum... <strong>SİZE SATTIM!</strong> 🔨
          </div>
        )}
        {status === "won" && (
          <div className="bubble them">Hayırlı olsun! Araç sizindir. 🎉</div>
        )}
        {status === "lost" && leader && leader !== "SİZ" && (
          <div className="bubble them">{leader} kazandı. Bir dahaki sefere!</div>
        )}
      </div>

      <div className="row between">
        <div>
          <div style={{ fontSize: 12.5, color: "var(--muted)" }}>Güncel teklif</div>
          <span className="price">{fmtMoney(currentBid)}</span>{" "}
          <span style={{ fontSize: 13, color: leader === "SİZ" ? "var(--green)" : "var(--red)" }}>
            {leader === null ? "(açılış)" : leader === "SİZ" ? "— sizde" : `— ${leader}'de`}
          </span>
        </div>
        {(status === "open" || status === "thinking") && (
          <div className="row">
            <button
              className="primary"
              disabled={status !== "open" || leader === "SİZ" || slotFull || cantAfford}
              onClick={placeBid}
            >
              {status === "thinking" ? "Rakipler düşünüyor..." : `Teklif Ver: ${fmtMoney(myNextBid)}`}
            </button>
            <button className="danger" disabled={leader === "SİZ"} onClick={pass}>
              Pas Geç
            </button>
          </div>
        )}
        {(status === "won" || status === "lost") && (
          <button className="primary" onClick={onExit}>
            Diğer Araçlara Dön
          </button>
        )}
      </div>
      {slotFull && (
        <div style={{ color: "var(--red)", fontSize: 13, marginTop: 6 }}>
          ⚠️ Galerinizde boş yer yok — teklif veremezsiniz.
        </div>
      )}
      {!slotFull && cantAfford && (
        <div style={{ color: "var(--red)", fontSize: 13, marginTop: 6 }}>
          ⚠️ Bir sonraki teklif + nakliye ({fmtMoney(transport)}) için kasanız yetersiz.
        </div>
      )}
      {transport > 0 && !cantAfford && (
        <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>
          Kazanırsanız eve nakliye: +{fmtMoney(transport)}
        </div>
      )}
    </div>
  );
}
