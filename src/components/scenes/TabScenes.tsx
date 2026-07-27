import { useRef } from "react";
import {
  CAR_COLORS,
  drawCarSide,
  drawParticles,
  drawPerson,
  drawSky,
  sceneCanvasStyle,
  SCENE_W,
  shortMoney,
  stepParticles,
  useScene,
  type Particle,
} from "./common";

// ============ 🏢 GALERİM: showroom içi ============

export function ShowroomScene() {
  const st = useRef({
    particles: [] as Particle[],
    browserX: 120,
    browserTarget: 500,
    sweep: 0,
  });
  const H = 200;

  const ref = useScene(H, (ctx, dt, t, g) => {
    const s = st.current;
    // zemin + duvar
    ctx.fillStyle = "#1b2438";
    ctx.fillRect(0, 0, SCENE_W, H);
    ctx.fillStyle = "#242f47";
    ctx.fillRect(0, 0, SCENE_W, 108);
    // arka duvar pencereleri
    ctx.fillStyle = "rgba(150,200,255,0.10)";
    for (let i = 0; i < 5; i++) ctx.fillRect(30 + i * 140, 16, 100, 58);
    // parlak zemin şeridi
    const floorGrad = ctx.createLinearGradient(0, 108, 0, H);
    floorGrad.addColorStop(0, "#39435e");
    floorGrad.addColorStop(1, "#232c44");
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, 108, SCENE_W, H - 108);

    // vitrindeki gerçek araçlar (en fazla 6)
    const cars = g.inventory.slice(0, 6);
    cars.forEach((o, i) => {
      const x = 80 + i * 110;
      const y = 158;
      // podyum
      ctx.fillStyle = "#151c2e";
      ctx.beginPath();
      ctx.ellipse(x, y + 6, 42, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      drawCarSide(ctx, x, y, CAR_COLORS[i % CAR_COLORS.length], 1, 1.25);
      // fiyat etiketi sallanır
      const wob = Math.sin(t * 2 + i) * 2;
      ctx.fillStyle = "#ffd166";
      ctx.font = "bold 10px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(shortMoney(o.askingPrice), x, y - 26 + wob);
      // temiz araç parıldar
      if (o.car.cleanliness > 85 && Math.random() < 0.02) {
        s.particles.push({
          x: x + (Math.random() - 0.5) * 50,
          y: y - 8 - Math.random() * 8,
          vx: 0,
          vy: -4,
          life: 0.8,
          maxLife: 0.8,
          kind: "sparkle",
        });
      }
      // nakliyede etiketi
      if (o.inTransitUntilDay && o.inTransitUntilDay > g.day) {
        ctx.fillStyle = "rgba(90,169,255,0.9)";
        ctx.font = "9px sans-serif";
        ctx.fillText("🚚 yolda", x, y + 20);
      }
    });

    if (cars.length === 0) {
      ctx.fillStyle = "rgba(200,220,255,0.35)";
      ctx.font = "13px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Vitrin boş — pazardan araç katın!", SCENE_W / 2, 150);
      if (Math.random() < 0.05) {
        s.particles.push({
          x: Math.random() * SCENE_W,
          y: 120 + Math.random() * 60,
          vx: 5,
          vy: 2,
          life: 2,
          maxLife: 2,
          kind: "dust",
        });
      }
    }

    // gezen spot ışığı
    s.sweep = (Math.sin(t * 0.5) + 1) / 2;
    const spotX = 60 + s.sweep * (SCENE_W - 120);
    const grad = ctx.createRadialGradient(spotX, 40, 10, spotX, 150, 150);
    grad.addColorStop(0, "rgba(255,240,200,0.14)");
    grad.addColorStop(1, "rgba(255,240,200,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, SCENE_W, H);

    // içeride gezinen müşteri
    if (g.customers.length > 0 && cars.length > 0) {
      if (Math.abs(s.browserX - s.browserTarget) < 4) {
        s.browserTarget = 80 + Math.random() * (Math.min(cars.length, 6) * 110);
      }
      s.browserX += Math.sign(s.browserTarget - s.browserX) * 22 * dt;
      drawPerson(ctx, s.browserX, 178, "#d85a30", t * 8);
      // düşünce balonu
      if (Math.sin(t * 0.8) > 0.6) {
        ctx.font = "11px serif";
        ctx.fillText("💭", s.browserX + 8, 152);
      }
    }

    s.particles = stepParticles(s.particles, dt);
    drawParticles(ctx, s.particles);
  });

  return <canvas ref={ref} width={SCENE_W} height={H} style={sceneCanvasStyle} aria-label="Showroom sahnesi" />;
}

// ============ 🛒 İLANLAR: ilan panolu cadde ============

export function MarketScene() {
  const st = useRef({
    cars: [] as { x: number; dir: 1 | -1; speed: number; color: string; y: number }[],
    spawn: 0,
    adIndex: 0,
    adTimer: 0,
  });
  const H = 190;

  const ref = useScene(H, (ctx, dt, t, g) => {
    const s = st.current;
    drawSky(ctx, g.hour, SCENE_W, 100);
    // şehir silueti
    ctx.fillStyle = "rgba(20,28,48,0.9)";
    for (let i = 0; i < 12; i++) {
      const bw = 45 + ((i * 37) % 40);
      const bh = 30 + ((i * 53) % 45);
      ctx.fillRect(i * 62, 100 - bh, bw, bh);
    }
    // ışıklı pencereler
    ctx.fillStyle = "rgba(255,220,130,0.35)";
    for (let i = 0; i < 26; i++) {
      const x = (i * 97) % SCENE_W;
      const y = 58 + ((i * 31) % 36);
      if ((i + Math.floor(t * 0.5)) % 3 !== 0) ctx.fillRect(x, y, 4, 5);
    }
    // yol
    ctx.fillStyle = "#3a3a40";
    ctx.fillRect(0, 100, SCENE_W, 90);
    ctx.strokeStyle = "#d8d8d8";
    ctx.lineWidth = 3;
    ctx.setLineDash([22, 16]);
    ctx.beginPath();
    ctx.moveTo(0, 145);
    ctx.lineTo(SCENE_W, 145);
    ctx.stroke();
    ctx.setLineDash([]);

    // BÜYÜK İLAN PANOSU — gerçek ilanlardan döner
    s.adTimer -= dt;
    if (s.adTimer <= 0) {
      s.adTimer = 3.2;
      s.adIndex = (s.adIndex + 1) % Math.max(1, g.listings.length);
    }
    const l = g.listings[s.adIndex % Math.max(1, g.listings.length)];
    ctx.fillStyle = "#151c2e";
    ctx.fillRect(230, 6, 250, 62);
    ctx.strokeStyle = "#f5a524";
    ctx.lineWidth = 2;
    ctx.strokeRect(230, 6, 250, 62);
    ctx.fillStyle = "#8b99b8";
    ctx.font = "9px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("— GÜNÜN İLANLARI —", 355, 20);
    if (l) {
      ctx.fillStyle = "#e8edf7";
      ctx.font = "bold 12px sans-serif";
      ctx.fillText(`${l.car.year} ${l.car.brand} ${l.car.model}`.slice(0, 34), 355, 38);
      ctx.fillStyle = "#ffd166";
      ctx.font = "bold 13px sans-serif";
      const blink = Math.floor(t * 2) % 4 !== 0;
      if (blink) ctx.fillText(shortMoney(l.askingPrice), 355, 56);
    } else {
      ctx.fillStyle = "#8b99b8";
      ctx.font = "11px sans-serif";
      ctx.fillText("Yarın yeni ilanlar düşecek", 355, 42);
    }
    // pano direkleri
    ctx.fillStyle = "#39435e";
    ctx.fillRect(280, 68, 6, 32);
    ctx.fillRect(424, 68, 6, 32);

    // trafik: bazıları SATILIK tabelalı
    s.spawn -= dt;
    if (s.spawn <= 0) {
      s.spawn = 1 + Math.random() * 1.8;
      const dir = Math.random() < 0.5 ? 1 : -1;
      s.cars.push({
        x: dir === 1 ? -40 : SCENE_W + 40,
        dir: dir as 1 | -1,
        speed: 55 + Math.random() * 65,
        color: CAR_COLORS[Math.floor(Math.random() * CAR_COLORS.length)],
        y: dir === 1 ? 172 : 128,
      });
    }
    for (const c of s.cars) {
      c.x += c.dir * c.speed * dt;
      drawCarSide(ctx, c.x, c.y, c.color, c.dir);
      if (c.speed < 80) {
        ctx.fillStyle = "#ffd166";
        ctx.font = "8px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("SATILIK", c.x, c.y - 18);
      }
    }
    s.cars = s.cars.filter((c) => c.x > -60 && c.x < SCENE_W + 60);
  });

  return <canvas ref={ref} width={SCENE_W} height={H} style={sceneCanvasStyle} aria-label="İlan pazarı sahnesi" />;
}

// ============ 🔧 ATÖLYE: liftli tamirhane ============

export function WorkshopScene() {
  const st = useRef({ particles: [] as Particle[], liftY: 0 });
  const H = 200;

  const ref = useScene(H, (ctx, dt, t, g) => {
    const s = st.current;
    // duvar + zemin
    ctx.fillStyle = "#232c44";
    ctx.fillRect(0, 0, SCENE_W, 140);
    ctx.fillStyle = "#1b2233";
    ctx.fillRect(0, 140, SCENE_W, 60);
    // alet panosu
    ctx.fillStyle = "#2b3448";
    ctx.fillRect(20, 16, 150, 70);
    ctx.font = "13px serif";
    ctx.textAlign = "center";
    ctx.fillText("🔧", 45, 42);
    ctx.fillText("🔨", 75, 42);
    ctx.fillText("🪛", 105, 42);
    ctx.fillText("⚙️", 135, 42);
    ctx.fillText("🛞", 45, 70);
    ctx.fillText("🔩", 75, 70);
    ctx.fillText("🧰", 105, 70);
    ctx.fillText("🔋", 135, 70);
    // yağ varilleri
    for (const vx of [640, 668]) {
      ctx.fillStyle = "#993c1d";
      ctx.fillRect(vx, 108, 24, 34);
      ctx.fillStyle = "#712b13";
      ctx.fillRect(vx, 114, 24, 4);
      ctx.fillRect(vx, 128, 24, 4);
    }

    const activeJobs = g.jobs.length;
    // lift + araç
    const targetLift = activeJobs > 0 ? 34 : 0;
    s.liftY += (targetLift - s.liftY) * Math.min(1, dt * 2);
    const carY = 148 - s.liftY;
    // lift kolonları
    ctx.fillStyle = "#4a5675";
    ctx.fillRect(250, 66, 8, 82);
    ctx.fillRect(440, 66, 8, 82);
    // platform
    ctx.fillStyle = "#5a6a8a";
    ctx.fillRect(255, carY + 4, 190, 6);
    if (activeJobs > 0) {
      drawCarSide(ctx, 348, carY, CAR_COLORS[2], 1, 1.4);
      // tamirci altında çalışır
      drawPerson(ctx, 320, 172, "#3e6ec0", 0);
      ctx.font = "11px serif";
      const wrenchWob = Math.sin(t * 6) * 0.4;
      ctx.save();
      ctx.translate(332, 150);
      ctx.rotate(wrenchWob);
      ctx.fillText("🔧", 0, 0);
      ctx.restore();
      if (Math.random() < 0.3) {
        s.particles.push({
          x: 330 + Math.random() * 40,
          y: carY + 8,
          vx: (Math.random() - 0.5) * 50,
          vy: -20 - Math.random() * 50,
          life: 0.45,
          maxLife: 0.45,
          kind: "spark",
        });
      }
      // iş sayısı panosu
      ctx.fillStyle = "#ffd166";
      ctx.font = "bold 11px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`${activeJobs} iş devam ediyor`, 348, 40);
      // bekleyen işler sağda sıra
      for (let i = 1; i < Math.min(activeJobs, 3); i++) {
        drawCarSide(ctx, 520 + i * 55, 170, CAR_COLORS[(i + 4) % CAR_COLORS.length], 1, 0.9);
      }
    } else {
      // boş atölye: usta çay içer
      drawPerson(ctx, 348, 172, "#3e6ec0", 0);
      ctx.font = "10px serif";
      ctx.fillText("☕", 360, 158);
      if (Math.random() < 0.05) {
        s.particles.push({
          x: 362,
          y: 148,
          vx: (Math.random() - 0.5) * 5,
          vy: -12,
          life: 1.4,
          maxLife: 1.4,
          kind: "steam",
        });
      }
      ctx.fillStyle = "rgba(200,220,255,0.35)";
      ctx.font = "12px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Atölye sakin — araçlarınıza bakım yaptırın", 348, 40);
    }

    s.particles = stepParticles(s.particles, dt);
    drawParticles(ctx, s.particles);
  });

  return <canvas ref={ref} width={SCENE_W} height={H} style={sceneCanvasStyle} aria-label="Atölye sahnesi" />;
}

// ============ 🧑‍🤝‍🧑 MÜŞTERİLER: kapı önü ============

export function CustomersScene() {
  const st = useRef({
    walkers: [] as { x: number; phase: number; color: string; emoji: string; dir: number }[],
    tumbleX: -20,
  });
  const H = 180;

  const ref = useScene(H, (ctx, dt, t, g) => {
    const s = st.current;
    drawSky(ctx, g.hour, SCENE_W, 90);
    // galeri cephesi
    ctx.fillStyle = "#242f47";
    ctx.fillRect(180, 20, 350, 110);
    ctx.fillStyle = "#f5a524";
    ctx.fillRect(174, 12, 362, 16);
    ctx.fillStyle = "#1a1205";
    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("🚗 " + g.galleryName.slice(0, 22).toUpperCase(), 355, 24);
    // kapı
    ctx.fillStyle = "rgba(150,200,255,0.2)";
    ctx.fillRect(330, 60, 50, 70);
    ctx.strokeStyle = "rgba(150,200,255,0.5)";
    ctx.strokeRect(330, 60, 50, 70);
    // camlar
    ctx.fillStyle = "rgba(150,200,255,0.12)";
    ctx.fillRect(196, 44, 120, 70);
    ctx.fillRect(394, 44, 120, 70);
    // kaldırım + yol
    ctx.fillStyle = "#7a8296";
    ctx.fillRect(0, 130, SCENE_W, 12);
    ctx.fillStyle = "#3a3a40";
    ctx.fillRect(0, 142, SCENE_W, 38);

    // gerçek müşteriler kapı önünde volta atar
    const want = Math.min(5, g.customers.length);
    while (s.walkers.length < want) {
      const c = g.customers[s.walkers.length];
      s.walkers.push({
        x: 120 + Math.random() * 460,
        phase: Math.random() * 6,
        color: ["#d85a30", "#3e6ec0", "#1d9e75", "#993556", "#c0a23e"][s.walkers.length % 5],
        emoji: c?.emoji ?? "🧑",
        dir: Math.random() < 0.5 ? 1 : -1,
      });
    }
    if (s.walkers.length > want) s.walkers.length = want;

    s.walkers.forEach((w, i) => {
      w.x += w.dir * 16 * dt;
      if (w.x < 90) w.dir = 1;
      if (w.x > 610) w.dir = -1;
      drawPerson(ctx, w.x, 128, w.color, t * 7 + w.phase);
      // düşünce balonları sırayla
      if ((t + i * 1.3) % 6 < 2) {
        const cust = g.customers[i];
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        ctx.beginPath();
        ctx.roundRect(w.x - 22, 84, 44, 18, 8);
        ctx.fill();
        ctx.fillStyle = "#1a1205";
        ctx.font = "9px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(
          cust ? (cust.style === "siki" ? "indirim?" : cust.style === "acele" ? "hemen!" : cust.style === "titiz" ? "tramer?" : "🚗 ₺?") : "🚗",
          w.x,
          96
        );
      }
    });

    if (want === 0) {
      // müşteri yok: yuvarlanan çalı
      s.tumbleX += 35 * dt;
      if (s.tumbleX > SCENE_W + 30) s.tumbleX = -30;
      ctx.save();
      ctx.translate(s.tumbleX, 158);
      ctx.rotate(t * 4);
      ctx.strokeStyle = "#8a7a4a";
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.arc(0, 0, 8, (i * Math.PI) / 2.5, (i * Math.PI) / 2.5 + 2);
        ctx.stroke();
      }
      ctx.restore();
      ctx.fillStyle = "rgba(200,220,255,0.4)";
      ctx.font = "12px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Kapıda kimse yok... Günü bitirin, müşteriler gelsin.", 355, 168);
    }
  });

  return <canvas ref={ref} width={SCENE_W} height={H} style={sceneCanvasStyle} aria-label="Müşteriler sahnesi" />;
}

// ============ 🏦 OFİS ============

export function OfficeScene() {
  const st = useRef({ particles: [] as Particle[] });
  const H = 190;

  const ref = useScene(H, (ctx, dt, t, g) => {
    const s = st.current;
    // oda
    ctx.fillStyle = "#242f47";
    ctx.fillRect(0, 0, SCENE_W, 130);
    ctx.fillStyle = "#1b2233";
    ctx.fillRect(0, 130, SCENE_W, 60);
    // pencere (dışarısı saate göre)
    drawSky(ctx, g.hour, 150, 70);
    ctx.save();
    ctx.beginPath();
    ctx.rect(40, 16, 130, 64);
    ctx.clip();
    drawSky(ctx, g.hour, SCENE_W, 90);
    ctx.restore();
    ctx.strokeStyle = "#4a5675";
    ctx.lineWidth = 4;
    ctx.strokeRect(40, 16, 130, 64);
    ctx.beginPath();
    ctx.moveTo(105, 16);
    ctx.lineTo(105, 80);
    ctx.stroke();

    // duvar saati — akrep oyun saatini gösterir
    ctx.fillStyle = "#e8edf7";
    ctx.beginPath();
    ctx.arc(240, 40, 17, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#1a1205";
    ctx.lineWidth = 2;
    const hourAngle = ((g.hour % 12) / 12) * Math.PI * 2 - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(240, 40);
    ctx.lineTo(240 + Math.cos(hourAngle) * 10, 40 + Math.sin(hourAngle) * 10);
    ctx.stroke();
    const minAngle = t % (Math.PI * 2);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(240, 40);
    ctx.lineTo(240 + Math.cos(minAngle) * 13, 40 + Math.sin(minAngle) * 13);
    ctx.stroke();

    // masa + bilgisayar (ekranda canlı grafik)
    ctx.fillStyle = "#39435e";
    ctx.fillRect(200, 96, 200, 12);
    ctx.fillRect(210, 108, 10, 40);
    ctx.fillRect(380, 108, 10, 40);
    ctx.fillStyle = "#151c2e";
    ctx.fillRect(255, 58, 90, 40);
    ctx.strokeStyle = "#3ecf8e";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i <= 16; i++) {
      const px = 260 + i * 5;
      const py = 88 - Math.abs(Math.sin(i * 0.9 + t * 1.5)) * 22;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    // masadaki patron
    drawPerson(ctx, 310, 150, "#f5a524", 0);

    // kasadaki para — banknot destesi yüksekliği kasayla orantılı
    const stackH = Math.max(4, Math.min(46, Math.log10(Math.max(10, g.money)) * 8 - 24));
    ctx.fillStyle = "#1d9e75";
    for (let i = 0; i < stackH / 5; i++) {
      ctx.fillRect(452, 120 - i * 5, 40, 4);
      ctx.strokeStyle = "#0f6e56";
      ctx.strokeRect(452, 120 - i * 5, 40, 4);
    }
    ctx.fillStyle = "#8b99b8";
    ctx.font = "9px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("KASA", 472, 136);
    if (Math.random() < 0.02 && g.money > 0) {
      s.particles.push({
        x: 452 + Math.random() * 40,
        y: 70,
        vx: (Math.random() - 0.5) * 20,
        vy: 10,
        life: 1.2,
        maxLife: 1.2,
        kind: "coin",
      });
    }

    // kredi varsa borç zarfları uçuşur
    if (g.loans.length > 0) {
      const wob = Math.sin(t * 2) * 6;
      ctx.font = "15px serif";
      ctx.fillText("📄", 560, 60 + wob);
      ctx.fillStyle = "#ff5c5c";
      ctx.font = "9px sans-serif";
      ctx.fillText(`${g.loans.length} kredi aktif`, 566, 84);
    }

    // çalışan köşesi: işe alınanlar masalarında
    const staffEmojis: Record<string, string> = { usta: "👨‍🔧", danisman: "👨‍💼", detayci: "🧽" };
    g.staff.forEach((stf, i) => {
      const x = 560 + i * 48;
      ctx.fillStyle = "#39435e";
      ctx.fillRect(x - 16, 128, 36, 8);
      ctx.font = "15px serif";
      ctx.textAlign = "center";
      ctx.fillText(staffEmojis[stf.role] ?? "🧑", x, 124);
    });
    if (g.staff.length === 0) {
      ctx.fillStyle = "rgba(200,220,255,0.3)";
      ctx.font = "10px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("boş masalar — eleman alın", 610, 120);
    }

    s.particles = stepParticles(s.particles, dt);
    drawParticles(ctx, s.particles);
  });

  return <canvas ref={ref} width={SCENE_W} height={H} style={sceneCanvasStyle} aria-label="Ofis sahnesi" />;
}

// ============ 🏆 LİG: canlı yarış pisti ============

export function LeagueScene() {
  const H = 210;
  const ref = useScene(H, (ctx, dt, t, g) => {
    // çim + pist
    ctx.fillStyle = "#28381f";
    ctx.fillRect(0, 0, SCENE_W, H);

    const racers = [
      { name: "SİZ", wealth: g.stats.totalProfit, color: "#f5a524", me: true },
      ...g.rivals
        .slice()
        .sort((a, b) => b.wealth - a.wealth)
        .slice(0, 4)
        .map((r) => ({ name: r.name.split(" ")[0], wealth: r.wealth, color: "#8e8e8e", me: false })),
    ].sort((a, b) => b.wealth - a.wealth);

    const min = Math.min(...racers.map((r) => r.wealth));
    const max = Math.max(...racers.map((r) => r.wealth));
    const span = Math.max(1, max - min);

    racers.forEach((r, i) => {
      const laneY = 24 + i * 38;
      // şerit
      ctx.fillStyle = i % 2 === 0 ? "#3a3a40" : "#42424a";
      ctx.fillRect(0, laneY, SCENE_W, 34);
      ctx.strokeStyle = "rgba(216,216,216,0.35)";
      ctx.lineWidth = 1;
      ctx.setLineDash([14, 12]);
      ctx.beginPath();
      ctx.moveTo(0, laneY + 34);
      ctx.lineTo(SCENE_W, laneY + 34);
      ctx.stroke();
      ctx.setLineDash([]);

      // pozisyon: kâra göre; hafif salınım canlılık verir
      const progress = (r.wealth - min) / span;
      const x = 90 + progress * 520 + Math.sin(t * 3 + i * 1.7) * 4;
      drawCarSide(ctx, x, laneY + 26, r.me ? "#f5a524" : CAR_COLORS[(i + 1) % CAR_COLORS.length], 1, 1.05);
      if (r.me) {
        ctx.font = "11px serif";
        ctx.textAlign = "center";
        ctx.fillText("⭐", x, laneY + 4);
      }
      // isim + kâr
      ctx.fillStyle = r.me ? "#ffd166" : "#aebad2";
      ctx.font = r.me ? "bold 10px sans-serif" : "10px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(`${i + 1}. ${r.name}${r.me ? " (SİZ)" : ""}`, 8, laneY + 14);
      ctx.fillStyle = r.wealth >= 0 ? "#3ecf8e" : "#ff5c5c";
      ctx.fillText(shortMoney(r.wealth), 8, laneY + 26);
      // egzoz tozu
      if (Math.random() < 0.15) {
        ctx.fillStyle = "rgba(180,180,200,0.25)";
        ctx.beginPath();
        ctx.arc(x - 24 - Math.random() * 8, laneY + 26, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // varış çizgisi (damalı)
    for (let y = 20; y < 200; y += 8) {
      for (let k = 0; k < 2; k++) {
        ctx.fillStyle = (y / 8 + k) % 2 === 0 ? "#e8e8e8" : "#1a1a1a";
        ctx.fillRect(660 + k * 8, y, 8, 8);
      }
    }
    ctx.font = "13px serif";
    ctx.fillText("🏁", 668, 14);
  });

  return <canvas ref={ref} width={SCENE_W} height={H} style={sceneCanvasStyle} aria-label="Lig yarışı sahnesi" />;
}

// ============ 🎖️ KARİYER: zirveye tırmanış ============

export function CareerScene() {
  const st = useRef({ particles: [] as Particle[] });
  const H = 200;

  const ref = useScene(H, (ctx, dt, t, g) => {
    const s = st.current;
    drawSky(ctx, g.hour, SCENE_W, H);
    // güneş
    ctx.fillStyle = "#ffd166";
    ctx.beginPath();
    ctx.arc(70, 44, 16, 0, Math.PI * 2);
    ctx.fill();
    // dağ / rampa
    ctx.fillStyle = "#2b3448";
    ctx.beginPath();
    ctx.moveTo(0, 200);
    ctx.lineTo(0, 176);
    ctx.lineTo(640, 60);
    ctx.lineTo(710, 56);
    ctx.lineTo(710, 200);
    ctx.closePath();
    ctx.fill();
    // yol çizgisi
    ctx.strokeStyle = "#5a6a8a";
    ctx.lineWidth = 3;
    ctx.setLineDash([14, 10]);
    ctx.beginPath();
    ctx.moveTo(10, 172);
    ctx.lineTo(640, 58);
    ctx.stroke();
    ctx.setLineDash([]);

    // zirvedeki bayrak: sonraki seviye
    const flagWave = Math.sin(t * 4) * 3;
    ctx.fillStyle = "#4a5675";
    ctx.fillRect(648, 18, 4, 42);
    ctx.fillStyle = "#f5a524";
    ctx.beginPath();
    ctx.moveTo(652, 20);
    ctx.lineTo(700 + flagWave, 27);
    ctx.lineTo(652, 36);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#1a1205";
    ctx.font = "bold 9px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`Sv.${g.level + 1}`, 656, 31);

    // aracınız XP ilerlemesine göre tırmanır
    const need = Math.round((500 * Math.pow(g.level, 1.35)) / 50) * 50;
    const p = Math.min(1, g.xp / need);
    const carX = 40 + p * 570;
    const carY = 166 - p * 106;
    const angle = -Math.atan2(114, 630);
    ctx.save();
    ctx.translate(carX, carY);
    ctx.rotate(angle);
    drawCarSide(ctx, 0, 0, "#f5a524", 1, 1.15);
    ctx.restore();
    // egzoz
    if (Math.random() < 0.2) {
      s.particles.push({
        x: carX - 20,
        y: carY + 2,
        vx: -12,
        vy: -4,
        life: 0.9,
        maxLife: 0.9,
        kind: "steam",
      });
    }

    // seviye + unvan panosu
    ctx.fillStyle = "rgba(21,28,46,0.85)";
    ctx.beginPath();
    ctx.roundRect(220, 12, 270, 44, 8);
    ctx.fill();
    ctx.fillStyle = "#ffd166";
    ctx.font = "bold 13px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`Seviye ${g.level}`, 355, 30);
    ctx.fillStyle = "#aebad2";
    ctx.font = "10px sans-serif";
    ctx.fillText(`${g.xp.toLocaleString("tr-TR")} / ${need.toLocaleString("tr-TR")} XP — zirvede Sv.${g.level + 1} ödülü`, 355, 47);

    // kazanılan madalyalar yolda parlar
    const medals = Object.values(g.achievements).reduce((a, b) => a + b, 0);
    for (let i = 0; i < Math.min(medals, 8); i++) {
      const mx = 80 + i * 70;
      const my = 165 - (mx - 40) * (114 / 630) + 18;
      ctx.font = "11px serif";
      ctx.fillText("🏅", mx, my);
    }

    s.particles = stepParticles(s.particles, dt);
    drawParticles(ctx, s.particles);
  });

  return <canvas ref={ref} width={SCENE_W} height={H} style={sceneCanvasStyle} aria-label="Kariyer tırmanışı sahnesi" />;
}

// ============ 📜 DEFTER: muhasebe masası ============

export function LedgerScene() {
  const st = useRef({ particles: [] as Particle[] });
  const H = 170;

  const ref = useScene(H, (ctx, dt, t, g) => {
    const s = st.current;
    // masa
    ctx.fillStyle = "#3d2f1e";
    ctx.fillRect(0, 0, SCENE_W, H);
    ctx.fillStyle = "#4a3a26";
    for (let i = 0; i < 8; i++) ctx.fillRect(0, i * 24, SCENE_W, 2);

    // açık defter
    ctx.fillStyle = "#f0ead8";
    ctx.beginPath();
    ctx.roundRect(230, 30, 250, 110, 6);
    ctx.fill();
    ctx.strokeStyle = "#b4a88a";
    ctx.beginPath();
    ctx.moveTo(355, 30);
    ctx.lineTo(355, 140);
    ctx.stroke();
    // satırlar yazılıyormuş gibi
    ctx.strokeStyle = "#8a7a5a";
    ctx.lineWidth = 1;
    const written = Math.floor((t * 0.7) % 8);
    for (let i = 0; i < 8; i++) {
      const y = 48 + i * 11;
      const half = i < 4 ? 0 : 1;
      const lx = 244 + half * 125;
      const ly = y + (half ? -44 : 0);
      const wlen = i <= written ? 95 : 20 + Math.sin(i * 5) * 8;
      ctx.beginPath();
      ctx.moveTo(lx, ly);
      ctx.lineTo(lx + Math.max(12, wlen), ly);
      ctx.stroke();
    }
    // kalem sallanır
    const penWob = Math.sin(t * 3) * 6;
    ctx.font = "16px serif";
    ctx.textAlign = "center";
    ctx.fillText("✒️", 470 + penWob, 60);

    // kâr/zarar damgası
    const profit = g.stats.totalProfit;
    ctx.save();
    ctx.translate(300, 120);
    ctx.rotate(-0.12 + Math.sin(t) * 0.01);
    ctx.strokeStyle = profit >= 0 ? "rgba(29,158,117,0.85)" : "rgba(216,90,48,0.85)";
    ctx.lineWidth = 2;
    ctx.strokeRect(-46, -13, 92, 26);
    ctx.fillStyle = profit >= 0 ? "rgba(29,158,117,0.9)" : "rgba(216,90,48,0.9)";
    ctx.font = "bold 11px sans-serif";
    ctx.fillText(profit >= 0 ? "KÂRDA ✓" : "ZARARDA !", 0, 4);
    ctx.restore();
    ctx.fillStyle = profit >= 0 ? "#3ecf8e" : "#ff8c5c";
    ctx.font = "bold 12px sans-serif";
    ctx.fillText(shortMoney(profit), 300, 155);

    // hesap makinesi + çekmece
    ctx.fillStyle = "#2b3448";
    ctx.beginPath();
    ctx.roundRect(540, 44, 70, 90, 6);
    ctx.fill();
    ctx.fillStyle = "#9fe1cb";
    ctx.fillRect(548, 52, 54, 18);
    ctx.fillStyle = "#04342c";
    ctx.font = "10px monospace";
    ctx.textAlign = "right";
    const num = Math.abs(Math.floor(profit + Math.sin(t) * 500));
    ctx.fillText(num.toLocaleString("tr-TR").slice(0, 9), 598, 65);
    ctx.fillStyle = "#4a5675";
    for (let r = 0; r < 3; r++)
      for (let c = 0; c < 3; c++) ctx.fillRect(550 + c * 18, 78 + r * 17, 14, 12);

    // madeni para yığını + ara sıra düşen para
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = "#ffd166";
      ctx.beginPath();
      ctx.ellipse(140, 120 - i * 5, 22, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#b4881f";
      ctx.stroke();
    }
    if (Math.random() < 0.03) {
      s.particles.push({
        x: 120 + Math.random() * 40,
        y: 20,
        vx: (Math.random() - 0.5) * 10,
        vy: 20,
        life: 1.4,
        maxLife: 1.4,
        kind: "coin",
      });
    }

    s.particles = stepParticles(s.particles, dt);
    drawParticles(ctx, s.particles);
  });

  return <canvas ref={ref} width={SCENE_W} height={H} style={sceneCanvasStyle} aria-label="Defter sahnesi" />;
}
