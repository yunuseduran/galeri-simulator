/**
 * Oyun verilerini Unity'ye (JsonUtility uyumlu) data.json olarak dışa aktarır.
 * Çalıştırma: npm run export:unity
 * Not: JsonUtility sözlük desteklemez; her şey dizi + düz nesne olarak yazılır.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { CITIES } from "../src/data/cities";
import { MODELS, COLORS } from "../src/data/cars";
import { FIRST_NAMES, LAST_NAMES, GALLERY_SUFFIXES } from "../src/data/names";
import { FAULT_TEMPLATES } from "../src/game/faults";
import { LOAN_OFFERS } from "../src/game/bank";
import { ACHIEVEMENTS, PERKS, xpNeeded, levelReward, titleFor } from "../src/game/career";
import {
  STAFF_DEFS,
  PART_LABELS,
  SEGMENT_LABELS,
  FUEL_LABELS,
  COSMETIC_LABELS,
  PART_KEYS,
  type StaffRole,
} from "../src/types";

// Denge sabitleri — kaynak: src/game/state.tsx, valuation.ts, events.ts, auction.ts
const balance = {
  currentYear: 2026,
  travelCostPerKm: 9,
  transportCostPerKm: 14,
  expertiseCostBase: 4000,
  expertiseCostPerkLevel3: 3000,
  expertiseRevealChance: 0.8,
  maxListings: 42,
  newListingsPerDayMin: 7,
  newListingsPerDayMax: 12,
  auctionPeriodDays: 5,
  auctionStartPriceMin: 0.45,
  auctionStartPriceMax: 0.58,
  wholesaleRatio: 0.78,
  startingMoney: { kolay: 2500000, normal: 1500000, zor: 900000 },
  weeklyExpenseBase: { kolay: 25000, normal: 40000, zor: 60000 },
  weeklyExpensePerSlot: 5000,
  gallerySlotUpgrades: [
    { fromSlots: 4, toSlots: 6, cost: 300000 },
    { fromSlots: 6, toSlots: 8, cost: 600000 },
    { fromSlots: 8, toSlots: 12, cost: 1200000 },
  ],
  // Değerleme (valuation.ts ile birebir)
  yearlyDepreciation: 0.925,
  minDepreciation: 0.12,
  expectedKmPerYear: 17000,
  partWeights: PART_KEYS.map((k) => ({
    part: k,
    weight: { motor: 0.32, sanziman: 0.2, fren: 0.12, suspansiyon: 0.12, lastik: 0.08, aku: 0.06, klima: 0.1 }[k],
  })),
  testDriveDurationSec: 180,
  roadDistanceFactor: 1.32, // kuş uçuşu -> karayolu katsayısı
  avgTravelSpeedKmh: 85,
};

const data = {
  meta: {
    game: "Galeri Simülatörü",
    exportedAt: new Date().toISOString(),
    source: "web prototipi (React/TS) — E:/galeri-simulator",
    note: "Tüm metinler Türkçe. JsonUtility uyumu için sözlük yok, sadece diziler.",
  },
  balance,
  cities: CITIES,
  models: MODELS,
  colors: COLORS,
  faultTemplates: FAULT_TEMPLATES.map((f) => ({
    part: f.part,
    label: f.label,
    costPctMin: f.costPct[0],
    costPctMax: f.costPct[1],
    valuePctMin: f.valuePct[0],
    valuePctMax: f.valuePct[1],
    drivable: f.drivable,
    driveHint: f.driveHint,
  })),
  staff: (Object.keys(STAFF_DEFS) as StaffRole[]).map((role) => ({
    role,
    ...STAFF_DEFS[role],
  })),
  loanOffers: LOAN_OFFERS,
  perks: PERKS,
  achievements: ACHIEVEMENTS.map((a) => ({
    id: a.id,
    emoji: a.emoji,
    name: a.name,
    unit: a.unit,
    thresholds: a.thresholds,
    finite: a.finite ?? false,
    // metric fonksiyonu serileştirilemez; C# tarafında bu anahtara switch yazılır
    metricKey: a.id,
  })),
  career: {
    // İlk 30 seviyenin XP/ödül/unvan tablosu (eğri: 500 * level^1.35)
    levels: Array.from({ length: 30 }, (_, i) => {
      const level = i + 1;
      return { level, xpToNext: xpNeeded(level), reward: levelReward(level + 1), title: titleFor(level) };
    }),
  },
  names: {
    first: FIRST_NAMES,
    last: LAST_NAMES,
    gallerySuffixes: GALLERY_SUFFIXES,
  },
  labels: {
    parts: Object.entries(PART_LABELS).map(([key, label]) => ({ key, label })),
    segments: Object.entries(SEGMENT_LABELS).map(([key, label]) => ({ key, label })),
    fuels: Object.entries(FUEL_LABELS).map(([key, label]) => ({ key, label })),
    cosmetics: Object.entries(COSMETIC_LABELS).map(([key, label]) => ({ key, label })),
  },
};

const outDir = join(import.meta.dirname ?? __dirname, "..", "unity-export");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "data.json"), JSON.stringify(data, null, 2), "utf8");
console.log("✓ unity-export/data.json yazıldı:");
console.log(`  ${CITIES.length} il, ${MODELS.length} model, ${FAULT_TEMPLATES.length} arıza şablonu, ${LOAN_OFFERS.length} kredi, ${PERKS.length} ayrıcalık, ${ACHIEVEMENTS.length} başarım`);
