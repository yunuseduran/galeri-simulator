import { carValue } from "../game/valuation";
import { EXPORT_COMMISSION, EXPORT_INSPECTION_FEE } from "../game/exchange";
import { fmtMoney, useGame } from "../game/state";
import { SEGMENT_LABELS, isAvailable, type ExportOffer, type OwnedCar } from "../types";
import { sfx } from "../game/sound";

function eligible(o: OwnedCar, offer: ExportOffer, day: number): string | null {
  if (!isAvailable(o, day)) return "kirada/yolda";
  if (o.legal) return "hukuki sorunlu";
  if (o.car.segment !== offer.segment) return "segment uymuyor";
  if (o.car.year < offer.minYear) return `model ${offer.minYear}'den eski`;
  if (o.car.km > offer.maxKm) return "km fazla";
  if (o.car.knownFaults.length > 0) return "bilinen arızası var";
  return null;
}

export function ExportOffice() {
  const { state, dispatch } = useGame();

  return (
    <div className="subview">
      <div className="card" style={{ marginBottom: 12 }}>
        <h3 style={{ margin: 0 }}>🚢 İhracat Ofisi</h3>
        <div className="sub" style={{ marginBottom: 0 }}>
          Yurt dışı alıcılar piyasanın <strong>%10–30 üstünde</strong> öder (komisyon %{EXPORT_COMMISSION * 100}). Şartlara
          uyan, bilinen arızası olmayan aracı seçin. Dikkat: alıcının ekspertizi gizli arızayı bulursa ihracat reddedilir ve{" "}
          {fmtMoney(EXPORT_INSPECTION_FEE)} ekspertiz ücreti kaybedilir — önce ekspertizle/tamirle temizleyin.
        </div>
      </div>

      {state.exports.length === 0 && <div className="empty">Şu an ihracat talebi yok — yarın yenileri gelir.</div>}

      <div className="grid">
        {state.exports.map((offer) => {
          const matches = state.inventory.map((o) => ({ o, why: eligible(o, offer, state.day) }));
          const ok = matches.filter((m) => !m.why);
          return (
            <div className="card" key={offer.id}>
              <h3>
                {offer.flag} {offer.country} alıcısı
              </h3>
              <div className="row" style={{ marginBottom: 6 }}>
                <span className="tag blue">{SEGMENT_LABELS[offer.segment]}</span>
                <span className="tag">{offer.minYear}+ model</span>
                <span className="tag">≤ {offer.maxKm.toLocaleString("tr-TR")} km</span>
                <span className="tag green">+%{Math.round((offer.premium - 1) * 100)} prim</span>
                <span className="tag yellow">gün {offer.expiresDay}'e kadar</span>
              </div>
              {ok.length === 0 ? (
                <div style={{ fontSize: 13, color: "var(--muted)" }}>
                  Vitrinizde uyan araç yok.
                  {matches.length > 0 && (
                    <div style={{ fontSize: 12, marginTop: 4 }}>
                      {matches.slice(0, 3).map((m) => (
                        <div key={m.o.car.id}>
                          · {m.o.car.brand} {m.o.car.model}: {m.why}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                ok.map(({ o }) => {
                  const gross = Math.round((carValue(o.car, state.marketModifiers, state.day) * offer.premium) / 1000) * 1000;
                  const net = Math.round(gross * (1 - EXPORT_COMMISSION));
                  return (
                    <div className="row between" key={o.car.id} style={{ marginBottom: 4 }}>
                      <span style={{ fontSize: 13 }}>
                        {o.car.year} {o.car.brand} {o.car.model} →{" "}
                        <strong style={{ color: "var(--accent2)" }}>{fmtMoney(net)}</strong>
                      </span>
                      <button
                        className="small primary"
                        onClick={() => {
                          sfx.cash();
                          dispatch({ type: "EXPORT_SELL", offerId: offer.id, carId: o.car.id });
                        }}
                      >
                        🚢 İhraç Et
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
