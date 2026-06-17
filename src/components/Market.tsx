import { useMemo, useState } from "react";
import type { Listing } from "../types";
import { cityByPlate, roadDistance } from "../data/cities";
import {
  expertiseCostFor,
  fmtMoney,
  TRANSPORT_COST_PER_KM,
  travelCostFor,
  travelHours,
  useGame,
} from "../game/state";
import {
  sellerRespond,
  startSellerNego,
  type NegoResult,
  type SellerNegoState,
} from "../game/negotiation";
import { CarSpecs } from "./CarSpecs";
import { Modal } from "./ui";
import { TestDrive } from "./TestDrive";
import { sfx } from "../game/sound";
import { AuctionBanner } from "./Auction";

const MOOD_LABELS = { acil: "🔥 Acil satılık", normal: "Satılık", sabirli: "💎 Sahibi acelesiz" };

export function Market() {
  const { state } = useGame();
  const [onlyHere, setOnlyHere] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  const listings = useMemo(() => {
    let ls = [...state.listings];
    if (onlyHere) ls = ls.filter((l) => l.cityPlate === state.currentCity);
    return ls.sort((a, b) => {
      const da = roadDistance(state.currentCity, a.cityPlate);
      const db = roadDistance(state.currentCity, b.cityPlate);
      return da - db || a.askingPrice - b.askingPrice;
    });
  }, [state.listings, onlyHere, state.currentCity]);

  const open = openId ? state.listings.find((l) => l.id === openId) ?? null : null;

  return (
    <div>
      <AuctionBanner />
      <div className="row between" style={{ marginBottom: 12 }}>
        <div className="row">
          <strong>{listings.length} ilan</strong>
          <label className="row" style={{ fontSize: 13.5, color: "var(--muted)", gap: 5 }}>
            <input
              type="checkbox"
              checked={onlyHere}
              onChange={(e) => setOnlyHere(e.target.checked)}
            />
            Sadece bulunduğum il ({cityByPlate(state.currentCity).name})
          </label>
        </div>
        <span style={{ fontSize: 12.5, color: "var(--muted)" }}>
          Her gün yeni ilanlar düşer, eskiler satılır gider.
        </span>
      </div>

      <div className="grid">
        {listings.map((l) => (
          <ListingCard key={l.id} listing={l} onOpen={() => setOpenId(l.id)} />
        ))}
      </div>
      {listings.length === 0 && (
        <div className="empty">Bu filtreyle ilan yok. Yarın yeni ilanlar düşecek.</div>
      )}

      {open && <ListingModal listing={open} onClose={() => setOpenId(null)} />}
    </div>
  );
}

function ListingCard({ listing, onOpen }: { listing: Listing; onOpen: () => void }) {
  const { state } = useGame();
  const city = cityByPlate(listing.cityPlate);
  const km = roadDistance(state.currentCity, listing.cityPlate);
  const car = listing.car;
  return (
    <div className="card">
      <div className="row between">
        <h3>
          {car.year} {car.brand} {car.model}
        </h3>
      </div>
      <div className="sub">
        📍 {city.name} {km > 0 ? `(${km} km uzakta)` : "(buradasınız)"} · {listing.sellerName} ·{" "}
        {listing.sellerType === "sahibinden" ? "Sahibinden" : "Galeriden"}
      </div>
      <div className="row" style={{ marginBottom: 8 }}>
        <span className="tag">{car.km.toLocaleString("tr-TR")} km</span>
        <span className="tag">{car.color}</span>
        <span
          className={
            "tag " + (listing.sellerMood === "acil" ? "red" : listing.sellerMood === "sabirli" ? "blue" : "")
          }
        >
          {MOOD_LABELS[listing.sellerMood]}
        </span>
        {listing.expertised && <span className="tag green">🔍 Ekspertizli</span>}
        {listing.testDriven && <span className="tag green">🛞 Sürüldü</span>}
      </div>
      <div className="row between">
        <span className="price">{fmtMoney(listing.askingPrice)}</span>
        <button onClick={onOpen}>İncele →</button>
      </div>
    </div>
  );
}

type Bubble = { who: "me" | "them"; text: string };

function ListingModal({ listing, onClose }: { listing: Listing; onClose: () => void }) {
  const { state, dispatch } = useGame();
  const car = listing.car;
  const city = cityByPlate(listing.cityPlate);
  const here = state.currentCity === listing.cityPlate;
  const km = roadDistance(state.currentCity, listing.cityPlate);
  const travelCost = travelCostFor(km, state.level);
  const expCost = expertiseCostFor(state.level);
  const transportKm = roadDistance(listing.cityPlate, state.homeCity);
  const transportCost = Math.round((transportKm * TRANSPORT_COST_PER_KM) / 100) * 100;
  const slotFull = state.inventory.length >= state.gallerySlots;

  const [driving, setDriving] = useState(false);
  const [nego, setNego] = useState<SellerNegoState | null>(null);
  const [chat, setChat] = useState<Bubble[]>([]);
  const [offer, setOffer] = useState(listing.askingPrice);
  const [agreed, setAgreed] = useState<number | null>(null);
  const [dead, setDead] = useState(listing.negotiationDead);

  function startNego() {
    setNego(startSellerNego(listing));
    setChat([
      {
        who: "them",
        text: `Hoş geldin! ${car.year} model ${car.brand} ${car.model}. İsteğim ${fmtMoney(listing.askingPrice)}. ${listing.sellerMood === "acil" ? "Acil ihtiyaçtan satıyorum, ona göre konuşalım." : listing.sellerMood === "sabirli" ? "Acelem yok, değerini bilen alsın." : "Pazarlık payı az da olsa var."}`,
      },
    ]);
    setOffer(Math.round((listing.askingPrice * 0.9) / 1000) * 1000);
  }

  function makeOffer() {
    if (!nego || agreed !== null || dead) return;
    sfx.click();
    const myOffer = Math.max(0, Math.round(offer));
    setChat((c) => [...c, { who: "me", text: `Teklifim: ${fmtMoney(myOffer)}` }]);
    const { result, state: ns } = sellerRespond(listing, nego, myOffer);
    setNego(ns);
    handleResult(result);
  }

  function handleResult(r: NegoResult) {
    if (r.type === "accept") {
      sfx.cash();
      setChat((c) => [...c, { who: "them", text: `${r.message} (${fmtMoney(r.price)})` }]);
      setAgreed(r.price);
    } else if (r.type === "counter") {
      setChat((c) => [...c, { who: "them", text: `${r.message} ${fmtMoney(r.price)}` }]);
      setOffer(Math.round((r.price * 0.95) / 1000) * 1000);
    } else if (r.type === "reject") {
      setChat((c) => [...c, { who: "them", text: r.message }]);
    } else {
      sfx.error();
      setChat((c) => [...c, { who: "them", text: r.message }]);
      setDead(true);
      dispatch({ type: "SELLER_WALKAWAY", listingId: listing.id });
    }
  }

  function acceptAsking(price: number) {
    if (state.money < price + transportCost || slotFull) return;
    sfx.buy();
    dispatch({ type: "BUY", listingId: listing.id, price });
    onClose();
  }

  if (driving) {
    return (
      <Modal title={`🛞 Test Sürüşü — ${car.brand} ${car.model}`} onClose={() => {}} wide>
        <TestDrive
          car={car}
          onDone={(found, crashed) => {
            dispatch({
              type: "TESTDRIVE_DONE",
              listingId: listing.id,
              foundFaultIds: found,
              crashed,
            });
            setDriving(false);
          }}
        />
      </Modal>
    );
  }

  return (
    <Modal title={`${car.year} ${car.brand} ${car.model}`} onClose={onClose} wide>
      <div className="sub" style={{ color: "var(--muted)", marginBottom: 10 }}>
        📍 {city.name} · Satıcı: {listing.sellerName} (
        {listing.sellerType === "sahibinden" ? "Sahibinden" : "Galeriden"}) ·{" "}
        {MOOD_LABELS[listing.sellerMood]}
      </div>

      <CarSpecs car={car} fullInfo={listing.expertised} declaredHonest={listing.honest} />

      <div className="row between" style={{ margin: "12px 0" }}>
        <span className="price">İstenen: {fmtMoney(listing.askingPrice)}</span>
        {transportKm > 0 && (
          <span style={{ fontSize: 12.5, color: "var(--muted)" }}>
            + Nakliye ({transportKm} km): ~{fmtMoney(transportCost)}
          </span>
        )}
      </div>

      {!here && (
        <div className="card" style={{ background: "var(--bg2)", marginBottom: 10 }}>
          <div className="row between">
            <span style={{ fontSize: 13.5 }}>
              Aracı incelemek, sürmek ve pazarlık etmek için <strong>{city.name}</strong> iline
              gitmelisiniz. ({km} km, ~{travelHours(km)} saat, {fmtMoney(travelCost)})
            </span>
            <button
              className="primary"
              disabled={state.money < travelCost}
              onClick={() => dispatch({ type: "TRAVEL", plate: listing.cityPlate })}
            >
              🚗 Yola Çık: {city.name}
            </button>
          </div>
        </div>
      )}

      {here && (
        <>
          <div className="row" style={{ marginBottom: 10 }}>
            <button
              disabled={listing.expertised || state.money < expCost}
              onClick={() => dispatch({ type: "EXPERTISE", listingId: listing.id })}
            >
              🔍 Ekspertiz ({fmtMoney(expCost)}, 1 saat)
            </button>
            <button disabled={dead} onClick={() => setDriving(true)}>
              🛞 Test Sürüşü (3 dk)
            </button>
            {!nego && !dead && (
              <button className="primary" onClick={startNego}>
                💬 Pazarlığa Otur
              </button>
            )}
          </div>

          {dead && (
            <div className="card" style={{ borderColor: "var(--red)", marginBottom: 10 }}>
              😤 Satıcı sizinle pazarlığı kesti. Bu araç artık size satılmaz.
            </div>
          )}

          {nego && !dead && (
            <>
              <div className="chat">
                {chat.map((b, i) => (
                  <div key={i} className={`bubble ${b.who}`}>
                    {b.text}
                  </div>
                ))}
              </div>

              {agreed === null ? (
                <div className="row">
                  <input
                    type="number"
                    step={1000}
                    value={offer}
                    onChange={(e) => setOffer(Number(e.target.value))}
                    style={{ width: 150 }}
                  />
                  <button className="primary" onClick={makeOffer}>
                    Teklif Ver
                  </button>
                  <button
                    onClick={() => {
                      const last = [...chat].reverse().find((b) => b.who === "them");
                      void last;
                      acceptAsking(nego.lastCounter);
                    }}
                    disabled={state.money < nego.lastCounter + transportCost || slotFull}
                    className="success"
                  >
                    {fmtMoney(nego.lastCounter)} kabul et, satın al
                  </button>
                </div>
              ) : (
                <div className="row between">
                  <strong style={{ color: "var(--green)" }}>
                    🤝 {fmtMoney(agreed)} fiyatta anlaştınız!
                  </strong>
                  <button
                    className="primary"
                    disabled={state.money < agreed + transportCost || slotFull}
                    onClick={() => acceptAsking(agreed)}
                  >
                    💰 Satın Al ({fmtMoney(agreed + transportCost)})
                  </button>
                </div>
              )}
              {slotFull && (
                <div style={{ color: "var(--red)", fontSize: 13, marginTop: 6 }}>
                  ⚠️ Galerinizde boş yer yok! Önce bir araç satın veya galeriyi büyütün.
                </div>
              )}
              {agreed !== null && state.money < agreed + transportCost && (
                <div style={{ color: "var(--red)", fontSize: 13, marginTop: 6 }}>
                  ⚠️ Kasanızda yeterli para yok (nakliye dahil {fmtMoney(agreed + transportCost)}{" "}
                  gerekiyor).
                </div>
              )}
            </>
          )}
        </>
      )}

      <div className="close-row">
        <button onClick={onClose}>Kapat</button>
      </div>
    </Modal>
  );
}
