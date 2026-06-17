import { useEffect, useRef, useState } from "react";
import { useGame } from "../game/state";
import { sfx } from "../game/sound";

type Toast = { id: number; text: string; kind: string };
type Burst = { id: number; pieces: { left: number; color: string; delay: number; dur: number }[] };

const CONFETTI_COLORS = ["#f5a524", "#ffd166", "#3ecf8e", "#5aa9ff", "#ff5c5c", "#c792ea", "#fff"];

let fxId = 0;

function logKey(e: { day: number; text: string }): string {
  return e.day + "|" + e.text;
}

/** Oyun durumunu izleyip görsel efektleri tetikleyen katman */
export function FxLayer() {
  const { state } = useGame();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [bursts, setBursts] = useState<Burst[]>([]);
  const [splash, setSplash] = useState<{ day: number } | null>(null);

  const prevDay = useRef<number | null>(null);
  const prevSold = useRef<number | null>(null);
  const prevRank = useRef<number | null>(null);
  const prevLevel = useRef<number | null>(null);
  const prevLogKey = useRef<string | null>(null);

  function burst(big = false) {
    const id = ++fxId;
    const n = big ? 110 : 60;
    const pieces = Array.from({ length: n }, () => ({
      left: Math.random() * 100,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      delay: Math.random() * 0.5,
      dur: 1.4 + Math.random() * 1.3,
    }));
    setBursts((b) => [...b, { id, pieces }]);
    window.setTimeout(() => setBursts((b) => b.filter((x) => x.id !== id)), 3400);
  }

  function pushToast(text: string, kind: string) {
    const id = ++fxId;
    setToasts((t) => [...t.slice(-3), { id, text, kind }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }

  useEffect(() => {
    if (!state.started) {
      prevDay.current = null;
      prevSold.current = null;
      prevRank.current = null;
      prevLogKey.current = null;
      return;
    }

    // İlk render: sadece referansları kaydet, efekt patlatma
    const firstRun = prevDay.current === null;

    // Gün geçişi
    if (!firstRun && state.day !== prevDay.current) {
      setSplash({ day: state.day });
      window.setTimeout(() => setSplash(null), 1500);
    }
    prevDay.current = state.day;

    // Satış konfetisi
    if (!firstRun && prevSold.current !== null && state.stats.carsSold > prevSold.current) {
      burst();
    }
    prevSold.current = state.stats.carsSold;

    // Seviye atlama: büyük konfeti + ses
    if (!firstRun && prevLevel.current !== null && state.level > prevLevel.current) {
      burst(true);
      sfx.cash();
    }
    prevLevel.current = state.level;

    // Lig: zirveye çıkınca büyük kutlama
    const rank = 1 + state.rivals.filter((r) => r.wealth > state.stats.totalProfit).length;
    if (!firstRun && prevRank.current !== null && rank === 1 && prevRank.current > 1) {
      burst(true);
      sfx.cash();
      pushToast("🏆 Lig birincisi oldunuz! Türkiye'nin en kârlı galerisi sizsiniz!", "olay");
    }
    prevRank.current = rank;

    // Yeni defter kayıtlarını toast olarak göster (uyarı ve olaylar)
    if (!firstRun && prevLogKey.current !== null) {
      const idx = state.log.findIndex((e) => logKey(e) === prevLogKey.current);
      const fresh = idx === -1 ? state.log.slice(0, 5) : state.log.slice(0, idx);
      for (const e of fresh.slice(0, 3).reverse()) {
        if (e.kind === "uyari" || e.kind === "olay") pushToast(e.text, e.kind);
      }
    }
    prevLogKey.current = state.log.length > 0 ? logKey(state.log[0]) : null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <>
      <div className="toast-stack">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.kind}`}>
            {t.text}
          </div>
        ))}
      </div>

      {bursts.map((b) => (
        <div key={b.id} className="confetti-layer">
          {b.pieces.map((p, i) => (
            <div
              key={i}
              className="confetti-piece"
              style={{
                left: `${p.left}%`,
                background: p.color,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.dur}s`,
              }}
            />
          ))}
        </div>
      ))}

      {splash && (
        <div className="day-splash">
          <div className="big">🌅 Gün {splash.day}</div>
          <div className="sub2">
            {splash.day % 7 === 1 ? "Yeni hafta — kira ödendi!" : "Yeni ilanlar düştü, kapılar açıldı."}
          </div>
        </div>
      )}
    </>
  );
}
