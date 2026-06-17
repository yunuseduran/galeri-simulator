import { COSMETIC_LABELS, PART_KEYS, PART_LABELS, STAFF_DEFS, type Cosmetics } from "../types";
import {
  applyUsta,
  cleanJob,
  cosmeticJob,
  faultJobFor,
  fmtMoney,
  repairJobFor,
  useGame,
} from "../game/state";
import { PartBar } from "./ui";
import { sfx } from "../game/sound";

export function Workshop() {
  const { state, dispatch } = useGame();
  const cars = state.inventory.filter((o) => !o.inTransitUntilDay || o.inTransitUntilDay <= state.day);
  const hasUsta = state.staff.some((st) => st.role === "usta");
  const lvl = state.level;

  return (
    <div>
      {lvl >= 10 && (
        <div className="card" style={{ marginBottom: 12, borderColor: "var(--blue)" }}>
          🔧 Seviye 10 ayrıcalığı: tüm atölye işlerinde <strong>%10 sanayi indirimi</strong> uygulanıyor.
        </div>
      )}
      {hasUsta && (
        <div className="card" style={{ marginBottom: 12, borderColor: "var(--green)" }}>
          {STAFF_DEFS.usta.emoji} Ustanız iş başında: tüm atölye işleri <strong>%15 daha ucuz</strong>{" "}
          ve <strong>1 gün daha hızlı</strong>.
        </div>
      )}
      {state.jobs.length > 0 && (
        <>
          <div className="section-title">⏳ Devam Eden İşler</div>
          <div className="grid" style={{ marginBottom: 16 }}>
            {state.jobs.map((j) => {
              const o = state.inventory.find((x) => x.car.id === j.carId);
              return (
                <div className="card" key={j.id}>
                  <strong>
                    {o ? `${o.car.brand} ${o.car.model}` : "?"}
                  </strong>
                  <div className="sub">{j.label}</div>
                  <span className="tag yellow">⏳ {j.daysLeft} gün kaldı</span>
                </div>
              );
            })}
          </div>
        </>
      )}

      <div className="section-title">🔧 Araç Bakım &amp; Değer Artırma</div>
      {cars.length === 0 && (
        <div className="empty">Atölyede işlem yapılacak araç yok. Önce araç almalısınız.</div>
      )}

      {cars.map((o) => {
        const car = o.car;
        return (
          <div className="card" key={car.id} style={{ marginBottom: 12 }}>
            <h3>
              {car.year} {car.brand} {car.model}
            </h3>
            <div className="row" style={{ alignItems: "flex-start", gap: 24 }}>
              <div style={{ flex: 1, minWidth: 280 }}>
                <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 4 }}>
                  Parça durumu — yıpranmış parçayı yenilemek aracın değerini artırır:
                </div>
                {PART_KEYS.map((k) => {
                  const job = applyUsta(repairJobFor(car, k), hasUsta, lvl);
                  const queued = state.jobs.some(
                    (j) => j.carId === car.id && j.partKey === k && !j.faultId
                  );
                  return (
                    <div className="row" key={k} style={{ gap: 6 }}>
                      <div style={{ flex: 1 }}>
                        <PartBar name={PART_LABELS[k]} value={car.parts[k]} />
                      </div>
                      <button
                        className="small"
                        disabled={car.parts[k] >= 90 || queued || state.money < job.cost}
                        onClick={() => {
                          sfx.wrench();
                          dispatch({ type: "START_JOB", carId: car.id, job });
                        }}
                      >
                        {queued ? "⏳" : `${fmtMoney(job.cost)} · ${job.daysLeft}g`}
                      </button>
                    </div>
                  );
                })}

                {car.knownFaults.length > 0 && (
                  <div style={{ marginTop: 10 }}>
                    <strong style={{ color: "var(--red)", fontSize: 13.5 }}>Arızalar:</strong>
                    {car.knownFaults.map((f) => {
                      const rawJob = faultJobFor(car, f.id);
                      const job = rawJob ? applyUsta(rawJob, hasUsta, lvl) : null;
                      const queued = state.jobs.some((j) => j.faultId === f.id);
                      return (
                        <div className="row between" key={f.id} style={{ marginTop: 4 }}>
                          <span style={{ fontSize: 13, color: "var(--red)" }}>⚠️ {f.label}</span>
                          <button
                            className="small"
                            disabled={!job || queued || state.money < (job?.cost ?? 0)}
                            onClick={() => {
                              if (!job) return;
                              sfx.wrench();
                              dispatch({ type: "START_JOB", carId: car.id, job });
                            }}
                          >
                            {queued ? "⏳ Tamirde" : job ? `Tamir Et (${fmtMoney(job.cost)})` : ""}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div style={{ width: 280 }}>
                <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 4 }}>
                  Değer artırıcı işlemler:
                </div>
                <div className="row between" style={{ marginBottom: 6 }}>
                  <span style={{ fontSize: 13 }}>🧽 Detaylı temizlik (%{car.cleanliness})</span>
                  <button
                    className="small"
                    disabled={
                      car.cleanliness >= 95 ||
                      state.jobs.some((j) => j.carId === car.id && j.type === "clean") ||
                      state.money < applyUsta(cleanJob(car), hasUsta, lvl).cost
                    }
                    onClick={() => {
                      sfx.wrench();
                      dispatch({
                        type: "START_JOB",
                        carId: car.id,
                        job: applyUsta(cleanJob(car), hasUsta, lvl),
                      });
                    }}
                  >
                    {fmtMoney(applyUsta(cleanJob(car), hasUsta, lvl).cost)}
                  </button>
                </div>
                {(Object.keys(COSMETIC_LABELS) as (keyof Cosmetics)[]).map((k) => {
                  const job = applyUsta(cosmeticJob(car, k), hasUsta, lvl);
                  const queued = state.jobs.some(
                    (j) => j.carId === car.id && j.cosmeticKey === k
                  );
                  return (
                    <div className="row between" key={k} style={{ marginBottom: 6 }}>
                      <span style={{ fontSize: 13 }}>
                        {car.cosmetics[k] ? "✅ " : "✨ "}
                        {COSMETIC_LABELS[k]}
                      </span>
                      <button
                        className="small"
                        disabled={car.cosmetics[k] || queued || state.money < job.cost}
                        onClick={() => {
                          sfx.wrench();
                          dispatch({ type: "START_JOB", carId: car.id, job });
                        }}
                      >
                        {car.cosmetics[k] ? "Var" : queued ? "⏳" : `${fmtMoney(job.cost)} · ${job.daysLeft}g`}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
