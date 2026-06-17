import { useState } from "react";
import { cityByPlate } from "../data/cities";
import { playerRank } from "../game/rivals";
import { getLeaderboard, currentUser } from "../game/auth";
import { titleFor } from "../game/career";
import { fmtMoney, useGame } from "../game/state";

function PlayersLeague() {
  const me = currentUser();
  const rows = getLeaderboard();
  const started = rows.filter((r) => r.started);
  const myIndex = started.findIndex((r) => r.username === me);
  const medal = (i: number) => (i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`);

  return (
    <div>
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="row between">
          <div>
            <h3 style={{ margin: 0 }}>👥 Oyuncular Ligi</h3>
            <div className="sub" style={{ marginBottom: 0 }}>
              Bu cihazda kayıtlı tüm galericiler toplam kâra göre sıralanır.
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>SIRANIZ</div>
            <div
              className={myIndex === 0 ? "rank-1" : ""}
              style={{ fontSize: 30, fontWeight: 900 }}
            >
              {myIndex < 0 ? "—" : myIndex === 0 ? "🥇 1" : `#${myIndex + 1}`}
              <span style={{ fontSize: 14, color: "var(--muted)", fontWeight: 600 }}>
                {" "}
                / {started.length || 1}
              </span>
            </div>
          </div>
        </div>
      </div>

      {started.length <= 1 ? (
        <div className="card">
          <p style={{ margin: 0, color: "var(--muted)" }}>
            Henüz yarışacak başka oyuncu yok. Aynı tarayıcıda 🚪 Çıkış yapıp yeni bir hesap
            açarak (ör. arkadaşın) bu ligi doldurabilirsiniz — herkesin ilerlemesi ayrı kaydedilir.
          </p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflowX: "auto" }}>
          <table className="city-table">
            <thead>
              <tr>
                <th>Sıra</th>
                <th>Oyuncu</th>
                <th>Galeri</th>
                <th>Merkez</th>
                <th>Seviye</th>
                <th>Satış</th>
                <th>Toplam Kâr</th>
                <th>İtibar</th>
              </tr>
            </thead>
            <tbody>
              {started.map((r, i) => (
                <tr key={r.username} className={r.username === me ? "league-row-me" : ""}>
                  <td className={i === 0 ? "rank-1" : ""} style={{ whiteSpace: "nowrap" }}>
                    {medal(i)}
                  </td>
                  <td>
                    {r.username === me ? "⭐ " : "👤 "}
                    {r.username}
                    {r.username === me ? " (SİZ)" : ""}
                  </td>
                  <td>{r.galleryName}</td>
                  <td>{cityByPlate(r.homeCity).name}</td>
                  <td title={titleFor(r.level)}>Lv {r.level}</td>
                  <td>{r.carsSold} araç</td>
                  <td style={{ color: r.totalProfit >= 0 ? "var(--green)" : "var(--red)", fontWeight: 700 }}>
                    {fmtMoney(r.totalProfit)}
                  </td>
                  <td>{r.reputation}/100</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function League() {
  const { state } = useGame();
  const [view, setView] = useState<"players" | "rivals">("players");

  const rows = [
    {
      id: "me",
      me: true,
      emoji: "⭐",
      name: `${state.galleryName} (SİZ)`,
      cityPlate: state.homeCity,
      carsSold: state.stats.carsSold,
      wealth: state.stats.totalProfit,
      reputation: state.reputation,
      lastDelta: null as number | null,
    },
    ...state.rivals.map((r) => ({
      id: r.id,
      me: false,
      emoji: r.emoji,
      name: r.name,
      cityPlate: r.cityPlate,
      carsSold: r.carsSold,
      wealth: r.wealth,
      reputation: r.reputation,
      lastDelta: r.lastDelta as number | null,
    })),
  ].sort((a, b) => b.wealth - a.wealth);

  const myRank = playerRank(state);
  const medal = (i: number) => (i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`);

  return (
    <div>
      <div className="row" style={{ gap: 8, marginBottom: 14 }}>
        <button
          className={view === "players" ? "primary" : ""}
          style={{ flex: 1 }}
          onClick={() => setView("players")}
        >
          👥 Oyuncular Ligi
        </button>
        <button
          className={view === "rivals" ? "primary" : ""}
          style={{ flex: 1 }}
          onClick={() => setView("rivals")}
        >
          🤖 Yapay Zekâ Rakipler
        </button>
      </div>

      {view === "players" && <PlayersLeague />}

      {view === "rivals" && (
        <>
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="row between">
          <div>
            <h3 style={{ margin: 0 }}>🏆 Galericiler Ligi</h3>
            <div className="sub" style={{ marginBottom: 0 }}>
              Sıralama toplam kâra göredir. Rakipler her gün alıp satıyor — boş durmayın!
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>SIRANIZ</div>
            <div className={myRank === 1 ? "rank-1" : ""} style={{ fontSize: 30, fontWeight: 900 }}>
              {myRank === 1 ? "🥇 1" : `#${myRank}`}
              <span style={{ fontSize: 14, color: "var(--muted)", fontWeight: 600 }}>
                {" "}
                / {rows.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflowX: "auto" }}>
        <table className="city-table">
          <thead>
            <tr>
              <th>Sıra</th>
              <th>Galeri</th>
              <th>Merkez</th>
              <th>Satış</th>
              <th>Toplam Kâr</th>
              <th>Dün</th>
              <th>İtibar</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id} className={r.me ? "league-row-me" : ""}>
                <td className={i === 0 ? "rank-1" : ""} style={{ whiteSpace: "nowrap" }}>
                  {medal(i)}
                </td>
                <td>
                  {r.emoji} {r.name}
                </td>
                <td>{cityByPlate(r.cityPlate).name}</td>
                <td>{r.carsSold} araç</td>
                <td style={{ color: r.wealth >= 0 ? "var(--green)" : "var(--red)", fontWeight: 700 }}>
                  {fmtMoney(r.wealth)}
                </td>
                <td>
                  {r.lastDelta === null ? (
                    <span style={{ color: "var(--muted)" }}>—</span>
                  ) : r.lastDelta >= 0 ? (
                    <span style={{ color: "var(--green)" }}>▲ {fmtMoney(r.lastDelta)}</span>
                  ) : (
                    <span style={{ color: "var(--red)" }}>▼ {fmtMoney(Math.abs(r.lastDelta))}</span>
                  )}
                </td>
                <td>{r.reputation}/100</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 12 }}>
        💡 İpucu: Ligde 1 numaraya çıktığınızda büyük kutlama sizi bekliyor. Rakiplerden bazıları
        usta satıcıdır (günlük kârlarına bakın) — onları geçmek için ucuza alıp pahalıya satmak
        yetmez, hacim de gerekir.
      </p>
        </>
      )}
    </div>
  );
}
