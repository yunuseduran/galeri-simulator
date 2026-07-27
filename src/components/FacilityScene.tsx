import { useEffect, useRef } from "react";
import type { GameState } from "../types";
import { facilityLevel, type FacilityKey } from "../game/facilities";
import { useGame } from "../game/state";
import { sfx } from "../game/sound";

// Canlı tesis sahnesi: yoldan trafik akar, pompaya araç yanaşır, yıkamada köpük uçuşur,
// tamirhanede kıvılcım çıkar. Oyun durumuna gerçek zamanlı bağlıdır.

const W = 710;
const H = 430;

interface Plot {
  x: number;
  y: number;
  w: number;
  h: number;
}

const PLOTS: Record<FacilityKey, Plot> = {
  otopark: { x: 36, y: 108, w: 200, h: 82 },
  kafeterya: { x: 252, y: 108, w: 118, h: 82 },
  parca: { x: 386, y: 108, w: 130, h: 82 },
  showroom: { x: 36, y: 212, w: 190, h: 112 },
  atolye: { x: 240, y: 220, w: 130, h: 104 },
  yikama: { x: 384, y: 220, w: 130, h: 104 },
  pompa: { x: 528, y: 212, w: 150, h: 112 },
};

const COLORS: Record<FacilityKey, string> = {
  showroom: "#f5a524",
  atolye: "#5aa9ff",
  yikama: "#3ecf8e",
  parca: "#c792ea",
  kafeterya: "#ffd166",
  pompa: "#ff8c5c",
  otopark: "#8b99b8",
};

const NAMES: Record<FacilityKey, string> = {
  showroom: "Vitrin",
  atolye: "Tamirhane",
  yikama: "Oto Yıkama",
  parca: "Yedek Parça",
  kafeterya: "Kafeterya",
  pompa: "Pompa",
  otopark: "Otopark",
};

const EMOJIS: Record<FacilityKey, string> = {
  showroom: "🏢",
  atolye: "🔧",
  yikama: "🧽",
  parca: "🛞",
  kafeterya: "☕",
  pompa: "⛽",
  otopark: "🅿️",
};

const CAR_COLORS = ["#c0473e", "#3e6ec0", "#3ec06b", "#c0a23e", "#8e8e8e", "#d8d8d8", "#5a3ec0"];

interface RoadCar {
  x: number;
  dir: 1 | -1;
  speed: number;
  color: string;
  y: number;
}

interface ServiceCar {
  kind: "pompa" | "yikama";
  phase: "in" | "serve" | "out";
  x: number;
  y: number;
  t: number;
  color: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  kind: "spark" | "bubble" | "steam" | "money" | "sparkle";
  text?: string;
}

interface Walker {
  x: number;
  target: number;
  dir: 1 | -1;
  color: string;
}

export function FacilityScene({
  selected,
  onSelect,
}: {
  selected: FacilityKey;
  onSelect: (k: FacilityKey) => void;
}) {
  const { state } = useGame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef(state);
  gameRef.current = state;
  const selRef = useRef(selected);
  selRef.current = selected;

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;
    let last = performance.now();
    let t = 0;

    // Sahne aktörleri
    let roadCars: RoadCar[] = [];
    let spawnTimer = 0;
    let serviceCars: ServiceCar[] = [];
    let pompaTimer = 3;
    let yikamaTimer = 6;
    let particles: Particle[] = [];
    let walkers: Walker[] = [];
    let walkerTimer = 2;
    const clouds = [
      { x: 80, y: 26, s: 1 },
      { x: 330, y: 44, s: 0.7 },
      { x: 560, y: 20, s: 1.2 },
    ];

    const lvl = (k: FacilityKey) => facilityLevel(gameRef.current, k);

    function skyColors(): [string, string] {
      const hour = gameRef.current.hour;
      // 8-16 gündüz, 17-20 günbatımı, 21+ gece
      if (hour >= 21) return ["#0c1030", "#1a2245"];
      if (hour >= 17) {
        return ["#3a2c55", "#c96a4a"];
      }
      return ["#3a6ea5", "#8fc3e8"];
    }

    function drawCarSide(x: number, y: number, color: string, dir: 1 | -1, scale = 1) {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(dir * scale, scale);
      // gövde
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(-17, -8, 34, 8, 3);
      ctx.fill();
      // kabin
      ctx.beginPath();
      ctx.roundRect(-9, -14, 15, 7, 3);
      ctx.fill();
      // cam
      ctx.fillStyle = "rgba(200,230,255,0.75)";
      ctx.fillRect(-6, -13, 5, 5);
      ctx.fillRect(1, -13, 4, 5);
      // tekerler
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

    function drawPerson(x: number, y: number, color: string, walkPhase: number) {
      ctx.save();
      ctx.translate(x, y);
      // kafa
      ctx.fillStyle = "#e8b98a";
      ctx.beginPath();
      ctx.arc(0, -13, 3, 0, Math.PI * 2);
      ctx.fill();
      // gövde
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(0, -10);
      ctx.lineTo(0, -3);
      ctx.stroke();
      // bacaklar (yürüme salınımı)
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

    function drawBuilding(key: FacilityKey) {
      const p = PLOTS[key];
      const level = lvl(key);
      const color = COLORS[key];
      const isSel = selRef.current === key;

      if (level === 0) {
        // Boş arsa: çitli parsel + tabela
        ctx.fillStyle = "#20301c";
        ctx.fillRect(p.x, p.y, p.w, p.h);
        ctx.strokeStyle = isSel ? "#ffffff" : "#4a6741";
        ctx.lineWidth = isSel ? 2.5 : 1.5;
        ctx.setLineDash([7, 5]);
        ctx.strokeRect(p.x + 1, p.y + 1, p.w - 2, p.h - 2);
        ctx.setLineDash([]);
        ctx.globalAlpha = 0.45;
        ctx.font = "17px serif";
        ctx.textAlign = "center";
        ctx.fillText(EMOJIS[key], p.x + p.w / 2, p.y + p.h / 2);
        ctx.globalAlpha = 1;
        ctx.fillStyle = "#6d8a67";
        ctx.font = "10px sans-serif";
        ctx.fillText("Boş arsa — inşa et", p.x + p.w / 2, p.y + p.h / 2 + 15);
        return;
      }

      const baseY = p.y + 14;
      const bh = p.h - 14;

      // bina gövdesi
      ctx.fillStyle = "#242f47";
      ctx.beginPath();
      ctx.roundRect(p.x, baseY, p.w, bh, 4);
      ctx.fill();
      // çatı bandı
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(p.x - 3, baseY - 8, p.w + 6, 12, 3);
      ctx.fill();
      // seçim çerçevesi
      if (isSel) {
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2.5;
        ctx.strokeRect(p.x - 4, baseY - 12, p.w + 8, bh + 16);
      }

      // Bina türüne özel detaylar
      if (key === "showroom") {
        // cam vitrin + içinde envanterdeki araçlar
        ctx.fillStyle = "rgba(150,200,255,0.16)";
        ctx.fillRect(p.x + 8, baseY + 12, p.w - 16, bh - 24);
        ctx.strokeStyle = "rgba(150,200,255,0.4)";
        ctx.lineWidth = 1;
        ctx.strokeRect(p.x + 8, baseY + 12, p.w - 16, bh - 24);
        const carCount = Math.min(4, gameRef.current.inventory.length);
        for (let i = 0; i < carCount; i++) {
          drawCarSide(p.x + 34 + i * 44, baseY + bh - 22, CAR_COLORS[i % CAR_COLORS.length], 1, 0.85);
        }
        if (carCount === 0) {
          ctx.fillStyle = "rgba(200,220,255,0.35)";
          ctx.font = "9.5px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("vitrin boş", p.x + p.w / 2, baseY + bh / 2 + 3);
        }
        // dönen tabela
        const wob = Math.sin(t * 2) * 0.12;
        ctx.save();
        ctx.translate(p.x + p.w / 2, baseY - 16);
        ctx.rotate(wob);
        ctx.font = "13px sans-serif";
        ctx.textAlign = "center";
        ctx.fillStyle = "#ffd166";
        ctx.fillText("🚗 " + gameRef.current.galleryName.slice(0, 14), 0, 0);
        ctx.restore();
      } else if (key === "atolye") {
        // kepenk
        ctx.fillStyle = "#333d58";
        ctx.fillRect(p.x + 10, baseY + 16, p.w - 20, bh - 24);
        ctx.strokeStyle = "#4a5675";
        for (let i = 1; i < 6; i++) {
          ctx.beginPath();
          ctx.moveTo(p.x + 10, baseY + 16 + i * ((bh - 24) / 6));
          ctx.lineTo(p.x + p.w - 10, baseY + 16 + i * ((bh - 24) / 6));
          ctx.stroke();
        }
        // iş varsa araba içeride + kıvılcım
        if (gameRef.current.jobs.length > 0) {
          drawCarSide(p.x + p.w / 2, baseY + bh - 12, "#8e8e8e", 1, 0.9);
          if (Math.random() < 0.25) {
            particles.push({
              x: p.x + p.w / 2 + (Math.random() - 0.5) * 24,
              y: baseY + bh - 18,
              vx: (Math.random() - 0.5) * 40,
              vy: -30 - Math.random() * 40,
              life: 0.5,
              maxLife: 0.5,
              kind: "spark",
            });
          }
        }
      } else if (key === "yikama") {
        // yıkama tüneli ağzı
        ctx.fillStyle = "#16352b";
        ctx.fillRect(p.x + 12, baseY + 14, p.w - 24, bh - 20);
        ctx.fillStyle = "rgba(62,207,142,0.25)";
        for (let i = 0; i < 3; i++) {
          const fy = baseY + 18 + i * 12 + Math.sin(t * 3 + i) * 2;
          ctx.fillRect(p.x + 16, fy, p.w - 32, 4);
        }
      } else if (key === "pompa") {
        // kanopi + pompalar
        ctx.fillStyle = "#242f47";
        ctx.fillRect(p.x + 6, baseY + 8, p.w - 12, bh - 14);
        ctx.fillStyle = "#1b2438";
        ctx.fillRect(p.x + 6, baseY + bh - 26, p.w - 12, 20);
        for (const px of [p.x + 34, p.x + p.w - 46]) {
          ctx.fillStyle = "#ff8c5c";
          ctx.fillRect(px, baseY + bh - 40, 12, 22);
          ctx.fillStyle = "#fff";
          ctx.fillRect(px + 2, baseY + bh - 37, 8, 6);
        }
        // fiyat panosu yanıp söner
        if (Math.floor(t * 1.4) % 2 === 0) {
          ctx.fillStyle = "#ffd166";
          ctx.font = "8.5px monospace";
          ctx.textAlign = "center";
          ctx.fillText("BENZİN 54.9", p.x + p.w / 2, baseY + 4);
        }
      } else if (key === "kafeterya") {
        // pencere + buhar
        ctx.fillStyle = "rgba(255,209,102,0.18)";
        ctx.fillRect(p.x + 10, baseY + 12, p.w - 20, bh - 20);
        ctx.font = "15px serif";
        ctx.textAlign = "center";
        ctx.fillText("☕", p.x + p.w / 2, baseY + bh / 2 + 5);
        if (Math.random() < 0.06) {
          particles.push({
            x: p.x + p.w / 2 + 2,
            y: baseY + bh / 2 - 8,
            vx: (Math.random() - 0.5) * 6,
            vy: -14,
            life: 1.6,
            maxLife: 1.6,
            kind: "steam",
          });
        }
      } else if (key === "parca") {
        ctx.fillStyle = "rgba(199,146,234,0.15)";
        ctx.fillRect(p.x + 10, baseY + 12, p.w - 20, bh - 20);
        ctx.font = "13px serif";
        ctx.textAlign = "center";
        ctx.fillText("🛞  🔩  🔋", p.x + p.w / 2, baseY + bh / 2 + 4);
      } else if (key === "otopark") {
        // park çizgileri + park halindeki fazla araçlar
        ctx.fillStyle = "#2b3448";
        ctx.fillRect(p.x + 4, baseY + 4, p.w - 8, bh - 8);
        ctx.strokeStyle = "#5a6a8a";
        ctx.lineWidth = 1.5;
        for (let i = 1; i < 4; i++) {
          const lx = p.x + 4 + i * ((p.w - 8) / 4);
          ctx.beginPath();
          ctx.moveTo(lx, baseY + 8);
          ctx.lineTo(lx, baseY + bh - 12);
          ctx.stroke();
        }
        const extra = Math.max(0, gameRef.current.inventory.length - 4);
        for (let i = 0; i < Math.min(extra, level); i++) {
          drawCarSide(p.x + 28 + i * 48, baseY + bh - 16, CAR_COLORS[(i + 3) % CAR_COLORS.length], 1, 0.8);
        }
      }

      // isim + seviye yıldızları
      ctx.font = "10px sans-serif";
      ctx.textAlign = "center";
      ctx.fillStyle = "#e8edf7";
      ctx.fillText(NAMES[key], p.x + p.w / 2, baseY - 1);
      ctx.fillStyle = color;
      ctx.font = "9px sans-serif";
      ctx.fillText("★".repeat(level), p.x + p.w / 2, p.y + p.h + 11);
    }

    function frame(now: number) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      t += dt;
      const g = gameRef.current;

      // ---- güncelle ----
      // trafik
      spawnTimer -= dt;
      if (spawnTimer <= 0) {
        spawnTimer = 1.2 + Math.random() * 2.2;
        const dir = Math.random() < 0.5 ? 1 : -1;
        roadCars.push({
          x: dir === 1 ? -40 : W + 40,
          dir: dir as 1 | -1,
          speed: 60 + Math.random() * 70,
          color: CAR_COLORS[Math.floor(Math.random() * CAR_COLORS.length)],
          y: dir === 1 ? 407 : 383,
        });
      }
      for (const c of roadCars) c.x += c.dir * c.speed * dt;
      roadCars = roadCars.filter((c) => c.x > -60 && c.x < W + 60);

      // pompa müşterisi
      if (lvl("pompa") > 0) {
        pompaTimer -= dt;
        if (pompaTimer <= 0 && !serviceCars.some((s) => s.kind === "pompa")) {
          pompaTimer = 5 + Math.random() * 6;
          serviceCars.push({
            kind: "pompa",
            phase: "in",
            x: -40,
            y: 300,
            t: 0,
            color: CAR_COLORS[Math.floor(Math.random() * CAR_COLORS.length)],
          });
        }
      }
      // yıkama müşterisi
      if (lvl("yikama") > 0) {
        yikamaTimer -= dt;
        if (yikamaTimer <= 0 && !serviceCars.some((s) => s.kind === "yikama")) {
          yikamaTimer = 7 + Math.random() * 7;
          serviceCars.push({
            kind: "yikama",
            phase: "in",
            x: -40,
            y: 308,
            t: 0,
            color: CAR_COLORS[Math.floor(Math.random() * CAR_COLORS.length)],
          });
        }
      }
      for (const s of serviceCars) {
        const targetX = s.kind === "pompa" ? PLOTS.pompa.x + 70 : PLOTS.yikama.x + 60;
        if (s.phase === "in") {
          s.x += 90 * dt;
          if (s.x >= targetX) {
            s.phase = "serve";
            s.t = s.kind === "pompa" ? 2.2 : 2.8;
          }
        } else if (s.phase === "serve") {
          s.t -= dt;
          if (s.kind === "yikama" && Math.random() < 0.35) {
            particles.push({
              x: s.x + (Math.random() - 0.5) * 30,
              y: s.y - 8 - Math.random() * 10,
              vx: (Math.random() - 0.5) * 15,
              vy: -8 - Math.random() * 12,
              life: 1,
              maxLife: 1,
              kind: "bubble",
            });
          }
          if (s.t <= 0) {
            s.phase = "out";
            particles.push({
              x: s.x,
              y: s.y - 22,
              vx: 0,
              vy: -22,
              life: 1.3,
              maxLife: 1.3,
              kind: "money",
              text: s.kind === "pompa" ? "+₺ yakıt" : "+₺ yıkama",
            });
            if (s.kind === "yikama") {
              for (let i = 0; i < 4; i++) {
                particles.push({
                  x: s.x + (Math.random() - 0.5) * 26,
                  y: s.y - 6 - Math.random() * 12,
                  vx: 0,
                  vy: -6,
                  life: 0.8,
                  maxLife: 0.8,
                  kind: "sparkle",
                });
              }
            }
          }
        } else {
          s.x += 110 * dt;
        }
      }
      serviceCars = serviceCars.filter((s) => s.x < W + 60);

      // müşteri yayalar
      walkerTimer -= dt;
      if (walkerTimer <= 0) {
        walkerTimer = 4 + Math.random() * 5;
        if (g.customers.length > 0 && walkers.length < 3) {
          walkers.push({
            x: Math.random() < 0.5 ? -10 : W + 10,
            target: PLOTS.showroom.x + 30 + Math.random() * 130,
            dir: 1,
            color: ["#d85a30", "#3e6ec0", "#1d9e75", "#993556"][Math.floor(Math.random() * 4)],
          });
        }
      }
      for (const w of walkers) {
        w.dir = w.target > w.x ? 1 : -1;
        w.x += w.dir * 28 * dt;
      }
      walkers = walkers.filter((w) => Math.abs(w.x - w.target) > 3);

      // parçacıklar
      for (const p of particles) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt;
        if (p.kind === "spark") p.vy += 160 * dt;
      }
      particles = particles.filter((p) => p.life > 0);
      if (particles.length > 120) particles = particles.slice(-120);

      // bulutlar
      for (const c of clouds) {
        c.x += 6 * c.s * dt;
        if (c.x > W + 60) c.x = -60;
      }

      // ---- çiz ----
      ctx.clearRect(0, 0, W, H);

      // gökyüzü
      const [skyTop, skyBottom] = skyColors();
      const grad = ctx.createLinearGradient(0, 0, 0, 100);
      grad.addColorStop(0, skyTop);
      grad.addColorStop(1, skyBottom);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, 100);

      // güneş / ay
      const night = g.hour >= 21;
      ctx.fillStyle = night ? "#e8edf7" : "#ffd166";
      ctx.beginPath();
      ctx.arc(650, 34, 14, 0, Math.PI * 2);
      ctx.fill();
      if (night) {
        ctx.fillStyle = skyTop;
        ctx.beginPath();
        ctx.arc(656, 30, 11, 0, Math.PI * 2);
        ctx.fill();
      }

      // bulutlar
      ctx.fillStyle = "rgba(255,255,255,0.75)";
      for (const c of clouds) {
        ctx.beginPath();
        ctx.arc(c.x, c.y, 10 * c.s, 0, Math.PI * 2);
        ctx.arc(c.x + 12 * c.s, c.y + 3, 8 * c.s, 0, Math.PI * 2);
        ctx.arc(c.x - 12 * c.s, c.y + 3, 8 * c.s, 0, Math.PI * 2);
        ctx.fill();
      }

      // zemin (parsel)
      ctx.fillStyle = "#28381f";
      ctx.fillRect(0, 96, W, 274);
      ctx.fillStyle = "#33405a";
      ctx.fillRect(20, 100, W - 40, 262);

      // kaldırım + yol
      ctx.fillStyle = "#7a8296";
      ctx.fillRect(0, 362, W, 10);
      ctx.fillStyle = "#3a3a40";
      ctx.fillRect(0, 372, W, 58);
      ctx.strokeStyle = "#d8d8d8";
      ctx.lineWidth = 3;
      ctx.setLineDash([22, 16]);
      ctx.beginPath();
      ctx.moveTo(0, 400);
      ctx.lineTo(W, 400);
      ctx.stroke();
      ctx.setLineDash([]);

      // binalar
      (Object.keys(PLOTS) as FacilityKey[]).forEach(drawBuilding);

      // servis araçları (pompa/yıkama müşterileri)
      for (const s of serviceCars) drawCarSide(s.x, s.y, s.color, 1);

      // yayalar
      for (const w of walkers) drawPerson(w.x, 356, w.color, t * 8);

      // yol trafiği
      for (const c of roadCars) drawCarSide(c.x, c.y, c.color, c.dir);

      // parçacıklar
      for (const p of particles) {
        const a = Math.max(0, p.life / p.maxLife);
        if (p.kind === "spark") {
          ctx.fillStyle = `rgba(255,${180 + Math.floor(Math.random() * 60)},60,${a})`;
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
        }
      }

      // gece karartması
      if (g.hour >= 19) {
        const darkness = Math.min(0.45, (g.hour - 19) * 0.09);
        ctx.fillStyle = `rgba(5,8,20,${darkness})`;
        ctx.fillRect(0, 0, W, H);
        // yanan vitrin ışıkları
        for (const key of Object.keys(PLOTS) as FacilityKey[]) {
          if (lvl(key) > 0) {
            const p = PLOTS[key];
            ctx.fillStyle = "rgba(255,220,130,0.10)";
            ctx.fillRect(p.x + 6, p.y + 22, p.w - 12, p.h - 30);
          }
        }
      }

      raf = requestAnimationFrame(frame);
    }

    raf = requestAnimationFrame(frame);

    // tıklama: binayı seç
    function onClick(e: MouseEvent) {
      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * W;
      const y = ((e.clientY - rect.top) / rect.height) * H;
      for (const key of Object.keys(PLOTS) as FacilityKey[]) {
        const p = PLOTS[key];
        if (x >= p.x - 4 && x <= p.x + p.w + 4 && y >= p.y - 14 && y <= p.y + p.h + 12) {
          sfx.click();
          onSelect(key);
          return;
        }
      }
    }
    canvas.addEventListener("click", onClick);

    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener("click", onClick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={W}
      height={H}
      style={{
        width: "100%",
        height: "auto",
        display: "block",
        borderRadius: 10,
        cursor: "pointer",
      }}
      aria-label="Canlı galeri tesisi sahnesi"
    />
  );
}
