import { LEGAL_LABELS, STAFF_DEFS } from "../types";
import {
  fmtMoney,
  hasLawyer,
  legalCost,
  LEGAL_SUE_COST,
  SENET_NOTICE_COST,
  SENET_SUE_COST,
  settleCost,
  useGame,
} from "../game/state";
import { sfx } from "../game/sound";

const STATUS_TAG: Record<string, { cls: string; text: string }> = {
  aktif: { cls: "green", text: "Aktif" },
  gecikmis: { cls: "red", text: "Gecikmiş" },
  tamam: { cls: "blue", text: "Tamamlandı" },
  zarar: { cls: "red", text: "Batık" },
};

export function Lawyer() {
  const { state, dispatch } = useGame();
  const lawyer = hasLawyer(state);
  const legalCars = state.inventory.filter((o) => o.legal);
  const open = state.notes.filter((n) => n.status === "aktif" || n.status === "gecikmis");
  const outstanding = open.reduce((s, n) => s + n.remaining, 0);
  const staff = STAFF_DEFS.avukat;

  return (
    <div className="subview">
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="row between">
          <div>
            <h3 style={{ margin: 0 }}>⚖️ Hukuk Bürosu</h3>
            <div className="sub" style={{ marginBottom: 0 }}>
              Haczli/rehinli araçlar, senet tahsilatı ve davalar burada çözülür.
            </div>
          </div>
          {lawyer ? (
            <span className="tag green">{staff.emoji} Kadrolu avukatınız var — ücretler yarıya indi</span>
          ) : (
            <span className="tag yellow">Kadrolu avukat yok — Ofis → Ekip'ten işe alın (haftalık {fmtMoney(staff.weeklySalary)})</span>
          )}
        </div>
      </div>

      <div className="section-title">🚨 Hukuki Sorunlu Araçlar</div>
      {legalCars.length === 0 ? (
        <div className="empty" style={{ padding: 16 }}>
          Çözülmemiş hukuki sorun yok. İlanlarda "⚖️ Hukuki Sorgu" ile haczli/rehinli araçları önceden tespit edebilirsiniz.
        </div>
      ) : (
        <div className="grid" style={{ marginBottom: 14 }}>
          {legalCars.map((o) => {
            const daysLeft = (o.legalDeadline ?? state.day) - state.day;
            const settle = settleCost(state, o);
            const sue = legalCost(state, LEGAL_SUE_COST);
            return (
              <div className="card" key={o.car.id} style={{ borderColor: "var(--red)" }}>
                <h3>
                  {o.car.year} {o.car.brand} {o.car.model}
                </h3>
                <div className="sub" style={{ color: "var(--red)" }}>
                  {LEGAL_LABELS[o.legal!]} · icraya {daysLeft > 0 ? `${daysLeft} gün` : "son gün!"}
                </div>
                <div className="row">
                  <button
                    className="small success"
                    disabled={state.money < settle}
                    onClick={() => {
                      sfx.cash();
                      dispatch({ type: "LEGAL_SETTLE", carId: o.car.id });
                    }}
                  >
                    🤝 Uzlaş ({fmtMoney(settle)}) · kesin çözüm
                  </button>
                  <button
                    className="small"
                    disabled={state.money < sue}
                    onClick={() => dispatch({ type: "LEGAL_SUE", carId: o.car.id })}
                  >
                    ⚖️ Dava Aç ({fmtMoney(sue)}) · %{lawyer ? 85 : 65} kazanma
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="section-title">🧾 Senetler</div>
      <div className="row between" style={{ marginBottom: 8 }}>
        <span style={{ fontSize: 13.5 }}>
          {open.length} açık senet · alacak <strong style={{ color: "var(--accent2)" }}>{fmtMoney(outstanding)}</strong>
        </span>
        <span style={{ fontSize: 12, color: "var(--muted)" }}>Taksitler haftalık, gün sonunda otomatik tahsil edilir.</span>
      </div>
      {state.notes.length === 0 ? (
        <div className="empty" style={{ padding: 16 }}>
          Henüz senetli satış yok. Müşteriyle fiyatta anlaşınca "Senetli" seçeneğiyle taksitli satabilirsiniz — daha yüksek fiyat, ama ödemeyen çıkabilir.
        </div>
      ) : (
        <div className="grid">
          {[...state.notes].reverse().map((n) => {
            const st = STATUS_TAG[n.status];
            const live = n.status === "aktif" || n.status === "gecikmis";
            const notice = legalCost(state, SENET_NOTICE_COST);
            const sue = legalCost(state, SENET_SUE_COST);
            return (
              <div className="card" key={n.id}>
                <div className="row between">
                  <h3 style={{ margin: 0 }}>{n.buyerName}</h3>
                  <span className={`tag ${st.cls}`}>{st.text}</span>
                </div>
                <div className="sub">{n.carLabel}</div>
                <div className="partbar">
                  <div className="track">
                    <div
                      className="fill"
                      style={{ width: `${Math.round(((n.total - n.remaining) / n.total) * 100)}%`, background: "var(--green)" }}
                    />
                  </div>
                  <span className="pct" style={{ width: 80 }}>
                    {n.paidCount}/{n.count}
                  </span>
                </div>
                <div style={{ fontSize: 13, margin: "6px 0" }}>
                  Kalan: <strong>{fmtMoney(n.remaining)}</strong> · taksit {fmtMoney(n.installment)}
                  {live && <span style={{ color: "var(--muted)" }}> · sonraki: gün {n.nextDueDay}</span>}
                </div>
                {live && (
                  <div className="row">
                    {n.status === "gecikmis" && (
                      <button
                        className="small"
                        disabled={state.money < notice}
                        onClick={() => dispatch({ type: "SENET_NOTICE", noteId: n.id })}
                      >
                        📨 İhtar ({fmtMoney(notice)})
                      </button>
                    )}
                    <button
                      className="small danger"
                      disabled={state.money < sue}
                      onClick={() => dispatch({ type: "SENET_SUE", noteId: n.id })}
                    >
                      ⚖️ İcra Takibi ({fmtMoney(sue)})
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
