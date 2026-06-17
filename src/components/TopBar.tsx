import { useEffect, useRef, useState } from "react";
import { CITIES, cityByPlate, roadDistance } from "../data/cities";
import { fmtMoney, travelCostFor, travelHours, useGame } from "../game/state";
import { currentUser, logout } from "../game/auth";
import { titleFor, xpNeeded } from "../game/career";
import { isMuted, setMuted, sfx } from "../game/sound";
import { Modal } from "./ui";
import { TurkeyMap } from "./TurkeyMap";

/** Para değişimini yumuşak sayaçla gösterir + uçan delta üretir */
function useMoneyFx(target: number) {
  const [display, setDisplay] = useState(target);
  const [deltas, setDeltas] = useState<{ id: number; amount: number }[]>([]);
  const [flash, setFlash] = useState<"pos" | "neg" | null>(null);
  const prev = useRef(target);
  const idRef = useRef(0);

  useEffect(() => {
    const from = prev.current;
    if (from === target) return;
    prev.current = target;

    const diff = target - from;
    const id = ++idRef.current;
    setDeltas((d) => [...d.slice(-2), { id, amount: diff }]);
    window.setTimeout(() => setDeltas((d) => d.filter((x) => x.id !== id)), 1650);
    setFlash(diff > 0 ? "pos" : "neg");
    window.setTimeout(() => setFlash(null), 750);

    const start = performance.now();
    const dur = 650;
    let raf = 0;
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(from + diff * eased));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  return { display, deltas, flash };
}

export function TopBar() {
  const { state, dispatch } = useGame();
  const [travelOpen, setTravelOpen] = useState(false);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [muted, setMutedState] = useState(isMuted());
  const [selCity, setSelCity] = useState<number | null>(null);

  const city = cityByPlate(state.currentCity);
  const repEmoji =
    state.reputation >= 80 ? "🌟" : state.reputation >= 55 ? "🙂" : state.reputation >= 30 ? "😐" : "😠";
  const moneyFx = useMoneyFx(state.money);

  return (
    <>
      <div className="topbar">
        <span className="brand">🚗 {state.galleryName}</span>
        <div className="stat money-wrap">
          <span className="label">Kasa</span>
          <span
            className={
              "value money" +
              (moneyFx.flash === "pos" ? " money-flash-pos" : moneyFx.flash === "neg" ? " money-flash-neg" : "")
            }
            style={state.money < 0 ? { color: "var(--red)" } : undefined}
          >
            {fmtMoney(moneyFx.display)}
          </span>
          {moneyFx.deltas.map((d) => (
            <span key={d.id} className={`fly-delta ${d.amount >= 0 ? "pos" : "neg"}`}>
              {d.amount >= 0 ? "+" : ""}
              {fmtMoney(d.amount)}
            </span>
          ))}
        </div>
        <div className="stat">
          <span className="label">Gün</span>
          <span className="value">
            {state.day}. gün — {String(state.hour).padStart(2, "0")}:00
          </span>
        </div>
        <div className="stat">
          <span className="label">İtibar</span>
          <span className="value">
            {repEmoji} {state.reputation}/100
          </span>
        </div>
        <div className="stat" title={`"${titleFor(state.level)}" — ${state.xp}/${xpNeeded(state.level)} XP`}>
          <span className="label">Seviye</span>
          <span className="value" style={{ color: "var(--accent2)" }}>
            ⬆️ Lv {state.level}
          </span>
          <div
            style={{
              height: 4,
              background: "var(--bg2)",
              borderRadius: 99,
              overflow: "hidden",
              marginTop: 2,
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${Math.min(100, Math.round((state.xp / xpNeeded(state.level)) * 100))}%`,
                background: "linear-gradient(90deg, var(--accent), var(--accent2))",
                borderRadius: 99,
              }}
            />
          </div>
        </div>
        <div className="stat">
          <span className="label">Galeri</span>
          <span className="value">
            {state.inventory.length}/{state.gallerySlots} araç
          </span>
        </div>
        <div className="stat">
          <span className="label">Konum</span>
          <span className="value">
            📍 {city.name} ({String(city.plate).padStart(2, "0")})
          </span>
        </div>
        <div className="spacer" />
        {state.hour >= 21 && <span className="hour-warn">🌙 Vakit geç oldu</span>}
        <button
          title={muted ? "Sesi aç" : "Sesi kapat"}
          onClick={() => {
            const m = !muted;
            setMuted(m);
            setMutedState(m);
            if (!m) sfx.click();
          }}
        >
          {muted ? "🔇" : "🔊"}
        </button>
        <button onClick={() => setTravelOpen(true)}>🗺️ Seyahat</button>
        <button className="primary" onClick={() => setConfirmEnd(true)}>
          🌙 Günü Bitir
        </button>
        <span className="stat" style={{ marginLeft: 4 }}>
          <span className="label">Oyuncu</span>
          <span className="value">👤 {currentUser()}</span>
        </span>
        <button
          title="Çıkış yap (ilerlemen kayıtlı kalır)"
          onClick={() => {
            logout();
            window.location.reload();
          }}
        >
          🚪 Çıkış
        </button>
      </div>

      {travelOpen && (
        <Modal title="🗺️ Şehirlerarası Seyahat" onClose={() => setTravelOpen(false)} wide>
          <p style={{ color: "var(--muted)", fontSize: 13.5, marginTop: 0 }}>
            İlanları yerinde incelemek, test sürüşü yapmak ve pazarlık etmek için aracın bulunduğu
            ile gitmeniz gerekir. Yol hem zaman hem para harcar. Haritadan bir ile tıklayın.
          </p>
          <TurkeyMap
            currentCity={state.currentCity}
            homeCity={state.homeCity}
            listingCounts={state.listings.reduce(
              (acc, l) => {
                acc[l.cityPlate] = (acc[l.cityPlate] ?? 0) + 1;
                return acc;
              },
              {} as Record<number, number>
            )}
            selected={selCity}
            onSelect={(p) => {
              sfx.click();
              setSelCity(p);
            }}
          />
          {selCity !== null && selCity !== state.currentCity && (() => {
            const c = cityByPlate(selCity);
            const km = roadDistance(state.currentCity, selCity);
            const cost = travelCostFor(km, state.level);
            const count = state.listings.filter((l) => l.cityPlate === selCity).length;
            return (
              <div className="card" style={{ background: "var(--bg2)", margin: "10px 0" }}>
                <div className="row between">
                  <span style={{ fontSize: 14 }}>
                    <strong>{c.name}</strong> — {km} km · ~{travelHours(km)} saat ·{" "}
                    {fmtMoney(cost)} yol masrafı · {count} ilan
                  </span>
                  <button
                    className="primary"
                    disabled={state.money < cost}
                    onClick={() => {
                      sfx.travel();
                      dispatch({ type: "TRAVEL", plate: selCity });
                      setTravelOpen(false);
                    }}
                  >
                    🚗 Yola Çık: {c.name}
                  </button>
                </div>
              </div>
            );
          })()}
          <table className="city-table">
            <thead>
              <tr>
                <th>İl</th>
                <th>Mesafe</th>
                <th>Süre</th>
                <th>Masraf</th>
                <th>İlan</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {CITIES.map((c) => {
                const km = roadDistance(state.currentCity, c.plate);
                const cost = travelCostFor(km, state.level);
                const count = state.listings.filter((l) => l.cityPlate === c.plate).length;
                return { c, km, cost, count };
              })
                .sort((a, b) => a.km - b.km)
                .map(({ c, km, cost, count }) => (
                  <tr key={c.plate}>
                    <td>
                      {c.plate === state.homeCity ? "🏠 " : ""}
                      {c.name} ({String(c.plate).padStart(2, "0")})
                    </td>
                    <td>{km === 0 ? "—" : `${km} km`}</td>
                    <td>{km === 0 ? "—" : `${travelHours(km)} saat`}</td>
                    <td>{km === 0 ? "—" : fmtMoney(cost)}</td>
                    <td>{count > 0 ? <span className="tag yellow">{count} ilan</span> : "-"}</td>
                    <td>
                      {c.plate !== state.currentCity && (
                        <button
                          className="small"
                          disabled={state.money < cost}
                          onClick={() => {
                            sfx.travel();
                            dispatch({ type: "TRAVEL", plate: c.plate });
                            setTravelOpen(false);
                          }}
                        >
                          Git
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          <div className="close-row">
            <button onClick={() => setTravelOpen(false)}>Kapat</button>
          </div>
        </Modal>
      )}

      {confirmEnd && (
        <Modal title="🌙 Günü bitir" onClose={() => setConfirmEnd(false)}>
          <p style={{ fontSize: 14 }}>
            Günü bitirince: atölye işleri ilerler, yeni ilanlar düşer, galeriye yeni müşteriler
            gelir ve piyasada neler olacağı belli olmaz...
          </p>
          {state.day % 7 === 0 && (
            <p style={{ color: "var(--accent2)", fontSize: 13.5 }}>
              ⚠️ Yarın haftalık kira ve giderler ödenecek!
            </p>
          )}
          <div className="row" style={{ justifyContent: "flex-end" }}>
            <button onClick={() => setConfirmEnd(false)}>Vazgeç</button>
            <button
              className="primary"
              onClick={() => {
                sfx.dayEnd();
                dispatch({ type: "END_DAY" });
                setConfirmEnd(false);
              }}
            >
              Günü Bitir →
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
