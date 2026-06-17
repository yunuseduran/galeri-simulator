import { STAFF_DEFS, type StaffRole } from "../types";
import { LOAN_OFFERS, MAX_ACTIVE_LOANS, canTakeLoan } from "../game/bank";
import { fmtMoney, useGame } from "../game/state";
import { sfx } from "../game/sound";

export function Office() {
  const { state, dispatch } = useGame();

  return (
    <div>
      <div className="section-title">🏦 Banka</div>
      {state.loans.length > 0 && (
        <div className="grid" style={{ marginBottom: 12 }}>
          {state.loans.map((l) => {
            const paidPct = Math.round(((l.totalDebt - l.remaining) / l.totalDebt) * 100);
            return (
              <div className="card" key={l.id}>
                <h3>{l.name}</h3>
                <div className="sub">
                  Çekilen: {fmtMoney(l.principal)} · Günlük taksit: {fmtMoney(l.dailyPayment)}
                </div>
                <div className="partbar" style={{ marginBottom: 8 }}>
                  <div className="track">
                    <div
                      className="fill"
                      style={{ width: `${paidPct}%`, background: "var(--green)" }}
                    />
                  </div>
                  <span className="pct" style={{ width: 90 }}>
                    %{paidPct} ödendi
                  </span>
                </div>
                <div className="row between">
                  <span style={{ color: "var(--red)", fontWeight: 700 }}>
                    Kalan borç: {fmtMoney(l.remaining)}
                  </span>
                  <button
                    className="small success"
                    disabled={state.money < l.remaining}
                    onClick={() => {
                      sfx.cash();
                      dispatch({ type: "PAYOFF_LOAN", loanId: l.id });
                    }}
                  >
                    Erken Kapat
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="grid">
        {LOAN_OFFERS.map((o) => {
          const err = canTakeLoan(state, o);
          return (
            <div className="card" key={o.key}>
              <h3>{o.name}</h3>
              <div className="sub">
                %{o.interestPct} toplam faiz · {o.termDays} gün vade
                {o.minReputation > 0 ? ` · en az ${o.minReputation} itibar` : ""}
              </div>
              <div className="row between">
                <span className="price">{fmtMoney(o.principal)}</span>
                <button
                  className="primary"
                  disabled={!!err}
                  title={err ?? undefined}
                  onClick={() => {
                    sfx.cash();
                    dispatch({ type: "TAKE_LOAN", offer: o });
                  }}
                >
                  Krediyi Çek
                </button>
              </div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>
                Geri ödeme: {fmtMoney(Math.round((o.principal * (1 + o.interestPct / 100)) / 1000) * 1000)}{" "}
                (günlük otomatik taksit). {err && <span style={{ color: "var(--red)" }}>{err}</span>}
              </div>
            </div>
          );
        })}
      </div>
      <p style={{ fontSize: 12.5, color: "var(--muted)" }}>
        Taksitler her gün sonunda otomatik çekilir. Aynı anda en fazla {MAX_ACTIVE_LOANS} kredi.
        Kasanız eksiye düşerse itibarınız zarar görür!
      </p>

      <div className="section-title">👥 Ekip</div>
      <div className="grid">
        {(Object.keys(STAFF_DEFS) as StaffRole[]).map((role) => {
          const def = STAFF_DEFS[role];
          const hired = state.staff.find((st) => st.role === role);
          return (
            <div className="card" key={role}>
              <h3>
                {def.emoji} {def.label}
              </h3>
              <div className="sub">{def.desc}</div>
              <div className="row between">
                <span className="tag yellow">Haftalık {fmtMoney(def.weeklySalary)}</span>
                {hired ? (
                  <div className="row">
                    <span className="tag green">{hired.name} çalışıyor</span>
                    <button
                      className="small danger"
                      onClick={() => dispatch({ type: "FIRE_STAFF", staffId: hired.id })}
                    >
                      İşten Çıkar
                    </button>
                  </div>
                ) : (
                  <button
                    className="primary"
                    onClick={() => {
                      sfx.click();
                      dispatch({ type: "HIRE_STAFF", role });
                    }}
                  >
                    İşe Al
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <p style={{ fontSize: 12.5, color: "var(--muted)" }}>
        Maaşlar haftalık kira ile birlikte ödenir. Her rolden bir kişi çalıştırabilirsiniz.
      </p>
    </div>
  );
}
