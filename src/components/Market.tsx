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
import { TestDrive3D } from "./TestDrive3D";
import { sfx } from "../game/sound";
import { travelCostMultiplier } from "../game/facilities";
import { AuctionBanner } from "./Auction";
import { MarketScene } from "./scenes/TabScenes";

const MOOD_LABELS = { acil: "🔥 Acil satılık", normal: "Satılık", sabirli: "💎 Sahibi acelesiz" };

/**
 * İlan pazarı — mobil oyun tarzı: ilanlar yatay kaydırılan raflarda,
 * karta dokununca ekran içinde kayarak detaya geçilir (modal yok).
 */
export function Market() {
  const { state } = useGame();
  const [openId, setOpenId] = useState<string | null>(null);

  const shelves = useMemo(() => {
    const withKm = state.listings.map((l) => ({
      l,
      km: roadDistance(state.currentCity, l.cityPlate),
    }));
    const sortFn = (a: { km: number; l: Listing }, b: { km: number; l: Listing }) =>
      a.km - b.km || a.l.askingPrice - b.l.askingPrice;
    const here = withKm.filter((x) => x.km === 0).sort(sortFn);
    const near = withKm.filter((x) => x.km > 0 && x.km <= 300).sort(sortFn);
    const far = withKm.filter((x) => x.km > 300).sort(sortFn);
    const hot = withKm.filter((x) => x.l.sellerMood === "acil").sort(sortFn);
    return [
      { key: "hot", title: "🔥 Fırsat rafı — acil satılıklar", items: hot, note: "Sahibi acele ediyor, pazarlık payı yüksek" },
      { key: "here", title: `📍 Bulunduğun il — ${cityByPlate(state.currentCity).name}`, items: here, note: "Hemen inceleyip pazarlığa oturabilirsin" },
      { key: "near", title: "🚗 Yakın iller (≤300 km)", items: near, note: "Kısa yol, düşük masraf" },
      { key: "far", title: "🗺️ Uzak iller", items: far, note: "Uzun yol ama bazen en iyi fiyatlar burada" },
    ];
  }, [state.listings, state.currentCity]);

  const open = openId ? state.listings.find((l) => l.id === openId) ?? null : null;

  if (open) {
    return (
      <div className="subview">
        <button className="small back-btn" onClick={() => setOpenId(null)}>
          ← Raflara Dön
        </button>
        <ListingDetail listing={open} onClose={() => setOpenId(null)} />
      </div>
    );
  }

  return (
    <div className="subview">
      <div className="card" style={{ padding: 8, marginBottom: 12 }}>
        <MarketScene />
      </div>
      <AuctionBanner />
      <div className="row between" style={{ marginBottom: 6 }}>
        <strong>{state.listings.length} ilan · raflarda gezin →</strong>
        <span style={{ fontSize: 12.5, color: "var(--muted)" }}>Her gün yeni ilanlar düşer.</span>
      </div>

      {shelves.map((s) => (
        <div className="shelf" key={s.key}>
          <div className="shelf-head">
            <strong>{s.title}</strong>
            <span>{s.items.length > 0 ? `${s.items.length} araç · ${s.note}` : "boş"}</span>
          </div>
          {s.items.length === 0 ? (
            <div className="shelf-empty">Bu rafta şu an araç yok.</div>
          ) : (
            <div className="shelf-row">
              {s.items.map(({ l, km }) => (
                <ShelfCard key={l.id} listing={l} km={km} onOpen={() => { sfx.click(); setOpenId(l.id); }} />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ShelfCard({ listing, km, onOpen }: { listing: Listing; km: number; onOpen: () => void }) {
  const city = cityByPlate(listing.cityPlate);
  const car = listing.car;
  const moodClass = listing.sellerMood === "acil" ? "red" : listing.sellerMood === "sabirli" ? "blue" : "";
  return (
    <div className="shelf-card" onClick={onOpen} role="button" tabIndex={0}>
      <div className="shelf-car">🚗</div>
      <div className="shelf-title">
        {car.year} {car.brand} {car.model}
      </div>
      <div className="shelf-sub">
        📍 {city.name} {km > 0 ? `· ${km} km` : "· buradasın"}
      </div>
      <div className="row" style={{ gap: 4, marginTop: 4 }}>
        <span className="tag">{Math.round(car.km / 1000)}k km</span>
        <span className={"tag " + moodClass}>{MOOD_LABELS[listing.sellerMood]}</span>
      </div>
      <div className="row" style={{ gap: 4, marginTop: 4 }}>
        {listing.expertised && <span className="tag green">🔍</span>}
        {listing.testDriven && <span className="tag green">🛞</span>}
      </div>
      <div className="shelf-price">{fmtMoney(listing.askingPrice)}</div>
    </div>
  );
}

type Bubble = { who: "me" | "them"; text: string };

function ListingDetail({ listing, onClose }: { listing: Listing; onClose: () => void }) {
  const { state, dispatch } = useGame();
  const car = listing.car;
  const city = cityByPlate(listing.cityPlate);
  const home = cityByPlate(state.homeCity);
  const here = state.currentCity === listing.cityPlate;
  const km = roadDistance(state.currentCity, listing.cityPlate);
  const travelCost = travelCostFor(km, state.level, travelCostMultiplier(state));
  const expCost = expertiseCostFor(state.level);
  const transportKm = roadDistance(listing.cityPlate, state.homeCity);
  const transportCost = Math.round((transportKm * TRANSPORT_COST_PER_KM) / 100) * 100;
  const slotFull = state.inventory.length >= state.gallerySlots;

  const [driving, setDriving] = useState(false);
  const [delivering, setDelivering] = useState<number | null>(null); // anlaşılan fiyat
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

  function buyWithTransport(price: number) {
    if (state.money < price + transportCost || slotFull) return;
    sfx.buy();
    dispatch({ type: "BUY", listingId: listing.id, price, deliver: "nakliye" });
    onClose();
  }

  // ---- 3D sürüşler: test sürüşü ya da eve götürme ----
  if (driving) {
    return (
      <div>
        <h3 style={{ marginTop: 0 }}>🛞 Test Sürüşü — {car.brand} {car.model}</h3>
        <TestDrive3D
          car={car}
          onDone={(found, crashed) => {
            dispatch({ type: "TESTDRIVE_DONE", listingId: listing.id, foundFaultIds: found, crashed });
            setDriving(false);
          }}
        />
      </div>
    );
  }
  if (delivering !== null) {
    return (
      <div>
        <h3 style={{ marginTop: 0 }}>
          🏁 {city.name} → {home.name}: {car.brand} {car.model} ile yoldasınız ({transportKm} km)
        </h3>
        <TestDrive3D
          car={car}
          deliveryKm={transportKm}
          homeName={home.name}
          onDone={(found, crashed, brokeDown) => {
            sfx.buy();
            dispatch({
              type: "BUY",
              listingId: listing.id,
              price: delivering,
              deliver: "sur",
              drive: { crashed, brokeDown, foundFaultIds: found },
            });
            onClose();
          }}
        />
      </div>
    );
  }

  const canPay = (price: number, withTransport: boolean) =>
    state.money >= price + (withTransport ? transportCost : 0) && !slotFull;

  return (
    <div>
      <h2 style={{ margin: "6px 0 4px" }}>
        {car.year} {car.brand} {car.model}
      </h2>
      <div className="sub" style={{ color: "var(--muted)", marginBottom: 10 }}>
        📍 {city.name} · Satıcı: {listing.sellerName} (
        {listing.sellerType === "sahibinden" ? "Sahibinden" : "Galeriden"}) · {MOOD_LABELS[listing.sellerMood]}
      </div>

      <CarSpecs car={car} fullInfo={listing.expertised} declaredHonest={listing.honest} />

      <div className="row between" style={{ margin: "12px 0" }}>
        <span className="price">İstenen: {fmtMoney(listing.askingPrice)}</span>
        {transportKm > 0 && (
          <span style={{ fontSize: 12.5, color: "var(--muted)" }}>
            Nakliye ({transportKm} km): ~{fmtMoney(transportCost)} — ya da kendin sür, bedava
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
              🛞 Test Sürüşü (3D)
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
                    className="success"
                    disabled={state.money < nego.lastCounter || slotFull}
                    onClick={() => {
                      sfx.cash();
                      setAgreed(nego.lastCounter);
                      setChat((c) => [...c, { who: "me", text: `Tamam, ${fmtMoney(nego.lastCounter)} olsun.` }]);
                    }}
                  >
                    {fmtMoney(nego.lastCounter)} kabul et
                  </button>
                </div>
              ) : (
                <div className="card" style={{ borderColor: "var(--green)", marginTop: 8 }}>
                  <strong style={{ color: "var(--green)" }}>
                    🤝 {fmtMoney(agreed)} fiyatta anlaştınız! Aracı galeriye nasıl götürelim?
                  </strong>
                  <div className="deliver-options">
                    {transportKm > 0 ? (
                      <>
                        <button
                          className="deliver-btn"
                          disabled={!canPay(agreed, true)}
                          onClick={() => buyWithTransport(agreed)}
                        >
                          <span className="big">🚚</span>
                          <span className="t">Nakliyeyle Gönder</span>
                          <span className="d">
                            +{fmtMoney(transportCost)} · toplam {fmtMoney(agreed + transportCost)}
                            {transportKm > 250 ? " · yarın gelir" : " · bugün gelir"}
                          </span>
                        </button>
                        <button
                          className="deliver-btn primary"
                          disabled={!canPay(agreed, false)}
                          onClick={() => {
                            sfx.travel();
                            setDelivering(agreed);
                          }}
                        >
                          <span className="big">🚗</span>
                          <span className="t">Kendin Sür (3D)</span>
                          <span className="d">
                            Nakliye bedava · {transportKm} km · ~{travelHours(transportKm)} saat · yolda
                            kalma ve kaza riski sende
                          </span>
                        </button>
                      </>
                    ) : (
                      <button
                        className="deliver-btn primary"
                        disabled={!canPay(agreed, false)}
                        onClick={() => buyWithTransport(agreed)}
                      >
                        <span className="big">💰</span>
                        <span className="t">Satın Al</span>
                        <span className="d">Galeri bu ilde — nakliye gerekmez</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
              {slotFull && (
                <div style={{ color: "var(--red)", fontSize: 13, marginTop: 6 }}>
                  ⚠️ Galerinizde boş yer yok! Önce bir araç satın veya Tesis'ten vitrini büyütün.
                </div>
              )}
              {agreed !== null && state.money < agreed && (
                <div style={{ color: "var(--red)", fontSize: 13, marginTop: 6 }}>
                  ⚠️ Kasanızda yeterli para yok ({fmtMoney(agreed)} gerekiyor).
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
