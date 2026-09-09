import { useEffect, useRef } from "react";

// Şehirlerarası yolculuk sineması: araba içinden ön cam görünümü.
// Yol akar, tepeler kayar, hedef şehir tabelası yaklaşır, direksiyon sallanır.

const W = 680;
const H = 400;

export function TravelOverlay({
  fromName,
  toName,
  km,
  hour,
  onDone,
}: {
  fromName: string;
  toName: string;
  km: number;
  hour: number;
  onDone: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  const duration = Math.min(4.6, 2.6 + km / 500);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;
    let start = performance.now();
    let ended = false;

    const horizon = 178;
    const night = hour >= 21;
    const evening = hour >= 17 && hour < 21;

    function frame(now: number) {
      const t = (now - start) / 1000;
      const prog = Math.min(1, t / duration);
      if (prog >= 1 && !ended) {
        ended = true;
        doneRef.current();
        return;
      }

      ctx.clearRect(0, 0, W, H);

      // gökyüzü
      const grad = ctx.createLinearGradient(0, 0, 0, horizon);
      if (night) {
        grad.addColorStop(0, "#0c1030");
        grad.addColorStop(1, "#1a2245");
      } else if (evening) {
        grad.addColorStop(0, "#3a2c55");
        grad.addColorStop(1, "#c96a4a");
      } else {
        grad.addColorStop(0, "#3a6ea5");
        grad.addColorStop(1, "#8fc3e8");
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, horizon);
      // güneş/ay
      ctx.fillStyle = night ? "#e8edf7" : "#ffd166";
      ctx.beginPath();
      ctx.arc(120, 60, 18, 0, Math.PI * 2);
      ctx.fill();

      // uzak tepeler (paralaks)
      ctx.fillStyle = night ? "#141c33" : "#2f4a2d";
      ctx.beginPath();
      ctx.moveTo(0, horizon);
      for (let px = 0; px <= W; px += 8) {
        ctx.lineTo(px, horizon - 26 - Math.sin(px * 0.012 + t * 0.6) * 14);
      }
      ctx.lineTo(W, horizon);
      ctx.closePath();
      ctx.fill();
      // yakın tepeler
      ctx.fillStyle = night ? "#1a2440" : "#3f6a2f";
      ctx.beginPath();
      ctx.moveTo(0, horizon);
      for (let px = 0; px <= W; px += 8) {
        ctx.lineTo(px, horizon - 10 - Math.sin(px * 0.02 + t * 1.6) * 9);
      }
      ctx.lineTo(W, horizon);
      ctx.closePath();
      ctx.fill();

      // zemin + yol (perspektif)
      ctx.fillStyle = night ? "#151d16" : "#28381f";
      ctx.fillRect(0, horizon, W, H - horizon);
      const cx = W / 2 + Math.sin(t * 0.5) * 10; // hafif viraj hissi
      ctx.fillStyle = "#3a3a40";
      ctx.beginPath();
      ctx.moveTo(cx - 26, horizon);
      ctx.lineTo(cx + 26, horizon);
      ctx.lineTo(W * 0.96, H);
      ctx.lineTo(W * 0.04, H);
      ctx.closePath();
      ctx.fill();

      // orta şerit çizgileri (yaklaşarak akar)
      const phase = (t * 1.6) % 1;
      ctx.fillStyle = "#d8d8d8";
      for (let i = 0; i < 7; i++) {
        const u = ((i + phase) / 7) ** 2.2;
        if (u <= 0.001) continue;
        const y = horizon + u * (H - horizon);
        const y2 = horizon + Math.min(1, u * 1.28) * (H - horizon);
        const w1 = 2 + u * 16;
        const xTop = cx + (W / 2 - cx) * 0 + (cx - W / 2) * 0;
        void xTop;
        ctx.beginPath();
        ctx.moveTo(cx - w1 / 2 + (u * (Math.sin(t * 0.5) * 40)), y);
        ctx.lineTo(cx + w1 / 2 + (u * (Math.sin(t * 0.5) * 40)), y);
        ctx.lineTo(cx + w1 + (Math.min(1, u * 1.28) * (Math.sin(t * 0.5) * 40)), y2);
        ctx.lineTo(cx - w1 + (Math.min(1, u * 1.28) * (Math.sin(t * 0.5) * 40)), y2);
        ctx.closePath();
        ctx.fill();
      }

      // yol kenarı direkleri
      const poleF = (t * 1.6 + 0.5) % 1;
      for (let i = 0; i < 5; i++) {
        const u = ((i + poleF) / 5) ** 2.2;
        if (u < 0.02) continue;
        const y = horizon + u * (H - horizon);
        const hgt = 6 + u * 60;
        ctx.fillStyle = night ? "#3a4560" : "#5a5a60";
        for (const side of [-1, 1]) {
          const px = cx + side * (30 + u * (W * 0.46));
          ctx.fillRect(px - 1.5 - u * 2, y - hgt, 3 + u * 4, hgt);
        }
      }

      // hedef tabelası: yolculuğun ortasında belirir, yaklaşır
      const signT = (prog - 0.35) / 0.5;
      if (signT > 0 && signT < 1) {
        const u = signT ** 2.2;
        const y = horizon + u * (H - horizon) * 0.7;
        const scale = 0.15 + u * 1.6;
        const sx = cx + (0.42 * W) * u + 40 * u;
        ctx.save();
        ctx.translate(sx, y);
        ctx.scale(scale, scale);
        ctx.fillStyle = "#5a5a60";
        ctx.fillRect(-6, -8, 8, 92);
        ctx.fillStyle = "#1d6e3f";
        ctx.beginPath();
        ctx.roundRect(-118, -66, 236, 62, 8);
        ctx.fill();
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 3;
        ctx.strokeRect(-112, -60, 224, 50);
        ctx.fillStyle = "#fff";
        ctx.font = "bold 30px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(toName.toUpperCase(), 0, -30);
        ctx.font = "18px sans-serif";
        ctx.fillText(`${Math.max(1, Math.round(km * (1 - prog)))} km`, 0, -8);
        ctx.restore();
      }

      // gece: far huzmeleri
      if (night) {
        const beam = ctx.createRadialGradient(cx, H - 40, 20, cx, horizon + 30, 260);
        beam.addColorStop(0, "rgba(255,240,190,0.16)");
        beam.addColorStop(1, "rgba(255,240,190,0)");
        ctx.fillStyle = beam;
        ctx.fillRect(0, horizon - 20, W, H);
      }

      // ---- kokpit ----
      const bob = Math.sin(t * 9) * 1.6 + Math.sin(t * 2.3) * 1.2;
      // cam direkleri
      ctx.fillStyle = "#12182a";
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(34, 0);
      ctx.lineTo(10, H);
      ctx.lineTo(0, H);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(W, 0);
      ctx.lineTo(W - 34, 0);
      ctx.lineTo(W - 10, H);
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fill();
      // tavan + dikiz aynası
      ctx.fillStyle = "#12182a";
      ctx.fillRect(0, 0, W, 26);
      ctx.fillStyle = "#1c2438";
      ctx.beginPath();
      ctx.roundRect(W / 2 - 52, 20, 104, 30, 6);
      ctx.fill();
      ctx.fillStyle = night ? "#0c1030" : "#8fc3e8";
      ctx.fillRect(W / 2 - 46, 25, 92, 20);

      // torpido
      ctx.fillStyle = "#161d2e";
      ctx.beginPath();
      ctx.moveTo(0, H - 86 + bob * 0.4);
      ctx.quadraticCurveTo(W / 2, H - 122 + bob * 0.4, W, H - 86 + bob * 0.4);
      ctx.lineTo(W, H);
      ctx.lineTo(0, H);
      ctx.closePath();
      ctx.fill();

      // gösterge: hız
      ctx.fillStyle = "#0f1420";
      ctx.beginPath();
      ctx.arc(W / 2 + 150, H - 52 + bob * 0.3, 34, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#39435e";
      ctx.lineWidth = 2;
      ctx.stroke();
      const spd = 90 + Math.sin(t * 1.3) * 8;
      const ang = Math.PI * 0.75 + (spd / 160) * Math.PI * 1.5;
      ctx.strokeStyle = "#ff5c5c";
      ctx.beginPath();
      ctx.moveTo(W / 2 + 150, H - 52 + bob * 0.3);
      ctx.lineTo(W / 2 + 150 + Math.cos(ang) * 24, H - 52 + bob * 0.3 + Math.sin(ang) * 24);
      ctx.stroke();
      ctx.fillStyle = "#8b99b8";
      ctx.font = "10px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`${Math.round(spd)} km/s`, W / 2 + 150, H - 10 + bob * 0.3);

      // direksiyon (hafif sağa sola kırar)
      const steer = Math.sin(t * 0.5) * 0.1 + Math.sin(t * 5) * 0.015;
      ctx.save();
      ctx.translate(W / 2 - 90, H - 8 + bob * 0.5);
      ctx.rotate(steer);
      ctx.strokeStyle = "#242f47";
      ctx.lineWidth = 16;
      ctx.beginPath();
      ctx.arc(0, 0, 96, Math.PI * 1.05, Math.PI * 1.95);
      ctx.stroke();
      ctx.strokeStyle = "#39435e";
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(-64, -40);
      ctx.lineTo(0, 0);
      ctx.lineTo(64, -40);
      ctx.stroke();
      ctx.restore();

      // vinyet
      const vin = ctx.createRadialGradient(W / 2, H / 2, H * 0.45, W / 2, H / 2, H * 0.85);
      vin.addColorStop(0, "rgba(0,0,0,0)");
      vin.addColorStop(1, "rgba(0,0,0,0.5)");
      ctx.fillStyle = vin;
      ctx.fillRect(0, 0, W, H);

      raf = requestAnimationFrame(frame);
    }

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="travel-overlay">
      <div className="travel-title">
        🚗 {fromName} → <strong>{toName}</strong> · {km} km
      </div>
      <canvas ref={canvasRef} width={W} height={H} className="travel-canvas" />
      <div className="travel-bottom">
        <div className="travel-bar">
          <div className="travel-bar-fill" style={{ animationDuration: `${duration}s` }} />
        </div>
        <button className="small" onClick={onDone}>
          Geç ⏭
        </button>
      </div>
    </div>
  );
}
