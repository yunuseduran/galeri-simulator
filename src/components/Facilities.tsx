import { useState } from "react";
import {
  FACILITY_DEFS,
  dailyFacilityIncome,
  facilityLevel,
  totalSlots,
  type FacilityKey,
} from "../game/facilities";
import { fmtMoney, useGame } from "../game/state";
import { sfx } from "../game/sound";
import { FacilityScene } from "./FacilityScene";

const BUILT_COLORS: Record<FacilityKey, string> = {
  showroom: "#f5a524",
  atolye: "#5aa9ff",
  yikama: "#3ecf8e",
  parca: "#c792ea",
  kafeterya: "#ffd166",
  pompa: "#ff8c5c",
  otopark: "#8b99b8",
};

export function Facilities() {
  const { state, dispatch } = useGame();
  const [selected, setSelected] = useState<FacilityKey>("showroom");

  const income = dailyFacilityIncome(state);
  const sel = FACILITY_DEFS.find((f) => f.key === selected)!;
  const selLvl = facilityLevel(state, selected);
  const nextLvl = selLvl < sel.levels.length ? sel.levels[selLvl] : null;

  return (
    <div>
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="row between">
          <div>
            <h3 style={{ margin: 0 }}>🏗️ {state.galleryName} Tesisi</h3>
            <div className="sub" style={{ marginBottom: 0 }}>
              Her dükkanı ayrı ayrı inşa et, yükselt; kimi gelir getirir, kimi işini kolaylaştırır.
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>GÜNLÜK DÜKKAN GELİRİ</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: "var(--green)" }}>
              {income > 0 ? "+" : ""}
              {fmtMoney(income)}
            </div>
          </div>
        </div>
      </div>

      {/* Canlı tesis sahnesi */}
      <div className="card" style={{ marginBottom: 14, padding: 8 }}>
        <FacilityScene selected={selected} onSelect={setSelected} />
        <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 6, textAlign: "center" }}>
          Sahne canlıdır: trafik akar, pompaya müşteri yanaşır, yıkamada köpükler uçuşur, atölyede
          iş varsa kıvılcım çıkar. Bir binaya tıklayıp yönetin.
        </div>
      </div>

      {/* Seçili dükkan detayı */}
      <div className="card" style={{ borderColor: selLvl > 0 ? BUILT_COLORS[selected] : undefined }}>
        <div className="row between" style={{ alignItems: "flex-start" }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <h3 style={{ margin: 0 }}>
              {sel.emoji} {sel.name}{" "}
              {selLvl > 0 && <span className="tag green">Seviye {selLvl}</span>}
              {selLvl === 0 && <span className="tag">Henüz yok</span>}
            </h3>
            <div className="sub">{sel.desc}</div>
            {selLvl > 0 && (
              <div style={{ fontSize: 13.5, color: "var(--green)" }}>
                ✓ Aktif: {sel.levels[selLvl - 1].effect}
                {sel.levels[selLvl - 1].income > 0 &&
                  ` (+${fmtMoney(sel.levels[selLvl - 1].income)}/gün)`}
              </div>
            )}
          </div>
          <div style={{ textAlign: "right" }}>
            {nextLvl ? (
              <>
                <div style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: 4 }}>
                  {selLvl === 0 ? "İnşaat bedeli" : `Seviye ${selLvl + 1} bedeli`}
                </div>
                <div className="price" style={{ marginBottom: 6 }}>
                  {fmtMoney(nextLvl.cost)}
                </div>
                <button
                  className="primary"
                  disabled={state.money < nextLvl.cost}
                  onClick={() => {
                    sfx.wrench();
                    dispatch({ type: "BUILD_FACILITY", facility: selected });
                  }}
                >
                  {selLvl === 0 ? "🏗️ İnşa Et" : "⬆️ Yükselt"}
                </button>
              </>
            ) : (
              <span className="tag green">🏅 Maksimum seviyede</span>
            )}
          </div>
        </div>

        {/* Seviye tablosu */}
        <table className="city-table" style={{ marginTop: 12 }}>
          <thead>
            <tr>
              <th>Seviye</th>
              <th>Maliyet</th>
              <th>Günlük Gelir</th>
              <th>Etki</th>
            </tr>
          </thead>
          <tbody>
            {sel.levels.map((l, i) => (
              <tr key={i} style={i < selLvl ? { color: "var(--green)" } : i === selLvl ? {} : { opacity: 0.55 }}>
                <td>
                  {i < selLvl ? "✅" : i === selLvl ? "👉" : "🔒"} Sv.{i + 1}
                </td>
                <td>{l.cost === 0 ? "Başlangıç" : fmtMoney(l.cost)}</td>
                <td>{l.income > 0 ? `+${fmtMoney(l.income)}` : "—"}</td>
                <td>{l.effect}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 12 }}>
        💡 Toplam kapasiteniz: <strong>{totalSlots(state)} araç</strong> (Vitrin + Ek Otopark).
        Dükkan gelirleri her gün sonunda otomatik kasaya girer. "Tesis Kralı" başarımı toplam
        seviyeye göre ödül verir.
      </p>
    </div>
  );
}
