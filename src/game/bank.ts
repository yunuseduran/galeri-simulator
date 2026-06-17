import type { GameState, Loan } from "../types";
import { roundMoney, uid } from "./rng";

export interface LoanOffer {
  key: string;
  name: string;
  principal: number;
  interestPct: number; // toplam faiz yüzdesi
  termDays: number;
  minReputation: number;
}

export const LOAN_OFFERS: LoanOffer[] = [
  {
    key: "esnaf",
    name: "Esnaf Kredisi",
    principal: 250000,
    interestPct: 8,
    termDays: 20,
    minReputation: 0,
  },
  {
    key: "isletme",
    name: "İşletme Kredisi",
    principal: 750000,
    interestPct: 12,
    termDays: 30,
    minReputation: 40,
  },
  {
    key: "yatirim",
    name: "Büyük Yatırım Kredisi",
    principal: 2000000,
    interestPct: 16,
    termDays: 40,
    minReputation: 65,
  },
];

export const MAX_ACTIVE_LOANS = 2;

export function makeLoan(offer: LoanOffer): Loan {
  const totalDebt = roundMoney(offer.principal * (1 + offer.interestPct / 100));
  return {
    id: uid("loan"),
    name: offer.name,
    principal: offer.principal,
    totalDebt,
    remaining: totalDebt,
    dailyPayment: roundMoney(totalDebt / offer.termDays, 100),
    takenDay: 0, // reducer doldurur
  };
}

export function canTakeLoan(state: GameState, offer: LoanOffer): string | null {
  if (state.loans.length >= MAX_ACTIVE_LOANS) return "En fazla 2 aktif krediniz olabilir.";
  if (state.reputation < offer.minReputation)
    return `Banka bu kredi için en az ${offer.minReputation} itibar istiyor.`;
  if (state.loans.some((l) => l.name === offer.name)) return "Bu krediden zaten aktif bir tane var.";
  return null;
}
