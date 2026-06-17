import {
  ACHIEVEMENTS,
  PERKS,
  levelReward,
  romanTier,
  thresholdFor,
  tierReward,
  titleFor,
  xpNeeded,
} from "../game/career";
import { fmtMoney, useGame } from "../game/state";

export function Career() {
  const { state } = useGame();
  const need = xpNeeded(state.level);
  const pct = Math.min(100, Math.round((state.xp / need) * 100));

  return (
    <div>
      {/* Seviye kartı */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="row between" style={{ alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>KARİYER</div>
            <div style={{ fontSize: 30, fontWeight: 900, color: "var(--accent)" }}>
              Seviye {state.level}
            </div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>"{titleFor(state.level)}"</div>
          </div>
          <div style={{ textAlign: "right", fontSize: 13, color: "var(--muted)" }}>
            Sonraki seviye ödülü
            <div style={{ color: "var(--green)", fontWeight: 800, fontSize: 17 }}>
              {fmtMoney(levelReward(state.level + 1))}
            </div>
            + itibar {PERKS.some((p) => p.level === state.level + 1) ? "+ YENİ AYRICALIK 🔓" : ""}
          </div>
        </div>
        <div className="partbar" style={{ marginTop: 10 }}>
          <div className="track" style={{ height: 14 }}>
            <div
              className="fill"
              style={{
                width: `${pct}%`,
                background: "linear-gradient(90deg, var(--accent), var(--accent2))",
              }}
            />
          </div>
          <span className="pct" style={{ width: 130 }}>
            {state.xp.toLocaleString("tr-TR")} / {need.toLocaleString("tr-TR")} XP
          </span>
        </div>
        <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 6 }}>
          XP kazandıran her şey: araç alımı (+40), satış (+60 ve kâra göre bonus), mezat kazanma
          (+60), atölye işleri (+15), test sürüşü (+10), seyahat, ekspertiz, kredi kapatma...
          Seviyeler sonsuzdur, her seviye daha büyük ödül verir.
        </div>
      </div>

      {/* Ayrıcalıklar */}
      <div className="section-title">🔓 Ayrıcalıklar</div>
      <div className="grid" style={{ marginBottom: 16 }}>
        {PERKS.map((p) => {
          const unlocked = state.level >= p.level;
          return (
            <div
              className="card"
              key={p.level}
              style={unlocked ? { borderColor: "var(--green)" } : { opacity: 0.65 }}
            >
              <div className="row between">
                <strong>
                  {p.emoji} Seviye {p.level}
                </strong>
                {unlocked ? (
                  <span className="tag green">✓ Açık</span>
                ) : (
                  <span className="tag">🔒 {p.level - state.level} seviye kaldı</span>
                )}
              </div>
              <div style={{ fontSize: 13.5, marginTop: 6 }}>{p.label}</div>
            </div>
          );
        })}
      </div>

      {/* Başarımlar */}
      <div className="section-title">🎖️ Başarımlar (her kademe ödül verir)</div>
      <div className="grid">
        {ACHIEVEMENTS.map((def) => {
          const tier = state.achievements[def.id] ?? 0;
          const next = thresholdFor(def, tier);
          const value = def.metric(state);
          const prev = tier > 0 ? thresholdFor(def, tier - 1) ?? 0 : 0;
          const pctA =
            next === null
              ? 100
              : Math.min(100, Math.round(((value - prev) / (next - prev)) * 100));
          const reward = tierReward(tier);
          return (
            <div className="card" key={def.id}>
              <div className="row between">
                <h3 style={{ margin: 0 }}>
                  {def.emoji} {def.name}
                  {tier > 0 && (
                    <span style={{ color: "var(--accent2)" }}> {romanTier(tier)}</span>
                  )}
                </h3>
                {next === null && <span className="tag green">TAMAMLANDI 🏅</span>}
              </div>
              {next !== null ? (
                <>
                  <div style={{ fontSize: 13, color: "var(--muted)", margin: "6px 0" }}>
                    Sonraki kademe: {next.toLocaleString("tr-TR")} {def.unit} — ödül{" "}
                    <span style={{ color: "var(--green)" }}>{fmtMoney(reward.money)}</span> +{" "}
                    {reward.xp} XP
                  </div>
                  <div className="partbar">
                    <div className="track">
                      <div
                        className="fill"
                        style={{
                          width: `${Math.max(0, pctA)}%`,
                          background: "var(--blue)",
                        }}
                      />
                    </div>
                    <span className="pct" style={{ width: 120 }}>
                      {value.toLocaleString("tr-TR")} / {next.toLocaleString("tr-TR")}
                    </span>
                  </div>
                </>
              ) : (
                <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 6 }}>
                  Tüm kademeler bitti: {value.toLocaleString("tr-TR")} {def.unit}. Helal olsun!
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
