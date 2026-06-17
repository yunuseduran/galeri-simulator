import { fmtMoney, useGame } from "../game/state";

export function Ledger() {
  const { state, dispatch } = useGame();
  const s = state.stats;

  return (
    <div>
      <div className="grid" style={{ marginBottom: 16, gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
        <div className="card">
          <div className="sub">Alınan araç</div>
          <div className="price">{s.carsBought}</div>
        </div>
        <div className="card">
          <div className="sub">Satılan araç</div>
          <div className="price">{s.carsSold}</div>
        </div>
        <div className="card">
          <div className="sub">Toplam kâr/zarar</div>
          <div className="price" style={{ color: s.totalProfit >= 0 ? "var(--green)" : "var(--red)" }}>
            {fmtMoney(s.totalProfit)}
          </div>
        </div>
        <div className="card">
          <div className="sub">En iyi satış kârı</div>
          <div className="price" style={{ color: "var(--green)" }}>{fmtMoney(s.bestFlip)}</div>
        </div>
      </div>

      {state.marketModifiers.length > 0 && (
        <div className="card" style={{ marginBottom: 16 }}>
          <strong>📈 Aktif piyasa durumu</strong>
          {state.marketModifiers.map((m, i) => (
            <div key={i} style={{ fontSize: 13.5, marginTop: 4, color: "var(--accent2)" }}>
              {m.label} (gün {m.untilDay}'e kadar)
            </div>
          ))}
        </div>
      )}

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--border)" }}>
          <strong>📜 İşletme Defteri</strong>
        </div>
        <div style={{ maxHeight: 480, overflowY: "auto" }}>
          {state.log.map((e, i) => (
            <div className="ledger-row" key={i}>
              <span className="day">Gün {e.day}</span>
              <span style={{ color: e.kind === "uyari" ? "var(--red)" : undefined }}>{e.text}</span>
              {e.amount !== undefined && (
                <span className={`amt ${e.amount >= 0 ? "pos" : "neg"}`}>
                  {e.amount >= 0 ? "+" : ""}
                  {fmtMoney(e.amount)}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 24, textAlign: "center" }}>
        <button
          className="danger"
          onClick={() => {
            if (confirm("Tüm ilerleme silinecek ve yeni oyun başlayacak. Emin misiniz?")) {
              dispatch({ type: "RESET" });
            }
          }}
        >
          🗑️ Oyunu Sıfırla
        </button>
      </div>
    </div>
  );
}
