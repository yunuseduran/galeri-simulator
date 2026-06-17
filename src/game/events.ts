import type { GameState, LogEntry, MarketModifier, Segment } from "../types";
import { SEGMENT_LABELS, PART_KEYS } from "../types";
import { makeFault } from "./faults";
import { chance, pick, rand, randInt, roundMoney } from "./rng";

/** Gün sonunda rastgele olayları uygular. State'i yerinde değiştirir (taze kopya üzerinde çağrılır). */
export function applyDailyEvents(s: GameState): void {
  const log = (e: Omit<LogEntry, "day">) => s.log.unshift({ day: s.day, ...e });

  // 1) Piyasa dalgalanması
  if (chance(0.18) && s.marketModifiers.length < 2) {
    const segments: Segment[] = ["ekonomi", "orta", "ust", "suv", "ticari", "klasik"];
    const seg = pick(segments);
    const up = chance(0.5);
    const factor = up ? rand(1.06, 1.15) : rand(0.86, 0.94);
    const days = randInt(2, 4);
    const mod: MarketModifier = {
      segment: seg,
      factor: Math.round(factor * 100) / 100,
      untilDay: s.day + days,
      label: up
        ? `${SEGMENT_LABELS[seg]} segmentine talep arttı (%${Math.round((factor - 1) * 100)} değer artışı, ${days} gün)`
        : `${SEGMENT_LABELS[seg]} segmentinde durgunluk (%${Math.round((1 - factor) * 100)} değer kaybı, ${days} gün)`,
    };
    s.marketModifiers.push(mod);
    log({ text: `📈 Piyasa: ${mod.label}`, kind: "olay" });
  }

  // 2) Envanterdeki bir araçta arıza çıkması / gizli arızanın ortaya çıkması
  const inGarage = s.inventory.filter(
    (o) => !o.inTransitUntilDay || o.inTransitUntilDay <= s.day
  );
  if (inGarage.length > 0 && chance(0.22)) {
    const o = pick(inGarage);
    const car = o.car;
    if (car.hiddenFaults.length > 0 && chance(0.6)) {
      // Gizli arıza kendini belli etti
      const f = car.hiddenFaults[0];
      car.hiddenFaults = car.hiddenFaults.slice(1);
      car.knownFaults = [...car.knownFaults, f];
      log({
        text: `🔧 ${car.brand} ${car.model} arıza verdi: ${f.label}. (Tamir: ~${f.repairCost.toLocaleString("tr-TR")} ₺)`,
        kind: "uyari",
      });
    } else if (chance(0.5)) {
      // Yeni bir arıza oluştu
      const f = makeFault(car.basePrice);
      if (!car.knownFaults.some((k) => k.label === f.label)) {
        car.knownFaults = [...car.knownFaults, f];
        const part = pick(PART_KEYS);
        car.parts[part] = Math.max(10, car.parts[part] - randInt(10, 25));
        log({
          text: `⚠️ ${car.brand} ${car.model} bozuldu: ${f.label}. Müşteriye böyle satmak zor olur.`,
          kind: "uyari",
        });
      }
    }
  }

  // 3) Araçlar bekledikçe tozlanır (detaycı varsa tam tersi: her gün parlatır)
  const hasDetayci = s.staff.some((st) => st.role === "detayci");
  for (const o of s.inventory) {
    if (hasDetayci) {
      o.car.cleanliness = Math.min(100, o.car.cleanliness + 5);
    } else {
      o.car.cleanliness = Math.max(10, o.car.cleanliness - randInt(1, 4));
    }
  }

  // 4) Küçük renkli olaylar
  if (chance(0.08)) {
    const small = [
      "Komşu galerici çay içmeye geldi, piyasa dedikodusu yaptınız.",
      "Belediye yolu kazıyor, galerinin önü toz içinde kaldı.",
      "Yerel gazete galerinizden 'güvenilir esnaf' diye bahsetti.",
      "Mahallenin çocukları vitrindeki arabaların fotoğrafını çekti.",
    ];
    log({ text: `☕ ${pick(small)}`, kind: "info" });
  }

  // 5) İtibar bonusu olayı
  if (chance(0.05) && s.reputation < 95) {
    s.reputation = Math.min(100, s.reputation + 2);
    log({ text: "🌟 Memnun bir müşteriniz sizi arkadaşlarına önerdi. İtibar +2", kind: "olay" });
  }

  // Süresi geçen piyasa etkilerini temizle
  s.marketModifiers = s.marketModifiers.filter((m) => m.untilDay >= s.day);
}

/** Haftalık sabit giderler (kira + stopaj) — 20. seviye ayrıcalığıyla %15 düşer */
export function weeklyExpense(s: GameState): number {
  const base = s.difficulty === "kolay" ? 25000 : s.difficulty === "zor" ? 60000 : 40000;
  const taxPerk = s.level >= 20 ? 0.85 : 1;
  return roundMoney((base + s.gallerySlots * 5000) * taxPerk);
}
