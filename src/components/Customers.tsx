import { useState } from "react";
import type { Customer } from "../types";
import { CUSTOMER_STYLE_LABELS } from "../types";
import { fmtMoney, useGame } from "../game/state";
import {
  buyerRespond,
  startBuyerNego,
  type BuyerNegoState,
  type NegoResult,
} from "../game/negotiation";
import { Modal } from "./ui";
import { chance } from "../game/rng";
import { sfx } from "../game/sound";

export function Customers() {
  const { state } = useGame();
  // Müşteri nesnesini sakla: satış sonrası listeden silinse bile modal açık kalsın
  const [nego, setNego] = useState<Customer | null>(null);

  return (
    <div>
      {state.customers.length === 0 && (
        <div className="empty">
          Şu an galeride müşteri yok. Günü bitirince yeni müşteriler gelir — vitrininiz ne kadar
          dolu ve itibarınız ne kadar yüksekse o kadar çok kişi uğrar.
        </div>
      )}
      <div className="grid">
        {state.customers.map((c) => (
          <CustomerCard key={c.id} customer={c} onNego={() => setNego(c)} />
        ))}
      </div>
      {nego && <NegoModal customer={nego} onClose={() => setNego(null)} />}
    </div>
  );
}

function CustomerCard({ customer, onNego }: { customer: Customer; onNego: () => void }) {
  const { state, dispatch } = useGame();
  const o = state.inventory.find((x) => x.car.id === customer.carId);
  if (!o) return null;
  const inTransit = o.inTransitUntilDay && o.inTransitUntilDay > state.day;

  return (
    <div className="card">
      <h3>
        {customer.emoji} {customer.name}
      </h3>
      <div className="sub">
        {CUSTOMER_STYLE_LABELS[customer.style]} ·{" "}
        {customer.leavesDay - state.day <= 1 ? "Bugün karar verecek" : "Birkaç gün bekleyebilir"}
      </div>
      <div style={{ fontSize: 13.5, marginBottom: 8 }}>
        İlgilendiği araç:{" "}
        <strong>
          {o.car.year} {o.car.brand} {o.car.model}
        </strong>
        <br />
        Açılış teklifi: <strong style={{ color: "var(--accent2)" }}>{fmtMoney(customer.openingOffer)}</strong>
        <span style={{ color: "var(--muted)" }}> (etiket: {fmtMoney(o.askingPrice)})</span>
      </div>
      <div className="row">
        <button className="primary" onClick={onNego} disabled={!!inTransit}>
          💬 Pazarlık Et
        </button>
        <button
          className="small danger"
          onClick={() => dispatch({ type: "CUSTOMER_GONE", customerId: customer.id })}
        >
          Gönder
        </button>
      </div>
      {inTransit && (
        <div style={{ fontSize: 12.5, color: "var(--accent2)", marginTop: 6 }}>
          🚚 Araç henüz nakliyede — yarın gelince satabilirsiniz.
        </div>
      )}
    </div>
  );
}

type Bubble = { who: "me" | "them"; text: string };

function NegoModal({ customer, onClose }: { customer: Customer; onClose: () => void }) {
  const { state, dispatch } = useGame();
  // Satış sonrası araç envanterden silinse de modal açık kalsın diye ilk hali saklanır
  const [snapshot] = useState(() =>
    state.inventory.find((x) => x.car.id === customer.carId) ?? null
  );
  const o = state.inventory.find((x) => x.car.id === customer.carId) ?? snapshot;

  const [nego, setNego] = useState<BuyerNegoState>(() => startBuyerNego(customer));
  const [chat, setChat] = useState<Bubble[]>(() => {
    const msgs: Bubble[] = [
      {
        who: "them",
        text: `Merhaba! ${o ? `${o.car.year} ${o.car.brand} ${o.car.model}` : "Araç"} ilgimi çekti. ${
          customer.style === "siki"
            ? "Ama açık konuşayım, piyasayı iyi bilirim."
            : customer.style === "acele"
              ? "Bugün araç alıp çıkmak istiyorum."
              : customer.style === "titiz"
                ? "Aracın geçmişini didik didik incelerim, haberiniz olsun."
                : "Fiyatta anlaşırsak alıcıyım."
        } Teklifim: ${fmtMoney(customer.openingOffer)}`,
      },
    ];
    return msgs;
  });
  const [price, setPrice] = useState(o?.askingPrice ?? 0);
  const [done, setDone] = useState<null | "sold" | "left" | "angry">(null);

  if (!o) return null;
  const car = o.car;

  // Titiz müşteri gizli arızayı yakalayabilir
  function checkTitiz(): boolean {
    if (customer.style !== "titiz" || car.hiddenFaults.length === 0) return false;
    if (chance(0.7)) {
      setChat((c) => [
        ...c,
        {
          who: "them",
          text: `Bir dakika... Kendi ustama baktırdım, bu araçta "${car.hiddenFaults[0].label}" sorunu var! Bunu söylemediniz. Ben böyle yere güvenmem, iyi günler!`,
        },
      ]);
      sfx.error();
      setDone("angry");
      return true;
    }
    return false;
  }

  function counter() {
    if (done) return;
    sfx.click();
    const p = Math.max(0, Math.round(price));
    setChat((c) => [...c, { who: "me", text: `${fmtMoney(p)} olursa anlaşırız.` }]);
    if (checkTitiz()) return;
    const { result, state: ns } = buyerRespond(customer, nego, p);
    setNego(ns);
    handle(result, p);
  }

  function handle(r: NegoResult, asked: number) {
    if (r.type === "accept") {
      sfx.cash();
      setChat((c) => [...c, { who: "them", text: `${r.message} (${fmtMoney(r.price)})` }]);
      setDone("sold");
      dispatch({ type: "CUSTOMER_DEAL", customerId: customer.id, price: r.price });
    } else if (r.type === "counter") {
      setChat((c) => [...c, { who: "them", text: `${r.message} ${fmtMoney(r.price)}` }]);
      setPrice(Math.round(((asked + r.price) / 2 / 1000)) * 1000);
    } else if (r.type === "reject") {
      setChat((c) => [...c, { who: "them", text: r.message }]);
    } else {
      sfx.error();
      setChat((c) => [...c, { who: "them", text: r.message }]);
      setDone("left");
      dispatch({ type: "CUSTOMER_GONE", customerId: customer.id });
    }
  }

  function acceptOffer() {
    if (done) return;
    if (checkTitiz()) return;
    sfx.cash();
    setChat((c) => [...c, { who: "me", text: `Tamam, ${fmtMoney(nego.lastOffer)} olsun, hayırlı olsun!` }]);
    setDone("sold");
    dispatch({ type: "CUSTOMER_DEAL", customerId: customer.id, price: nego.lastOffer });
  }

  return (
    <Modal
      title={`${customer.emoji} ${customer.name} ile pazarlık`}
      onClose={() => {
        if (done === "angry") {
          dispatch({ type: "CUSTOMER_GONE", customerId: customer.id, angry: true });
        }
        onClose();
      }}
    >
      <div className="sub" style={{ color: "var(--muted)" }}>
        {CUSTOMER_STYLE_LABELS[customer.style]} · Araç: {car.year} {car.brand} {car.model} · Maliyetiniz:{" "}
        {fmtMoney(o.totalSpent)}
      </div>

      <div className="chat">
        {chat.map((b, i) => (
          <div key={i} className={`bubble ${b.who}`}>
            {b.text}
          </div>
        ))}
      </div>

      {!done && (
        <>
          <div className="row">
            <input
              type="number"
              step={1000}
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              style={{ width: 150 }}
            />
            <button className="primary" onClick={counter}>
              Fiyat Söyle
            </button>
            <button className="success" onClick={acceptOffer}>
              {fmtMoney(nego.lastOffer)} teklifini kabul et
            </button>
          </div>
          {car.hiddenFaults.length > 0 && (
            <div style={{ fontSize: 12.5, color: "var(--accent2)", marginTop: 8 }}>
              🤫 Bu araçta sizin de yeni öğrendiğiniz gizli sorun(lar) olabilir... Satarsanız müşteri
              fark edebilir ve itibarınız zedelenir.
            </div>
          )}
        </>
      )}

      {done === "sold" && (
        <div className="card" style={{ borderColor: "var(--green)", color: "var(--green)", marginTop: 8 }}>
          🎉 Satış tamamlandı! Hayırlı olsun.
        </div>
      )}
      {done === "left" && (
        <div className="card" style={{ borderColor: "var(--red)", marginTop: 8 }}>
          Müşteri anlaşamadan ayrıldı.
        </div>
      )}
      {done === "angry" && (
        <div className="card" style={{ borderColor: "var(--red)", color: "var(--red)", marginTop: 8 }}>
          😠 Müşteri gizli arızayı fark etti ve öfkeyle ayrıldı!
        </div>
      )}

      <div className="close-row">
        <button
          onClick={() => {
            if (done === "angry") {
              dispatch({ type: "CUSTOMER_GONE", customerId: customer.id, angry: true });
            }
            onClose();
          }}
        >
          Kapat
        </button>
      </div>
    </Modal>
  );
}
