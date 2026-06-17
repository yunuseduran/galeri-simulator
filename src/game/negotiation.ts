import type { Listing, Customer } from "../types";
import { chance, rand, roundMoney } from "./rng";

export type NegoResult =
  | { type: "accept"; price: number; message: string }
  | { type: "counter"; price: number; message: string }
  | { type: "reject"; message: string }
  | { type: "walkaway"; message: string };

// ---- SATICI ile pazarlık (araç alırken) ----

export interface SellerNegoState {
  round: number;
  lastCounter: number; // satıcının son söylediği fiyat
  patience: number;
}

export function startSellerNego(listing: Listing): SellerNegoState {
  const patience =
    listing.sellerMood === "sabirli" ? 5 : listing.sellerMood === "acil" ? 4 : 4;
  return { round: 0, lastCounter: listing.askingPrice, patience };
}

export function sellerRespond(
  listing: Listing,
  state: SellerNegoState,
  offer: number
): { result: NegoResult; state: SellerNegoState } {
  const s = { ...state, round: state.round + 1 };
  const min = listing.minPrice;

  if (offer >= s.lastCounter) {
    return {
      result: { type: "accept", price: Math.min(offer, s.lastCounter), message: "Anlaştık, hayırlı olsun!" },
      state: s,
    };
  }

  // Çok düşük teklif satıcıyı kızdırır
  if (offer < min * 0.78) {
    s.patience -= 2;
    if (s.patience <= 0) {
      return {
        result: { type: "walkaway", message: "Bu fiyata araba değil bisiklet alırsın. Ben bu işte yokum!" },
        state: s,
      };
    }
    return {
      result: { type: "reject", message: "Ciddi olun lütfen, bu fiyat olmaz. Düzgün bir teklif bekliyorum." },
      state: s,
    };
  }

  if (offer >= min) {
    // Kabul edebilir ama biraz daha sıkıştırmayı dener
    const acceptChance =
      0.35 + (offer - min) / Math.max(1, listing.askingPrice - min);
    if (chance(Math.min(0.95, acceptChance))) {
      return {
        result: { type: "accept", price: offer, message: "Eh, hadi senin için olsun. Hayırlı olsun!" },
        state: s,
      };
    }
  }

  s.patience -= 1;
  if (s.patience <= 0) {
    if (offer >= min) {
      return {
        result: { type: "accept", price: offer, message: "Tamam, daha fazla uzatmayalım. Anlaştık." },
        state: s,
      };
    }
    return {
      result: { type: "walkaway", message: "Anlaşamayacağız, kolay gelsin." },
      state: s,
    };
  }

  // Karşı teklif: son fiyatı ile teklifin arasında bir yerde, minPrice altına inmez
  const target = Math.max(min, offer + (s.lastCounter - offer) * rand(0.35, 0.6));
  const counter = roundMoney(Math.min(s.lastCounter - 1000, target), 1000);
  s.lastCounter = counter;
  const messages = [
    "O fiyata olmaz ama şöyle yapalım:",
    "Araç temiz, kıyamam ama hadi:",
    "Son fiyat şu olsun:",
    "Biraz daha açın, şöyle anlaşalım:",
  ];
  return {
    result: {
      type: "counter",
      price: counter,
      message: messages[Math.min(messages.length - 1, s.round - 1)] ?? "Şöyle olsun:",
    },
    state: s,
  };
}

// ---- MÜŞTERİ ile pazarlık (araç satarken) ----

export interface BuyerNegoState {
  round: number;
  lastOffer: number; // müşterinin son teklifi
  patience: number;
}

export function startBuyerNego(customer: Customer): BuyerNegoState {
  return { round: 0, lastOffer: customer.openingOffer, patience: customer.patience };
}

/** Oyuncu fiyat söyler (counterPrice), müşteri cevap verir */
export function buyerRespond(
  customer: Customer,
  state: BuyerNegoState,
  counterPrice: number
): { result: NegoResult; state: BuyerNegoState } {
  const s = { ...state, round: state.round + 1 };
  const max = customer.maxPay;

  if (counterPrice <= s.lastOffer) {
    return {
      result: { type: "accept", price: counterPrice, message: "Anlaştık! Hemen kaparoyu vereyim." },
      state: s,
    };
  }

  if (counterPrice > max * 1.3) {
    s.patience -= 2;
    if (s.patience <= 0) {
      return { result: { type: "walkaway", message: "Bu fiyat çok uçuk, iyi günler..." }, state: s };
    }
    return {
      result: { type: "reject", message: "Yok yok, bu rakamlar bizi aşar. İndirim yoksa ben gideyim." },
      state: s,
    };
  }

  if (counterPrice <= max) {
    const acceptChance = 0.3 + (max - counterPrice) / Math.max(1, max * 0.15);
    if (chance(Math.min(0.95, acceptChance))) {
      return {
        result: { type: "accept", price: counterPrice, message: "Tamamdır, el sıkışalım!" },
        state: s,
      };
    }
  }

  s.patience -= 1;
  if (s.patience <= 0) {
    if (counterPrice <= max * 1.02) {
      return {
        result: { type: "accept", price: Math.min(counterPrice, max), message: "Hadi tamam, anlaştık." },
        state: s,
      };
    }
    return { result: { type: "walkaway", message: "Ben biraz daha bakınacağım, kolay gelsin." }, state: s };
  }

  // Müşteri teklifini yükseltir ama maxPay'i geçmez
  const target = Math.min(max, s.lastOffer + (counterPrice - s.lastOffer) * rand(0.3, 0.55));
  const newOffer = roundMoney(Math.max(s.lastOffer + 1000, target), 1000);
  s.lastOffer = Math.min(newOffer, max);
  const messages = [
    "Biraz daha inerseniz şöyle veririm:",
    "Eşimle konuştum, en fazla şu olur:",
    "Son teklifim bu:",
    "Hadi ortada buluşalım:",
  ];
  return {
    result: {
      type: "counter",
      price: s.lastOffer,
      message: messages[Math.min(messages.length - 1, s.round - 1)] ?? "Teklifim:",
    },
    state: s,
  };
}
