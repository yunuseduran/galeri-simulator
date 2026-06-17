import type { Car, Listing, PartKey, SellerMood } from "../types";
import { PART_KEYS } from "../types";
import { MODELS, COLORS } from "../data/cars";
import { CITIES } from "../data/cities";
import { FIRST_NAMES, LAST_NAMES, GALLERY_SUFFIXES } from "../data/names";
import { makeFault } from "./faults";
import { carValue, expectedKm } from "./valuation";
import { chance, pick, pickWeighted, rand, randInt, roundMoney, uid } from "./rng";

export function randomPersonName(): string {
  return `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
}

export function generateCar(): Car {
  const def = pickWeighted(MODELS, (m) => m.weight);
  const year = randInt(def.minYear, Math.min(def.maxYear, 2026));
  const exp = expectedKm(year);
  const km = Math.max(1000, Math.min(465000, Math.round(exp * rand(0.5, 1.7))));

  // Genel yıpranma seviyesi araca karakter verir
  const wearBase = rand(45, 98);
  const parts = {} as Record<PartKey, number>;
  for (const k of PART_KEYS) {
    parts[k] = Math.round(Math.min(100, Math.max(15, wearBase + rand(-18, 12))));
  }

  const paintedPanels = chance(0.55) ? randInt(1, 5) : 0;
  const changedPanels = chance(0.25) ? randInt(1, 3) : 0;
  const tramer =
    paintedPanels + changedPanels > 0 && chance(0.7)
      ? roundMoney(def.basePrice * rand(0.005, 0.06), 500)
      : 0;

  const car: Car = {
    id: uid("car"),
    brand: def.brand,
    model: def.model,
    segment: def.segment,
    year,
    km,
    color: pick(COLORS),
    fuel: pick(def.fuels),
    gear: def.segment === "klasik" ? "manuel" : chance(0.5) ? "otomatik" : "manuel",
    basePrice: def.basePrice,
    parts,
    paintedPanels,
    changedPanels,
    tramer,
    hiddenFaults: [],
    knownFaults: [],
    cosmetics: {
      seatCover: false,
      rims: chance(0.15),
      multimedia: chance(0.2),
      tint: chance(0.25),
      ceramic: false,
    },
    cleanliness: randInt(35, 90),
  };

  // Gizli arızalar: yıpranmış araçlarda daha olası
  const faultChance = wearBase < 60 ? 0.75 : wearBase < 75 ? 0.45 : 0.2;
  if (chance(faultChance)) {
    car.hiddenFaults.push(makeFault(def.basePrice));
    if (chance(0.35)) car.hiddenFaults.push(makeFault(def.basePrice));
  }
  // Aynı arızadan iki tane olmasın
  car.hiddenFaults = car.hiddenFaults.filter(
    (f, i, arr) => arr.findIndex((g) => g.label === f.label) === i
  );

  return car;
}

export function generateListing(day: number, preferCity?: number): Listing {
  const car = generateCar();
  const value = carValue(car);
  const sellerType = chance(0.7) ? "sahibinden" : "galeriden";
  const mood: SellerMood = chance(0.2) ? "acil" : chance(0.65) ? "normal" : "sabirli";

  // İsteme fiyatı: gerçek değere göre. Gizli arızayı satıcı da bilmiyor olabilir,
  // bu yüzden "algılanan" değer üzerinden fiyatlanır -> fırsat ve tuzaklar doğar.
  const perceived = carValue({ ...car, hiddenFaults: [] });
  let askMult: number;
  if (mood === "acil") askMult = rand(0.82, 0.95);
  else if (mood === "sabirli") askMult = rand(1.05, 1.25);
  else askMult = rand(0.95, 1.12);
  if (sellerType === "galeriden") askMult += 0.05;

  const askingPrice = roundMoney(perceived * askMult, 5000);
  const minMult = mood === "acil" ? rand(0.85, 0.92) : mood === "sabirli" ? rand(0.93, 0.97) : rand(0.88, 0.95);
  const minPrice = roundMoney(askingPrice * minMult, 1000);

  const sellerName =
    sellerType === "galeriden"
      ? `${pick(LAST_NAMES)} ${pick(GALLERY_SUFFIXES)}`
      : randomPersonName();

  return {
    id: uid("lst"),
    car,
    cityPlate: preferCity ?? pick(CITIES).plate,
    sellerName,
    sellerType,
    sellerMood: mood,
    askingPrice,
    minPrice,
    honest: chance(0.75),
    expiresDay: day + randInt(2, 6),
    expertised: false,
    testDriven: false,
    negotiationDead: false,
  };
}
