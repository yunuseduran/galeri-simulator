import type { GameState } from "../types";

// BenelOil tarzı tesis sistemi: galeri kompleksindeki her dükkan ayrı ayrı
// inşa edilir ve seviye atlatılır. Kimi pasif gelir üretir, kimi oyuna bonus verir.

export type FacilityKey =
  | "showroom"
  | "atolye"
  | "yikama"
  | "parca"
  | "kafeterya"
  | "pompa"
  | "otopark";

export interface FacilityLevel {
  cost: number; // bu seviyeye çıkma maliyeti (₺)
  income: number; // günlük pasif gelir (₺)
  effect: string; // seviyenin sağladığı bonus açıklaması
}

export interface FacilityDef {
  key: FacilityKey;
  name: string;
  emoji: string;
  desc: string;
  levels: FacilityLevel[]; // levels[0] = Seviye 1
}

export const FACILITY_DEFS: FacilityDef[] = [
  {
    key: "showroom",
    name: "Vitrin (Showroom)",
    emoji: "🏢",
    desc: "Galerinin kalbi. Seviyesi arttıkça daha fazla aracı vitrine dizebilirsiniz.",
    levels: [
      { cost: 0, income: 0, effect: "4 araç kapasitesi" },
      { cost: 300000, income: 0, effect: "6 araç kapasitesi" },
      { cost: 600000, income: 0, effect: "8 araç kapasitesi" },
      { cost: 1200000, income: 0, effect: "12 araç kapasitesi" },
    ],
  },
  {
    key: "atolye",
    name: "Tamirhane",
    emoji: "🔧",
    desc: "Kendi tamirhaneniz. Yoksa işler dış sanayiye %30 zamlı yaptırılır!",
    levels: [
      { cost: 150000, income: 0, effect: "Normal fiyatla tamir (dış sanayi zammı kalkar)" },
      { cost: 400000, income: 0, effect: "Tüm atölye işleri %10 indirimli" },
      { cost: 900000, income: 0, effect: "%20 indirim + işler 1 gün daha hızlı" },
    ],
  },
  {
    key: "yikama",
    name: "Oto Yıkama",
    emoji: "🧽",
    desc: "Dışarıdan müşteri alır, sizin araçları da her gün parlatır.",
    levels: [
      { cost: 200000, income: 4000, effect: "Günlük gelir + araçlara her gün +4 temizlik" },
      { cost: 450000, income: 9000, effect: "Gelir artar + her gün +8 temizlik" },
      { cost: 900000, income: 15000, effect: "Gelir artar + her gün +12 temizlik" },
    ],
  },
  {
    key: "parca",
    name: "Yedek Parça Dükkanı",
    emoji: "🛞",
    desc: "Parça satışından gelir; kendi tamirlerinize de parça maliyeti indirimi.",
    levels: [
      { cost: 250000, income: 6000, effect: "Günlük gelir + tamirlerde %5 indirim" },
      { cost: 550000, income: 13000, effect: "Gelir artar + %10 indirim" },
      { cost: 1100000, income: 22000, effect: "Gelir artar + %15 indirim" },
    ],
  },
  {
    key: "kafeterya",
    name: "Kafeterya",
    emoji: "☕",
    desc: "Çay ikram edilen müşteri masadan kalkamaz: daha cömert pazarlık eder.",
    levels: [
      { cost: 120000, income: 2000, effect: "Müşteriler %1,5 daha cömert" },
      { cost: 300000, income: 5000, effect: "%3 cömertlik + müşteri sabrı +1 tur" },
    ],
  },
  {
    key: "pompa",
    name: "Akaryakıt Pompası",
    emoji: "⛽",
    desc: "Yoldan geçen yakıt alır; kendi seyahatleriniz de ucuzlar.",
    levels: [
      { cost: 600000, income: 12000, effect: "Günlük gelir + yol masrafı %5 iner" },
      { cost: 1200000, income: 25000, effect: "Gelir artar + yol masrafı %10 iner" },
      { cost: 2000000, income: 40000, effect: "Gelir artar + yol masrafı %15 iner" },
    ],
  },
  {
    key: "otopark",
    name: "Ek Otopark",
    emoji: "🅿️",
    desc: "Arka parseldeki park alanı: her seviye +1 araçlık yer açar.",
    levels: [
      { cost: 100000, income: 0, effect: "+1 araç kapasitesi" },
      { cost: 250000, income: 0, effect: "+1 araç kapasitesi (toplam +2)" },
      { cost: 500000, income: 0, effect: "+1 araç kapasitesi (toplam +3)" },
    ],
  },
];

export function facilityDef(key: FacilityKey): FacilityDef {
  const d = FACILITY_DEFS.find((f) => f.key === key);
  if (!d) throw new Error("Bilinmeyen tesis: " + key);
  return d;
}

export function facilityLevel(s: GameState, key: FacilityKey): number {
  return s.facilities?.[key] ?? 0;
}

/** Vitrin + otopark seviyesinden toplam araç kapasitesi */
export function totalSlots(s: GameState): number {
  const showroomSlots = [0, 4, 6, 8, 12][facilityLevel(s, "showroom")] ?? 4;
  return showroomSlots + facilityLevel(s, "otopark");
}

/** Tüm dükkanların günlük pasif gelir toplamı */
export function dailyFacilityIncome(s: GameState): number {
  let total = 0;
  for (const def of FACILITY_DEFS) {
    const lvl = facilityLevel(s, def.key);
    if (lvl > 0) total += def.levels[lvl - 1].income;
  }
  return total;
}

/** Atölye + yedek parça dükkanının tamir maliyet çarpanı (1 = normal) */
export function workshopCostMultiplier(s: GameState): number {
  const atolye = facilityLevel(s, "atolye");
  let m = atolye === 0 ? 1.3 : atolye === 2 ? 0.9 : atolye >= 3 ? 0.8 : 1;
  m *= 1 - 0.05 * facilityLevel(s, "parca");
  return m;
}

/** Tamirhane L3: işler 1 gün daha hızlı */
export function workshopDayBonus(s: GameState): number {
  return facilityLevel(s, "atolye") >= 3 ? 1 : 0;
}

/** Pompa seviyesine göre yol masrafı çarpanı */
export function travelCostMultiplier(s: GameState): number {
  return 1 - 0.05 * facilityLevel(s, "pompa");
}

/** Kafeterya: müşteri cömertlik bonusu (maxPay çarpanına eklenir) */
export function cafeGenerosityBonus(s: GameState): number {
  return 0.015 * facilityLevel(s, "kafeterya");
}

/** Kafeterya L2+: müşteri sabrı +1 tur */
export function cafePatienceBonus(s: GameState): number {
  return facilityLevel(s, "kafeterya") >= 2 ? 1 : 0;
}

/** Yıkama: araçlara günlük temizlik puanı */
export function washDailyCleanBonus(s: GameState): number {
  return facilityLevel(s, "yikama") * 4;
}

/** Toplam tesis seviyesi (başarım metriği) */
export function totalFacilityLevels(s: GameState): number {
  return FACILITY_DEFS.reduce((sum, d) => sum + facilityLevel(s, d.key), 0);
}
