import { useState } from "react";
import { useGame } from "./game/state";
import { currentUser } from "./game/auth";
import type { FacilityKey } from "./game/facilities";
import { Login } from "./components/Login";
import { NewGame } from "./components/NewGame";
import { TopBar } from "./components/TopBar";
import { Hub3D, type PanelKey } from "./components/Hub3D";
import { Showroom } from "./components/Showroom";
import { Market } from "./components/Market";
import { Workshop } from "./components/Workshop";
import { Customers } from "./components/Customers";
import { Facilities } from "./components/Facilities";
import { Office } from "./components/Office";
import { League } from "./components/League";
import { Career } from "./components/Career";
import { Ledger } from "./components/Ledger";
import { FxLayer } from "./components/Fx";
import { playerRank } from "./game/rivals";
import { sfx } from "./game/sound";

const PANEL_TITLES: Record<PanelKey, string> = {
  galeri: "🏢 Galerim",
  pazar: "🛒 İlan Pazarı",
  tesis: "🏗️ Tesis Yönetimi",
  atolye: "🔧 Atölye",
  musteri: "🧑‍🤝‍🧑 Müşteriler",
  ofis: "🏦 Ofis",
  lig: "🏆 Lig",
  kariyer: "🎖️ Kariyer",
  defter: "📜 Defter",
};

export default function App() {
  const { state } = useGame();
  const [panel, setPanel] = useState<PanelKey | null>(null);
  const [facilitySel, setFacilitySel] = useState<FacilityKey>("showroom");
  const user = currentUser();

  if (!user) {
    return (
      <div className="app">
        <Login onAuthed={() => window.location.reload()} />
      </div>
    );
  }

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

  function openPanel(p: PanelKey, facility?: FacilityKey) {
    if (facility) setFacilitySel(facility);
    setPanel(p);
  }

  const dock: { key: PanelKey; emoji: string; label: string; badge?: string; badgeBg?: string }[] = [
    {
      key: "galeri",
      emoji: "🏢",
      label: "Galerim",
      badge: state.inventory.length > 0 ? String(state.inventory.length) : undefined,
      badgeBg: "var(--blue)",
    },
    { key: "pazar", emoji: "🛒", label: "İlanlar" },
    { key: "tesis", emoji: "🏗️", label: "Tesis" },
    {
      key: "atolye",
      emoji: "🔧",
      label: "Atölye",
      badge: jobCount > 0 ? String(jobCount) : undefined,
      badgeBg: "var(--accent)",
    },
    {
      key: "musteri",
      emoji: "🧑‍🤝‍🧑",
      label: "Müşteri",
      badge: customerCount > 0 ? String(customerCount) : undefined,
      badgeBg: "var(--red)",
    },
    {
      key: "ofis",
      emoji: "🏦",
      label: "Ofis",
      badge: state.loans.length > 0 ? String(state.loans.length) : undefined,
      badgeBg: "var(--accent)",
    },
    { key: "lig", emoji: "🏆", label: "Lig", badge: `#${rank}`, badgeBg: rank === 1 ? "#b8860b" : "var(--blue)" },
    { key: "kariyer", emoji: "🎖️", label: "Kariyer", badge: `Lv${state.level}`, badgeBg: "var(--green)" },
    { key: "defter", emoji: "📜", label: "Defter" },
  ];

  return (
    <div className="app game-app">
      <TopBar />

      {/* 3D oyun dünyası */}
      <div className="hub-wrap">
        <Hub3D onOpen={openPanel} />
        <div className="hub-hint">
          🖱️ Sürükle: kamerayı döndür · Tekerlek/iki parmak: yakınlaş · Binalara tıkla: yönet
        </div>
      </div>

      {/* Oyun HUD'u */}
      <div className="hud-dock">
        {dock.map((d) => (
          <button
            key={d.key}
            className={"hud-btn" + (panel === d.key ? " active" : "")}
            onClick={() => {
              sfx.click();
              setPanel(panel === d.key ? null : d.key);
            }}
          >
            <span className="hud-emoji">{d.emoji}</span>
            <span className="hud-label">{d.label}</span>
            {d.badge && (
              <span className="badge" style={{ background: d.badgeBg }}>
                {d.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Panel: 3D dünyanın üzerine kayar */}
      {panel && (
        <div className="panel-overlay" onMouseDown={(e) => e.target === e.currentTarget && setPanel(null)}>
          <div className="panel-sheet">
            <div className="panel-head">
              <strong>{PANEL_TITLES[panel]}</strong>
              <button className="small" onClick={() => setPanel(null)}>
                ✖ Kapat
              </button>
            </div>
            <div className="panel-body">
              {panel === "galeri" && <Showroom />}
              {panel === "tesis" && <Facilities key={facilitySel} initialSelected={facilitySel} />}
              {panel === "pazar" && <Market />}
              {panel === "atolye" && <Workshop />}
              {panel === "musteri" && <Customers />}
              {panel === "ofis" && <Office />}
              {panel === "lig" && <League />}
              {panel === "kariyer" && <Career />}
              {panel === "defter" && <Ledger />}
            </div>
          </div>
        </div>
      )}

      <FxLayer />
    </div>
  );
}
