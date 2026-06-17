import { useState } from "react";
import { getLeaderboard, login, register } from "../game/auth";
import { fmtMoney } from "../game/state";
import { cityByPlate } from "../data/cities";

export function Login({ onAuthed }: { onAuthed: () => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState<string | null>(null);

  const board = getLeaderboard().filter((p) => p.started).slice(0, 5);

  function submit() {
    setError(null);
    const res = mode === "register" ? register(username, pass) : login(username, pass);
    if (res.ok) {
      onAuthed();
    } else {
      setError(res.error);
    }
  }

  return (
    <div className="newgame">
      <div className="logo">🚗💨</div>
      <h1>GALERİ SİMÜLATÖRÜ</h1>
      <p className="tagline">
        Hesabınla giriş yap, kaldığın yerden devam et ve diğer oyuncularla yarış!
      </p>

      <div className="card">
        <div className="row" style={{ gap: 8, marginBottom: 14 }}>
          <button
            className={mode === "login" ? "primary" : ""}
            style={{ flex: 1 }}
            onClick={() => {
              setMode("login");
              setError(null);
            }}
          >
            🔑 Giriş Yap
          </button>
          <button
            className={mode === "register" ? "primary" : ""}
            style={{ flex: 1 }}
            onClick={() => {
              setMode("register");
              setError(null);
            }}
          >
            ✨ Kayıt Ol
          </button>
        </div>

        <div className="field">
          <label>Kullanıcı Adı</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="ör. yunus34"
            maxLength={20}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
        </div>
        <div className="field">
          <label>Şifre</label>
          <input
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            placeholder="••••••"
            maxLength={32}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
        </div>

        {error && (
          <div style={{ color: "var(--red)", fontSize: 13.5, marginBottom: 10 }}>⚠️ {error}</div>
        )}

        <button
          className="primary"
          style={{ width: "100%", padding: 12, fontSize: 16 }}
          disabled={username.trim().length < 2 || pass.length < 3}
          onClick={submit}
        >
          {mode === "register" ? "✨ Hesabı Oluştur" : "🔑 Giriş Yap"}
        </button>

        <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 12, marginBottom: 0 }}>
          🔒 Hesaplar bu cihazda (tarayıcıda) saklanır. Tarayıcıyı kapatsan bile oturumun açık
          kalır ve kaldığın yerden devam edersin.
        </p>
      </div>

      {board.length > 0 && (
        <div className="card" style={{ marginTop: 14, textAlign: "left" }}>
          <h3 style={{ margin: "0 0 10px" }}>🏆 Bu Cihazdaki En İyi Galericiler</h3>
          <table className="city-table">
            <thead>
              <tr>
                <th>Sıra</th>
                <th>Oyuncu</th>
                <th>Galeri</th>
                <th>Toplam Kâr</th>
              </tr>
            </thead>
            <tbody>
              {board.map((p, i) => (
                <tr key={p.username}>
                  <td>{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`}</td>
                  <td>{p.username}</td>
                  <td>
                    {p.galleryName}
                    <span style={{ color: "var(--muted)" }}> · {cityByPlate(p.homeCity).name}</span>
                  </td>
                  <td style={{ color: p.totalProfit >= 0 ? "var(--green)" : "var(--red)", fontWeight: 700 }}>
                    {fmtMoney(p.totalProfit)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
