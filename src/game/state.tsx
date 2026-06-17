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
import { COSMETIC_LABELS, PART_LABELS, STAFF_DEFS } from "../types";
import { cityByPlate, roadDistance } from "../data/cities";
import { generateListing, randomPersonName } from "./carFactory";
import { dailyCustomers } from "./customers";
import { applyDailyEvents, weeklyExpense } from "./events";
import { canTakeLoan, makeLoan, type LoanOffer } from "./bank";
import { AUCTION_PERIOD, generateAuction } from "./auction";
import { generateRivals, playerRank, updateRivals } from "./rivals";
import { addXp, checkMilestones } from "./career";
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
export const MAX_LISTINGS = 42;

/** Yol masrafı — 5. seviye ayrıcalığıyla %15 iner */
export function travelCostFor(km: number, level: number): number {
  const base = km * TRAVEL_COST_PER_KM * (level >= 5 ? 0.85 : 1);
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
  | { type: "TRAVEL"; plate: number }
  | { type: "EXPERTISE"; listingId: string }
  | { type: "TESTDRIVE_DONE"; listingId: string; foundFaultIds: string[]; crashed: boolean }
  | { type: "SELLER_WALKAWAY"; listingId: string }
  | { type: "BUY"; listingId: string; price: number }
  | { type: "SET_ASKING"; carId: string; price: number }
  | { type: "START_JOB"; carId: string; job: Omit<WorkshopJob, "id" | "carId"> }
  | { type: "CUSTOMER_DEAL"; customerId: string; price: number }
  | { type: "CUSTOMER_GONE"; customerId: string; angry?: boolean }
  | { type: "WHOLESALE"; carId: string }
  | { type: "UPGRADE_SLOTS" }
  | { type: "TAKE_LOAN"; offer: LoanOffer }
  | { type: "PAYOFF_LOAN"; loanId: string }
  | { type: "HIRE_STAFF"; role: StaffRole }
  | { type: "FIRE_STAFF"; staffId: string }
  | { type: "AUCTION_BUY"; carId: string; price: number }
  | { type: "AUCTION_PASS"; carId: string }
  | { type: "END_DAY" };

function freshListings(day: number, count: number): Listing[] {
  const out: Listing[] = [];
  for (let i = 0; i < count; i++) out.push(generateListing(day));
  return out;
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
  base.listings = freshListings(1, 30);
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

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "NEW_GAME":
      return newGameState(action.playerName, action.galleryName, action.homeCity, action.difficulty);

    case "RESET":
      return { ...emptyState };

    case "TRAVEL": {
      if (action.plate === state.currentCity) return state;
      const s = clone(state);
      const km = roadDistance(s.currentCity, action.plate);
      const cost = travelCostFor(km, s.level);
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
      const transport = roundMoney(km * TRANSPORT_COST_PER_KM, 100);
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
        inTransitUntilDay: km > 250 ? s.day + 1 : undefined,
      };
      s.inventory.push(owned);
      s.listings.splice(li, 1);
      s.stats.carsBought++;
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

      s.money += action.price;
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
        text: `💰 ${o.car.year} ${o.car.brand} ${o.car.model}, ${c.name} adlı müşteriye satıldı! Kâr: ${profit.toLocaleString("tr-TR")} ₺`,
        amount: action.price,
        kind: "gelir",
      });

      // İtibar etkisi — dürüst satış itibar kazandırır, gizli arıza nadiren ve ölçülü zarar verir
      if (o.car.hiddenFaults.length > 0 && chance(0.35)) {
        const hit = 2 + o.car.hiddenFaults.length;
        s.reputation = Math.max(0, s.reputation - hit);
        log(s, {
          text: `😠 ${c.name} eve varamadan araç arıza yaptı! Sosyal medyada sizi kötüledi. İtibar -${hit}`,
          kind: "uyari",
        });
      } else if (o.car.knownFaults.length === 0 && o.car.hiddenFaults.length === 0 && profit > 0) {
        s.reputation = Math.min(100, s.reputation + 3);
        log(s, { text: "🌟 Sorunsuz satış! İtibar +3", kind: "info" });
      } else if (profit > 0) {
        // Açıkça bilinen kusurlarına rağmen sorunsuz tamamlanan satış da güven kazandırır
        s.reputation = Math.min(100, s.reputation + 1);
        log(s, { text: "🙂 Memnun müşteri! İtibar +1", kind: "info" });
      }
      addXp(s, 60 + Math.max(0, Math.floor(profit / 10000)));
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

    case "UPGRADE_SLOTS": {
      const s = clone(state);
      const next =
        s.gallerySlots === 4 ? 6 : s.gallerySlots === 6 ? 8 : s.gallerySlots === 8 ? 12 : 0;
      if (!next) return state;
      const cost = s.gallerySlots === 4 ? 300000 : s.gallerySlots === 6 ? 600000 : 1200000;
      if (s.money < cost) return state;
      s.money -= cost;
      s.gallerySlots = next;
      log(s, {
        text: `🏗️ Galeri büyütüldü! Yeni kapasite: ${next} araç.`,
        amount: -cost,
        kind: "gider",
      });
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
      const newCount = Math.min(MAX_LISTINGS - s.listings.length, randInt(7, 12));
      if (newCount > 0) s.listings.push(...freshListings(s.day, newCount));

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
    const parsed = JSON.parse(raw) as GameState;
    if (parsed.version !== SAVE_VERSION || !parsed.started) return null;
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
