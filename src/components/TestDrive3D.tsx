import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import type { Car, Fault } from "../types";
import { avgCondition } from "../game/valuation";
import { EngineSound, sfx } from "../game/sound";

// 3D test sürüşü: arkadan kamera, 3 şeritli otoyol, trafik.
// Arızalar sürüş hissine yansır (2D sürümdeki effectOf mantığının 3D portu).

const DURATION = 180; // saniye
const LANES = [-3.4, 0, 3.4];

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

function makeCar3D(color: number): THREE.Group {
  const g = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(1.7, 0.5, 3.4),
    new THREE.MeshLambertMaterial({ color })
  );
  body.position.y = 0.5;
  g.add(body);
  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 0.45, 1.7),
    new THREE.MeshLambertMaterial({ color: 0x9fc6e8 })
  );
  cabin.position.set(0, 0.95, 0.15);
  g.add(cabin);
  const wheelGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 12);
  wheelGeo.rotateZ(Math.PI / 2);
  const wheelMat = new THREE.MeshLambertMaterial({ color: 0x181818 });
  for (const [wx, wz] of [
    [-0.85, 1.1],
    [0.85, 1.1],
    [-0.85, -1.1],
    [0.85, -1.1],
  ]) {
    const w = new THREE.Mesh(wheelGeo, wheelMat);
    w.position.set(wx, 0.3, wz);
    g.add(w);
  }
  return g;
}

export function TestDrive3D({
  car,
  onDone,
}: {
  car: Car;
  onDone: (foundFaultIds: string[], crashed: boolean) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hints, setHints] = useState<string[]>([]);
  const [hud, setHud] = useState({ speed: 0, timeLeft: DURATION, temp: 70 });
  const [over, setOver] = useState<null | "crash" | "done">(null);
  const stateRef = useRef({ found: new Set<string>(), crashed: false, ended: false });
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
    const container = containerRef.current;
    if (!container) return;

    // ---- sahne ----
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x8fc3e8);
    scene.fog = new THREE.Fog(0x8fc3e8, 60, 170);
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 300);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
    container.appendChild(renderer.domElement);
    function resize() {
      const w = container!.clientWidth;
      const h = container!.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    scene.add(new THREE.HemisphereLight(0xbfd9ff, 0x3a5a2a, 1.0));
    const sun = new THREE.DirectionalLight(0xfff2d0, 1.0);
    sun.position.set(15, 30, 10);
    scene.add(sun);

    // zemin + yol
    const grass = new THREE.Mesh(
      new THREE.PlaneGeometry(400, 400),
      new THREE.MeshLambertMaterial({ color: 0x3f6a2f })
    );
    grass.rotation.x = -Math.PI / 2;
    grass.position.y = -0.05;
    scene.add(grass);
    const road = new THREE.Mesh(
      new THREE.PlaneGeometry(12, 400),
      new THREE.MeshLambertMaterial({ color: 0x3a3a40 })
    );
    road.rotation.x = -Math.PI / 2;
    scene.add(road);

    // kayan şerit çizgileri
    const dashes: THREE.Mesh[] = [];
    const dashMat = new THREE.MeshBasicMaterial({ color: 0xd8d8d8 });
    for (let i = 0; i < 30; i++) {
      for (const dx of [-1.7, 1.7]) {
        const d = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 2.2), dashMat);
        d.rotation.x = -Math.PI / 2;
        d.position.set(dx, 0.01, -i * 8 + 20);
        dashes.push(d);
        scene.add(d);
      }
    }
    // yol kenarı direkleri + ağaçlar
    const props: THREE.Object3D[] = [];
    for (let i = 0; i < 16; i++) {
      const side = i % 2 === 0 ? 1 : -1;
      const tree = new THREE.Group();
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.2, 1.2, 6),
        new THREE.MeshLambertMaterial({ color: 0x6a4a2a })
      );
      trunk.position.y = 0.6;
      tree.add(trunk);
      const crown = new THREE.Mesh(
        new THREE.ConeGeometry(1.1, 2.4, 8),
        new THREE.MeshLambertMaterial({ color: 0x2f6a3f })
      );
      crown.position.y = 2.2;
      tree.add(crown);
      tree.position.set(side * (8 + Math.random() * 6), 0, -i * 16 + 20);
      props.push(tree);
      scene.add(tree);
    }

    // oyuncu aracı
    const player = makeCar3D(0xf5a524);
    scene.add(player);

    // trafik
    const npcs: { g: THREE.Group; lane: number; speed: number; z: number }[] = [];
    const npcColors = [0xc0473e, 0x3e6ec0, 0x3ec06b, 0x8e8e8e, 0xc0a23e];
    for (let i = 0; i < 5; i++) {
      const g = makeCar3D(npcColors[i]);
      const lane = Math.floor(Math.random() * 3);
      const z = -60 - i * 45;
      g.position.set(LANES[lane], 0, z);
      npcs.push({ g, lane, speed: 35 + Math.random() * 35, z });
      scene.add(g);
    }

    // egzoz dumanı (yağ yakıyor arızası)
    const smokes: { s: THREE.Sprite; life: number }[] = [];
    function makeSmokeSprite(): THREE.Sprite {
      const cv = document.createElement("canvas");
      cv.width = cv.height = 64;
      const c = cv.getContext("2d")!;
      const grad = c.createRadialGradient(32, 32, 4, 32, 32, 30);
      grad.addColorStop(0, "rgba(150,160,200,0.8)");
      grad.addColorStop(1, "rgba(150,160,200,0)");
      c.fillStyle = grad;
      c.fillRect(0, 0, 64, 64);
      const sp = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: new THREE.CanvasTexture(cv),
          transparent: true,
          depthWrite: false,
        })
      );
      sp.scale.setScalar(1.2);
      return sp;
    }

    // ---- sürüş durumu (2D sürümle aynı denge) ----
    const faults = car.hiddenFaults
      .map((f) => ({ fault: f, effect: effectOf(f) }))
      .filter((x): x is { fault: Fault; effect: EffectKey } => x.effect !== null);
    const has = (e: EffectKey) => faults.some((f) => f.effect === e);
    const cond = avgCondition(car) / 100;
    const maxSpeed = 90 + cond * 70;

    let speed = 0;
    let x = 0;
    let vx = 0;
    let t = 0;
    let temp = 70;
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
    const engine = new EngineSound();
    engine.start();
    const clock = new THREE.Clock();

    function discover(effect: EffectKey) {
      const f = faults.find((ff) => ff.effect === effect);
      if (!f || stateRef.current.found.has(f.fault.id)) return;
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
      renderer.setAnimationLoop(null);
      setTimeout(() => onDone(Array.from(stateRef.current.found), crashed), crashed ? 1600 : 600);
    }

    if (has("battery")) {
      addHint("🔑 Marş güçlükle bastı... Akü zayıf olabilir mi?");
      setTimeout(() => discover("battery"), 2500);
    }

    renderer.setAnimationLoop(() => {
      const dt = Math.min(0.05, clock.getDelta());
      t += dt;

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
        accel -= has("weakbrake") ? 24 : 65;
        if (speed > 30) {
          brakeTime += dt;
          if (has("weakbrake") && brakeTime > 2) discover("weakbrake");
          if (has("abs") && speed > 70) {
            vx += (Math.random() - 0.5) * 22;
            discover("abs");
          }
        }
      }
      accel -= 6;

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
        shake = 0.14;
      }

      speed = Math.max(0, Math.min(maxSpeed, speed + accel * dt));

      if (has("gearjolt")) {
        for (const th of [45, 85]) {
          if (lastSpeedForJolt < th && speed >= th) {
            speed = Math.max(0, speed - 10);
            shake = 0.2;
            joltCount++;
            if (joltCount >= 2) discover("gearjolt");
          }
        }
      }
      lastSpeedForJolt = speed;

      if (has("heat") && speed > 40) {
        temp += dt * 0.55;
        if (temp >= 105) discover("heat");
      } else {
        temp = Math.max(70, temp - dt * 2);
      }

      // direksiyon
      const grip = has("grip") ? 0.55 : 1;
      let targetVx = ((k.left ? -1 : 0) + (k.right ? 1 : 0)) * 5.2 * grip;
      if (speed < 5) targetVx = 0;
      const ease = has("grip") ? 2.2 : 8;
      vx += (targetVx - vx) * Math.min(1, ease * dt);
      if (has("pull") && speed > 40) {
        vx += 1.5 * dt * 10;
        pullTime += dt;
        if (pullTime > 6) discover("pull");
      }
      if (has("grip") && speed > 60) {
        gripTime += dt;
        if (gripTime > 4) discover("grip");
      }
      x = Math.max(-4.6, Math.min(4.6, x + vx * dt));

      let bounceY = 0;
      if (has("bounce") && speed > 45) {
        bounceY = Math.abs(Math.sin(t * 7)) * 0.14;
        bounceTime += dt;
        if (bounceTime > 7) discover("bounce");
      }

      if (has("tick") && t > 15) discover("tick");
      if (has("ac") && t > 25) discover("ac");

      // dünya oyuncuya doğru akar
      const worldV = speed * 0.28;
      for (const d of dashes) {
        d.position.z += worldV * dt;
        if (d.position.z > 24) d.position.z -= 240;
      }
      for (const p of props) {
        p.position.z += worldV * dt;
        if (p.position.z > 24) p.position.z -= 256;
      }

      // trafik
      for (const n of npcs) {
        n.z += (speed - n.speed) * 0.28 * dt;
        if (n.z > 16) {
          n.z = -220 - Math.random() * 60;
          n.lane = Math.floor(Math.random() * 3);
          n.speed = 35 + Math.random() * 35;
        }
        n.g.position.set(LANES[n.lane], 0, n.z);
        // çarpışma
        if (Math.abs(n.g.position.x - x) < 1.5 && Math.abs(n.z) < 2.6) {
          end(true);
        }
      }

      // duman
      if (has("smoke") && speed > 30 && Math.random() < 0.25) {
        const s = makeSmokeSprite();
        s.position.set(x + (Math.random() - 0.5) * 0.4, 0.5, 2);
        scene.add(s);
        smokes.push({ s, life: 1.2 });
        if (t > 18) discover("smoke");
      }
      for (let i = smokes.length - 1; i >= 0; i--) {
        const sm = smokes[i];
        sm.life -= dt;
        sm.s.position.y += 0.8 * dt;
        sm.s.position.z += worldV * dt * 0.6;
        sm.s.scale.multiplyScalar(1 + dt);
        (sm.s.material as THREE.SpriteMaterial).opacity = Math.max(0, sm.life / 1.2);
        if (sm.life <= 0) {
          scene.remove(sm.s);
          smokes.splice(i, 1);
        }
      }

      // oyuncu + kamera
      player.position.set(x, bounceY, 0);
      player.rotation.y = -vx * 0.04;
      player.rotation.z = -vx * 0.02;
      shake = Math.max(0, shake - dt * 0.6);
      const shx = (Math.random() - 0.5) * shake;
      const shy = (Math.random() - 0.5) * shake;
      camera.position.set(x * 0.6 + shx, 3.6 + shy, 8.2);
      camera.lookAt(x, 1, -8);

      engine.update(speed, stuttering > 0);
      setHud({
        speed: Math.round(speed),
        timeLeft: Math.max(0, Math.ceil(DURATION - t)),
        temp: Math.round(temp),
      });

      if (t >= DURATION) {
        end(false);
        return;
      }
      renderer.render(scene, camera);
    });

    return () => {
      renderer.setAnimationLoop(null);
      engine.stop();
      ro.disconnect();
      renderer.dispose();
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const touchBtn = (key: keyof typeof keys.current) => ({
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      keys.current[key] = true;
    },
    onPointerUp: () => (keys.current[key] = false),
    onPointerCancel: () => (keys.current[key] = false),
    onPointerLeave: () => (keys.current[key] = false),
    onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
  });

  return (
    <div className="testdrive-wrap">
      <div style={{ flex: "1 1 320px", maxWidth: 560 }}>
        <div
          ref={containerRef}
          className="testdrive-canvas"
          style={{ width: "100%", height: 340, position: "relative" }}
        />
        <div className="td-controls">
          <div className="pedal-group">
            <button {...touchBtn("left")} aria-label="Sola dön">⬅️</button>
            <button {...touchBtn("right")} aria-label="Sağa dön">➡️</button>
          </div>
          <div className="pedal-group">
            <button {...touchBtn("down")} aria-label="Fren">🛑 Fren</button>
            <button {...touchBtn("up")} aria-label="Gaz">⛽ Gaz</button>
          </div>
        </div>
      </div>
      <div className="td-panel">
        <div className="card" style={{ padding: 10 }}>
          <div className="row between">
            <span>
              ⏱️ {Math.floor(hud.timeLeft / 60)}:{String(hud.timeLeft % 60).padStart(2, "0")}
            </span>
            <strong style={{ fontSize: 20 }}>{hud.speed} km/s</strong>
          </div>
          <div style={{ fontSize: 12.5, marginTop: 4 }}>
            🌡️ Motor:{" "}
            <span style={{ color: hud.temp > 100 ? "var(--red)" : "var(--green)" }}>
              {hud.temp}°C
            </span>
          </div>
        </div>
        <div className="td-hints">
          <strong style={{ fontSize: 12, color: "var(--muted)" }}>SÜRÜŞ NOTLARI</strong>
          {hints.length === 0 && (
            <div style={{ color: "var(--muted)", marginTop: 6 }}>
              Arabayı sür, gözünü kulağını açık tut. Sorun varsa kendini belli eder...
              <br />
              <br />
              🎮 Ok tuşları / WASD ya da ekrandaki pedallar
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
