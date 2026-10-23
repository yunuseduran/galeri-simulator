/**
 * Senet / avukat / kiralama / ilan stoğu testleri. Çalıştırma: npm run test:legal
 */
import { applyAction, newGameState, MIN_PER_CITY, senetPlan } from "../src/game/state";
import { CITIES } from "../src/data/cities";
import { generateListing } from "../src/game/carFactory";
import type { Customer, GameState, OwnedCar } from "../src/types";

function assert(cond: unknown, msg: string): void {
  if (!cond) {
    console.error("✗ " + msg);
    process.exitCode = 1;
  } else console.log("✓ " + msg);
}

// ---- İlan stoğu: her ilde en az 5 ----
const s0 = newGameState("T", "Test", 34, "normal");
const counts = new Map<number, number>();
for (const l of s0.listings) counts.set(l.cityPlate, (counts.get(l.cityPlate) ?? 0) + 1);
assert(CITIES.every((c) => (counts.get(c.plate) ?? 0) >= MIN_PER_CITY), `yeni oyunda 81 ilin hepsinde ≥${MIN_PER_CITY} ilan (toplam ${s0.listings.length})`);

let sd = s0;
for (let i = 0; i < 8; i++) sd = applyAction(sd, { type: "END_DAY" });
const c2 = new Map<number, number>();
for (const l of sd.listings) c2.set(l.cityPlate, (c2.get(l.cityPlate) ?? 0) + 1);
assert(CITIES.every((c) => (c2.get(c.plate) ?? 0) >= MIN_PER_CITY), "8 gün sonra da her ilde ≥5 ilan");

// ---- Senetli satış ----
function withCar(base: GameState, legal?: OwnedCar["legal"]): { s: GameState; cust: Customer } {
  const s = JSON.parse(JSON.stringify(base)) as GameState;
  const car = generateListing(s.day, 34).car;
  car.hiddenFaults = [];
  s.inventory = [{ car, boughtPrice: 500000, boughtDay: 1, totalSpent: 500000, askingPrice: 700000, legal, legalDeadline: legal ? s.day + 3 : undefined }];
  const cust: Customer = { id: "c1", name: "Ali Veli", emoji: "🧔", carId: car.id, style: "acele", maxPay: 800000, patience: 4, openingOffer: 600000, leavesDay: s.day + 3, lastOffer: null, gone: false };
  s.customers = [cust];
  return { s, cust };
}

{
  const { s, cust } = withCar(s0);
  const plan = senetPlan(700000, 8);
  const s1 = applyAction(s, { type: "CUSTOMER_DEAL", customerId: cust.id, price: 700000, senet: { count: 8 } });
  assert(s1.notes.length === 1, "senet oluştu");
  const saleLog = s1.log.find((e) => e.text.includes("satıldı"));
  assert(saleLog?.amount === plan.down, `satış kaydına sadece peşinat girdi (${saleLog?.amount} = ${plan.down})`);
  assert(s1.notes[0].total > 700000 - plan.down, "senet toplamı vade farkı içeriyor");
  assert(s1.inventory.length === 0, "araç satıldı");

  // Riski sıfırla: taksit düzenli ödensin
  const n0 = s1.notes[0];
  n0.risk = 0;
  let st = s1;
  const startMoney = st.money;
  for (let i = 0; i < 7 * 8 + 2; i++) st = applyAction(st, { type: "END_DAY" });
  const note = st.notes.find((n) => n.id === n0.id);
  assert(note?.status === "tamam", "riski sıfır senet 8 haftada tamamen ödendi");
  assert(note?.remaining === 0 && (note?.paidCount ?? 0) >= 8, "8 taksitin hepsi tahsil edildi (kalan 0)");
  void startMoney;

  // Riski %100'e yakın: gecikme + zarar
  const s2 = JSON.parse(JSON.stringify(s1)) as GameState;
  s2.notes[0].risk = 1;
  let bad = s2;
  // Rastgele %10 ödeme şansı seriyi bozabilir; batığa dönene kadar (en çok 400 gün) ilerle
  for (let i = 0; i < 400 && bad.notes[0]?.status !== "zarar"; i++) bad = applyAction(bad, { type: "END_DAY" });
  assert(bad.notes[0]?.status === "zarar", "temerrütteki senet 3 gecikmeden sonra batık işaretlendi");

  // İhtar / icra
  const s3 = JSON.parse(JSON.stringify(s1)) as GameState;
  s3.notes[0].status = "gecikmis";
  s3.notes[0].missed = 1;
  s3.money = 1_000_000;
  const sued = applyAction(s3, { type: "SENET_SUE", noteId: s3.notes[0].id });
  assert(sued.notes[0].status === "tamam" || sued.notes[0].status === "zarar", "icra takibi sonuçlandı (tamam/zarar)");
  assert(sued.money < s3.money + s3.notes[0].remaining, "avukatlık ücreti düşüldü");
}

// ---- Avukat / hukuki sorun ----
{
  const { s } = withCar(s0, "haciz");
  s.money = 2_000_000;
  const settled = applyAction(s, { type: "LEGAL_SETTLE", carId: s.inventory[0].car.id });
  assert(settled.inventory[0].legal === undefined, "uzlaşma haczi kaldırdı");
  assert(settled.money < s.money, "uzlaşma bedeli ödendi");

  const lawyerState = JSON.parse(JSON.stringify(s)) as GameState;
  lawyerState.staff.push({ id: "a", name: "Av", role: "avukat", weeklySalary: 35000, hiredDay: 1 });
  const normalCost = s.money - applyAction(s, { type: "LEGAL_SUE", carId: s.inventory[0].car.id }).money;
  const lawCost = lawyerState.money - applyAction(lawyerState, { type: "LEGAL_SUE", carId: lawyerState.inventory[0].car.id }).money;
  assert(lawCost === normalCost / 2, `kadrolu avukat dava ücretini yarıya indirdi (${normalCost} → ${lawCost})`);

  // Süre dolunca icra
  let st = s;
  for (let i = 0; i < 4; i++) st = applyAction(st, { type: "END_DAY" });
  assert(st.inventory.length === 0, "çözülmeyen hacizli araç 3 günde icradan alındı");
  assert(st.log.some((e) => e.text.includes("İCRA")), "İCRA kaydı düştü");

  // Toptancı hukuki sorunlu aracı almaz
  assert(applyAction(s, { type: "WHOLESALE", carId: s.inventory[0].car.id }) === s, "toptancı hacizli aracı almıyor");

  // Hacizli aracı müşteriye satınca dava
  const { s: sl, cust } = withCar(s0, "rehin");
  const sold = applyAction(sl, { type: "CUSTOMER_DEAL", customerId: cust.id, price: 700000 });
  assert(sold.log.some((e) => e.text.includes("dava açtı")), "hukuki sorunlu araç satılınca alıcı dava açtı");
  assert(sold.money < sl.money + 700000, "tazminat ödendi");
}

// ---- Hukuki sorgu ----
{
  const s = JSON.parse(JSON.stringify(s0)) as GameState;
  const l = s.listings[0];
  l.legal = "haciz";
  l.legalChecked = false;
  const r = applyAction(s, { type: "LEGAL_CHECK", listingId: l.id });
  assert(r.listings[0].legalChecked === true, "hukuki sorgu işaretlendi");
  assert(r.log[0].text.includes("haciz") || r.log[0].text.includes("Haciz") || r.log[0].text.includes("Hukuki sorgu"), "sorgu sonucu deftere yazıldı");
}

// ---- Kiralama ----
{
  const { s } = withCar(s0);
  const carId = s.inventory[0].car.id;
  const r = applyAction(s, { type: "START_RENT", carId, days: 10 });
  assert(!!r.inventory[0].rental, "araç kiraya verildi");
  assert(r.customers.length === 0, "kiradaki araca bakan müşteriler gitti");
  assert(applyAction(r, { type: "WHOLESALE", carId }) === r, "kiradaki araç toptancıya satılamaz");
  let st = r;
  let rentEntries = 0;
  for (let i = 0; i < 11; i++) {
    st = applyAction(st, { type: "END_DAY" });
    if (st.log.some((e) => e.day === st.day && e.text.includes("kira geliri") && e.amount === r.inventory[0].rental!.dailyRate)) rentEntries++;
  }
  assert(rentEntries >= 10, `günlük kira geliri her gün tahsil edildi (${rentEntries} gün)`);
  assert(!st.inventory[0].rental, "kira bitince araç döndü");
}

console.log(process.exitCode ? "\nBAŞARISIZ" : "\nTÜM TESTLER GEÇTİ");
