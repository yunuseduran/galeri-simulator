import type { GameState } from "../types";
import { roundMoney } from "./rng";

// ---- Seviye / XP ----

/** Bir sonraki seviye için gereken XP (sonsuz büyür) */
export function xpNeeded(level: number): number {
  return Math.round((500 * Math.pow(level, 1.35)) / 50) * 50;
}

const TITLE_STEPS: [number, string][] = [
  [20, "Galeri İmparatoru"],
  [18, "Otomotiv Patronu"],
  [16, "Ulusal Marka"],
  [14, "Bölge Devi"],
  [12, "İl Meşhuru"],
  [10, "Oto Baronu"],
  [9, "Piyasa Bilirkişisi"],
  [8, "Usta Galerici"],
  [7, "Pazarlık Kurdu"],
  [6, "Güvenilir Satıcı"],
  [5, "Sanayi Esnafı"],
  [4, "Pazarlıkçı"],
  [3, "Mahalle Esnafı"],
  [2, "Acemi Galerici"],
  [1, "Çaylak"],
];

export function titleFor(level: number): string {
  if (level > 20) return `Otomotiv Efsanesi ${level - 20}`;
  const t = TITLE_STEPS.find(([min]) => level >= min);
  return t ? t[1] : "Çaylak";
}

export function levelReward(level: number): number {
  return roundMoney(20000 + level * 15000, 1000);
}

// ---- Kalıcı ayrıcalıklar ----

export interface Perk {
  level: number;
  emoji: string;
  label: string;
}

export const PERKS: Perk[] = [
  { level: 3, emoji: "🔍", label: "Ekspertiz anlaşması: ekspertiz ücreti 4.000 → 3.000 ₺" },
  { level: 5, emoji: "⛽", label: "Yakıt kartı: yol masrafları %15 indirimli" },
  { level: 8, emoji: "🗣️", label: "İkna kabiliyeti: müşteriler %3 daha cömert öder" },
  { level: 10, emoji: "🔧", label: "Sanayi dostu: atölye işleri %10 indirimli" },
  { level: 12, emoji: "🌟", label: "Ünlü galeri: her gün daha fazla müşteri uğrar" },
  { level: 15, emoji: "🔨", label: "Mezat locası: mezat araçlarının nakliyesi yarı fiyat" },
  { level: 20, emoji: "🧾", label: "Vergi avukatı: haftalık giderler %15 düşer" },
];

export function hasPerk(level: number, perkLevel: number): boolean {
  return level >= perkLevel;
}

/** XP ekler; seviye atlamaları, ödülleri ve ayrıcalık duyurularını işler */
export function addXp(s: GameState, amount: number): void {
  s.xp += Math.max(0, Math.round(amount));
  while (s.xp >= xpNeeded(s.level)) {
    s.xp -= xpNeeded(s.level);
    s.level += 1;
    const bonus = levelReward(s.level);
    s.money += bonus;
    s.reputation = Math.min(100, s.reputation + 1);
    s.log.unshift({
      day: s.day,
      text: `⬆️ SEVİYE ATLADINIZ! Seviye ${s.level} — "${titleFor(s.level)}". Ödül: ${bonus.toLocaleString("tr-TR")} ₺ + itibar`,
      amount: bonus,
      kind: "olay",
    });
    const perk = PERKS.find((p) => p.level === s.level);
    if (perk) {
      s.log.unshift({
        day: s.day,
        text: `🔓 Yeni ayrıcalık açıldı: ${perk.emoji} ${perk.label}`,
        kind: "olay",
      });
    }
  }
}

// ---- Kademeli başarımlar ----

export interface AchievementDef {
  id: string;
  emoji: string;
  name: string;
  unit: string;
  /** İlk kademe eşikleri; sonrası son eşiğin ~2.2 katı şeklinde sonsuza gider */
  thresholds: number[];
  /** true ise eşikler bitince başarım tamamlanır (sonsuz değil) */
  finite?: boolean;
  metric: (s: GameState) => number;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: "satis", emoji: "🤝", name: "Satış Ustası", unit: "satış", thresholds: [1, 5, 15, 40, 100], metric: (s) => s.stats.carsSold },
  { id: "alim", emoji: "🛒", name: "Koleksiyoncu", unit: "alım", thresholds: [1, 5, 15, 40, 100], metric: (s) => s.stats.carsBought },
  { id: "kar", emoji: "💰", name: "Kâr Makinesi", unit: "₺ kâr", thresholds: [100000, 500000, 2000000, 5000000, 15000000], metric: (s) => Math.max(0, s.stats.totalProfit) },
  { id: "gezgin", emoji: "🗺️", name: "Anadolu Gezgini", unit: "il", thresholds: [3, 10, 25, 50, 81], finite: true, metric: (s) => s.stats.citiesVisited.length },
  { id: "mezat", emoji: "🔨", name: "Mezat Kurdu", unit: "mezat", thresholds: [1, 3, 10, 25, 60], metric: (s) => s.stats.auctionsWon },
  { id: "tamir", emoji: "🔧", name: "Usta Eller", unit: "iş", thresholds: [5, 15, 40, 100, 250], metric: (s) => s.stats.repairsDone },
  { id: "yol", emoji: "🛣️", name: "Yol Canavarı", unit: "km", thresholds: [1000, 5000, 20000, 50000, 120000], metric: (s) => s.stats.kmTraveled },
];

/** Verilen kademe için eşik; finite başarımlarda eşikler bitince null */
export function thresholdFor(def: AchievementDef, tier: number): number | null {
  if (tier < def.thresholds.length) return def.thresholds[tier];
  if (def.finite) return null;
  const last = def.thresholds[def.thresholds.length - 1];
  return Math.round(last * Math.pow(2.2, tier - def.thresholds.length + 1));
}

export function tierReward(tier: number): { money: number; xp: number } {
  return {
    money: roundMoney(20000 * Math.pow(tier + 1, 1.5), 1000),
    xp: 100 * (tier + 1),
  };
}

/** Tüm başarımları kontrol eder; tamamlanan kademeleri ödüllendirir */
export function checkMilestones(s: GameState): void {
  for (const def of ACHIEVEMENTS) {
    let tier = s.achievements[def.id] ?? 0;
    let threshold = thresholdFor(def, tier);
    const value = def.metric(s);
    while (threshold !== null && value >= threshold) {
      const reward = tierReward(tier);
      s.money += reward.money;
      s.log.unshift({
        day: s.day,
        text: `🎖️ BAŞARIM: ${def.emoji} ${def.name} ${romanTier(tier + 1)} (${threshold.toLocaleString("tr-TR")} ${def.unit}) — Ödül: ${reward.money.toLocaleString("tr-TR")} ₺ + ${reward.xp} XP`,
        amount: reward.money,
        kind: "olay",
      });
      addXp(s, reward.xp);
      tier += 1;
      s.achievements[def.id] = tier;
      threshold = thresholdFor(def, tier);
    }
  }
}

export function romanTier(n: number): string {
  const romans = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
  return n <= 10 ? romans[n - 1] : `${n}`;
}
