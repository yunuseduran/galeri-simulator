/**
 * "Kendin sürerek getirme" satın alma yolunun reducer testi.
 * Çalıştırma: npm run test:buy-sur
 */
import { applyAction, newGameState } from "../src/game/state";
import { generateListing } from "../src/game/carFactory";
import { roadDistance } from "../src/data/cities";
import { makeFault } from "../src/game/faults";

function assert(cond: unknown, msg: string): void {
  if (!cond) {
    console.error("✗ " + msg);
    process.exitCode = 1;
  } else {
    console.log("✓ " + msg);
  }
}

// İstanbul merkezli galeri, Çanakkale'de ilan
const s0 = newGameState("Test", "Test Motors", 34, "normal");
s0.currentCity = 17;
const listing = generateListing(s0.day, 17);
listing.car.hiddenFaults = [makeFault(listing.car.basePrice, "motor"), makeFault(listing.car.basePrice, "fren")];
const fault0 = listing.car.hiddenFaults[0];
s0.listings = [listing];
const km = roadDistance(17, 34);
const price = 400000;

const flagLog = (s: ReturnType<typeof applyAction>) => s.log.find((e) => e.text.startsWith("🏁"));

// 1) Sorunsuz sürüş
const s1 = applyAction(s0, { type: "BUY", listingId: listing.id, price, deliver: "sur", drive: { crashed: false, brokeDown: false, foundFaultIds: [] } });
assert(s1 !== s0, "aksiyon state'i değiştirdi");
assert(s1.inventory.length === 1, "araç envantere girdi");
assert(s1.currentCity === 34, "oyuncu eve (İstanbul) döndü");
// Not: ilk alım "Koleksiyoncu I" başarımıyla +20.000 ₺ ödül getirir; nakliye kesilmediğini
// toplam giderin fiyatı aşmamasıyla doğruluyoruz.
assert(s0.money - s1.money <= price, `nakliye kesilmedi (gider ${s0.money - s1.money} ≤ fiyat ${price})`);
assert(s1.inventory[0].totalSpent === price, "aracın maliyeti sadece alış fiyatı");
assert(s1.inventory[0].car.km === listing.car.km + km, `araca ${km} km yazıldı`);
assert(s1.inventory[0].inTransitUntilDay === undefined, "araç hemen galeride (nakliyede değil)");
assert(s1.stats.kmTraveled === s0.stats.kmTraveled + km, "kmTraveled istatistiği arttı");
assert(!!flagLog(s1) && flagLog(s1)!.day === s1.day, "bugünkü 🏁 defter kaydı var (sinema atlanır)");
assert(s1.xp > s0.xp || s1.level > s0.level, "XP kazanıldı");

// 2) Yolda kalma + kaza + yolda fark edilen arıza
const s2 = applyAction(s0, { type: "BUY", listingId: listing.id, price, deliver: "sur", drive: { crashed: true, brokeDown: true, foundFaultIds: [fault0.id] } });
const car2 = s2.inventory[0].car;
const tow = Math.max(3000, km * 12);
const extra = s2.inventory[0].totalSpent - price;
assert(extra >= tow + 5000, `çekici (~${tow}) ve kaza hasarı aracın maliyetine yazıldı (ek gider ${extra} ₺)`);
assert(car2.knownFaults.some((f) => f.id === fault0.id), "yolda fark edilen arıza bilinen arızaya dönüştü");
assert(car2.hiddenFaults.length === 0, "yolda kalınca kalan gizli arıza da ortaya çıktı");
assert(car2.paintedPanels === listing.car.paintedPanels + 1, "kaza boyalı parça ekledi");
const l2 = flagLog(s2);
assert(!!l2 && l2.text.includes("çekici") && l2.text.includes("Kaza"), "🏁 defter kaydı çekici ve kaza notunu içeriyor");
assert(s2.inventory[0].totalSpent > price, "ek giderler aracın toplam maliyetine yazıldı");

// 3) Nakliye yolu hâlâ eskisi gibi
const s3 = applyAction(s0, { type: "BUY", listingId: listing.id, price, deliver: "nakliye" });
assert(s3.currentCity === 17, "nakliyede oyuncu Çanakkale'de kaldı");
assert(s3.inventory[0].totalSpent > price, "nakliye ücreti aracın maliyetine eklendi");
assert(s0.money - s3.money > s0.money - s1.money, "nakliye yolu, kendin sürmekten daha pahalı");
assert(s3.inventory[0].inTransitUntilDay === s0.day + 1, "uzak ilden nakliye yarın gelir");
assert(!flagLog(s3), "nakliyede 🏁 kaydı yok (sinema oynar)");

console.log(process.exitCode ? "\nBAŞARISIZ" : "\nTÜM TESTLER GEÇTİ");
