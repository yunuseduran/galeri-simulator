import type { GameState, Rival } from "../types";
import { CITIES } from "../data/cities";
import { chance, pick, rand, randInt, roundMoney, uid } from "./rng";

const RIVAL_NAMES: { name: string; emoji: string }[] = [
  { name: "Şahin Oto", emoji: "🦅" },
  { name: "Kartal Motors", emoji: "🚙" },
  { name: "Anadolu Otomotiv", emoji: "🐂" },
  { name: "Yıldız Garaj", emoji: "⭐" },
  { name: "Boğaziçi Auto", emoji: "🌉" },
  { name: "Toros Oto Pazarı", emoji: "🏔️" },
  { name: "Hızlı Hasan Galeri", emoji: "⚡" },
  { name: "Paşa Otomotiv", emoji: "🎩" },
];

export function generateRivals(homeCity: number): Rival[] {
  return RIVAL_NAMES.map((r) => {
    let city = pick(CITIES).plate;
    if (city === homeCity) city = city === 34 ? 6 : 34;
    return {
      id: uid("rvl"),
      name: r.name,
      emoji: r.emoji,
      cityPlate: city,
      skill: Math.round(rand(0.6, 1.5) * 100) / 100,
      wealth: roundMoney(rand(-30000, 350000), 1000),
      carsSold: randInt(1, 25),
      reputation: randInt(30, 85),
      lastDelta: 0,
    };
  });
}

/**
 * Rakiplerin günlük ticaretini simüle eder. State'i yerinde değiştirir,
 * defter kaydı gerektiren olay metinlerini döner.
 */
export function updateRivals(s: GameState): string[] {
  const logs: string[] = [];
  for (const r of s.rivals) {
    // 0-2 satış arası, beceriye bağlı
    const p = 0.35 + r.skill * 0.25;
    let sales = 0;
    if (chance(p)) sales++;
    if (chance(p * 0.4)) sales++;

    let delta = 0;
    for (let i = 0; i < sales; i++) {
      if (chance(0.12)) {
        // kötü alım: zarar etti
        delta -= roundMoney(rand(5000, 45000), 1000);
      } else {
        delta += roundMoney(rand(8000, 95000) * r.skill, 1000);
      }
    }
    // Satış olmayan günlerde küçük masraflar
    if (sales === 0) delta -= roundMoney(rand(2000, 8000), 500);

    r.wealth += delta;
    r.carsSold += sales;
    r.lastDelta = delta;
    r.reputation = Math.max(20, Math.min(95, r.reputation + randInt(-1, 1)));

    if (delta > 160000) {
      logs.push(`🏁 ${r.emoji} ${r.name} bugün rekor bir satışa imza attı! Piyasa konuşuyor...`);
    }
  }
  // Nadir: bir rakip kötü gün geçirir
  if (chance(0.05) && s.rivals.length > 0) {
    const r = pick(s.rivals);
    const hit = roundMoney(rand(30000, 120000), 1000);
    r.wealth -= hit;
    r.lastDelta -= hit;
    logs.push(`📉 ${r.emoji} ${r.name} arızalı araç sattığı için müşterisine tazminat ödedi!`);
  }
  return logs;
}

/** Oyuncunun ligdeki sırası (1 = lider) */
export function playerRank(s: GameState): number {
  return 1 + s.rivals.filter((r) => r.wealth > s.stats.totalProfit).length;
}
