import type { ExchangeState, ExportOffer, GameState, Segment } from "../types";
import { SEGMENT_LABELS } from "../types";
import { chance, pick, rand, randInt, uid } from "./rng";

export type AssetKind = "hisse" | "kripto" | "doviz";

export interface AssetDef {
  key: string;
  name: string;
  emoji: string;
  kind: AssetKind;
  start: number;
  /** Günlük oynaklık (standart sapma) */
  vol: number;
  /** Günlük ortalama eğilim */
  drift: number;
  /** İşlem komisyonu */
  fee: number;
  desc: string;
}

// Kurgusal varlıklar (gerçek şirket/coin isimleri kullanılmaz)
export const ASSETS: AssetDef[] = [
  { key: "ANAH", name: "Anadolu Holding", emoji: "🏛️", kind: "hisse", start: 85, vol: 0.022, drift: 0.0006, fee: 0.004, desc: "Sağlam, yavaş büyüyen holding." },
  { key: "OTOS", name: "Oto Sanayi A.Ş.", emoji: "🚗", kind: "hisse", start: 140, vol: 0.028, drift: 0.0005, fee: 0.004, desc: "Otomotiv piyasasıyla birlikte hareket eder." },
  { key: "ENRJ", name: "Enerji A.Ş.", emoji: "⚡", kind: "hisse", start: 52, vol: 0.034, drift: 0.0004, fee: 0.004, desc: "Oynak ama yüksek getirili enerji hissesi." },
  { key: "BANK", name: "Bankacılık A.Ş.", emoji: "🏦", kind: "hisse", start: 33, vol: 0.026, drift: 0.0005, fee: 0.004, desc: "Faiz haberlerinden etkilenir." },
  { key: "BTK", name: "Bitkoin", emoji: "₿", kind: "kripto", start: 3200000, vol: 0.065, drift: 0.0008, fee: 0.01, desc: "Kripto kralı: büyük kazanç, büyük düşüş." },
  { key: "ETR", name: "Etheri", emoji: "💠", kind: "kripto", start: 140000, vol: 0.075, drift: 0.0007, fee: 0.01, desc: "Bitkoin'den de oynak." },
  { key: "DGK", name: "DogeKurt", emoji: "🐺", kind: "kripto", start: 12.5, vol: 0.13, drift: 0, fee: 0.01, desc: "Meme coin: ya 3 katı ya sıfır." },
  { key: "USD", name: "Dolar", emoji: "💵", kind: "doviz", start: 41, vol: 0.007, drift: 0.0012, fee: 0.002, desc: "Lira değer kaybettikçe yavaşça artar." },
  { key: "EUR", name: "Euro", emoji: "💶", kind: "doviz", start: 47, vol: 0.008, drift: 0.0012, fee: 0.002, desc: "Dolara yakın seyreder." },
];

export function assetDef(key: string): AssetDef {
  const a = ASSETS.find((x) => x.key === key);
  if (!a) throw new Error("Bilinmeyen varlık: " + key);
  return a;
}

export function initialExchange(): ExchangeState {
  const prices: Record<string, number> = {};
  const history: Record<string, number[]> = {};
  for (const a of ASSETS) {
    prices[a.key] = a.start;
    history[a.key] = [a.start];
  }
  return { prices, history, holdings: {} };
}

/** Eksik varlıkları tamamlar (eski kayıtlar için) */
export function ensureExchange(ex: ExchangeState | undefined): ExchangeState {
  const e = ex ?? initialExchange();
  for (const a of ASSETS) {
    if (e.prices[a.key] === undefined) {
      e.prices[a.key] = a.start;
      e.history[a.key] = [a.start];
    }
  }
  return e;
}

function gauss(): number {
  // Box-Muller
  const u = 1 - Math.random();
  const v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function round(n: number, key: string): number {
  return key === "DGK" || n < 100 ? Math.round(n * 100) / 100 : Math.round(n);
}

/** Bir günlük fiyat hareketi. Haber olarak yazılacak büyük hareketleri döner. */
export function stepExchange(ex: ExchangeState): string[] {
  const news: string[] = [];
  for (const a of ASSETS) {
    const prev = ex.prices[a.key];
    let change = a.drift + a.vol * gauss();
    // Nadir şok
    if (chance(a.kind === "kripto" ? 0.06 : 0.025)) change += (chance(0.5) ? 1 : -1) * a.vol * rand(2, 3.5);
    change = Math.max(-0.45, Math.min(0.6, change));
    // Başlangıç fiyatına çekim: aşırı sapmayı yumuşatır
    const ratio = prev / a.start;
    if (ratio > 5) change -= 0.01;
    if (ratio < 0.15) change += 0.01;
    const next = Math.max(a.start * 0.02, round(prev * (1 + change), a.key));
    ex.prices[a.key] = next;
    const h = ex.history[a.key] ?? [];
    h.push(next);
    if (h.length > 30) h.shift();
    ex.history[a.key] = h;
    if (Math.abs(change) >= (a.kind === "kripto" ? 0.14 : 0.07)) {
      news.push(
        change > 0
          ? `📈 ${a.emoji} ${a.name} fırladı: %${Math.round(change * 100)} yükseldi!`
          : `📉 ${a.emoji} ${a.name} çöktü: %${Math.round(-change * 100)} düştü!`
      );
    }
  }
  return news;
}

/** Portföyün güncel değeri */
export function portfolioValue(s: GameState): number {
  let v = 0;
  for (const [k, h] of Object.entries(s.exchange.holdings)) v += h.qty * (s.exchange.prices[k] ?? 0);
  return v;
}

// ---- İhracat ----

const COUNTRIES: { name: string; flag: string; segments: Segment[] }[] = [
  { name: "Almanya", flag: "🇩🇪", segments: ["orta", "ust", "suv"] },
  { name: "Bulgaristan", flag: "🇧🇬", segments: ["ekonomi", "orta", "ticari"] },
  { name: "Irak", flag: "🇮🇶", segments: ["suv", "ust", "orta"] },
  { name: "Azerbaycan", flag: "🇦🇿", segments: ["orta", "suv", "ekonomi"] },
  { name: "Gürcistan", flag: "🇬🇪", segments: ["ekonomi", "orta", "suv"] },
  { name: "Romanya", flag: "🇷🇴", segments: ["ekonomi", "ticari", "orta"] },
  { name: "Katar", flag: "🇶🇦", segments: ["ust", "suv"] },
  { name: "Libya", flag: "🇱🇾", segments: ["klasik", "ticari", "ekonomi"] },
];

export function makeExportOffer(day: number): ExportOffer {
  const c = pick(COUNTRIES);
  const segment = pick(c.segments);
  return {
    id: uid("exp"),
    country: c.name,
    flag: c.flag,
    segment,
    minYear: segment === "klasik" ? 1990 : randInt(2008, 2020),
    maxKm: pick([120000, 160000, 200000, 250000]),
    premium: Math.round(rand(1.1, 1.3) * 100) / 100,
    expiresDay: day + randInt(3, 8),
  };
}

/** İhracat talepleri: süresi dolanları temizle, en az 4 talep tut */
export function refreshExportOffers(s: GameState): void {
  s.exports = s.exports.filter((o) => o.expiresDay > s.day);
  while (s.exports.length < 4) s.exports.push(makeExportOffer(s.day));
}

export const EXPORT_COMMISSION = 0.03;
export const EXPORT_INSPECTION_FEE = 6000;

export function offerLabel(o: ExportOffer): string {
  return `${o.flag} ${o.country} — ${SEGMENT_LABELS[o.segment]}, ${o.minYear}+ model, ≤${(o.maxKm / 1000).toFixed(0)}.000 km, +%${Math.round((o.premium - 1) * 100)} prim`;
}
