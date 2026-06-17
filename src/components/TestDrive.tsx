import { useEffect, useRef, useState } from "react";
import type { Car, Fault } from "../types";
import { avgCondition } from "../game/valuation";
import { EngineSound, sfx } from "../game/sound";

const W = 400;
const H = 560;
const ROAD_L = 40;
const ROAD_R = 360;
const LANES = [93, 200, 307];
const CAR_W = 44;
const CAR_H = 78;
const PLAYER_Y = 440;
const DURATION = 180; // saniye (3 dakika)

type EffectKey =
  | "stutter"
  | "heat"
  | "smoke"
  | "tick"
  | "gearjolt"
  | "clutch"
  | "weakbrake"
  | "abs"
  | "bounce"
  | "pull"
  | "grip"
  | "battery"
  | "ac";

function effectOf(f: Fault): EffectKey | null {
  const l = f.label;
  if (l.includes("tekliyor")) return "stutter";
  if (l.includes("Hararet")) return "heat";
  if (l.includes("yağ yakıyor")) return "smoke";
  if (l.includes("Triger")) return "tick";
  if (l.includes("vites atlatıyor")) return "gearjolt";
  if (l.includes("Debriyaj")) return "clutch";
  if (l.includes("balata")) return "weakbrake";
  if (l.includes("ABS")) return "abs";
  if (l.includes("Amortisör")) return "bounce";
  if (l.includes("Rot")) return "pull";
  if (l.includes("Lastik")) return "grip";
  if (l.includes("Akü")) return "battery";
  if (l.includes("Klima")) return "ac";
  return null;
}

interface Npc {
  lane: number;
  x: number;
  y: number;
  speed: number;
  color: string;
}

export function TestDrive({
  car,
  onDone,
}: {
  car: Car;
  /** foundFaultIds: keşfedilen gizli arızalar; crashed: kaza yapıldı mı */
  onDone: (foundFaultIds: string[], crashed: boolean) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hints, setHints] = useState<string[]>([]);
  const [hud, setHud] = useState({ speed: 0, timeLeft: DURATION, temp: 70 });
  const [over, setOver] = useState<null | "crash" | "done">(null);
  const stateRef = useRef({ found: new Set<string>(), crashed: false, ended: false });

  // Klavye girişleri
  const keys = useRef({ up: false, down: false, left: false, right: false });

  useEffect(() => {
    const kd = (e: KeyboardEvent) => setKey(e, true);
    const ku = (e: KeyboardEvent) => setKey(e, false);
    function setKey(e: KeyboardEvent, v: boolean) {
      if (e.key === "ArrowUp" || e.key === "w") keys.current.up = v;
      else if (e.key === "ArrowDown" || e.key === "s") keys.current.down = v;
      else if (e.key === "ArrowLeft" || e.key === "a") keys.current.left = v;
      else if (e.key === "ArrowRight" || e.key === "d") keys.current.right = v;
      else return;
      e.preventDefault();
    }
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);
    return () => {
      window.removeEventListener("keydown", kd);
      window.removeEventListener("keyup", ku);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const faults = car.hiddenFaults
      .map((f) => ({ fault: f, effect: effectOf(f) }))
      .filter((x): x is { fault: Fault; effect: EffectKey } => x.effect !== null);
    const has = (e: EffectKey) => faults.some((f) => f.effect === e);
    const cond = avgCondition(car) / 100;

    // Oyun durumu
    let speed = 0; // km/h
    let x = LANES[1];
    let vx = 0;
    let t = 0;
    let temp = 70;
    let dashOffset = 0;
    let npcs: Npc[] = [];
    let npcTimer = 1.5;
    let stutterTimer = 4 + Math.random() * 4;
    let stuttering = 0;
    let stutterCount = 0;
    let joltCount = 0;
    let lastSpeedForJolt = 0;
    let brakeTime = 0;
    let clutchTime = 0;
    let pullTime = 0;
    let gripTime = 0;
    let bounceTime = 0;
    let engineStarted = !has("battery");
    let startDelay = has("battery") ? 2.5 : 0;
    let shake = 0;
    let smoke: { x: number; y: number; r: number; a: number }[] = [];
    let raf = 0;
    let last = performance.now();
    let crashFlash = 0;
    const engine = new EngineSound();
    engine.start();

    const maxSpeed = 90 + cond * 70; // kötü araç 90, iyi araç 160

    function discover(effect: EffectKey) {
      const f = faults.find((ff) => ff.effect === effect);
      if (!f) return;
      if (stateRef.current.found.has(f.fault.id)) return;
      stateRef.current.found.add(f.fault.id);
      sfx.hint();
      setHints((h) => [...h, "💡 " + f.fault.driveHint]);
    }

    function addHint(text: string) {
      setHints((h) => (h.includes(text) ? h : [...h, text]));
    }

    function end(crashed: boolean) {
      if (stateRef.current.ended) return;
      stateRef.current.ended = true;
      stateRef.current.crashed = crashed;
      engine.stop();
      if (crashed) sfx.crash();
      setOver(crashed ? "crash" : "done");
      cancelAnimationFrame(raf);
      // kısa bekleme sonrası sonucu bildir
      setTimeout(() => {
        onDone(Array.from(stateRef.current.found), crashed);
      }, crashed ? 1600 : 600);
    }

    if (has("battery")) {
      addHint("🔑 Marş güçlükle bastı... Akü zayıf olabilir mi?");
      setTimeout(() => discover("battery"), 2500);
    }

    function frame(now: number) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      t += dt;

      // ---- Fizik ----
      if (startDelay > 0) {
        startDelay -= dt;
        if (startDelay <= 0) engineStarted = true;
      }

      const k = keys.current;
      let accel = 0;
      if (engineStarted && k.up) {
        accel = 32;
        if (has("clutch") && speed > 50) {
          accel *= 0.35;
          clutchTime += dt;
          if (clutchTime > 5) discover("clutch");
        }
      }
      if (k.down) {
        const brakeForce = has("weakbrake") ? 24 : 65;
        accel -= brakeForce;
        if (speed > 30) {
          brakeTime += dt;
          if (has("weakbrake") && brakeTime > 2) discover("weakbrake");
          if (has("abs") && speed > 70) {
            vx += (Math.random() - 0.5) * 220 * dt * 10;
            discover("abs");
          }
        }
      }
      // doğal yavaşlama
      accel -= 6;

      // motor teklemesi
      if (has("stutter") && speed > 35) {
        stutterTimer -= dt;
        if (stutterTimer <= 0 && stuttering <= 0) {
          stuttering = 1.1;
          stutterTimer = 5 + Math.random() * 5;
          stutterCount++;
          if (stutterCount >= 2) discover("stutter");
        }
      }
      if (stuttering > 0) {
        stuttering -= dt;
        accel -= 45;
        shake = 3;
      }

      speed = Math.max(0, Math.min(maxSpeed, speed + accel * dt));

      // vites atlatma
      if (has("gearjolt")) {
        for (const th of [45, 85]) {
          if (lastSpeedForJolt < th && speed >= th) {
            speed = Math.max(0, speed - 10);
            shake = 4;
            joltCount++;
            if (joltCount >= 2) discover("gearjolt");
          }
        }
      }
      lastSpeedForJolt = speed;

      // hararet
      if (has("heat") && speed > 40) {
        temp += dt * 0.55;
        if (temp >= 105) discover("heat");
      } else {
        temp = Math.max(70, temp - dt * 2);
      }

      // direksiyon
      const steerBase = 200;
      const grip = has("grip") ? 0.55 : 1;
      let targetVx = ((k.left ? -1 : 0) + (k.right ? 1 : 0)) * steerBase * grip;
      if (speed < 5) targetVx = 0;
      const ease = has("grip") ? 2.2 : 8;
      vx += (targetVx - vx) * Math.min(1, ease * dt);

      if (has("pull") && speed > 40) {
        vx += 55 * dt * 10 * dt * 60; // sürekli sağa çekme
        pullTime += dt;
        if (pullTime > 6) discover("pull");
      }
      if (has("grip") && speed > 60) {
        gripTime += dt;
        if (gripTime > 4) discover("grip");
      }

      let bounceX = 0;
      if (has("bounce") && speed > 45) {
        bounceX = Math.sin(t * 7) * 6;
        bounceTime += dt;
        if (bounceTime > 7) discover("bounce");
      }

      x += vx * dt;
      x = Math.max(ROAD_L + CAR_W / 2 + 4, Math.min(ROAD_R - CAR_W / 2 - 4, x));

      // duman
      if (has("smoke") && speed > 30 && Math.random() < 0.3) {
        smoke.push({ x: x + (Math.random() - 0.5) * 10, y: PLAYER_Y + CAR_H, r: 4, a: 0.5 });
        if (t > 18) discover("smoke");
      }
      smoke = smoke.filter((p) => p.a > 0.02);
      for (const p of smoke) {
        p.y += 60 * dt;
        p.r += 14 * dt;
        p.a -= 0.35 * dt;
      }

      // zamanlı mesajlar
      if (has("tick") && t > 15) {
        discover("tick");
      }
      if (has("ac") && t > 25) {
        discover("ac");
      }

      // ---- Trafik ----
      npcTimer -= dt;
      if (npcTimer <= 0 && speed > 25) {
        npcTimer = 1.6 + Math.random() * 1.6;
        const lane = Math.floor(Math.random() * 3);
        if (!npcs.some((n) => n.lane === lane && n.y < 60)) {
          npcs.push({
            lane,
            x: LANES[lane],
            y: -120,
            speed: 35 + Math.random() * 35,
            color: ["#c0473e", "#3e6ec0", "#3ec06b", "#c0a23e", "#8e8e8e"][
              Math.floor(Math.random() * 5)
            ],
          });
        }
      }
      const pxPerKmh = 0.55;
      dashOffset = (dashOffset + speed * pxPerKmh * dt * 6) % 48;
      for (const n of npcs) {
        n.y += (speed - n.speed) * pxPerKmh * dt * 6;
      }
      npcs = npcs.filter((n) => n.y < H + 150 && n.y > -400);

      // çarpışma
      for (const n of npcs) {
        if (
          Math.abs(n.x - x) < CAR_W - 6 &&
          n.y + CAR_H > PLAYER_Y + 6 &&
          n.y < PLAYER_Y + CAR_H - 6
        ) {
          crashFlash = 1;
          end(true);
          break;
        }
      }

      shake = Math.max(0, shake - dt * 12);
      engine.update(speed, stuttering > 0);

      // ---- Çizim ----
      ctx.save();
      if (shake > 0) ctx.translate((Math.random() - 0.5) * shake * 2, (Math.random() - 0.5) * shake * 2);

      // zemin
      ctx.fillStyle = "#2f4a2d";
      ctx.fillRect(0, 0, W, H);
      // yol
      ctx.fillStyle = "#3a3a40";
      ctx.fillRect(ROAD_L, 0, ROAD_R - ROAD_L, H);
      // kenar çizgileri
      ctx.fillStyle = "#e8e8e8";
      ctx.fillRect(ROAD_L, 0, 5, H);
      ctx.fillRect(ROAD_R - 5, 0, 5, H);
      // şerit çizgileri
      ctx.fillStyle = "#d8d8d8";
      for (const lx of [ROAD_L + 106, ROAD_L + 213]) {
        for (let y = -48 + dashOffset; y < H; y += 48) {
          ctx.fillRect(lx - 3, y, 6, 26);
        }
      }

      // npc araçlar
      for (const n of npcs) {
        drawCar(ctx, n.x, n.y, n.color);
      }

      // duman
      for (const p of smoke) {
        ctx.fillStyle = `rgba(120,140,200,${p.a})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // oyuncu aracı
      drawCar(ctx, x + bounceX, PLAYER_Y, "#f5a524", true);

      if (crashFlash > 0) {
        ctx.fillStyle = `rgba(255,60,60,0.45)`;
        ctx.fillRect(0, 0, W, H);
      }

      ctx.restore();

      setHud({ speed: Math.round(speed), timeLeft: Math.max(0, Math.ceil(DURATION - t)), temp: Math.round(temp) });

      if (t >= DURATION) {
        end(false);
        return;
      }
      if (!stateRef.current.ended) raf = requestAnimationFrame(frame);
    }

    function drawCar(c: CanvasRenderingContext2D, cx: number, cy: number, color: string, player = false) {
      c.save();
      c.translate(cx, cy + CAR_H / 2);
      // gövde
      c.fillStyle = color;
      roundRect(c, -CAR_W / 2, -CAR_H / 2, CAR_W, CAR_H, 10);
      c.fill();
      // cam
      c.fillStyle = "rgba(20,30,50,0.8)";
      roundRect(c, -CAR_W / 2 + 6, -CAR_H / 2 + (player ? 12 : 46), CAR_W - 12, 16, 4);
      c.fill();
      roundRect(c, -CAR_W / 2 + 6, -CAR_H / 2 + (player ? 50 : 12), CAR_W - 12, 12, 4);
      c.fill();
      // farlar / stoplar
      c.fillStyle = player ? "#ff4444" : "#ffdd88";
      c.fillRect(-CAR_W / 2 + 4, player ? CAR_H / 2 - 6 : -CAR_H / 2 + 2, 9, 4);
      c.fillRect(CAR_W / 2 - 13, player ? CAR_H / 2 - 6 : -CAR_H / 2 + 2, 9, 4);
      c.restore();
    }

    function roundRect(c: CanvasRenderingContext2D, rx: number, ry: number, rw: number, rh: number, r: number) {
      c.beginPath();
      c.moveTo(rx + r, ry);
      c.arcTo(rx + rw, ry, rx + rw, ry + rh, r);
      c.arcTo(rx + rw, ry + rh, rx, ry + rh, r);
      c.arcTo(rx, ry + rh, rx, ry, r);
      c.arcTo(rx, ry, rx + rw, ry, r);
      c.closePath();
    }

    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      engine.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const touchBtn = (key: keyof typeof keys.current) => ({
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault();
      keys.current[key] = true;
    },
    onPointerUp: () => (keys.current[key] = false),
    onPointerLeave: () => (keys.current[key] = false),
  });

  return (
    <div className="testdrive-wrap">
      <div>
        <canvas ref={canvasRef} width={W} height={H} className="testdrive-canvas" />
        <div className="row" style={{ justifyContent: "center", marginTop: 8 }}>
          <button {...touchBtn("left")}>⬅️</button>
          <button {...touchBtn("up")}>Gaz ⬆️</button>
          <button {...touchBtn("down")}>Fren ⬇️</button>
          <button {...touchBtn("right")}>➡️</button>
        </div>
      </div>
      <div className="td-panel">
        <div className="card" style={{ padding: 10 }}>
          <div className="row between">
            <span>⏱️ {Math.floor(hud.timeLeft / 60)}:{String(hud.timeLeft % 60).padStart(2, "0")}</span>
            <strong style={{ fontSize: 20 }}>{hud.speed} km/s</strong>
          </div>
          <div style={{ fontSize: 12.5, marginTop: 4 }}>
            🌡️ Motor:{" "}
            <span style={{ color: hud.temp > 100 ? "var(--red)" : "var(--green)" }}>{hud.temp}°C</span>
          </div>
        </div>
        <div className="td-hints">
          <strong style={{ fontSize: 12, color: "var(--muted)" }}>SÜRÜŞ NOTLARI</strong>
          {hints.length === 0 && (
            <div style={{ color: "var(--muted)", marginTop: 6 }}>
              Arabayı sür, gözünü kulağını açık tut. Sorun varsa kendini belli eder...
              <br />
              <br />
              🎮 Ok tuşları veya WASD
            </div>
          )}
          {hints.map((h, i) => (
            <div key={i} className="hint">
              {h}
            </div>
          ))}
        </div>
        {over === "crash" && (
          <div className="card" style={{ borderColor: "var(--red)", color: "var(--red)" }}>
            💥 Kaza yaptınız! Satıcı çok kızgın...
          </div>
        )}
        {over === "done" && (
          <div className="card" style={{ borderColor: "var(--green)", color: "var(--green)" }}>
            ✅ Sürüş tamamlandı.
          </div>
        )}
        {!over && (
          <button
            className="primary"
            onClick={() => {
              stateRef.current.ended = true;
              setOver("done");
              setTimeout(() => onDone(Array.from(stateRef.current.found), false), 400);
            }}
          >
            Sürüşü Bitir ✅
          </button>
        )}
      </div>
    </div>
  );
}
