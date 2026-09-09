import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { facilityLevel, type FacilityKey } from "../game/facilities";
import { useGame } from "../game/state";
import { sfx } from "../game/sound";

// 3D oyun dünyası: galeri kompleksi, sürükleyerek döndürülür, binalara tıklanır.
// Oyun durumuna canlı bağlıdır: seviyeler bina boyutunu, saat gökyüzünü,
// işler kıvılcımları, müşteriler yayaları belirler.

export type PanelKey =
  | "galeri"
  | "pazar"
  | "tesis"
  | "atolye"
  | "musteri"
  | "ofis"
  | "lig"
  | "kariyer"
  | "defter";

interface Hit {
  panel: PanelKey;
  facility?: FacilityKey;
  label: string;
}

const FACILITY_COLORS: Record<FacilityKey, number> = {
  showroom: 0xf5a524,
  atolye: 0x5aa9ff,
  yikama: 0x3ecf8e,
  parca: 0xc792ea,
  kafeterya: 0xffd166,
  pompa: 0xff8c5c,
  otopark: 0x8b99b8,
};

const FACILITY_NAMES: Record<FacilityKey, string> = {
  showroom: "🏢 Vitrin",
  atolye: "🔧 Tamirhane",
  yikama: "🧽 Oto Yıkama",
  parca: "🛞 Yedek Parça",
  kafeterya: "☕ Kafeterya",
  pompa: "⛽ Pompa",
  otopark: "🅿️ Otopark",
};

// Parsel yerleşimi: [x, z, genişlik, derinlik]
const LOTS: Record<FacilityKey, [number, number, number, number]> = {
  showroom: [-13, 2.5, 9, 6],
  atolye: [-3.5, 3, 6, 5],
  yikama: [3.5, 3, 6, 5],
  pompa: [11, 2.5, 7, 5.5],
  otopark: [-13, -5.5, 9, 5],
  kafeterya: [-4.5, -5.5, 5, 4],
  parca: [2.5, -5.5, 6, 4],
};

const FACILITY_PANEL: Record<FacilityKey, PanelKey> = {
  showroom: "galeri",
  atolye: "atolye",
  yikama: "tesis",
  parca: "tesis",
  kafeterya: "tesis",
  pompa: "tesis",
  otopark: "tesis",
};

const CAR_COLORS = [0xc0473e, 0x3e6ec0, 0x3ec06b, 0xc0a23e, 0x8e8e8e, 0xd8d8d8, 0x5a3ec0];

function makeLabelSprite(text: string, scale = 1): THREE.Sprite {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 128;
  const c = canvas.getContext("2d")!;
  c.font = "bold 52px 'Segoe UI', sans-serif";
  c.textAlign = "center";
  c.textBaseline = "middle";
  c.shadowColor = "rgba(0,0,0,0.85)";
  c.shadowBlur = 10;
  c.fillStyle = "#ffffff";
  c.fillText(text, 256, 64);
  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 4;
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false })
  );
  sprite.scale.set(6.4 * scale, 1.6 * scale, 1);
  return sprite;
}

function makeCar(color: number): THREE.Group {
  const g = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(1.9, 0.45, 0.85),
    new THREE.MeshLambertMaterial({ color })
  );
  body.position.y = 0.45;
  g.add(body);
  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(1.0, 0.38, 0.75),
    new THREE.MeshLambertMaterial({ color: 0x9fc6e8 })
  );
  cabin.position.set(-0.1, 0.85, 0);
  g.add(cabin);
  const wheelGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.16, 12);
  wheelGeo.rotateX(Math.PI / 2);
  const wheelMat = new THREE.MeshLambertMaterial({ color: 0x181818 });
  for (const [wx, wz] of [
    [-0.6, 0.45],
    [0.6, 0.45],
    [-0.6, -0.45],
    [0.6, -0.45],
  ]) {
    const w = new THREE.Mesh(wheelGeo, wheelMat);
    w.position.set(wx, 0.22, wz);
    g.add(w);
  }
  return g;
}

function makePerson(color: number): THREE.Group {
  const g = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.2, 0.7, 8),
    new THREE.MeshLambertMaterial({ color })
  );
  body.position.y = 0.35;
  g.add(body);
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.17, 10, 10),
    new THREE.MeshLambertMaterial({ color: 0xe8b98a })
  );
  head.position.y = 0.85;
  g.add(head);
  return g;
}

export function Hub3D({ onOpen }: { onOpen: (panel: PanelKey, facility?: FacilityKey) => void }) {
  const { state } = useGame();
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef(state);
  gameRef.current = state;
  const onOpenRef = useRef(onOpen);
  onOpenRef.current = onOpen;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // ---- temel kurulum ----
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0f1420, 45, 90);
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 200);
    camera.position.set(16, 15, 24);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0.5, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minDistance = 12;
    controls.maxDistance = 46;
    controls.maxPolarAngle = 1.32;
    controls.minPolarAngle = 0.35;

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

    // ---- ışıklar ----
    const hemi = new THREE.HemisphereLight(0xbfd9ff, 0x2a3550, 0.9);
    scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xfff2d0, 1.1);
    sun.position.set(20, 30, 12);
    scene.add(sun);

    // ---- zemin, parsel, yol ----
    const grass = new THREE.Mesh(
      new THREE.PlaneGeometry(120, 120),
      new THREE.MeshLambertMaterial({ color: 0x28381f })
    );
    grass.rotation.x = -Math.PI / 2;
    grass.position.y = -0.02;
    scene.add(grass);

    const parcel = new THREE.Mesh(
      new THREE.PlaneGeometry(38, 20),
      new THREE.MeshLambertMaterial({ color: 0x33405a })
    );
    parcel.rotation.x = -Math.PI / 2;
    parcel.position.set(0, 0, -0.5);
    scene.add(parcel);

    const road = new THREE.Mesh(
      new THREE.PlaneGeometry(120, 4.6),
      new THREE.MeshLambertMaterial({ color: 0x3a3a40 })
    );
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0.01, 12);
    scene.add(road);
    // şerit çizgileri
    for (let i = -14; i <= 14; i++) {
      const dash = new THREE.Mesh(
        new THREE.PlaneGeometry(1.6, 0.16),
        new THREE.MeshBasicMaterial({ color: 0xd8d8d8 })
      );
      dash.rotation.x = -Math.PI / 2;
      dash.position.set(i * 4, 0.02, 12);
      scene.add(dash);
    }
    // kaldırım
    const sidewalk = new THREE.Mesh(
      new THREE.PlaneGeometry(120, 1.4),
      new THREE.MeshLambertMaterial({ color: 0x7a8296 })
    );
    sidewalk.rotation.x = -Math.PI / 2;
    sidewalk.position.set(0, 0.015, 9);
    scene.add(sidewalk);

    // ---- binalar ----
    const clickables: { obj: THREE.Object3D; hit: Hit }[] = [];
    const windowMats: THREE.MeshLambertMaterial[] = [];
    const buildingGroups = new Map<FacilityKey, THREE.Group>();
    const lastLevels = new Map<FacilityKey, number>();
    // inşaat animasyonu: bina tozu dumanıyla yerden yükselir, üstünde çekiç sallanır
    const constructionAnims: { g: THREE.Group; t: number; hammer: THREE.Sprite; x: number; z: number; w: number }[] = [];
    const dust: { s: THREE.Sprite; vx: number; vz: number; life: number }[] = [];

    function buildFacility(key: FacilityKey, animate = false) {
      const old = buildingGroups.get(key);
      if (old) {
        scene.remove(old);
        clickables.splice(
          0,
          clickables.length,
          ...clickables.filter((c) => c.obj !== old)
        );
      }
      const [x, z, w, d] = LOTS[key];
      const level = facilityLevel(gameRef.current, key);
      const color = FACILITY_COLORS[key];
      const g = new THREE.Group();
      g.position.set(x, 0, z);

      if (level === 0) {
        // boş arsa: koyu zemin + tabela
        const pad = new THREE.Mesh(
          new THREE.BoxGeometry(w, 0.08, d),
          new THREE.MeshLambertMaterial({ color: 0x1d2618 })
        );
        pad.position.y = 0.04;
        g.add(pad);
        const sign = new THREE.Mesh(
          new THREE.BoxGeometry(1.6, 1.0, 0.08),
          new THREE.MeshLambertMaterial({ color: 0x4a6741 })
        );
        sign.position.set(0, 0.9, d / 2 - 0.3);
        g.add(sign);
        const label = makeLabelSprite(FACILITY_NAMES[key].split(" ")[0] + " + İnşa Et", 0.85);
        label.position.set(0, 2.1, 0);
        g.add(label);
      } else if (key === "otopark") {
        // düz otopark: çizgili asfalt + park halinde araçlar
        const pad = new THREE.Mesh(
          new THREE.BoxGeometry(w, 0.08, d),
          new THREE.MeshLambertMaterial({ color: 0x2b3448 })
        );
        pad.position.y = 0.04;
        g.add(pad);
        for (let i = 0; i < 3; i++) {
          const line = new THREE.Mesh(
            new THREE.PlaneGeometry(0.12, d - 1),
            new THREE.MeshBasicMaterial({ color: 0x5a6a8a })
          );
          line.rotation.x = -Math.PI / 2;
          line.position.set(-w / 2 + (i + 1) * (w / 4), 0.09, 0);
          g.add(line);
        }
        const extra = Math.max(0, gameRef.current.inventory.length - 4);
        for (let i = 0; i < Math.min(extra, level); i++) {
          const car = makeCar(CAR_COLORS[(i + 3) % CAR_COLORS.length]);
          car.scale.setScalar(0.85);
          car.position.set(-w / 2 + 1.4 + i * 2.4, 0.04, 0);
          car.rotation.y = Math.PI / 2;
          g.add(car);
        }
        const label = makeLabelSprite(`🅿️ Otopark ${"★".repeat(level)}`, 0.8);
        label.position.set(0, 2.2, 0);
        g.add(label);
      } else {
        const h = 1.9 + level * 0.55;
        const body = new THREE.Mesh(
          new THREE.BoxGeometry(w, h, d),
          new THREE.MeshLambertMaterial({ color: 0x2a3550 })
        );
        body.position.y = h / 2;
        g.add(body);
        // renkli çatı bandı
        const roof = new THREE.Mesh(
          new THREE.BoxGeometry(w + 0.3, 0.35, d + 0.3),
          new THREE.MeshLambertMaterial({ color })
        );
        roof.position.y = h + 0.17;
        g.add(roof);
        // ön cam / pencere (geceleri yanar)
        const winMat = new THREE.MeshLambertMaterial({
          color: 0x8fb8e8,
          emissive: 0xffdc82,
          emissiveIntensity: 0,
          transparent: true,
          opacity: 0.9,
        });
        windowMats.push(winMat);
        const win = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.8, h - 0.9), winMat);
        win.position.set(0, h / 2, d / 2 + 0.01);
        g.add(win);

        // türe özel süsler
        if (key === "showroom") {
          // vitrindeki gerçek araçlar
          const count = Math.min(3, gameRef.current.inventory.length);
          for (let i = 0; i < count; i++) {
            const car = makeCar(CAR_COLORS[i % CAR_COLORS.length]);
            car.scale.setScalar(0.8);
            car.position.set(-w / 2 + 1.8 + i * 2.6, 0.05, d / 2 + 0.9);
            g.add(car);
          }
        } else if (key === "pompa") {
          // kanopi + pompalar
          for (const px of [-1.6, 1.6]) {
            const pump = new THREE.Mesh(
              new THREE.BoxGeometry(0.5, 1.1, 0.5),
              new THREE.MeshLambertMaterial({ color: 0xff8c5c })
            );
            pump.position.set(px, 0.55, d / 2 + 1.6);
            g.add(pump);
          }
          const canopy = new THREE.Mesh(
            new THREE.BoxGeometry(w, 0.25, 3),
            new THREE.MeshLambertMaterial({ color: 0xe8edf7 })
          );
          canopy.position.set(0, 2.6, d / 2 + 1.6);
          g.add(canopy);
          for (const px of [-w / 2 + 0.4, w / 2 - 0.4]) {
            const pole = new THREE.Mesh(
              new THREE.CylinderGeometry(0.08, 0.08, 2.6, 8),
              new THREE.MeshLambertMaterial({ color: 0x8b99b8 })
            );
            pole.position.set(px, 1.3, d / 2 + 1.6);
            g.add(pole);
          }
        }

        const label = makeLabelSprite(`${FACILITY_NAMES[key]} ${"★".repeat(level)}`, 0.9);
        label.position.set(0, h + 1.5, 0);
        g.add(label);
      }

      scene.add(g);
      buildingGroups.set(key, g);
      lastLevels.set(key, level);
      clickables.push({
        obj: g,
        hit: { panel: FACILITY_PANEL[key], facility: key, label: FACILITY_NAMES[key] },
      });

      if (animate && level > 0) {
        g.scale.y = 0.05;
        const hammer = makeLabelSprite("🔨", 0.9);
        hammer.position.set(x, 4.4, z);
        scene.add(hammer);
        constructionAnims.push({ g, t: 0, hammer, x, z, w });
      }
    }

    (Object.keys(LOTS) as FacilityKey[]).forEach((k) => buildFacility(k));

    // ---- ek tıklanabilirler: reklam panosu (Pazar) + bayrak (Lig) + ofis (Ofis) ----
    const billboard = new THREE.Group();
    billboard.position.set(17.5, 0, 8.6);
    const bbPole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.15, 3.4, 8),
      new THREE.MeshLambertMaterial({ color: 0x4a5675 })
    );
    bbPole.position.y = 1.7;
    billboard.add(bbPole);
    const bbPanel = new THREE.Mesh(
      new THREE.BoxGeometry(4.4, 2.2, 0.2),
      new THREE.MeshLambertMaterial({ color: 0x151c2e })
    );
    bbPanel.position.y = 4.2;
    billboard.add(bbPanel);
    const bbLabel = makeLabelSprite("🛒 İLANLAR", 0.9);
    bbLabel.position.set(0, 4.2, 0.3);
    billboard.add(bbLabel);
    scene.add(billboard);
    clickables.push({ obj: billboard, hit: { panel: "pazar", label: "🛒 İlan Pazarı" } });

    const flag = new THREE.Group();
    flag.position.set(17.5, 0, -4);
    const fPole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.1, 5, 8),
      new THREE.MeshLambertMaterial({ color: 0x8b99b8 })
    );
    fPole.position.y = 2.5;
    flag.add(fPole);
    const fCloth = new THREE.Mesh(
      new THREE.PlaneGeometry(2.2, 1.2),
      new THREE.MeshLambertMaterial({ color: 0xf5a524, side: THREE.DoubleSide })
    );
    fCloth.position.set(1.15, 4.3, 0);
    flag.add(fCloth);
    const fLabel = makeLabelSprite("🏆 Lig", 0.8);
    fLabel.position.set(0, 6, 0);
    flag.add(fLabel);
    scene.add(flag);
    clickables.push({ obj: flag, hit: { panel: "lig", label: "🏆 Lig" } });

    const office = new THREE.Group();
    office.position.set(10.5, 0, -5.5);
    const oBody = new THREE.Mesh(
      new THREE.BoxGeometry(4, 2.4, 3.4),
      new THREE.MeshLambertMaterial({ color: 0x2a3550 })
    );
    oBody.position.y = 1.2;
    office.add(oBody);
    const oRoof = new THREE.Mesh(
      new THREE.BoxGeometry(4.3, 0.3, 3.7),
      new THREE.MeshLambertMaterial({ color: 0x3ecf8e })
    );
    oRoof.position.y = 2.55;
    office.add(oRoof);
    const oLabel = makeLabelSprite("🏦 Ofis", 0.8);
    oLabel.position.set(0, 3.8, 0);
    office.add(oLabel);
    scene.add(office);
    clickables.push({ obj: office, hit: { panel: "ofis", label: "🏦 Ofis" } });

    // ---- aktörler ----
    const roadCars: { g: THREE.Group; speed: number; dir: 1 | -1 }[] = [];
    for (let i = 0; i < 6; i++) {
      const dir = (i % 2 === 0 ? 1 : -1) as 1 | -1;
      const g = makeCar(CAR_COLORS[i % CAR_COLORS.length]);
      g.position.set(-30 + i * 12, 0, dir === 1 ? 13 : 11);
      g.rotation.y = dir === 1 ? 0 : Math.PI;
      roadCars.push({ g, speed: 5 + Math.random() * 5, dir });
      scene.add(g);
    }

    const walkers: { g: THREE.Group; x: number; target: number }[] = [];
    for (let i = 0; i < 3; i++) {
      const g = makePerson([0xd85a30, 0x3e6ec0, 0x1d9e75][i]);
      g.position.set(-14 + i * 4, 0, 8.3);
      g.visible = false;
      walkers.push({ g, x: -14 + i * 4, target: -8 + Math.random() * 10 });
      scene.add(g);
      // yürüyen müşteriye tıklamak Müşteriler panelini açar
      clickables.push({ obj: g, hit: { panel: "musteri", label: "🧑 Müşteri" } });
    }

    // kıvılcımlar (atölye)
    const sparkGeo = new THREE.BufferGeometry();
    const sparkCount = 30;
    const sparkPos = new Float32Array(sparkCount * 3);
    const sparkVel: number[] = [];
    for (let i = 0; i < sparkCount; i++) {
      sparkPos[i * 3] = LOTS.atolye[0];
      sparkPos[i * 3 + 1] = 1;
      sparkPos[i * 3 + 2] = LOTS.atolye[1] + 2.6;
      sparkVel.push((Math.random() - 0.5) * 2, Math.random() * 2.5, (Math.random() - 0.5) * 2);
    }
    sparkGeo.setAttribute("position", new THREE.BufferAttribute(sparkPos, 3));
    const sparks = new THREE.Points(
      sparkGeo,
      new THREE.PointsMaterial({ color: 0xffc03c, size: 0.12, transparent: true, opacity: 0.95 })
    );
    sparks.visible = false;
    scene.add(sparks);

    // köpükler (yıkama)
    const bubbles: THREE.Mesh[] = [];
    const bubbleMat = new THREE.MeshLambertMaterial({
      color: 0xdff2ff,
      transparent: true,
      opacity: 0.65,
    });
    for (let i = 0; i < 8; i++) {
      const b = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), bubbleMat);
      b.position.set(
        LOTS.yikama[0] + (Math.random() - 0.5) * 3,
        0.5 + Math.random() * 2,
        LOTS.yikama[1] + 2.8
      );
      b.visible = false;
      bubbles.push(b);
      scene.add(b);
    }

    // bulutlar
    const clouds: THREE.Sprite[] = [];
    for (let i = 0; i < 3; i++) {
      const s = makeLabelSprite("☁️", 2.2);
      s.position.set(-20 + i * 18, 13 + i * 1.5, -6 - i * 3);
      clouds.push(s);
      scene.add(s);
    }

    // pompa müşterisi
    const pompaCar = makeCar(0x3e6ec0);
    pompaCar.visible = false;
    scene.add(pompaCar);
    let pompaPhase = 0; // 0 bekle, 1 geliyor, 2 dolduruyor, 3 gidiyor
    let pompaT = 4;
    const moneySprite = makeLabelSprite("+₺", 0.7);
    moneySprite.visible = false;
    scene.add(moneySprite);
    let moneyT = 0;

    // ---- etkileşim ----
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let hovered: { obj: THREE.Object3D; hit: Hit } | null = null;
    let downPos: { x: number; y: number } | null = null;

    function pickAt(clientX: number, clientY: number) {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      for (const c of clickables) {
        if (!c.obj.visible) continue;
        if (raycaster.intersectObject(c.obj, true).length > 0) return c;
      }
      return null;
    }

    function onMove(e: PointerEvent) {
      const hit = pickAt(e.clientX, e.clientY);
      if (hit !== hovered) {
        if (hovered) hovered.obj.scale.setScalar(1);
        hovered = hit;
        if (hovered) hovered.obj.scale.setScalar(1.05);
        renderer.domElement.style.cursor = hit ? "pointer" : "grab";
      }
    }
    function onDown(e: PointerEvent) {
      downPos = { x: e.clientX, y: e.clientY };
    }
    function onUp(e: PointerEvent) {
      if (!downPos) return;
      const moved = Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y);
      downPos = null;
      if (moved > 8) return; // sürükleme, tıklama değil
      const hit = pickAt(e.clientX, e.clientY);
      if (hit) {
        sfx.click();
        onOpenRef.current(hit.hit.panel, hit.hit.facility);
      }
    }
    renderer.domElement.addEventListener("pointermove", onMove);
    renderer.domElement.addEventListener("pointerdown", onDown);
    renderer.domElement.addEventListener("pointerup", onUp);

    // ---- döngü ----
    const skyDay = new THREE.Color(0x8fc3e8);
    const skyEve = new THREE.Color(0xc96a4a);
    const skyNight = new THREE.Color(0x0c1030);
    const clock = new THREE.Clock();

    renderer.setAnimationLoop(() => {
      const dt = Math.min(0.05, clock.getDelta());
      const t = clock.elapsedTime;
      const g = gameRef.current;

      // seviye değiştiyse binayı inşaat animasyonuyla yeniden kur
      for (const key of Object.keys(LOTS) as FacilityKey[]) {
        if (lastLevels.get(key) !== facilityLevel(g, key)) buildFacility(key, true);
      }

      // inşaat animasyonları: bina yükselir, çekiç sallanır, toz savrulur
      for (let i = constructionAnims.length - 1; i >= 0; i--) {
        const a = constructionAnims[i];
        a.t += dt;
        const p = Math.min(1, a.t / 1.3);
        const ease = 1 - Math.pow(1 - p, 3);
        a.g.scale.y = 0.05 + ease * 0.95;
        a.hammer.position.y = 4.2 + Math.sin(a.t * 12) * 0.5;
        a.hammer.material.rotation = Math.sin(a.t * 12) * 0.5;
        if (p < 1 && Math.random() < 0.4) {
          const s = makeLabelSprite("💨", 0.45);
          const ang = Math.random() * Math.PI * 2;
          s.position.set(a.x + Math.cos(ang) * (a.w / 2), 0.3, a.z + Math.sin(ang) * 1.6);
          scene.add(s);
          dust.push({ s, vx: Math.cos(ang) * 1.4, vz: Math.sin(ang) * 1.4, life: 0.9 });
        }
        if (p >= 1) {
          a.g.scale.y = 1;
          scene.remove(a.hammer);
          constructionAnims.splice(i, 1);
        }
      }
      for (let i = dust.length - 1; i >= 0; i--) {
        const d = dust[i];
        d.life -= dt;
        d.s.position.x += d.vx * dt;
        d.s.position.z += d.vz * dt;
        d.s.position.y += 0.6 * dt;
        (d.s.material as THREE.SpriteMaterial).opacity = Math.max(0, d.life / 0.9);
        if (d.life <= 0) {
          scene.remove(d.s);
          dust.splice(i, 1);
        }
      }

      // gökyüzü + ışık (oyun saatine göre)
      const hour = g.hour;
      let sky = skyDay;
      let lightI = 1.1;
      let winGlow = 0;
      if (hour >= 21) {
        sky = skyNight;
        lightI = 0.25;
        winGlow = 0.9;
      } else if (hour >= 17) {
        sky = skyEve;
        lightI = 0.6;
        winGlow = 0.4;
      }
      (scene.background as THREE.Color | null) ??= new THREE.Color();
      (scene.background as THREE.Color).lerp(sky, dt * 2);
      scene.fog!.color.copy(scene.background as THREE.Color);
      sun.intensity += (lightI - sun.intensity) * dt * 2;
      for (const m of windowMats) {
        m.emissiveIntensity += (winGlow - m.emissiveIntensity) * dt * 2;
      }

      // trafik
      for (const c of roadCars) {
        c.g.position.x += c.dir * c.speed * dt;
        if (c.g.position.x > 32) c.g.position.x = -32;
        if (c.g.position.x < -32) c.g.position.x = 32;
      }

      // yayalar (müşteri varsa)
      const showWalkers = g.customers.length > 0;
      walkers.forEach((w, i) => {
        w.g.visible = showWalkers && i < Math.min(3, g.customers.length);
        if (!w.g.visible) return;
        const dir = Math.sign(w.target - w.x);
        w.x += dir * 0.9 * dt;
        if (Math.abs(w.x - w.target) < 0.2) w.target = -16 + Math.random() * 14;
        w.g.position.x = w.x;
        w.g.position.y = Math.abs(Math.sin(t * 6 + i)) * 0.05;
        w.g.rotation.z = Math.sin(t * 8 + i * 2) * 0.08; // yürüme salınımı
        w.g.rotation.y = dir > 0 ? 0 : Math.PI;
      });

      // kıvılcımlar
      sparks.visible = g.jobs.length > 0;
      if (sparks.visible) {
        const pos = sparkGeo.getAttribute("position") as THREE.BufferAttribute;
        for (let i = 0; i < sparkCount; i++) {
          let px = pos.getX(i) + sparkVel[i * 3] * dt;
          let py = pos.getY(i) + sparkVel[i * 3 + 1] * dt;
          let pz = pos.getZ(i) + sparkVel[i * 3 + 2] * dt;
          sparkVel[i * 3 + 1] -= 6 * dt;
          if (py < 0.05) {
            px = LOTS.atolye[0] + (Math.random() - 0.5) * 1.5;
            py = 1 + Math.random() * 0.5;
            pz = LOTS.atolye[1] + 2.6;
            sparkVel[i * 3] = (Math.random() - 0.5) * 2;
            sparkVel[i * 3 + 1] = Math.random() * 2.5;
            sparkVel[i * 3 + 2] = (Math.random() - 0.5) * 2;
          }
          pos.setXYZ(i, px, py, pz);
        }
        pos.needsUpdate = true;
      }

      // köpükler
      const washOn = facilityLevel(g, "yikama") > 0;
      for (const b of bubbles) {
        b.visible = washOn;
        if (!washOn) continue;
        b.position.y += 0.5 * dt;
        if (b.position.y > 3) {
          b.position.set(
            LOTS.yikama[0] + (Math.random() - 0.5) * 3,
            0.4,
            LOTS.yikama[1] + 2.8
          );
        }
      }

      // bulutlar
      for (const c of clouds) {
        c.position.x += 0.35 * dt;
        if (c.position.x > 30) c.position.x = -30;
      }

      // pompa müşterisi döngüsü
      if (facilityLevel(g, "pompa") > 0) {
        pompaT -= dt;
        const slotX = LOTS.pompa[0];
        const slotZ = LOTS.pompa[1] + 5.4;
        if (pompaPhase === 0 && pompaT <= 0) {
          pompaPhase = 1;
          pompaCar.visible = true;
          pompaCar.position.set(-30, 0, 13);
          pompaCar.rotation.y = 0;
        } else if (pompaPhase === 1) {
          const dx = slotX - pompaCar.position.x;
          const dz = slotZ - pompaCar.position.z;
          const dist = Math.hypot(dx, dz);
          if (dist < 0.3) {
            pompaPhase = 2;
            pompaT = 2.5;
          } else {
            pompaCar.position.x += (dx / dist) * 6 * dt;
            pompaCar.position.z += (dz / dist) * 6 * dt;
            pompaCar.rotation.y = -Math.atan2(dz, dx);
          }
        } else if (pompaPhase === 2) {
          if (pompaT <= 0) {
            pompaPhase = 3;
            moneySprite.position.set(slotX, 2.2, slotZ);
            moneySprite.visible = true;
            moneyT = 1.4;
          }
        } else if (pompaPhase === 3) {
          pompaCar.position.x += 7 * dt;
          pompaCar.rotation.y = 0;
          if (pompaCar.position.x > 32) {
            pompaCar.visible = false;
            pompaPhase = 0;
            pompaT = 6 + Math.random() * 6;
          }
        }
      } else {
        pompaCar.visible = false;
      }
      if (moneySprite.visible) {
        moneyT -= dt;
        moneySprite.position.y += 0.8 * dt;
        (moneySprite.material as THREE.SpriteMaterial).opacity = Math.max(0, moneyT / 1.4);
        if (moneyT <= 0) moneySprite.visible = false;
      }

      // bayrak dalgalanır
      fCloth.rotation.y = Math.sin(t * 3) * 0.25;

      controls.update();
      renderer.render(scene, camera);
      const win = window as unknown as { __hubFrames?: number };
      win.__hubFrames = (win.__hubFrames ?? 0) + 1;
    });

    return () => {
      renderer.setAnimationLoop(null);
      renderer.domElement.removeEventListener("pointermove", onMove);
      renderer.domElement.removeEventListener("pointerdown", onDown);
      renderer.domElement.removeEventListener("pointerup", onUp);
      controls.dispose();
      ro.disconnect();
      renderer.dispose();
      container.removeChild(renderer.domElement);
      scene.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose?.();
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={containerRef}
      className="hub3d"
      aria-label="3D galeri dünyası — binalara tıklayın, sürükleyerek döndürün"
    />
  );
}
