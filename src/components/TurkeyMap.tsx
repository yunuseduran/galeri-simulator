import { CITIES } from "../data/cities";

// Enlem/boylamı SVG koordinatına çevirir
function px(lon: number): number {
  return (lon - 25.4) * 40;
}
function py(lat: number): number {
  return (42.6 - lat) * 50;
}

// Türkiye'nin sadeleştirilmiş dış hattı (boylam, enlem)
const OUTLINE: [number, number][] = [
  [26.0, 42.0], [27.6, 42.0], [28.2, 41.6], [29.1, 41.3], [30.4, 41.2],
  [31.4, 41.5], [32.3, 41.9], [34.0, 42.05], [35.2, 42.1], [36.2, 41.4],
  [37.5, 41.1], [38.4, 41.0], [39.5, 41.1], [40.5, 41.2], [41.6, 41.6],
  [42.6, 41.6], [43.5, 41.15], [43.7, 40.5], [44.8, 39.8], [44.4, 39.4],
  [44.6, 39.0], [44.3, 38.4], [44.5, 37.7], [44.2, 37.3], [42.8, 37.15],
  [41.3, 37.1], [40.2, 36.95], [39.0, 36.7], [38.0, 36.8], [36.9, 36.7],
  [36.7, 36.25], [36.15, 35.85], [35.95, 36.3], [36.05, 36.85], [35.5, 36.6],
  [34.6, 36.75], [33.5, 36.15], [32.2, 36.1], [30.7, 36.3], [29.7, 36.15],
  [28.9, 36.7], [28.0, 36.6], [27.3, 37.0], [27.2, 37.6], [26.3, 38.3],
  [26.7, 38.7], [26.6, 39.3], [26.1, 39.5], [26.15, 40.05], [26.0, 40.6],
  [26.0, 41.0], [25.95, 41.5],
];

const PATH = OUTLINE.map(([lon, lat], i) => `${i === 0 ? "M" : "L"}${px(lon).toFixed(1)},${py(lat).toFixed(1)}`).join(" ") + " Z";

export function TurkeyMap({
  currentCity,
  homeCity,
  listingCounts,
  selected,
  onSelect,
}: {
  currentCity: number;
  homeCity: number;
  listingCounts: Record<number, number>;
  selected: number | null;
  onSelect: (plate: number) => void;
}) {
  return (
    <svg
      viewBox="0 0 790 350"
      style={{ width: "100%", height: "auto", display: "block" }}
      role="img"
      aria-label="Türkiye haritası"
    >
      {/* deniz */}
      <rect x="0" y="0" width="790" height="350" rx="12" fill="#101b2e" />
      {/* kara */}
      <path d={PATH} fill="#22311f" stroke="#4a6741" strokeWidth="2" strokeLinejoin="round" />

      {CITIES.map((c) => {
        const x = px(c.lon);
        const y = py(c.lat);
        const count = listingCounts[c.plate] ?? 0;
        const isCur = c.plate === currentCity;
        const isHome = c.plate === homeCity;
        const isSel = c.plate === selected;
        const r = isCur || isSel ? 7 : count > 0 ? 5.5 : 4;
        const fill = isCur
          ? "#f5a524"
          : isSel
            ? "#5aa9ff"
            : count > 0
              ? "#3ecf8e"
              : "#5d6c8a";
        return (
          <g
            key={c.plate}
            onClick={() => onSelect(c.plate)}
            style={{ cursor: "pointer" }}
          >
            <title>
              {c.name} ({String(c.plate).padStart(2, "0")}){count > 0 ? ` — ${count} ilan` : ""}
            </title>
            {/* görünmez büyük tıklama alanı */}
            <circle cx={x} cy={y} r={11} fill="transparent" />
            <circle
              cx={x}
              cy={y}
              r={r}
              fill={fill}
              stroke={isSel || isCur ? "#fff" : "#0f1420"}
              strokeWidth={isSel || isCur ? 2 : 1}
            />
            {isHome && (
              <text x={x} y={y - 9} textAnchor="middle" fontSize="11" fill="#ffd166">
                🏠
              </text>
            )}
            {count > 0 && (
              <text
                x={x}
                y={y + 3.5}
                textAnchor="middle"
                fontSize="8.5"
                fontWeight="bold"
                fill="#06120b"
                style={{ pointerEvents: "none" }}
              >
                {count}
              </text>
            )}
            {(isCur || isSel || count >= 3) && (
              <text
                x={x}
                y={y + 18}
                textAnchor="middle"
                fontSize="10"
                fill={isCur ? "#f5a524" : "#aebad2"}
                style={{ pointerEvents: "none" }}
              >
                {c.name}
              </text>
            )}
          </g>
        );
      })}

      {/* lejant */}
      <g fontSize="10" fill="#8b99b8">
        <circle cx={16} cy={332} r={5} fill="#f5a524" />
        <text x={26} y={335.5}>Buradasınız</text>
        <circle cx={106} cy={332} r={5} fill="#3ecf8e" />
        <text x={116} y={335.5}>İlan var</text>
        <circle cx={176} cy={332} r={4} fill="#5d6c8a" />
        <text x={186} y={335.5}>İlan yok</text>
      </g>
    </svg>
  );
}
