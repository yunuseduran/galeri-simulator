import type { Customer, CustomerStyle, GameState, OwnedCar } from "../types";
import { CUSTOMER_EMOJIS } from "../data/names";
import { randomPersonName } from "./carFactory";
import { perceivedValue } from "./valuation";
import { chance, pick, rand, randInt, roundMoney, uid } from "./rng";

export function generateCustomer(state: GameState, owned: OwnedCar): Customer {
  const styles: CustomerStyle[] = ["normal", "normal", "siki", "siki", "acele", "titiz"];
  const style = pick(styles);

  const pv = perceivedValue(owned.car, state.marketModifiers, state.day);
  const repBonus = (state.reputation - 50) / 100; // -0.5 .. +0.5
  const hasDanisman = state.staff.some((st) => st.role === "danisman");

  let maxMult: number;
  switch (style) {
    case "acele":
      maxMult = rand(1.0, 1.12);
      break;
    case "siki":
      maxMult = rand(0.82, 0.95);
      break;
    case "titiz":
      maxMult = rand(0.92, 1.05);
      break;
    default:
      maxMult = rand(0.9, 1.03);
  }
  maxMult += repBonus * 0.1;
  if (hasDanisman) maxMult += 0.04; // danışman müşteriyi tatlı dille ikna eder
  if (state.level >= 8) maxMult += 0.03; // kariyer ayrıcalığı: ikna kabiliyeti

  const maxPay = roundMoney(pv * maxMult, 1000);
  const openingOffer = roundMoney(maxPay * rand(0.78, 0.9), 1000);

  return {
    id: uid("cus"),
    name: randomPersonName(),
    emoji: pick(CUSTOMER_EMOJIS),
    carId: owned.car.id,
    style,
    maxPay,
    patience: style === "acele" ? 3 : style === "siki" ? 5 : 4,
    openingOffer,
    leavesDay: state.day + (style === "acele" ? 1 : randInt(1, 3)),
    lastOffer: null,
    gone: false,
  };
}

/** Gün başında galeriye gelecek müşterileri üretir */
export function dailyCustomers(state: GameState): Customer[] {
  const sellable = state.inventory.filter(
    (o) => !o.inTransitUntilDay || o.inTransitUntilDay <= state.day
  );
  if (sellable.length === 0) return [];

  const diffMult =
    state.difficulty === "kolay" ? 1.3 : state.difficulty === "zor" ? 0.7 : 1;
  const repMult = 0.5 + state.reputation / 60;
  const staffMult = state.staff.some((st) => st.role === "danisman") ? 1.4 : 1;
  const fameMult = state.level >= 12 ? 1.25 : 1; // kariyer ayrıcalığı: ünlü galeri
  const base = Math.min(4, sellable.length) * 0.8 * diffMult * repMult * staffMult * fameMult;

  const out: Customer[] = [];
  let n = Math.floor(base);
  if (chance(base - n)) n++;
  n = Math.min(5, n);
  for (let i = 0; i < n; i++) {
    out.push(generateCustomer(state, pick(sellable)));
  }
  return out;
}
