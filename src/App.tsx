import { useRef, useState } from "react";
import { useGame } from "./game/state";
import { currentUser } from "./game/auth";
import type { FacilityKey } from "./game/facilities";
import { Login } from "./components/Login";
import { NewGame } from "./components/NewGame";
import { TopBar } from "./components/TopBar";
import { Hub3D, type FlyTarget, type Hub3DHandle, type PanelKey } from "./components/Hub3D";
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

/** Panel açılınca kameranın uçacağı yer */
function flyTargetFor(panel: PanelKey, facility?: FacilityKey): FlyTarget {
  if (facility) return facility;
  switch (panel) {
    case "galeri":
      return "showroom";
    case "atolye":
      return "atolye";
    case "tesis":
      return "showroom";
    case "pazar":
      return "pazar";
    case "lig":
      return "lig";
    case "ofis":
      return "ofis";
    case "musteri":
      return "musteri";
    default:
      return "overview";
  }
}

export default function App() {
  const { state } = useGame();
  const [panel, setPanel] = useState<PanelKey | null>(null);
  const [facilitySel, setFacilitySel] = useState<FacilityKey>("showroom");
  const [flying, setFlying] = useState(false);
  const hubRef = useRef<Hub3DHandle>(null);
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

  /** Önce kamera oraya uçar, sonra ekran açılır (mobil oyun geçişi) */
  function openPanel(p: PanelKey, facility?: FacilityKey) {
    if (facility) setFacilitySel(facility);
    hubRef.current?.flyTo(flyTargetFor(p, facility));
    setFlying(true);
    setPanel(null);
    window.setTimeout(() => {
      setPanel(p);
      setFlying(false);
    }, 520);
  }

  function closePanel() {
    setPanel(null);
    hubRef.current?.flyTo("overview");
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
    <div className="game-root">
      {/* 3D dünya tam ekran */}
      <div className="hub-full">
        <Hub3D ref={hubRef} onOpen={openPanel} />
      </div>

      {/* Üst HUD: kasa, gün, itibar... sahnenin içinde */}
      <div className="hud-top">
        <TopBar />
      </div>

      {/* Alt HUD: oyun tuşları sahnenin içinde */}
      <div className="hud-dock hud-dock--overlay">
        {dock.map((d) => (
          <button
            key={d.key}
            className={"hud-btn" + (panel === d.key ? " active" : "")}
            onClick={() => {
              sfx.click();
              if (panel === d.key) closePanel();
              else openPanel(d.key);
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

      {!panel && !flying && (
        <div className="hub-hint hub-hint--top">
          🖱️ Sürükle: döndür · Tekerlek/iki parmak: yakınlaş · Binalara ve müşterilere dokun
        </div>
      )}

      {flying && <div className="fly-veil" />}

      {/* Ekran: kamera vardığı yerde, sahnenin üstünde mobil oyun ekranı gibi açılır */}
      {panel && (
        <div className="screen-overlay" onMouseDown={(e) => e.target === e.currentTarget && closePanel()}>
          <div className="screen-card">
            <div className="panel-head">
              <strong>{PANEL_TITLES[panel]}</strong>
              <button className="small" onClick={closePanel}>
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
