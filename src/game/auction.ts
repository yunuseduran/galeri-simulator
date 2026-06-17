import type { Auction, Car } from "../types";
import { CITIES } from "../data/cities";
import { generateCar, randomPersonName } from "./carFactory";
import { perceivedValue } from "./valuation";
import { pick, rand, randInt, roundMoney } from "./rng";

export const AUCTION_PERIOD = 5; // her 5 günde bir mezat

export function generateAuction(day: number): Auction {
  const count = randInt(3, 5);
  const cars: Car[] = [];
  const startPrices: number[] = [];
  for (let i = 0; i < count; i++) {
    const car = generateCar();
    // Mezat araçları biraz daha yıpranmış olur (bankadan/hacizden gelir)
    car.cleanliness = Math.max(15, car.cleanliness - 20);
    cars.push(car);
    startPrices.push(roundMoney(perceivedValue(car) * rand(0.45, 0.58), 5000));
  }
  return {
    day,
    cityPlate: pick(CITIES).plate,
    cars,
    startPrices,
    resolved: [],
  };
}

export interface AiBidder {
  name: string;
  /** En fazla çıkacağı tutar (gizli) */
  max: number;
}

/** Her araç için 2-4 rakip galerici üretir */
export function makeBidders(car: Car): AiBidder[] {
  const pv = perceivedValue(car);
  const n = randInt(2, 4);
  const out: AiBidder[] = [];
  for (let i = 0; i < n; i++) {
    out.push({
      name: randomPersonName(),
      max: roundMoney(pv * rand(0.62, 0.98), 1000),
    });
  }
  return out;
}

/** Mevcut fiyatın üstüne çıkmak isteyen rakip var mı? Varsa yeni teklifi döner. */
export function aiResponse(bidders: AiBidder[], current: number): { name: string; bid: number } | null {
  const inc = current < 200000 ? 5000 : current < 1000000 ? 10000 : 25000;
  const willing = bidders.filter((b) => b.max >= current + inc);
  if (willing.length === 0) return null;
  const b = pick(willing);
  // Bazen agresif artırır
  const bid = Math.min(b.max, current + inc * (Math.random() < 0.25 ? 2 : 1));
  return { name: b.name, bid: roundMoney(bid, 1000) };
}
