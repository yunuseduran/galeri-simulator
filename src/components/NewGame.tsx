import { useState } from "react";
import type { Difficulty } from "../types";
import { CITIES } from "../data/cities";
import { useGame } from "../game/state";

const DIFFS: { key: Difficulty; title: string; desc: string }[] = [
  { key: "kolay", title: "🟢 Kolay", desc: "2.500.000 ₺ sermaye, düşük kira, bol müşteri" },
  { key: "normal", title: "🟡 Normal", desc: "1.500.000 ₺ sermaye, dengeli piyasa" },
  { key: "zor", title: "🔴 Zor", desc: "900.000 ₺ sermaye, yüksek kira, az müşteri" },
];

export function NewGame() {
  const { dispatch } = useGame();
  const [name, setName] = useState("");
  const [gallery, setGallery] = useState("");
  const [city, setCity] = useState(34);
  const [diff, setDiff] = useState<Difficulty>("normal");
  const [showHelp, setShowHelp] = useState(false);

  const canStart = name.trim().length > 0 && gallery.trim().length > 0;

  return (
    <div className="newgame">
      <div className="logo">🚗💨</div>
      <h1>GALERİ SİMÜLATÖRÜ</h1>
      <p className="tagline">
        Türkiye'nin 81 ilinde araba al, tamir et, parlat... ve kârına sat!
      </p>

      <div className="card">
        <div className="field">
          <label>Adınız</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ör. Yunus Emre"
            maxLength={24}
          />
        </div>
        <div className="field">
          <label>Galeri Adı</label>
          <input
            value={gallery}
            onChange={(e) => setGallery(e.target.value)}
            placeholder="ör. Duran Otomotiv"
            maxLength={28}
          />
        </div>
        <div className="field">
          <label>Galerinizin Bulunduğu İl</label>
          <select value={city} onChange={(e) => setCity(Number(e.target.value))}>
            {CITIES.map((c) => (
              <option key={c.plate} value={c.plate}>
                {String(c.plate).padStart(2, "0")} — {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>Zorluk</label>
          <div className="diff-cards">
            {DIFFS.map((d) => (
              <div
                key={d.key}
                className={`diff-card ${diff === d.key ? "selected" : ""}`}
                onClick={() => setDiff(d.key)}
              >
                <div className="t">{d.title}</div>
                <div className="d">{d.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <button
          className="primary"
          style={{ width: "100%", padding: 12, fontSize: 16 }}
          disabled={!canStart}
          onClick={() =>
            dispatch({
              type: "NEW_GAME",
              playerName: name.trim(),
              galleryName: gallery.trim(),
              homeCity: city,
              difficulty: diff,
            })
          }
        >
          🔑 Galeriyi Aç!
        </button>

        <button
          style={{ width: "100%", marginTop: 8 }}
          onClick={() => setShowHelp(!showHelp)}
        >
          ❓ Nasıl Oynanır?
        </button>

        {showHelp && (
          <div style={{ fontSize: 13.5, lineHeight: 1.6, marginTop: 12, color: "var(--muted)" }}>
            <p>
              <strong style={{ color: "var(--text)" }}>1. Araç bul:</strong> 🛒 İlanlar sekmesinde
              Türkiye'nin her ilinden ilanlar var. Ucuza alabileceğin "acil satılık" araçları kolla!
            </p>
            <p>
              <strong style={{ color: "var(--text)" }}>2. Yerinde incele:</strong> Aracın bulunduğu
              ile git (yol para ve zaman harcar). Ekspertiz yaptır, 3 dakikalık test sürüşüne çık —
              arızalı araç sürüşte kendini ele verir: çekme, fren zayıflığı, hararet...
            </p>
            <p>
              <strong style={{ color: "var(--text)" }}>3. Pazarlık et:</strong> Satıcının sabrı
              sınırlı. Çok düşük teklif verirsen masadan kalkar!
            </p>
            <p>
              <strong style={{ color: "var(--text)" }}>4. Değerini artır:</strong> 🔧 Atölyede
              arızaları tamir et, koltuk kılıfı, jant, multimedya, seramik kaplama yaptır, detaylı
              temizlet.
            </p>
            <p>
              <strong style={{ color: "var(--text)" }}>5. Sat:</strong> Her gün galerine müşteri
              gelir. Kimi acelecidir yüksek öder, kimi sıkı pazarlıkçıdır. Titiz müşteri gizli
              arızayı yakalarsa itibarın zedelenir!
            </p>
            <p>
              <strong style={{ color: "var(--text)" }}>Dikkat:</strong> Her hafta kira ödersin,
              araçlar galeride beklerken bozulabilir, piyasa dalgalanır. İtibarın yükseldikçe daha
              çok ve daha cömert müşteri gelir.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
