import { useEffect, useRef, type CSSProperties } from "react";
import type { GameState } from "../../types";
import { useGame } from "../../game/state";

// Tüm sekme sahnelerinin ortak çizim motoru ve yardımcıları.

export const SCENE_W = 710;

export const CAR_COLORS = [
  "#c0473e", "#3e6ec0", "#3ec06b", "#c0a23e", "#8e8e8e", "#d8d8d8", "#5a3ec0", "#f5a524",
];

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  kind: "spark" | "bubble" | "steam" | "money" | "sparkle" | "coin" | "dust";
  text?: string;
}

export function stepParticles(ps: Particle[], dt: number): Particle[] {
  for (const p of ps) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.life -= dt;
    if (p.kind === "spark" || p.kind === "coin") p.vy += 160 * dt;
  }
  const out = ps.filter((p) => p.life > 0);
  return out.length > 140 ? out.slice(-140) : out;
}

export function drawParticles(ctx: CanvasRenderingContext2D, ps: Particle[]): void {
  for (const p of ps) {
    const a = Math.max(0, p.life / p.maxLife);
    if (p.kind === "spark") {
      ctx.fillStyle = `rgba(255,${180 + ((p.x * 7) % 60 | 0)},60,${a})`;
      ctx.fillRect(p.x, p.y, 2.5, 2.5);
    } else if (p.kind === "bubble") {
      ctx.strokeStyle = `rgba(210,240,255,${a * 0.9})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3 + (1 - a) * 3, 0, Math.PI * 2);
      ctx.stroke();
    } else if (p.kind === "steam") {
      ctx.fillStyle = `rgba(230,230,240,${a * 0.5})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2.5 + (1 - a) * 3, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.kind === "sparkle") {
      ctx.fillStyle = `rgba(255,255,210,${a})`;
      ctx.font = "10px serif";
      ctx.fillText("✦", p.x, p.y);
    } else if (p.kind === "money") {
      ctx.fillStyle = `rgba(62,207,142,${a})`;
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(p.text ?? "+₺", p.x, p.y);
    } else if (p.kind === "coin") {
      ctx.fillStyle = `rgba(255,209,102,${a})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = `rgba(180,140,40,${a})`;
      ctx.stroke();
    } else if (p.kind === "dust") {
      ctx.fillStyle = `rgba(180,180,200,${a * 0.35})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

/** Yandan araba çizimi (yol/showroom sahneleri için) */
export function drawCarSide(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  dir: 1 | -1 = 1,
  scale = 1
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(dir * scale, scale);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(-17, -8, 34, 8, 3);
  ctx.fill();
  ctx.beginPath();
  ctx.roundRect(-9, -14, 15, 7, 3);
  ctx.fill();
  ctx.fillStyle = "rgba(200,230,255,0.75)";
  ctx.fillRect(-6, -13, 5, 5);
  ctx.fillRect(1, -13, 4, 5);
  ctx.fillStyle = "#181818";
  ctx.beginPath();
  ctx.arc(-10, 0, 3.6, 0, Math.PI * 2);
  ctx.arc(10, 0, 3.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#666";
  ctx.beginPath();
  ctx.arc(-10, 0, 1.6, 0, Math.PI * 2);
  ctx.arc(10, 0, 1.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** Basit insan figürü (yürüme salınımlı) */
export function drawPerson(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  walkPhase: number
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "#e8b98a";
  ctx.beginPath();
  ctx.arc(0, -13, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(0, -10);
  ctx.lineTo(0, -3);
  ctx.stroke();
  const sw = Math.sin(walkPhase) * 3;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -3);
  ctx.lineTo(-2 + sw, 2);
  ctx.moveTo(0, -3);
  ctx.lineTo(2 - sw, 2);
  ctx.stroke();
  ctx.restore();
}

/** Saate göre gökyüzü (gündüz / günbatımı / gece) */
export function drawSky(
  ctx: CanvasRenderingContext2D,
  hour: number,
  w: number,
  h: number
): void {
  let top = "#3a6ea5";
  let bottom = "#8fc3e8";
  if (hour >= 21) {
    top = "#0c1030";
    bottom = "#1a2245";
  } else if (hour >= 17) {
    top = "#3a2c55";
    bottom = "#c96a4a";
  }
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, top);
  grad.addColorStop(1, bottom);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}

/** Kısa para formatı: 1.2M, 450K */
export function shortMoney(n: number): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1000000) return sign + (abs / 1000000).toFixed(1).replace(".0", "") + "M ₺";
  if (abs >= 1000) return sign + Math.round(abs / 1000) + "K ₺";
  return sign + abs + " ₺";
}

/**
 * Sahne döngüsü kancası: canvas ref döner, draw her karede çağrılır.
 * draw closure'ı her render'da tazelenir; sahne durumu bileşendeki ref'lerde tutulmalı.
 */
export function useScene(
  height: number,
  draw: (ctx: CanvasRenderingContext2D, dt: number, t: number, g: GameState) => void
) {
  const { state } = useGame();
  const gameRef = useRef(state);
  gameRef.current = state;
  const drawRef = useRef(draw);
  drawRef.current = draw;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let last = performance.now();
    let t = 0;
    function frame(now: number) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      t += dt;
      ctx!.clearRect(0, 0, SCENE_W, height);
      drawRef.current(ctx!, dt, t, gameRef.current);
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [height]);

  return canvasRef;
}

export const sceneCanvasStyle: CSSProperties = {
  width: "100%",
  height: "auto",
  display: "block",
  borderRadius: 10,
};
