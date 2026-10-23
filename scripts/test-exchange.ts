/** Borsa / kripto / ihracat testleri. Çalıştırma: npm run test:exchange */
import { applyAction, newGameState } from "../src/game/state";
import { ASSETS, EXPORT_COMMISSION, EXPORT_INSPECTION_FEE, portfolioValue } from "../src/game/exchange";
import { generateListing } from "../src/game/carFactory";
import { carValue } from "../src/game/valuation";
import { makeFault } from "../src/game/faults";
import type { GameState } from "../src/types";

function assert(cond: unknown, msg: string): void {
  if (!cond) {
    console.error("✗ " + msg);
    process.exitCode = 1;
  } else console.log("✓ " + msg);
}

const s0 = newGameState("T", "Test", 34, "normal");
assert(Object.keys(s0.exchange.prices).length === ASSETS.length, `${ASSETS.length} varlığın fiyatı var`);
assert(s0.exports.length >= 4, "başlangıçta ≥4 ihracat talebi");

// Al / sat
const bought = applyAction(s0, { type: "EX_BUY", key: "ANAH", amount: 100000 });
assert(bought.money === s0.money - 100000, "alım kasadan düştü");
const h = bought.exchange.holdings.ANAH;
assert(h && h.qty > 0 && h.cost === 100000, "pozisyon açıldı");
assert(h.qty * bought.exchange.prices.ANAH < 100000, "komisyon düşüldü");
assert(portfolioValue(bought) > 0, "portföy değeri hesaplanıyor");

const rich = JSON.parse(JSON.stringify(bought)) as GameState;
rich.exchange.prices.ANAH *= 1.5;
const sold = applyAction(rich, { type: "EX_SELL", key: "ANAH", fraction: 1 });
assert(!sold.exchange.holdings.ANAH, "tamamı satılınca pozisyon silindi");
assert(sold.money > bought.money + 100000, "fiyat %50 artınca kârla satıldı");
assert(sold.stats.totalProfit > 0, "gerçekleşen kâr istatistiğe yazıldı");
assert(applyAction(s0, { type: "EX_BUY", key: "BTK", amount: s0.money + 1 }) === s0, "yetersiz bakiyeyle alım reddedildi");

// Fiyat hareketi: 200 gün, hepsi pozitif ve sınırlı
let st = s0;
for (let i = 0; i < 200; i++) st = applyAction(st, { type: "END_DAY" });
assert(ASSETS.every((a) => st.exchange.prices[a.key] > 0), "200 gün sonra tüm fiyatlar pozitif");
assert(ASSETS.every((a) => st.exchange.history[a.key].length <= 30), "geçmiş 30 günle sınırlı");
assert(ASSETS.some((a) => st.exchange.prices[a.key] !== a.start), "fiyatlar hareket etti");
assert(st.exports.length >= 4, "ihracat talepleri sürekli yenileniyor");

// İhracat
function exportCase(withHidden: boolean) {
  const s = JSON.parse(JSON.stringify(s0)) as GameState;
  const car = generateListing(s.day, 34).car;
  car.hiddenFaults = withHidden ? [makeFault(car.basePrice)] : [];
  car.knownFaults = [];
  car.year = 2018;
  car.km = 90000;
  s.inventory = [{ car, boughtPrice: 400000, boughtDay: 1, totalSpent: 400000, askingPrice: 600000 }];
  s.exports = [{ id: "e1", country: "Almanya", flag: "🇩🇪", segment: car.segment, minYear: 2010, maxKm: 200000, premium: 1.2, expiresDay: s.day + 5 }];
  return s;
}
{
  const s = exportCase(false);
  const value = carValue(s.inventory[0].car);
  const r = applyAction(s, { type: "EXPORT_SELL", offerId: "e1", carId: s.inventory[0].car.id });
  const entry = r.log.find((e) => e.text.includes("ihraç edildi"));
  const expected = Math.round(Math.round((value * 1.2) / 1000) * 1000 * (1 - EXPORT_COMMISSION));
  assert(r.inventory.length === 0, "araç ihraç edildi");
  assert(entry?.amount === expected, `net tutar prim ve komisyonla hesaplandı (${entry?.amount} = ${expected})`);
  assert(entry!.amount! > value, "ihracat piyasa değerinin üstünde ödedi");
  assert(r.exports.length === 0, "kullanılan talep kapandı");
}
{
  const s = exportCase(true);
  const r = applyAction(s, { type: "EXPORT_SELL", offerId: "e1", carId: s.inventory[0].car.id });
  assert(r.inventory.length === 1, "gizli arızalı araç ihracatta reddedildi (araç kaldı)");
  assert(r.inventory[0].totalSpent === 400000 + EXPORT_INSPECTION_FEE, "ekspertiz ücreti maliyete yazıldı");
  assert(r.inventory[0].car.knownFaults.length === 1, "bulunan arıza artık bilinen arıza");
}
{
  const s = exportCase(false);
  s.inventory[0].car.year = 2005;
  assert(applyAction(s, { type: "EXPORT_SELL", offerId: "e1", carId: s.inventory[0].car.id }) === s, "şartı sağlamayan araç ihraç edilemez");
}

console.log(process.exitCode ? "\nBAŞARISIZ" : "\nTÜM TESTLER GEÇTİ");
