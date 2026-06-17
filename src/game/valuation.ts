import type { Car, MarketModifier, PartKey } from "../types";
import { PART_KEYS } from "../types";

const CURRENT_YEAR = 2026;

const PART_WEIGHTS: Record<PartKey, number> = {
  motor: 0.32,
  sanziman: 0.2,
  fren: 0.12,
  suspansiyon: 0.12,
  lastik: 0.08,
  aku: 0.06,
  klima: 0.1,
};

export function expectedKm(year: number): number {
  return Math.max(5000, (CURRENT_YEAR - year) * 17000);
}

/** Aracın GERÇEK piyasa değeri (gizli arızalar dahil) */
export function carValue(car: Car, modifiers: MarketModifier[] = [], day = 0): number {
  let v = car.basePrice;

  // Yaş amortismanı: yılda ~%7,5, taban %12
  const age = CURRENT_YEAR - car.year;
  v *= Math.max(0.12, Math.pow(0.925, age));

  // Km etkisi: beklenenden sapma
  const exp = expectedKm(car.year);
  const kmRatio = car.km / exp;
  if (kmRatio > 1) v *= Math.max(0.72, 1 - (kmRatio - 1) * 0.18);
  else v *= Math.min(1.12, 1 + (1 - kmRatio) * 0.1);

  // Parça kondisyonu (0-100) -> 0.65 - 1.04 çarpan
  let cond = 0;
  for (const k of PART_KEYS) cond += car.parts[k] * PART_WEIGHTS[k];
  v *= 0.65 + (cond / 100) * 0.39;

  // Boya / değişen
  v *= 1 - car.paintedPanels * 0.012 - car.changedPanels * 0.03;

  // Tramer kaydı
  if (car.tramer > 0) {
    const ratio = Math.min(0.5, car.tramer / Math.max(1, v));
    v *= 1 - ratio * 0.45;
  }

  // Arızalar (gizli + bilinen) gerçek değeri düşürür
  for (const f of [...car.hiddenFaults, ...car.knownFaults]) v -= f.valueHit;

  // Kozmetik artılar
  if (car.cosmetics.seatCover) v += Math.min(25000, v * 0.015);
  if (car.cosmetics.rims) v += Math.min(35000, v * 0.02);
  if (car.cosmetics.multimedia) v += Math.min(20000, v * 0.012);
  if (car.cosmetics.tint) v += Math.min(8000, v * 0.005);
  if (car.cosmetics.ceramic) v += Math.min(30000, v * 0.018);

  // Temizlik
  v *= 0.96 + (car.cleanliness / 100) * 0.06;

  // Piyasa dalgalanması
  for (const m of modifiers) {
    if (m.segment === car.segment && m.untilDay >= day) v *= m.factor;
  }

  return Math.max(30000, Math.round(v / 1000) * 1000);
}

/** Alıcıların gördüğü değer: gizli arızaları bilmezler */
export function perceivedValue(car: Car, modifiers: MarketModifier[] = [], day = 0): number {
  const noHidden: Car = { ...car, hiddenFaults: [] };
  return carValue(noHidden, modifiers, day);
}

export function conditionLabel(score: number): string {
  if (score >= 90) return "Çok iyi";
  if (score >= 75) return "İyi";
  if (score >= 55) return "Orta";
  if (score >= 35) return "Yıpranmış";
  return "Kötü";
}

export function avgCondition(car: Car): number {
  let cond = 0;
  for (const k of PART_KEYS) cond += car.parts[k] * PART_WEIGHTS[k];
  return Math.round(cond);
}
