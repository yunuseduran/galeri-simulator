import { useState } from "react";
import type { GameState } from "../types";
import { isMuted, setMuted, sfx } from "../game/sound";
import { migrateSave, useGame } from "../game/state";
import { Modal } from "./ui";

export const APP_VERSION = "1.0";

export function Settings({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useGame();
  const [muted, setMutedState] = useState(isMuted());
  const [backup, setBackup] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function copyBackup() {
    const json = JSON.stringify(state);
    setBackup(json);
    try {
      await navigator.clipboard.writeText(json);
      setMsg({ ok: true, text: "Kayıt panoya kopyalandı. Güvenli bir yere yapıştırıp saklayın." });
    } catch {
      setMsg({ ok: true, text: "Aşağıdaki kutudaki metni tümünü seçip kopyalayın." });
    }
  }

  function restore() {
    try {
      const parsed = JSON.parse(backup) as GameState;
      if (!migrateSave(JSON.parse(backup))) throw new Error("geçersiz");
      if (!confirm("Mevcut ilerlemeniz bu yedekle DEĞİŞTİRİLECEK. Devam edilsin mi?")) return;
      dispatch({ type: "LOAD_SAVE", save: parsed });
      setMsg({ ok: true, text: "Yedek yüklendi." });
    } catch {
      setMsg({ ok: false, text: "Bu metin geçerli bir oyun yedeği değil." });
    }
  }

  return (
    <Modal title="⚙️ Ayarlar" onClose={onClose}>
      <div className="row between" style={{ marginBottom: 12 }}>
        <span>🔊 Ses efektleri</span>
        <button
          onClick={() => {
            const m = !muted;
            setMuted(m);
            setMutedState(m);
            if (!m) sfx.click();
          }}
        >
          {muted ? "Kapalı — Aç" : "Açık — Kapat"}
        </button>
      </div>

      <div className="row between" style={{ marginBottom: 12 }}>
        <span>🎓 Oyun turu</span>
        <button
          onClick={() => {
            onClose();
            window.dispatchEvent(new Event("galeri-start-tour"));
          }}
        >
          Turu Yeniden Başlat
        </button>
      </div>

      <div className="section-title" style={{ marginTop: 6 }}>
        💾 Kayıt yedeği
      </div>
      <p style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 0 }}>
        İlerlemeniz bu cihazda otomatik kaydedilir. Başka cihaza taşımak ya da güvenceye almak için yedeği
        kopyalayın; yüklemek için metni kutuya yapıştırın.
      </p>
      <textarea
        value={backup}
        onChange={(e) => setBackup(e.target.value)}
        placeholder="Yedek metni burada görünür / yapıştırılır"
        rows={4}
        style={{ width: "100%", fontSize: 11, fontFamily: "monospace" }}
      />
      <div className="row" style={{ marginTop: 8 }}>
        <button onClick={copyBackup}>📋 Yedeği Kopyala</button>
        <button className="success" disabled={backup.trim().length < 10} onClick={restore}>
          📥 Yedeği Yükle
        </button>
      </div>
      {msg && (
        <div style={{ fontSize: 13, marginTop: 8, color: msg.ok ? "var(--green)" : "var(--red)" }}>{msg.text}</div>
      )}

      <div className="section-title">⚠️ Tehlikeli bölge</div>
      <button
        className="danger"
        onClick={() => {
          if (confirm("Tüm ilerleme silinecek ve yeni oyun başlayacak. Bu işlem geri alınamaz. Emin misiniz?")) {
            dispatch({ type: "RESET" });
            onClose();
          }
        }}
      >
        🗑️ Oyunu Sıfırla
      </button>

      <p style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 14 }}>
        Galeri Simülatörü v{APP_VERSION} · Gün {state.day} · Seviye {state.level}
      </p>
      <div className="close-row">
        <button onClick={onClose}>Kapat</button>
      </div>
    </Modal>
  );
}
