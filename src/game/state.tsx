import React, { createContext, useContext, useEffect, useReducer } from "react";
import type {
  Car,
  Cosmetics,
  Customer,
  Difficulty,
  GameState,
  Listing,
  LogEntry,
  OwnedCar,
  PartKey,
  StaffRole,
  WorkshopJob,
} from "../types";
import { COSMETIC_LABELS, LEGAL_LABELS, PART_LABELS, STAFF_DEFS, isAvailable } from "../types";

// Kaza hasarının yansıyabileceği parçalar (kendin sürerek getirme modu)
const PART_KEYS_FOR_DAMAGE: PartKey[] = ["fren", "suspansiyon", "lastik", "motor"];
import { CITIES, cityByPlate, roadDistance } from "../data/cities";
import { generateListing, randomPersonName } from "./carFactory";
import { dailyCustomers } from "./customers";
import { applyDailyEvents, weeklyExpense } from "./events";
import { canTakeLoan, makeLoan, type LoanOffer } from "./bank";
import { AUCTION_PERIOD, generateAuction } from "./auction";
import { generateRivals, playerRank, updateRivals } from "./rivals";
import {
  dailyFacilityIncome,
  facilityDef,
  facilityLevel,
  totalSlots,
  travelCostMultiplier,
  workshopCostMultiplier,
  workshopDayBonus,
  type FacilityKey,
} from "./facilities";
import { addXp, checkMilestones } from "./career";
import {
  assetDef,
  ensureExchange,
  EXPORT_COMMISSION,
  EXPORT_INSPECTION_FEE,
  initialExchange,
  refreshExportOffers,
  stepExchange,
} from "./exchange";
import { carValue } from "./valuation";
import { chance, randInt, roundMoney, uid } from "./rng";
import { currentUser, saveKeyFor, upsertProfile } from "./auth";

const SAVE_VERSION = 1;

/** O an giriş yapmış kullanıcının kayıt anahtarı (kullanıcı yoksa null). */
function activeSaveKey(): string | null {
  const u = currentUser();
  return u ? saveKeyFor(u) : null;
}

export const TRAVEL_COST_PER_KM = 9; // yakıt + masraf ₺/km
export const TRANSPORT_COST_PER_KM = 14; // çekici/nakliye ₺/km
export const EXPERTISE_COST = 4000;

/** Yol masrafı — 5. seviye ayrıcalığıyla %15 iner */
export function travelCostFor(km: number, level: number, facilityMult = 1): number {
  const base = km * TRAVEL_COST_PER_KM * (level >= 5 ? 0.85 : 1) * facilityMult;
  return Math.round(base / 100) * 100;
}

/** Ekspertiz ücreti — 3. seviye ayrıcalığıyla 3.000 ₺ */
export function expertiseCostFor(level: number): number {
  return level >= 3 ? 3000 : EXPERTISE_COST;
}

/** Mezat nakliyesi — 15. seviye ayrıcalığıyla yarı fiyat */
export function auctionTransportFor(km: number, level: number): number {
  const base = km * TRANSPORT_COST_PER_KM * (level >= 15 ? 0.5 : 1);
  return Math.round(base / 100) * 100;
}

export type Action =
  | { type: "NEW_GAME"; playerName: string; galleryName: string; homeCity: number; difficulty: Difficulty }
  | { type: "RESET" }
  | { type: "LOAD_SAVE"; save: GameState }
  | { type: "TRAVEL"; plate: number }
  | { type: "EXPERTISE"; listingId: string }
  | { type: "TESTDRIVE_DONE"; listingId: string; foundFaultIds: string[]; crashed: boolean }
  | { type: "SELLER_WALKAWAY"; listingId: string }
  | {
      type: "BUY";
      listingId: string;
      price: number;
      /** "sur": aracı kendin sürerek getir (nakliye bedava, yol riski senin) */
      deliver?: "nakliye" | "sur";
      drive?: { crashed: boolean; brokeDown: boolean; foundFaultIds: string[] };
    }
  | { type: "SET_ASKING"; carId: string; price: number }
  | { type: "START_JOB"; carId: string; job: Omit<WorkshopJob, "id" | "carId"> }
  | {
      type: "CUSTOMER_DEAL";
      customerId: string;
      price: number;
      /** Taksitli satış: peşinat %25, kalanı haftalık senetlerle (vade farkı eklenir) */
      senet?: { count: 4 | 8 | 12 };
    }
  | { type: "CUSTOMER_GONE"; customerId: string; angry?: boolean }
  | { type: "LEGAL_CHECK"; listingId: string }
  | { type: "LEGAL_SETTLE"; carId: string }
  | { type: "LEGAL_SUE"; carId: string }
  | { type: "SENET_NOTICE"; noteId: string }
  | { type: "SENET_SUE"; noteId: string }
  | { type: "START_RENT"; carId: string; days: 10 | 20 | 30 }
  | { type: "EX_BUY"; key: string; amount: number }
  | { type: "EX_SELL"; key: string; fraction: number }
  | { type: "EXPORT_SELL"; offerId: string; carId: string }
  | { type: "WHOLESALE"; carId: string }
  | { type: "TAKE_LOAN"; offer: LoanOffer }
  | { type: "PAYOFF_LOAN"; loanId: string }
  | { type: "HIRE_STAFF"; role: StaffRole }
  | { type: "FIRE_STAFF"; staffId: string }
  | { type: "AUCTION_BUY"; carId: string; price: number }
  | { type: "AUCTION_PASS"; carId: string }
  | { type: "BUILD_FACILITY"; facility: FacilityKey }
  | { type: "END_DAY" };

/** Her ilde her zaman en az bu kadar ilan bulunur */
export const MIN_PER_CITY = 5;

/** Pazarda toplam ilan üst sınırı */
const LISTING_CAP = 1200;

/**
 * İlan stoğunu tamamlar: her ile en az MIN_PER_CITY ilan, ayrıca rastgele illere `extra` ilan daha.
 * (Süresi dolan ilanlar temizlendikten sonra çağrılır; böylece hiçbir il boş kalmaz.)
 */
function stockListings(s: GameState, extra: number): void {
  const counts = new Map<number, number>();
  for (const l of s.listings) counts.set(l.cityPlate, (counts.get(l.cityPlate) ?? 0) + 1);
  for (const c of CITIES) {
    for (let n = counts.get(c.plate) ?? 0; n < MIN_PER_CITY; n++) {
      s.listings.push(generateListing(s.day, c.plate));
    }
  }
  const room = Math.max(0, Math.min(extra, LISTING_CAP - s.listings.length));
  for (let i = 0; i < room; i++) s.listings.push(generateListing(s.day));
}

/** Taksitli satış: vade sayısına göre vade farkı */
export const SENET_MARKUP: Record<4 | 8 | 12, number> = { 4: 0.05, 8: 0.11, 12: 0.18 };
export const SENET_DOWN_PCT = 0.25;

export function senetPlan(price: number, count: 4 | 8 | 12) {
  const down = roundMoney(price * SENET_DOWN_PCT, 1000);
  const rest = price - down;
  const total = roundMoney(rest * (1 + SENET_MARKUP[count]), 100);
  const installment = Math.ceil(total / count / 100) * 100;
  return { down, rest, total, installment };
}

const SENET_RISK: Record<string, number> = { normal: 0.12, siki: 0.08, acele: 0.25, titiz: 0.05 };

export function hasLawyer(s: GameState): boolean {
  return s.staff.some((st) => st.role === "avukat");
}
export const LEGAL_CHECK_COST = 2500;
export const LEGAL_SUE_COST = 15000;
export const SENET_NOTICE_COST = 2000;
export const SENET_SUE_COST = 8000;
export function legalCost(s: GameState, base: number): number {
  return hasLawyer(s) ? Math.round(base / 2) : base;
}
export function settleCost(s: GameState, o: OwnedCar): number {
  return roundMoney(carValue(o.car, s.marketModifiers, s.day) * (hasLawyer(s) ? 0.08 : 0.12), 1000);
}
export function rentDailyRate(s: GameState, o: OwnedCar): number {
  return roundMoney(carValue(o.car, s.marketModifiers, s.day) * 0.0034, 100);
}

export function newGameState(
  playerName: string,
  galleryName: string,
  homeCity: number,
  difficulty: Difficulty
): GameState {
  const money =
    difficulty === "kolay" ? 2500000 : difficulty === "zor" ? 900000 : 1500000;
  const base: GameState = {
    version: SAVE_VERSION,
    started: true,
    playerName,
    galleryName,
    homeCity,
    currentCity: homeCity,
    difficulty,
    day: 1,
    hour: 8,
    money,
    reputation: 50,
    gallerySlots: 4,
    inventory: [],
    listings: [],
    customers: [],
    jobs: [],
    marketModifiers: [],
    loans: [],
    staff: [],
    auction: null,
    rivals: generateRivals(homeCity),
    facilities: { showroom: 1 },
    notes: [],
    exchange: initialExchange(),
    exports: [],
    log: [
      {
        day: 1,
        text: `🎉 ${galleryName} kapılarını açtı! Bol kazançlar ${playerName} usta.`,
        kind: "info",
      },
    ],
    stats: {
      carsBought: 0,
      carsSold: 0,
      totalProfit: 0,
      bestFlip: 0,
      auctionsWon: 0,
      repairsDone: 0,
      kmTraveled: 0,
      citiesVisited: [homeCity],
    },
    xp: 0,
    level: 1,
    achievements: {},
    rngSeed: Date.now(),
  };
  stockListings(base, 60);
  refreshExportOffers(base);
  return base;
}

const emptyState: GameState = {
  version: SAVE_VERSION,
  started: false,
  playerName: "",
  galleryName: "",
  homeCity: 34,
  currentCity: 34,
  difficulty: "normal",
  day: 1,
  hour: 8,
  money: 0,
  reputation: 50,
  gallerySlots: 4,
  inventory: [],
  listings: [],
  customers: [],
  jobs: [],
  marketModifiers: [],
  loans: [],
  staff: [],
  auction: null,
  rivals: [],
  facilities: { showroom: 1 },
  notes: [],
  exchange: initialExchange(),
  exports: [],
  log: [],
  stats: {
    carsBought: 0,
    carsSold: 0,
    totalProfit: 0,
    bestFlip: 0,
    auctionsWon: 0,
    repairsDone: 0,
    kmTraveled: 0,
    citiesVisited: [],
  },
  xp: 0,
  level: 1,
  achievements: {},
  rngSeed: 0,
};

function log(s: GameState, e: Omit<LogEntry, "day">): void {
  s.log = [{ day: s.day, ...e }, ...s.log].slice(0, 200);
}

function clone<T>(o: T): T {
  return JSON.parse(JSON.stringify(o));
}

export function travelHours(km: number): number {
  return Math.max(1, Math.round(km / 85));
}

/** Saf oyun mantığı — test betikleri için dışa açık */
export function applyAction(state: GameState, action: Action): GameState {
  return reducer(state, action);
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "NEW_GAME":
      return newGameState(action.playerName, action.galleryName, action.homeCity, action.difficulty);

    case "RESET":
      return { ...emptyState };

    case "LOAD_SAVE":
      return migrateSave(action.save) ?? state;

    case "TRAVEL": {
      if (action.plate === state.currentCity) return state;
      const s = clone(state);
      const km = roadDistance(s.currentCity, action.plate);
      const cost = travelCostFor(km, s.level, travelCostMultiplier(s));
      if (s.money < cost) return state;
      const h = travelHours(km);
      s.money -= cost;
      s.hour = Math.min(24, s.hour + h);
      s.currentCity = action.plate;
      s.stats.kmTraveled += km;
      if (!s.stats.citiesVisited.includes(action.plate)) {
        s.stats.citiesVisited.push(action.plate);
      }
      log(s, {
        text: `🚗 ${km} km yol gidildi (${h} saat). Yol masrafı düşüldü.`,
        amount: -cost,
        kind: "gider",
      });
      addXp(s, 5);
      checkMilestones(s);
      return s;
    }

    case "EXPERTISE": {
      const s = clone(state);
      const l = s.listings.find((x) => x.id === action.listingId);
      const cost = expertiseCostFor(state.level);
      if (!l || l.expertised || s.money < cost) return state;
      s.money -= cost;
      s.hour = Math.min(24, s.hour + 1);
      addXp(s, 5);
      l.expertised = true;
      // Ekspertiz gizli arızaların çoğunu ortaya çıkarır
      const found: typeof l.car.knownFaults = [];
      l.car.hiddenFaults = l.car.hiddenFaults.filter((f) => {
        if (chance(0.8)) {
          found.push(f);
          return false;
        }
        return true;
      });
      l.car.knownFaults = [...l.car.knownFaults, ...found];
      log(s, {
        text:
          found.length > 0
            ? `🔍 Ekspertiz: ${l.car.brand} ${l.car.model} aracında ${found.length} sorun tespit edildi!`
            : `🔍 Ekspertiz: ${l.car.brand} ${l.car.model} temiz çıktı.`,
        amount: -cost,
        kind: "gider",
      });
      return s;
    }

    case "TESTDRIVE_DONE": {
      const s = clone(state);
      const l = s.listings.find((x) => x.id === action.listingId);
      if (!l) return state;
      l.testDriven = true;
      s.hour = Math.min(24, s.hour + 1);
      addXp(s, 10);
      const found = l.car.hiddenFaults.filter((f) => action.foundFaultIds.includes(f.id));
      l.car.hiddenFaults = l.car.hiddenFaults.filter((f) => !action.foundFaultIds.includes(f.id));
      l.car.knownFaults = [...l.car.knownFaults, ...found];
      if (action.crashed) {
        const damage = roundMoney(l.car.basePrice * 0.01, 500);
        s.money = Math.max(0, s.money - damage);
        log(s, {
          text: `💥 Test sürüşünde kaza yaptınız! Satıcıya hasar ödendi.`,
          amount: -damage,
          kind: "gider",
        });
      }
      if (found.length > 0) {
        log(s, {
          text: `🛞 Test sürüşü: ${l.car.brand} ${l.car.model} aracında ${found.length} sorun fark ettiniz.`,
          kind: "info",
        });
      }
      return s;
    }

    case "SELLER_WALKAWAY": {
      const s = clone(state);
      const l = s.listings.find((x) => x.id === action.listingId);
      if (!l) return state;
      l.negotiationDead = true;
      return s;
    }

    case "BUY": {
      const s = clone(state);
      const li = s.listings.findIndex((x) => x.id === action.listingId);
      if (li < 0) return state;
      const l = s.listings[li];
      const inGarageCount = s.inventory.length;
      if (inGarageCount >= s.gallerySlots) return state;

      const km = roadDistance(l.cityPlate, s.homeCity);
      const selfDrive = action.deliver === "sur" && km > 0;
      const transport = selfDrive ? 0 : roundMoney(km * TRANSPORT_COST_PER_KM, 100);
      const total = action.price + transport;
      if (s.money < total) return state;

      s.money -= total;
      s.hour = Math.min(24, s.hour + 1);
      const owned: OwnedCar = {
        car: l.car,
        boughtPrice: action.price,
        boughtDay: s.day,
        totalSpent: total,
        askingPrice: roundMoney(carValue({ ...l.car, hiddenFaults: [] }, s.marketModifiers, s.day) * 1.08, 5000),
        inTransitUntilDay: !selfDrive && km > 250 ? s.day + 1 : undefined,
        legal: l.legal,
        legalDeadline: l.legal ? s.day + 3 : undefined,
      };
      if (l.legal) {
        log(s, {
          text: `⚠️ ${l.car.brand} ${l.car.model} için tebligat geldi: ${LEGAL_LABELS[l.legal]}! 3 gün içinde Avukat sekmesinden çözmezseniz araç icradan alınır.`,
          kind: "uyari",
        });
      }
      s.inventory.push(owned);
      s.listings.splice(li, 1);
      s.stats.carsBought++;

      if (selfDrive) {
        // Aracı kendin sürdün: eve döndün, km yazdı, yolda öğrendiklerin bilinen arıza oldu
        const car = owned.car;
        s.currentCity = s.homeCity;
        s.hour = Math.min(24, s.hour + travelHours(km));
        s.stats.kmTraveled += km;
        if (!s.stats.citiesVisited.includes(s.homeCity)) s.stats.citiesVisited.push(s.homeCity);
        car.km += km;
        const found = action.drive?.foundFaultIds ?? [];
        const learned = car.hiddenFaults.filter((f) => found.includes(f.id));
        car.hiddenFaults = car.hiddenFaults.filter((f) => !found.includes(f.id));
        car.knownFaults = [...car.knownFaults, ...learned];
        let extra = 0;
        let note = "";
        if (action.drive?.brokeDown) {
          const tow = roundMoney(Math.max(3000, km * 12), 500);
          extra += tow;
          note += ` Yolda kaldınız, çekici: ${tow.toLocaleString("tr-TR")} ₺.`;
          // yolda kalan araçta gizli arıza kendini belli eder
          if (car.hiddenFaults.length > 0) {
            const f = car.hiddenFaults.shift()!;
            car.knownFaults.push(f);
            note += ` Sorun: ${f.label}.`;
          }
        }
        if (action.drive?.crashed) {
          const damage = roundMoney(Math.max(5000, car.basePrice * 0.015), 500);
          extra += damage;
          const part = PART_KEYS_FOR_DAMAGE[Math.floor(Math.random() * PART_KEYS_FOR_DAMAGE.length)];
          car.parts[part] = Math.max(10, car.parts[part] - 15);
          car.paintedPanels += 1;
          note += ` Kaza yaptınız: ${damage.toLocaleString("tr-TR")} ₺ hasar, ${PART_LABELS[part]} yıprandı.`;
        }
        s.money -= extra;
        owned.totalSpent += extra;
        log(s, {
          text: `🏁 ${l.car.year} ${l.car.brand} ${l.car.model} satın alınıp ${km} km sürülerek galeriye getirildi (nakliye bedava).${note}${learned.length > 0 ? ` Yolda ${learned.length} arıza fark ettiniz.` : ""}`,
          amount: -(total + extra),
          kind: "gider",
        });
        addXp(s, 40 + 30 + Math.floor(km / 100));
        checkMilestones(s);
        return s;
      }

      log(s, {
        text: `🤝 ${l.car.year} ${l.car.brand} ${l.car.model} satın alındı (${l.sellerName}).${transport > 0 ? ` Nakliye: ${transport.toLocaleString("tr-TR")} ₺.` : ""}${owned.inTransitUntilDay ? " Araç yarın galeride olacak." : ""}`,
        amount: -total,
        kind: "gider",
      });
      addXp(s, 40);
      checkMilestones(s);
      return s;
    }

    case "SET_ASKING": {
      const s = clone(state);
      const o = s.inventory.find((x) => x.car.id === action.carId);
      if (!o) return state;
      o.askingPrice = Math.max(0, Math.round(action.price));
      return s;
    }

    case "START_JOB": {
      const s = clone(state);
      const o = s.inventory.find((x) => x.car.id === action.carId);
      if (!o || s.money < action.job.cost) return state;
      // Aynı araçta aynı iş zaten kuyruktaysa engelle
      const dup = s.jobs.some(
        (j) =>
          j.carId === action.carId &&
          j.type === action.job.type &&
          j.partKey === action.job.partKey &&
          j.cosmeticKey === action.job.cosmeticKey &&
          j.faultId === action.job.faultId
      );
      if (dup) return state;
      s.money -= action.job.cost;
      s.jobs.push({ id: uid("job"), carId: action.carId, ...action.job });
      log(s, {
        text: `🔧 Atölye işi başladı: ${o.car.brand} ${o.car.model} — ${action.job.label}`,
        amount: -action.job.cost,
        kind: "gider",
      });
      return s;
    }

    case "CUSTOMER_DEAL": {
      const s = clone(state);
      const c = s.customers.find((x) => x.id === action.customerId);
      if (!c) return state;
      const oi = s.inventory.findIndex((x) => x.car.id === c.carId);
      if (oi < 0) return state;
      const o = s.inventory[oi];

      if (o.rental && o.rental.untilDay > s.day) return state; // kiradaki araç satılamaz

      // Taksitli satış: peşinat bugün, kalanı haftalık senetlerle (vade farkıyla)
      let cashNow = action.price;
      let senetText = "";
      if (action.senet) {
        const plan = senetPlan(action.price, action.senet.count);
        cashNow = plan.down;
        const risk = Math.min(0.6, (SENET_RISK[c.style] ?? 0.12) + (s.reputation < 40 ? 0.04 : 0));
        s.notes.push({
          id: uid("snt"),
          buyerName: c.name,
          carLabel: `${o.car.year} ${o.car.brand} ${o.car.model}`,
          total: plan.total,
          remaining: plan.total,
          installment: plan.installment,
          count: action.senet.count,
          paidCount: 0,
          intervalDays: 7,
          nextDueDay: s.day + 7,
          principalRatio: plan.rest / plan.total,
          risk,
          missed: 0,
          status: "aktif",
          takenDay: s.day,
        });
        senetText = ` Senetli: ${fmtMoney(plan.down)} peşin + ${action.senet.count} × ${fmtMoney(plan.installment)} (haftalık).`;
      }

      s.money += cashNow;
      const profit = action.price - o.totalSpent;
      s.stats.carsSold++;
      s.stats.totalProfit += profit;
      s.stats.bestFlip = Math.max(s.stats.bestFlip, profit);
      s.inventory.splice(oi, 1);
      s.customers = s.customers.filter((x) => x.id !== c.id);
      // Aynı araca bakan diğer müşteriler ayrılır
      s.customers = s.customers.filter((x) => x.carId !== c.carId);
      s.jobs = s.jobs.filter((j) => j.carId !== c.carId);

      log(s, {
        text: `💰 ${o.car.year} ${o.car.brand} ${o.car.model}, ${c.name} adlı müşteriye satıldı! Kâr: ${profit.toLocaleString("tr-TR")} ₺.${senetText}`,
        amount: cashNow,
        kind: "gelir",
      });

      // Hukuki sorunlu araç satıldıysa alıcı dava açar
      if (o.legal) {
        const penalty = Math.round((action.price * (hasLawyer(s) ? 0.12 : 0.25)) / 1000) * 1000;
        s.money -= penalty;
        s.reputation = Math.max(0, s.reputation - 8);
        log(s, {
          text: `⚖️ ${c.name}, araçtaki ${LEGAL_LABELS[o.legal].toLowerCase()} sorununu öğrenip dava açtı! Tazminat: ${fmtMoney(penalty)}. İtibar -8${hasLawyer(s) ? " (avukatınız cezayı yarıya indirdi)" : ""}`,
          amount: -penalty,
          kind: "uyari",
        });
      }

      // İtibar etkisi — dürüst satış bol itibar kazandırır, gizli arıza nadiren ve hafif zarar verir
      if (o.car.hiddenFaults.length > 0 && chance(0.25)) {
        const hit = 1 + o.car.hiddenFaults.length;
        s.reputation = Math.max(0, s.reputation - hit);
        log(s, {
          text: `😠 ${c.name} eve varamadan araç arıza yaptı! Sosyal medyada sizi kötüledi. İtibar -${hit}`,
          kind: "uyari",
        });
      } else if (o.car.knownFaults.length === 0 && o.car.hiddenFaults.length === 0 && profit > 0) {
        s.reputation = Math.min(100, s.reputation + 6);
        log(s, { text: "🌟 Sorunsuz satış! İtibar +6", kind: "info" });
      } else if (profit > 0) {
        // Açıkça bilinen kusurlarına rağmen sorunsuz tamamlanan satış da güven kazandırır
        s.reputation = Math.min(100, s.reputation + 3);
        log(s, { text: "🙂 Memnun müşteri! İtibar +3", kind: "info" });
      }
      addXp(s, 60 + Math.max(0, Math.floor(profit / 10000)));
      checkMilestones(s);
      return s;
    }

    case "LEGAL_CHECK": {
      const s = clone(state);
      const l = s.listings.find((x) => x.id === action.listingId);
      const cost = legalCost(s, LEGAL_CHECK_COST);
      if (!l || l.legalChecked || s.money < cost) return state;
      s.money -= cost;
      l.legalChecked = true;
      addXp(s, 5);
      log(s, {
        text: l.legal
          ? `⚖️ Hukuki sorgu: ${l.car.brand} ${l.car.model} — ${LEGAL_LABELS[l.legal]}! Almadan önce düşünün.`
          : `⚖️ Hukuki sorgu: ${l.car.brand} ${l.car.model} temiz çıktı.`,
        amount: -cost,
        kind: l.legal ? "uyari" : "gider",
      });
      return s;
    }

    case "LEGAL_SETTLE": {
      const s = clone(state);
      const o = s.inventory.find((x) => x.car.id === action.carId);
      if (!o || !o.legal) return state;
      const cost = settleCost(s, o);
      if (s.money < cost) return state;
      s.money -= cost;
      o.totalSpent += cost;
      log(s, {
        text: `⚖️ ${o.car.brand} ${o.car.model}: ${LEGAL_LABELS[o.legal].toLowerCase()} sorunu uzlaşmayla kapatıldı.`,
        amount: -cost,
        kind: "gider",
      });
      o.legal = undefined;
      o.legalDeadline = undefined;
      addXp(s, 20);
      return s;
    }

    case "LEGAL_SUE": {
      const s = clone(state);
      const o = s.inventory.find((x) => x.car.id === action.carId);
      const fee = legalCost(s, LEGAL_SUE_COST);
      if (!o || !o.legal || s.money < fee) return state;
      s.money -= fee;
      o.totalSpent += fee;
      if (chance(hasLawyer(s) ? 0.85 : 0.65)) {
        log(s, {
          text: `⚖️ Dava kazanıldı! ${o.car.brand} ${o.car.model} üzerindeki ${LEGAL_LABELS[o.legal].toLowerCase()} kaldırıldı.`,
          amount: -fee,
          kind: "gelir",
        });
        o.legal = undefined;
        o.legalDeadline = undefined;
        addXp(s, 40);
      } else {
        log(s, {
          text: `⚖️ Dava kaybedildi — ${o.car.brand} ${o.car.model} için avukatlık ücreti boşa gitti. Uzlaşmayı deneyin ya da yeniden dava açın.`,
          amount: -fee,
          kind: "uyari",
        });
      }
      return s;
    }

    case "SENET_NOTICE": {
      const s = clone(state);
      const n = s.notes.find((x) => x.id === action.noteId);
      const fee = legalCost(s, SENET_NOTICE_COST);
      if (!n || n.status !== "gecikmis" || s.money < fee) return state;
      s.money -= fee;
      if (chance(hasLawyer(s) ? 0.85 : 0.65)) {
        const amt = Math.min(n.installment, n.remaining);
        n.remaining -= amt;
        n.paidCount++;
        n.missed = 0;
        n.status = n.remaining <= 0 ? "tamam" : "aktif";
        n.nextDueDay = s.day + n.intervalDays;
        s.money += amt;
        s.stats.totalProfit += amt * (1 - n.principalRatio);
        log(s, {
          text: `📨 İhtar işe yaradı: ${n.buyerName} gecikmiş taksiti (${fmtMoney(amt)}) ödedi.`,
          amount: amt - fee,
          kind: "gelir",
        });
      } else {
        log(s, { text: `📨 İhtar çekildi ama ${n.buyerName} ödemedi. Dava açmayı düşünün.`, amount: -fee, kind: "uyari" });
      }
      return s;
    }

    case "SENET_SUE": {
      const s = clone(state);
      const n = s.notes.find((x) => x.id === action.noteId);
      const fee = legalCost(s, SENET_SUE_COST);
      if (!n || (n.status !== "gecikmis" && n.status !== "aktif") || s.money < fee) return state;
      s.money -= fee;
      if (chance(hasLawyer(s) ? 0.9 : 0.7)) {
        const got = Math.round(n.remaining * 0.9);
        s.money += got;
        s.stats.totalProfit += got - n.remaining * n.principalRatio;
        log(s, {
          text: `⚖️ İcra takibi sonuçlandı: ${n.buyerName} senedinden ${fmtMoney(got)} tahsil edildi (avukatlık ${fmtMoney(fee)}).`,
          amount: got - fee,
          kind: "gelir",
        });
        n.remaining = 0;
        n.status = "tamam";
        addXp(s, 30);
      } else {
        const loss = Math.round(n.remaining * n.principalRatio);
        s.stats.totalProfit -= loss;
        log(s, {
          text: `⚖️ İcra takibi sonuçsuz: ${n.buyerName} malvarlığı çıkmadı, senet batık. Zarar ${fmtMoney(loss)}.`,
          amount: -fee,
          kind: "uyari",
        });
        n.status = "zarar";
      }
      return s;
    }

    case "START_RENT": {
      const s = clone(state);
      const o = s.inventory.find((x) => x.car.id === action.carId);
      if (!o || !isAvailable(o, s.day)) return state;
      const rate = rentDailyRate(s, o);
      o.rental = { untilDay: s.day + action.days, dailyRate: rate, renter: randomPersonName() };
      s.customers = s.customers.filter((x) => x.carId !== o.car.id);
      log(s, {
        text: `🔑 ${o.car.brand} ${o.car.model}, ${o.rental.renter} adlı kiracıya ${action.days} günlüğüne verildi (günlük ${fmtMoney(rate)}).`,
        kind: "info",
      });
      return s;
    }

    case "EX_BUY": {
      const s = clone(state);
      const a = assetDef(action.key);
      const amount = Math.floor(action.amount);
      if (amount < 100 || s.money < amount) return state;
      const price = s.exchange.prices[a.key];
      const qty = Math.floor(((amount * (1 - a.fee)) / price) * 10000) / 10000;
      if (qty <= 0) return state;
      s.money -= amount;
      const h = s.exchange.holdings[a.key] ?? { qty: 0, cost: 0 };
      h.qty = Math.round((h.qty + qty) * 10000) / 10000;
      h.cost += amount;
      s.exchange.holdings[a.key] = h;
      log(s, {
        text: `${a.emoji} ${a.name}: ${qty} adet alındı (${fmtMoney(amount)}, komisyon %${(a.fee * 100).toFixed(1)}).`,
        amount: -amount,
        kind: "gider",
      });
      addXp(s, 3);
      return s;
    }

    case "EX_SELL": {
      const s = clone(state);
      const a = assetDef(action.key);
      const h = s.exchange.holdings[a.key];
      if (!h || h.qty <= 0) return state;
      const frac = Math.min(1, Math.max(0.01, action.fraction));
      const qty = frac >= 1 ? h.qty : Math.floor(h.qty * frac * 10000) / 10000;
      if (qty <= 0) return state;
      const gross = qty * s.exchange.prices[a.key];
      const proceeds = Math.round(gross * (1 - a.fee));
      const costPart = h.cost * (qty / h.qty);
      const pnl = Math.round(proceeds - costPart);
      s.money += proceeds;
      s.stats.totalProfit += pnl;
      h.qty = Math.round((h.qty - qty) * 10000) / 10000;
      h.cost -= costPart;
      if (h.qty <= 0) delete s.exchange.holdings[a.key];
      log(s, {
        text: `${a.emoji} ${a.name}: ${qty} adet satıldı. ${pnl >= 0 ? "Kâr" : "Zarar"}: ${fmtMoney(pnl)}`,
        amount: proceeds,
        kind: pnl >= 0 ? "gelir" : "uyari",
      });
      addXp(s, 3 + Math.max(0, Math.floor(pnl / 20000)));
      checkMilestones(s);
      return s;
    }

    case "EXPORT_SELL": {
      const s = clone(state);
      const offer = s.exports.find((x) => x.id === action.offerId);
      const oi = s.inventory.findIndex((x) => x.car.id === action.carId);
      if (!offer || oi < 0) return state;
      const o = s.inventory[oi];
      const car = o.car;
      if (!isAvailable(o, s.day) || o.legal) return state;
      if (car.segment !== offer.segment || car.year < offer.minYear || car.km > offer.maxKm) return state;
      if (car.knownFaults.length > 0) return state;

      // Alıcı tarafın ihracat ekspertizi: gizli arıza varsa reddedilir, ücret kaybedilir
      if (car.hiddenFaults.length > 0) {
        s.money -= EXPORT_INSPECTION_FEE;
        o.totalSpent += EXPORT_INSPECTION_FEE;
        const f = car.hiddenFaults.shift()!;
        car.knownFaults.push(f);
        s.exports = s.exports.filter((x) => x.id !== offer.id);
        log(s, {
          text: `🛃 ${offer.flag} ${offer.country} alıcısının ekspertizi ${car.brand} ${car.model} aracında "${f.label}" buldu — ihracat reddedildi! Ekspertiz ücreti ${fmtMoney(EXPORT_INSPECTION_FEE)}.`,
          amount: -EXPORT_INSPECTION_FEE,
          kind: "uyari",
        });
        return s;
      }

      const gross = Math.round((carValue(car, s.marketModifiers, s.day) * offer.premium) / 1000) * 1000;
      const net = Math.round(gross * (1 - EXPORT_COMMISSION));
      const profit = net - o.totalSpent;
      s.money += net;
      s.stats.carsSold++;
      s.stats.totalProfit += profit;
      s.stats.bestFlip = Math.max(s.stats.bestFlip, profit);
      s.inventory.splice(oi, 1);
      s.jobs = s.jobs.filter((j) => j.carId !== car.id);
      s.customers = s.customers.filter((x) => x.carId !== car.id);
      s.exports = s.exports.filter((x) => x.id !== offer.id);
      s.reputation = Math.min(100, s.reputation + 3);
      log(s, {
        text: `🚢 ${car.year} ${car.brand} ${car.model} → ${offer.flag} ${offer.country} ihraç edildi! ${fmtMoney(gross)} − %${EXPORT_COMMISSION * 100} komisyon. Kâr: ${fmtMoney(profit)}. İtibar +3`,
        amount: net,
        kind: "gelir",
      });
      addXp(s, 90 + Math.max(0, Math.floor(profit / 10000)));
      checkMilestones(s);
      return s;
    }

    case "CUSTOMER_GONE": {
      const s = clone(state);
      const c = s.customers.find((x) => x.id === action.customerId);
      if (!c) return state;
      s.customers = s.customers.filter((x) => x.id !== action.customerId);
      if (action.angry) {
        s.reputation = Math.max(0, s.reputation - 1);
        log(s, { text: `😒 ${c.name} galeriden memnun ayrılmadı. İtibar -1`, kind: "uyari" });
      }
      return s;
    }

    case "WHOLESALE": {
      const s = clone(state);
      const oi = s.inventory.findIndex((x) => x.car.id === action.carId);
      if (oi < 0) return state;
      const o = s.inventory[oi];
      if (o.legal || !isAvailable(o, s.day)) return state; // toptancı hukuki sorunlu/kiradaki aracı almaz
      const price = roundMoney(carValue(o.car, s.marketModifiers, s.day) * 0.78, 1000);
      s.money += price;
      const profit = price - o.totalSpent;
      s.stats.carsSold++;
      s.stats.totalProfit += profit;
      s.inventory.splice(oi, 1);
      s.customers = s.customers.filter((x) => x.carId !== action.carId);
      s.jobs = s.jobs.filter((j) => j.carId !== action.carId);
      log(s, {
        text: `🚛 ${o.car.brand} ${o.car.model} toptancıya verildi. ${profit >= 0 ? "Kâr" : "Zarar"}: ${profit.toLocaleString("tr-TR")} ₺`,
        amount: price,
        kind: profit >= 0 ? "gelir" : "uyari",
      });
      addXp(s, 20);
      checkMilestones(s);
      return s;
    }

    case "BUILD_FACILITY": {
      const s = clone(state);
      const def = facilityDef(action.facility);
      const cur = facilityLevel(s, action.facility);
      if (cur >= def.levels.length) return state;
      const lvl = def.levels[cur]; // bir sonraki seviye
      if (s.money < lvl.cost) return state;
      s.money -= lvl.cost;
      s.facilities[action.facility] = cur + 1;
      s.gallerySlots = totalSlots(s);
      log(s, {
        text:
          cur === 0
            ? `🏗️ ${def.emoji} ${def.name} inşa edildi! ${lvl.effect}.`
            : `🏗️ ${def.emoji} ${def.name} Seviye ${cur + 1} oldu! ${lvl.effect}.`,
        amount: -lvl.cost,
        kind: "gider",
      });
      addXp(s, 50 + cur * 25);
      checkMilestones(s);
      return s;
    }

    case "TAKE_LOAN": {
      const s = clone(state);
      if (canTakeLoan(s, action.offer)) return state;
      const loan = makeLoan(action.offer);
      loan.takenDay = s.day;
      s.loans.push(loan);
      s.money += loan.principal;
      log(s, {
        text: `🏦 ${loan.name} çekildi. Geri ödeme: ${fmtMoney(loan.totalDebt)} (günlük ${fmtMoney(loan.dailyPayment)} taksit).`,
        amount: loan.principal,
        kind: "gelir",
      });
      return s;
    }

    case "PAYOFF_LOAN": {
      const s = clone(state);
      const loan = s.loans.find((l) => l.id === action.loanId);
      if (!loan || s.money < loan.remaining) return state;
      s.money -= loan.remaining;
      log(s, {
        text: `🏦 ${loan.name} erken kapatıldı. Banka sizi seviyor!`,
        amount: -loan.remaining,
        kind: "gider",
      });
      s.loans = s.loans.filter((l) => l.id !== action.loanId);
      s.reputation = Math.min(100, s.reputation + 1);
      addXp(s, 25);
      return s;
    }

    case "HIRE_STAFF": {
      const s = clone(state);
      if (s.staff.some((st) => st.role === action.role)) return state;
      const def = STAFF_DEFS[action.role];
      s.staff.push({
        id: uid("stf"),
        name: randomPersonName(),
        role: action.role,
        weeklySalary: def.weeklySalary,
        hiredDay: s.day,
      });
      const hired = s.staff[s.staff.length - 1];
      log(s, {
        text: `${def.emoji} ${hired.name} işe alındı (${def.label}). Haftalık maaş: ${fmtMoney(def.weeklySalary)}.`,
        kind: "info",
      });
      return s;
    }

    case "FIRE_STAFF": {
      const s = clone(state);
      const st = s.staff.find((x) => x.id === action.staffId);
      if (!st) return state;
      s.staff = s.staff.filter((x) => x.id !== action.staffId);
      log(s, { text: `👋 ${st.name} ile yollar ayrıldı.`, kind: "info" });
      return s;
    }

    case "AUCTION_BUY": {
      const s = clone(state);
      const a = s.auction;
      if (!a || a.day !== s.day || s.currentCity !== a.cityPlate) return state;
      const car = a.cars.find((c) => c.id === action.carId);
      if (!car || a.resolved.includes(car.id)) return state;
      if (s.inventory.length >= s.gallerySlots) return state;
      const km = roadDistance(a.cityPlate, s.homeCity);
      const transport = auctionTransportFor(km, s.level);
      const total = action.price + transport;
      if (s.money < total) return state;
      s.money -= total;
      s.hour = Math.min(24, s.hour + 1);
      s.inventory.push({
        car,
        boughtPrice: action.price,
        boughtDay: s.day,
        totalSpent: total,
        askingPrice: roundMoney(
          carValue({ ...car, hiddenFaults: [] }, s.marketModifiers, s.day) * 1.08,
          5000
        ),
        inTransitUntilDay: km > 250 ? s.day + 1 : undefined,
      });
      a.resolved.push(car.id);
      s.stats.carsBought++;
      s.stats.auctionsWon++;
      log(s, {
        text: `🔨 Mezattan ${car.year} ${car.brand} ${car.model} kazanıldı!${transport > 0 ? ` Nakliye: ${fmtMoney(transport)}.` : ""} Mezat malı ekspertizsizdir, sürprizlere hazır olun...`,
        amount: -total,
        kind: "gider",
      });
      addXp(s, 60);
      checkMilestones(s);
      return s;
    }

    case "AUCTION_PASS": {
      const s = clone(state);
      const a = s.auction;
      if (!a) return state;
      const car = a.cars.find((c) => c.id === action.carId);
      if (!car || a.resolved.includes(car.id)) return state;
      a.resolved.push(car.id);
      log(s, {
        text: `🔨 Mezatta ${car.brand} ${car.model} rakip galericiye gitti.`,
        kind: "info",
      });
      return s;
    }

    case "END_DAY": {
      const s = clone(state);
      s.day += 1;
      s.hour = 8;

      // Haftalık gider (kira + maaşlar)
      if (s.day % 7 === 1 && s.day > 1) {
        const exp = weeklyExpense(s);
        const salaries = s.staff.reduce((sum, st) => sum + st.weeklySalary, 0);
        s.money -= exp + salaries;
        log(s, {
          text: salaries > 0 ? "🏠 Haftalık kira, giderler ve maaşlar ödendi." : "🏠 Haftalık kira ve giderler ödendi.",
          amount: -(exp + salaries),
          kind: "gider",
        });
        if (s.money < 0) {
          log(s, {
            text: "🚨 Kasanız eksiye düştü! Araç satıp nakit toplamalısınız (toptancı her zaman alıcıdır).",
            kind: "uyari",
          });
        }
      }

      // Kiradaki araçlar: günlük kira + dönüşte hasar riski
      let rentIncome = 0;
      for (const o of s.inventory) {
        if (!o.rental) continue;
        rentIncome += o.rental.dailyRate;
        if (o.rental.untilDay <= s.day) {
          const risky = chance(hasLawyer(s) ? 0.12 : 0.25);
          o.car.cleanliness = Math.max(10, o.car.cleanliness - (risky ? 30 : 10));
          o.car.km += randInt(600, 2200);
          if (risky) {
            const part = PART_KEYS_FOR_DAMAGE[Math.floor(Math.random() * PART_KEYS_FOR_DAMAGE.length)];
            o.car.parts[part] = Math.max(10, o.car.parts[part] - randInt(10, 25));
            log(s, {
              text: `🔑 ${o.car.brand} ${o.car.model} kiradan hasarlı döndü (${PART_LABELS[part]} yıprandı).${hasLawyer(s) ? " Avukatınız kiracıdan kısmi tazminat aldı: +5.000 ₺." : ""}`,
              kind: "uyari",
            });
            if (hasLawyer(s)) s.money += 5000;
          } else {
            log(s, { text: `🔑 ${o.car.brand} ${o.car.model} kiradan sorunsuz döndü, vitrinde.`, kind: "info" });
          }
          o.rental = undefined;
        }
      }
      if (rentIncome > 0) {
        s.money += rentIncome;
        log(s, { text: "🔑 Kiradaki araçlardan günlük kira geliri tahsil edildi.", amount: rentIncome, kind: "gelir" });
      }

      // Senet taksitleri
      for (const n of s.notes) {
        if ((n.status !== "aktif" && n.status !== "gecikmis") || n.nextDueDay > s.day) continue;
        const pDefault = Math.min(0.9, n.risk * (1 + n.missed) * (hasLawyer(s) ? 0.7 : 1));
        if (chance(pDefault)) {
          n.missed++;
          n.status = "gecikmis";
          n.nextDueDay = s.day + 7;
          if (n.missed >= 3) {
            const loss = Math.round(n.remaining * n.principalRatio);
            n.status = "zarar";
            s.stats.totalProfit -= loss;
            log(s, {
              text: `📉 ${n.buyerName} ${n.carLabel} senedini 3 kez ödemedi, senet zamanaşımına uğradı. Zarar ${fmtMoney(loss)}. (Gecikince İhtar/İcra için Avukat sekmesine bakın.)`,
              kind: "uyari",
            });
          } else {
            log(s, {
              text: `⏰ ${n.buyerName} bu haftaki taksiti ödemedi (${n.carLabel}). Avukat sekmesinden ihtar çekebilirsiniz.`,
              kind: "uyari",
            });
          }
        } else {
          const amt = Math.min(n.installment, n.remaining);
          n.remaining -= amt;
          n.paidCount++;
          n.missed = 0;
          n.nextDueDay = s.day + n.intervalDays;
          s.money += amt;
          s.stats.totalProfit += amt * (1 - n.principalRatio);
          if (n.remaining <= 0) {
            n.status = "tamam";
            log(s, { text: `✅ ${n.buyerName} ${n.carLabel} senedinin son taksitini ödedi. Senet kapandı.`, amount: amt, kind: "gelir" });
          } else {
            n.status = "aktif";
            log(s, { text: `🧾 ${n.buyerName} senet taksidi: ${fmtMoney(amt)} (${n.paidCount}/${n.count}).`, amount: amt, kind: "gelir" });
          }
        }
      }
      s.notes = s.notes.filter((n) => n.status === "aktif" || n.status === "gecikmis" || n.takenDay > s.day - 60);

      // Hukuki sorunlu araçlar: tebligat süresi dolduysa icradan alınır
      for (const o of [...s.inventory]) {
        if (o.legal && o.legalDeadline !== undefined && o.legalDeadline <= s.day) {
          s.inventory = s.inventory.filter((x) => x.car.id !== o.car.id);
          s.jobs = s.jobs.filter((j) => j.carId !== o.car.id);
          s.customers = s.customers.filter((x) => x.carId !== o.car.id);
          s.reputation = Math.max(0, s.reputation - 3);
          s.stats.totalProfit -= o.totalSpent;
          log(s, {
            text: `🚨 İCRA! ${o.car.year} ${o.car.brand} ${o.car.model} (${LEGAL_LABELS[o.legal].toLowerCase()}) süresinde çözülmediği için elinizden alındı. Zarar ${fmtMoney(o.totalSpent)}. İtibar -3`,
            kind: "uyari",
          });
        }
      }

      // Borsa / kripto / döviz günlük hareketi + ihracat talepleri
      for (const t of stepExchange(s.exchange)) log(s, { text: t, kind: "olay" });
      refreshExportOffers(s);

      // Dükkan gelirleri (yıkama, parça, kafeterya, pompa...)
      const shopIncome = dailyFacilityIncome(s);
      if (shopIncome > 0) {
        s.money += shopIncome;
        log(s, {
          text: "🏪 Tesisteki dükkanlar günlük ciroyu kasaya devretti.",
          amount: shopIncome,
          kind: "gelir",
        });
      }

      // Kredi taksitleri
      if (s.loans.length > 0) {
        let totalPay = 0;
        for (const loan of s.loans) {
          const pay = Math.min(loan.dailyPayment, loan.remaining);
          loan.remaining -= pay;
          totalPay += pay;
        }
        s.money -= totalPay;
        log(s, { text: "🏦 Günlük kredi taksitleri ödendi.", amount: -totalPay, kind: "gider" });
        const finished = s.loans.filter((l) => l.remaining <= 0);
        for (const l of finished) {
          log(s, { text: `🎉 ${l.name} tamamen ödendi!`, kind: "info" });
        }
        s.loans = s.loans.filter((l) => l.remaining > 0);
        if (s.money < 0) {
          s.reputation = Math.max(0, s.reputation - 1);
          log(s, {
            text: "🚨 Taksitler kasayı eksiye düşürdü! Banka kara listeye almadan nakit bulun. İtibar -1",
            kind: "uyari",
          });
        }
      }

      // Atölye işleri ilerler
      const finished: WorkshopJob[] = [];
      s.jobs = s.jobs.filter((j) => {
        j.daysLeft -= 1;
        if (j.daysLeft <= 0) {
          finished.push(j);
          return false;
        }
        return true;
      });
      for (const j of finished) {
        const o = s.inventory.find((x) => x.car.id === j.carId);
        if (!o) continue;
        const car = o.car;
        o.totalSpent += 0; // maliyet işe başlarken düşüldü
        if (j.type === "repair") {
          if (j.partKey) car.parts[j.partKey] = randInt(95, 100);
          if (j.faultId) {
            car.knownFaults = car.knownFaults.filter((f) => f.id !== j.faultId);
          }
        } else if (j.type === "clean") {
          car.cleanliness = 100;
        } else if (j.type === "cosmetic" && j.cosmeticKey) {
          car.cosmetics[j.cosmeticKey] = true;
          if (j.cosmeticKey === "seatCover") car.cleanliness = Math.min(100, car.cleanliness + 15);
        }
        log(s, { text: `✅ Atölye işi bitti: ${car.brand} ${car.model} — ${j.label}`, kind: "info" });
      }
      // İş maliyetlerini totalSpent'e işle
      for (const j of finished) {
        const o = s.inventory.find((x) => x.car.id === j.carId);
        if (o) o.totalSpent += j.cost;
      }
      s.stats.repairsDone += finished.length;
      addXp(s, 5 + finished.length * 15);

      // Nakliyedeki araçlar gelir
      for (const o of s.inventory) {
        if (o.inTransitUntilDay && o.inTransitUntilDay <= s.day) {
          o.inTransitUntilDay = undefined;
          log(s, { text: `🚚 ${o.car.brand} ${o.car.model} galeriye ulaştı.`, kind: "info" });
        }
      }

      // İlanlar: süresi dolanlar gider, yenileri gelir
      s.listings = s.listings.filter((l) => l.expiresDay > s.day && !l.negotiationDead);
      stockListings(s, randInt(30, 50));

      // Müşteriler: süresi dolan gider, yenisi gelir
      const leaving = s.customers.filter((c) => c.leavesDay <= s.day);
      for (const c of leaving) {
        log(s, { text: `🚶 ${c.name} beklemekten vazgeçip gitti.`, kind: "info" });
      }
      s.customers = s.customers.filter(
        (c) => c.leavesDay > s.day && s.inventory.some((o) => o.car.id === c.carId)
      );
      const fresh = dailyCustomers(s);
      s.customers.push(...fresh);
      if (fresh.length > 0) {
        log(s, { text: `🛎️ Bugün galeriye ${fresh.length} müşteri geldi.`, kind: "info" });
      }

      // Mezat takvimi: her AUCTION_PERIOD günde bir, bir gün önceden duyurulur
      if (s.auction && s.auction.day < s.day) {
        s.auction = null;
      }
      if (!s.auction && (s.day + 1) % AUCTION_PERIOD === 0) {
        s.auction = generateAuction(s.day + 1);
        log(s, {
          text: `📢 Duyuru: YARIN ${cityByPlate(s.auction.cityPlate).name}'de banka mezadı var! ${s.auction.cars.length} araç açık artırmayla satılacak. Erken giden ucuza kapatır.`,
          kind: "olay",
        });
      }
      if (s.auction && s.auction.day === s.day) {
        log(s, {
          text: `🔨 Bugün ${cityByPlate(s.auction.cityPlate).name}'de mezat günü! Katılmak için oraya gidin (İlanlar sekmesindeki mezat panosuna bakın).`,
          kind: "olay",
        });
      }

      // Rakip galeriler ticaretine devam eder
      const rankBefore = playerRank(s);
      const rivalLogs = updateRivals(s);
      for (const t of rivalLogs) log(s, { text: t, kind: "olay" });
      const rankAfter = playerRank(s);
      if (rankAfter < rankBefore) {
        log(s, {
          text: `📊 Ligde yükseliyorsunuz! Yeni sıranız: ${rankAfter}. (${s.rivals.length + 1} galeri arasında)`,
          kind: "olay",
        });
      } else if (rankAfter > rankBefore) {
        log(s, {
          text: `📊 Rakipler sizi geçti... Yeni sıranız: ${rankAfter}. Lig sekmesine göz atın.`,
          kind: "info",
        });
      }

      // Rastgele olaylar
      applyDailyEvents(s);

      checkMilestones(s);
      return s;
    }

    default:
      return state;
  }
}

function loadSave(): GameState | null {
  try {
    const key = activeSaveKey();
    if (!key) return null;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return migrateSave(JSON.parse(raw) as GameState);
  } catch {
    return null;
  }
}

/** Kayıt nesnesini doğrular ve eski sürümlerde eksik alanları doldurur (yedekten yüklemede de kullanılır). */
export function migrateSave(parsed: GameState): GameState | null {
  try {
    if (!parsed || parsed.version !== SAVE_VERSION || !parsed.started) return null;
    if (!Array.isArray(parsed.inventory) || typeof parsed.money !== "number" || !parsed.stats) return null;
    // Eski kayıtlar için yeni alanları doldur
    parsed.loans = parsed.loans ?? [];
    parsed.staff = parsed.staff ?? [];
    parsed.auction = parsed.auction ?? null;
    parsed.rivals = parsed.rivals ?? generateRivals(parsed.homeCity);
    parsed.xp = parsed.xp ?? 0;
    parsed.level = parsed.level ?? 1;
    parsed.achievements = parsed.achievements ?? {};
    parsed.stats.auctionsWon = parsed.stats.auctionsWon ?? 0;
    parsed.stats.repairsDone = parsed.stats.repairsDone ?? 0;
    parsed.stats.kmTraveled = parsed.stats.kmTraveled ?? 0;
    parsed.stats.citiesVisited = parsed.stats.citiesVisited ?? [parsed.homeCity];
    if (!parsed.facilities) {
      // Eski kayıt: mevcut kapasiteden vitrin seviyesini türet; tamirhane zaten kullanılıyordu
      const showroom = parsed.gallerySlots >= 12 ? 4 : parsed.gallerySlots >= 8 ? 3 : parsed.gallerySlots >= 6 ? 2 : 1;
      parsed.facilities = { showroom, atolye: 1 };
    }
    parsed.notes = parsed.notes ?? [];
    parsed.exchange = ensureExchange(parsed.exchange);
    parsed.exports = parsed.exports ?? [];
    refreshExportOffers(parsed);
    // Eski kayıtlarda her ile en az MIN_PER_CITY ilan olsun
    stockListings(parsed, 40);
    return parsed;
  } catch {
    return null;
  }
}

const GameContext = createContext<{ state: GameState; dispatch: React.Dispatch<Action> }>({
  state: emptyState,
  dispatch: () => {},
});

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, emptyState, () => loadSave() ?? emptyState);

  useEffect(() => {
    const key = activeSaveKey();
    const user = currentUser();
    if (!key || !user) return;
    if (state.started) {
      try {
        localStorage.setItem(key, JSON.stringify(state));
      } catch {
        // depolama dolu olabilir, sessiz geç
      }
      upsertProfile({
        username: user,
        galleryName: state.galleryName,
        homeCity: state.homeCity,
        totalProfit: state.stats.totalProfit,
        carsSold: state.stats.carsSold,
        reputation: state.reputation,
        level: state.level,
        day: state.day,
        started: true,
        updatedAt: Date.now(),
      });
    } else {
      localStorage.removeItem(key);
    }
  }, [state]);

  return <GameContext.Provider value={{ state, dispatch }}>{children}</GameContext.Provider>;
}

export function useGame() {
  return useContext(GameContext);
}

// UI yardımcıları
export function fmtMoney(n: number): string {
  return n.toLocaleString("tr-TR") + " ₺";
}

/** Usta varsa %15, 10. seviye ayrıcalığıyla ek %10 indirim; usta işi 1 gün kısaltır */
export function applyUsta(
  job: Omit<WorkshopJob, "id" | "carId">,
  hasUsta: boolean,
  level = 1
): Omit<WorkshopJob, "id" | "carId"> {
  let cost = job.cost;
  let daysLeft = job.daysLeft;
  if (hasUsta) {
    cost *= 0.85;
    daysLeft = Math.max(1, daysLeft - 1);
  }
  if (level >= 10) cost *= 0.9;
  if (cost === job.cost && daysLeft === job.daysLeft) return job;
  return { ...job, cost: roundMoney(cost, 100), daysLeft };
}

/** Usta + kariyer + tesis (tamirhane/yedek parça) etkilerinin tamamını uygular */
export function adjustJob(
  s: GameState,
  job: Omit<WorkshopJob, "id" | "carId">
): Omit<WorkshopJob, "id" | "carId"> {
  const hasUsta = s.staff.some((st) => st.role === "usta");
  const base = applyUsta(job, hasUsta, s.level);
  const cost = roundMoney(base.cost * workshopCostMultiplier(s), 100);
  const daysLeft = Math.max(1, base.daysLeft - workshopDayBonus(s));
  if (cost === base.cost && daysLeft === base.daysLeft) return base;
  return { ...base, cost, daysLeft };
}

export function repairJobFor(car: Car, partKey: PartKey): Omit<WorkshopJob, "id" | "carId"> {
  const cond = car.parts[partKey];
  const cost = roundMoney(Math.max(2500, car.basePrice * ((100 - cond) / 100) * 0.025), 500);
  return {
    type: "repair",
    partKey,
    label: `${PART_LABELS[partKey]} bakım/yenileme`,
    cost,
    daysLeft: cond < 40 ? 2 : 1,
  };
}

export function faultJobFor(car: Car, faultId: string): Omit<WorkshopJob, "id" | "carId"> | null {
  const f = car.knownFaults.find((x) => x.id === faultId);
  if (!f) return null;
  return {
    type: "repair",
    partKey: f.part,
    faultId: f.id,
    label: `Arıza tamiri: ${f.label}`,
    cost: f.repairCost,
    daysLeft: f.repairCost > car.basePrice * 0.03 ? 2 : 1,
  };
}

export function cleanJob(car: Car): Omit<WorkshopJob, "id" | "carId"> {
  return {
    type: "clean",
    label: "Detaylı iç-dış temizlik",
    cost: 3500,
    daysLeft: 1,
  };
}

export function cosmeticJob(car: Car, key: keyof Cosmetics): Omit<WorkshopJob, "id" | "carId"> {
  const costs: Record<keyof Cosmetics, number> = {
    seatCover: roundMoney(Math.max(8000, car.basePrice * 0.008), 500),
    rims: roundMoney(Math.max(15000, car.basePrice * 0.012), 500),
    multimedia: roundMoney(Math.max(9000, car.basePrice * 0.007), 500),
    tint: 4500,
    ceramic: roundMoney(Math.max(12000, car.basePrice * 0.01), 500),
  };
  return {
    type: "cosmetic",
    cosmeticKey: key,
    label: `${COSMETIC_LABELS[key]} uygulaması`,
    cost: costs[key],
    daysLeft: key === "tint" ? 1 : key === "seatCover" ? 1 : 2,
  };
}
