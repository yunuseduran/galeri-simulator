import { useState } from "react";
import { useGame } from "./game/state";
import { NewGame } from "./components/NewGame";
import { TopBar } from "./components/TopBar";
import { Showroom } from "./components/Showroom";
import { Market } from "./components/Market";
import { Workshop } from "./components/Workshop";
import { Customers } from "./components/Customers";
import { Office } from "./components/Office";
import { League } from "./components/League";
import { Career } from "./components/Career";
import { Ledger } from "./components/Ledger";
import { FxLayer } from "./components/Fx";
import { playerRank } from "./game/rivals";

type Tab = "galeri" | "pazar" | "atolye" | "musteri" | "ofis" | "lig" | "kariyer" | "defter";

export default function App() {
  const { state } = useGame();
  const [tab, setTab] = useState<Tab>("galeri");

  if (!state.started) {
    return (
      <div className="app">
        <NewGame />
      </div>
    );
  }

  const jobCount = state.jobs.length;
  const customerCount = state.customers.length;
  const rank = playerRank(state);

  return (
    <div className="app">
      <TopBar />
      <div className="tabs">
        <button className={tab === "galeri" ? "active" : ""} onClick={() => setTab("galeri")}>
          🏢 Galerim
          {state.inventory.length > 0 && <span className="badge" style={{ background: "var(--blue)" }}>{state.inventory.length}</span>}
        </button>
        <button className={tab === "pazar" ? "active" : ""} onClick={() => setTab("pazar")}>
          🛒 İlanlar
        </button>
        <button className={tab === "atolye" ? "active" : ""} onClick={() => setTab("atolye")}>
          🔧 Atölye
          {jobCount > 0 && <span className="badge" style={{ background: "var(--accent)" }}>{jobCount}</span>}
        </button>
        <button className={tab === "musteri" ? "active" : ""} onClick={() => setTab("musteri")}>
          🧑‍🤝‍🧑 Müşteriler
          {customerCount > 0 && <span className="badge">{customerCount}</span>}
        </button>
        <button className={tab === "ofis" ? "active" : ""} onClick={() => setTab("ofis")}>
          🏦 Ofis
          {state.loans.length > 0 && (
            <span className="badge" style={{ background: "var(--accent)" }}>{state.loans.length}</span>
          )}
        </button>
        <button className={tab === "lig" ? "active" : ""} onClick={() => setTab("lig")}>
          🏆 Lig
          <span
            className="badge"
            style={{ background: rank === 1 ? "#b8860b" : "var(--blue)" }}
          >
            #{rank}
          </span>
        </button>
        <button className={tab === "kariyer" ? "active" : ""} onClick={() => setTab("kariyer")}>
          🎖️ Kariyer
          <span className="badge" style={{ background: "var(--green)" }}>Lv {state.level}</span>
        </button>
        <button className={tab === "defter" ? "active" : ""} onClick={() => setTab("defter")}>
          📜 Defter
        </button>
      </div>

      {tab === "galeri" && <Showroom />}
      {tab === "pazar" && <Market />}
      {tab === "atolye" && <Workshop />}
      {tab === "musteri" && <Customers />}
      {tab === "ofis" && <Office />}
      {tab === "lig" && <League />}
      {tab === "kariyer" && <Career />}
      {tab === "defter" && <Ledger />}
      <FxLayer />
    </div>
  );
}
