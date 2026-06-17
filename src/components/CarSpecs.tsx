import type { Car } from "../types";
import { COSMETIC_LABELS, FUEL_LABELS, PART_KEYS, PART_LABELS, SEGMENT_LABELS } from "../types";
import { fmtMoney } from "../game/state";
import { PartBar } from "./ui";

/**
 * Araç teknik detayları.
 * fullInfo=false ise (ekspertizsiz ilan) parça durumu ve gerçek tramer gizlenir,
 * satıcı beyanı gösterilir.
 */
export function CarSpecs({
  car,
  fullInfo,
  declaredHonest,
}: {
  car: Car;
  fullInfo: boolean;
  declaredHonest?: boolean;
}) {
  const declaredTramer = fullInfo ? car.tramer : declaredHonest ? car.tramer : 0;
  const cosmetics = (Object.keys(COSMETIC_LABELS) as (keyof typeof COSMETIC_LABELS)[]).filter(
    (k) => car.cosmetics[k]
  );

  return (
    <div>
      <div className="row" style={{ marginBottom: 8 }}>
        <span className="tag blue">{SEGMENT_LABELS[car.segment]}</span>
        <span className="tag">{car.year}</span>
        <span className="tag">{car.km.toLocaleString("tr-TR")} km</span>
        <span className="tag">{FUEL_LABELS[car.fuel]}</span>
        <span className="tag">{car.gear === "otomatik" ? "Otomatik" : "Manuel"}</span>
        <span className="tag">{car.color}</span>
      </div>

      <div className="row" style={{ marginBottom: 8 }}>
        {declaredTramer > 0 ? (
          <span className="tag red">Tramer: {fmtMoney(declaredTramer)}</span>
        ) : (
          <span className="tag green">Tramer: {fullInfo ? (car.tramer > 0 ? fmtMoney(car.tramer) : "Yok") : "Yok (beyan)"}</span>
        )}
        {car.paintedPanels > 0 && <span className="tag yellow">{car.paintedPanels} parça boyalı</span>}
        {car.changedPanels > 0 && <span className="tag red">{car.changedPanels} parça değişen</span>}
        {car.paintedPanels === 0 && car.changedPanels === 0 && (
          <span className="tag green">Boyasız değişensiz</span>
        )}
        <span className="tag">Temizlik: %{car.cleanliness}</span>
      </div>

      {cosmetics.length > 0 && (
        <div className="row" style={{ marginBottom: 8 }}>
          {cosmetics.map((k) => (
            <span key={k} className="tag blue">
              ✨ {COSMETIC_LABELS[k]}
            </span>
          ))}
        </div>
      )}

      <div style={{ margin: "10px 0" }}>
        {PART_KEYS.map((k) => (
          <PartBar key={k} name={PART_LABELS[k]} value={car.parts[k]} unknown={!fullInfo} />
        ))}
        {!fullInfo && (
          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
            Parça durumları için ekspertiz yaptırın.
          </div>
        )}
      </div>

      {car.knownFaults.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <strong style={{ color: "var(--red)", fontSize: 13.5 }}>Bilinen arızalar:</strong>
          {car.knownFaults.map((f) => (
            <div key={f.id} style={{ fontSize: 13, color: "var(--red)", marginTop: 3 }}>
              ⚠️ {f.label} <span style={{ color: "var(--muted)" }}>(tamir ~{fmtMoney(f.repairCost)})</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
