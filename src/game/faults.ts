import type { Fault, PartKey } from "../types";
import { uid, rand, roundMoney } from "./rng";

interface FaultTemplate {
  part: PartKey;
  label: string;
  costPct: [number, number]; // basePrice yüzdesi olarak tamir maliyeti
  valuePct: [number, number]; // değer kaybı yüzdesi
  drivable: boolean;
  driveHint: string;
}

export const FAULT_TEMPLATES: FaultTemplate[] = [
  { part: "motor", label: "Motor yağ yakıyor", costPct: [3, 6], valuePct: [5, 9], drivable: true, driveHint: "Egzozdan mavi duman geliyor, yağ kokusu var..." },
  { part: "motor", label: "Motor tekliyor (ateşleme sorunu)", costPct: [1, 3], valuePct: [3, 6], drivable: true, driveHint: "Motor ara ara tekliyor, çekişten düşüyor!" },
  { part: "motor", label: "Hararet sorunu (termostat/radyatör)", costPct: [1.5, 3], valuePct: [3, 6], drivable: true, driveHint: "Hararet göstergesi yükseliyor!" },
  { part: "motor", label: "Triger seti ömrünü doldurmuş", costPct: [1, 2.5], valuePct: [2, 4], drivable: true, driveHint: "Motordan tıkırtı sesi geliyor..." },
  { part: "sanziman", label: "Şanzıman vites atlatıyor", costPct: [3, 7], valuePct: [5, 10], drivable: true, driveHint: "Vites geçişlerinde sert vuruntu hissediliyor!" },
  { part: "sanziman", label: "Debriyaj balatası bitmiş", costPct: [1.5, 3], valuePct: [2, 5], drivable: true, driveHint: "Debriyaj kavramıyor, devir yükseliyor ama hız artmıyor..." },
  { part: "fren", label: "Fren balata ve diskleri bitik", costPct: [0.8, 1.8], valuePct: [1.5, 3], drivable: true, driveHint: "Frenler çok zayıf, geç yavaşlıyor!" },
  { part: "fren", label: "ABS arızası", costPct: [1, 2.5], valuePct: [2, 4], drivable: true, driveHint: "Sert frende tekerlek kilitleniyor, ABS devreye girmiyor!" },
  { part: "suspansiyon", label: "Amortisörler patlak", costPct: [1.2, 2.5], valuePct: [2, 4], drivable: true, driveHint: "Araç yatıyor, virajda sallanıyor..." },
  { part: "suspansiyon", label: "Rot-balans bozuk, araç çekiyor", costPct: [0.4, 1], valuePct: [1, 2.5], drivable: true, driveHint: "Direksiyon bir tarafa çekiyor!" },
  { part: "lastik", label: "Lastikler ömrünü doldurmuş", costPct: [0.8, 1.5], valuePct: [1, 2], drivable: true, driveHint: "Lastikler kayıyor, yol tutuş çok kötü..." },
  { part: "aku", label: "Akü zayıf, marş güç alıyor", costPct: [0.3, 0.6], valuePct: [0.5, 1], drivable: true, driveHint: "Marş zor bastı, akü zayıf görünüyor..." },
  { part: "klima", label: "Klima soğutmuyor (kompresör)", costPct: [0.8, 2], valuePct: [1, 2.5], drivable: true, driveHint: "Klimayı açtınız ama sıcak hava üflüyor..." },
];

export function makeFault(basePrice: number, part?: PartKey): Fault {
  const candidates = part
    ? FAULT_TEMPLATES.filter((f) => f.part === part)
    : FAULT_TEMPLATES;
  const t = candidates[Math.floor(Math.random() * candidates.length)];
  const cost = roundMoney((basePrice * rand(t.costPct[0], t.costPct[1])) / 100, 500);
  const valueHit = roundMoney((basePrice * rand(t.valuePct[0], t.valuePct[1])) / 100, 500);
  return {
    id: uid("flt"),
    part: t.part,
    label: t.label,
    repairCost: Math.max(2000, cost),
    valueHit: Math.max(2500, valueHit),
    drivable: t.drivable,
    driveHint: t.driveHint,
  };
}
