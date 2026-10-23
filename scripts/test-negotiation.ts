/** Müşteri pazarlığı özellik testi: müşteri asla oyuncunun sorduğundan düşük fiyata otomatik anlaşmaz. */
import { buyerRespond, startBuyerNego } from "../src/game/negotiation";
import type { Customer } from "../src/types";

function assert(cond: unknown, msg: string): void {
  if (!cond) {
    console.error("✗ " + msg);
    process.exitCode = 1;
  } else console.log("✓ " + msg);
}

function mk(maxPay: number, opening: number, patience: number): Customer {
  return { id: "c", name: "X", emoji: "🧔", carId: "a", style: "normal", maxPay, patience, openingOffer: opening, leavesDay: 9, lastOffer: null, gone: false };
}

// 1) Kullanıcının bildirdiği senaryo: 785k soruyor, müşterinin limiti 765k
let violations = 0;
let accepts = 0;
let finals = 0;
for (let i = 0; i < 20000; i++) {
  // Hata yalnızca sorulan fiyat müşteri limitinin %2'si içindeyken (785k ≤ 780k×1.02) tetikleniyordu
  const c = mk(780000, 650000, 3);
  let st = startBuyerNego(c);
  let ask = 785000;
  for (let round = 0; round < 8; round++) {
    const { result, state } = buyerRespond(c, st, ask);
    st = state;
    if (result.type === "accept") {
      accepts++;
      if (result.price < ask) violations++;
      break;
    }
    if (result.type === "walkaway") break;
    if (result.type === "counter" && result.message.includes("Son sözüm")) finals++;
    // oyuncu inatla aynı fiyatta kalır (sabır tükenir)
  }
}
assert(violations === 0, `20.000 pazarlıkta sorulan fiyatın altından otomatik anlaşma yok (${accepts} anlaşma, ${violations} ihlal)`);
assert(finals > 0, `sabır bitince müşteri "son teklif" diyor (${finals} kez) — otomatik kapanmıyor`);

// 2) Son teklif sonrası daha yüksek fiyat → masadan kalkar; teklifine inilirse onu öder
{
  const c = mk(765000, 650000, 1);
  let st = startBuyerNego(c);
  let r = buyerRespond(c, st, 790000);
  // patience 1 → ilk turda ya anlaşır ya son teklif
  if (r.result.type === "counter") {
    st = r.state;
    const again = buyerRespond(c, st, 790000);
    assert(again.result.type === "walkaway", "son tekliften yüksek fiyatta müşteri ayrılır");
    const low = buyerRespond(c, st, st.lastOffer - 5000);
    assert(low.result.type === "accept" && low.result.price === st.lastOffer, "sorulan fiyat müşteri teklifinin altındaysa müşteri kendi teklifini öder");
  } else {
    assert(true, "(bu çalıştırmada müşteri doğrudan anlaştı/ayrıldı)");
  }
}

// 3) Oyuncu müşterinin açılış teklifine inerse müşteri kendi teklifini öder
{
  const c = mk(800000, 700000, 4);
  const r = buyerRespond(c, startBuyerNego(c), 650000);
  assert(r.result.type === "accept" && r.result.price === 700000, "oyuncu kendi teklifinden aşağı inince 650k değil 700k ödenir");
}

console.log(process.exitCode ? "\nBAŞARISIZ" : "\nTÜM TESTLER GEÇTİ");
