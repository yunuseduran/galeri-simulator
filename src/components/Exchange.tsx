import { useState } from "react";
import { ASSETS, portfolioValue, type AssetKind } from "../game/exchange";
import { fmtMoney, useGame } from "../game/state";
import { sfx } from "../game/sound";
import { MoneyInput } from "./ui";

const KIND_LABEL: Record<AssetKind, string> = { hisse: "📊 Borsa", kripto: "🪙 Kripto", doviz: "💱 Döviz" };

function Spark({ data, up }: { data: number[]; up: boolean }) {
  const w = 120;
  const h = 36;
  if (data.length < 2) return <svg width={w} height={h} />;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = Math.max(1e-9, max - min);
  const pts = data
    .map((v, i) => `${((i / (data.length - 1)) * w).toFixed(1)},${(h - 3 - ((v - min) / span) * (h - 6)).toFixed(1)}`)
    .join(" ");
  return (
    <svg width={w} height={h} role="img" aria-label="fiyat grafiği">
      <polyline points={pts} fill="none" stroke={up ? "#3ecf8e" : "#ff5c5c"} strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function fmtPrice(n: number): string {
  return n < 100 ? n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " ₺" : fmtMoney(Math.round(n));
}

export function Exchange() {
  const { state, dispatch } = useGame();
  const [kind, setKind] = useState<AssetKind>("hisse");
  const [amounts, setAmounts] = useState<Record<string, number>>({});

  const pv = portfolioValue(state);
  const invested = Object.values(state.exchange.holdings).reduce((s, h) => s + h.cost, 0);
  const pnl = pv - invested;

  return (
    <div className="subview">
      <div className="card" style={{ marginBottom: 12 }}>
        <div className="row between">
          <div>
            <h3 style={{ margin: 0 }}>📈 Piyasalar</h3>
            <div className="sub" style={{ marginBottom: 0 }}>
              Fiyatlar her gün sonunda değişir. Kripto ve hisse riskli — yatırımı kaybedebilirsiniz.
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>PORTFÖY DEĞERİ</div>
            <div style={{ fontSize: 20, fontWeight: 900 }}>{fmtMoney(Math.round(pv))}</div>
            <div style={{ fontSize: 12.5, color: pnl >= 0 ? "var(--green)" : "var(--red)" }}>
              {pnl >= 0 ? "▲" : "▼"} {fmtMoney(Math.round(Math.abs(pnl)))} {invested > 0 ? `(%${((pnl / invested) * 100).toFixed(1)})` : ""}
            </div>
          </div>
        </div>
      </div>

      <div className="row" style={{ gap: 8, marginBottom: 12 }}>
        {(Object.keys(KIND_LABEL) as AssetKind[]).map((k) => (
          <button key={k} className={kind === k ? "primary" : ""} style={{ flex: 1 }} onClick={() => setKind(k)}>
            {KIND_LABEL[k]}
          </button>
        ))}
      </div>

      <div className="grid">
        {ASSETS.filter((a) => a.kind === kind).map((a) => {
          const price = state.exchange.prices[a.key];
          const hist = state.exchange.history[a.key] ?? [price];
          const prev = hist.length > 1 ? hist[hist.length - 2] : price;
          const chg = prev > 0 ? ((price - prev) / prev) * 100 : 0;
          const hold = state.exchange.holdings[a.key];
          const value = hold ? hold.qty * price : 0;
          const hp = hold ? value - hold.cost : 0;
          const amount = amounts[a.key] ?? 50000;
          return (
            <div className="card" key={a.key}>
              <div className="row between">
                <h3 style={{ margin: 0 }}>
                  {a.emoji} {a.name} <span style={{ color: "var(--muted)", fontSize: 12 }}>{a.key}</span>
                </h3>
                <Spark data={hist} up={price >= hist[0]} />
              </div>
              <div className="row between" style={{ margin: "4px 0" }}>
                <span className="price">{fmtPrice(price)}</span>
                <span style={{ color: chg >= 0 ? "var(--green)" : "var(--red)", fontWeight: 700 }}>
                  {chg >= 0 ? "▲" : "▼"} %{Math.abs(chg).toFixed(1)}
                </span>
              </div>
              <div className="sub">{a.desc}</div>
              {hold && (
                <div style={{ fontSize: 13, marginBottom: 6 }}>
                  Elinizde: <strong>{hold.qty}</strong> adet · {fmtMoney(Math.round(value))}{" "}
                  <span style={{ color: hp >= 0 ? "var(--green)" : "var(--red)" }}>
                    ({hp >= 0 ? "+" : "−"}
                    {fmtMoney(Math.round(Math.abs(hp)))})
                  </span>
                </div>
              )}
              <div className="row">
                <MoneyInput
                  value={amount}
                  step={10000}
                  onChange={(n) => setAmounts((m) => ({ ...m, [a.key]: n }))}
                  style={{ width: 130 }}
                  ariaLabel={`${a.name} alım tutarı`}
                />
                <button
                  className="small success"
                  disabled={state.money < amount || amount < 100}
                  onClick={() => {
                    sfx.buy();
                    dispatch({ type: "EX_BUY", key: a.key, amount });
                  }}
                >
                  Al
                </button>
                {hold && (
                  <>
                    <button className="small danger" onClick={() => dispatch({ type: "EX_SELL", key: a.key, fraction: 0.5 })}>
                      %50 Sat
                    </button>
                    <button
                      className="small danger"
                      onClick={() => {
                        sfx.cash();
                        dispatch({ type: "EX_SELL", key: a.key, fraction: 1 });
                      }}
                    >
                      Hepsini Sat
                    </button>
                  </>
                )}
              </div>
              <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 4 }}>
                Komisyon %{(a.fee * 100).toFixed(1)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
