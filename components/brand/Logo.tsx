/* The CyclePlate mark, wordmark and lockup.
 *
 * The mark is a ring of four arc segments: it reads at once as a menstrual
 * cycle, four phases moving around, and as a plate seen from above.
 *
 * This was a script that wrote SVG strings into placeholder elements after the
 * page loaded. As components the same drawing arrives in the server rendered
 * HTML, so the logo is painted on first frame instead of popping in, and it
 * costs no client JavaScript at all.
 */

const PHASE = {
  menstrual: "#B23A4B",
  follicular: "#7C9A65",
  ovulatory: "#E0A33E",
  luteal: "#96617F",
} as const;

const CLAY = "#C2410C";
const INK = "#3A2418";
const CREAM = "#FBF4EC";

const ORDER = ["menstrual", "follicular", "ovulatory", "luteal"] as const;

/* A point on a circle, degrees measured clockwise from twelve o'clock. */
function pointOn(cx: number, cy: number, r: number, deg: number) {
  const a = ((deg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const;
}

function arcPath(cx: number, cy: number, r: number, start: number, end: number) {
  const [sx, sy] = pointOn(cx, cy, r, start);
  const [ex, ey] = pointOn(cx, cy, r, end);
  const large = end - start > 180 ? 1 : 0;
  return `M ${sx.toFixed(2)} ${sy.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${ex.toFixed(2)} ${ey.toFixed(2)}`;
}

export type MarkMode = "phase" | "mono" | "cream";

export function Mark({
  size = 120,
  mode = "phase",
  color,
  gap = 16,
  weight = 14,
  well = true,
}: {
  size?: number;
  mode?: MarkMode;
  color?: string;
  gap?: number;
  weight?: number;
  well?: boolean;
}) {
  const r = 42;
  const half = gap / 2;

  const stroke =
    mode === "mono" ? color ?? INK : mode === "cream" ? color ?? CREAM : null;

  /* The well is the faint inner ring. In phase mode it sits behind four
     colours, so it is drawn in ink at low opacity rather than picking one. */
  const wellColor =
    mode === "cream" ? color ?? CREAM : mode === "mono" ? color ?? INK : INK;

  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      role="img"
      aria-label="CyclePlate mark"
    >
      {ORDER.map((phase, i) => (
        <path
          key={phase}
          d={arcPath(60, 60, r, i * 90 + half, (i + 1) * 90 - half)}
          stroke={stroke ?? PHASE[phase]}
          strokeWidth={weight}
          strokeLinecap="round"
          fill="none"
        />
      ))}
      {well ? (
        <circle
          cx={60}
          cy={60}
          r={r - weight - 6}
          fill="none"
          stroke={wellColor}
          strokeWidth={2.5}
          opacity={mode === "phase" ? 0.32 : 0.5}
        />
      ) : null}
    </svg>
  );
}

/* Text rather than an SVG path, so it renders in the live Fraunces and stays
   selectable and readable to a screen reader. "Cycle" follows the theme; the
   dark theme override lives in globals.css. */
export function Wordmark({ size = 40 }: { size?: number }) {
  return (
    <span className="cp-wordmark" style={{ fontSize: `${size}px` }}>
      <span style={{ color: INK }}>Cycle</span>
      <span style={{ color: CLAY }}>Plate</span>
    </span>
  );
}

export function Lockup({
  dir = "h",
  markSize = 56,
  wordSize = 34,
  mode = "phase",
  color,
  weight,
  gap,
}: {
  dir?: "h" | "v";
  markSize?: number;
  wordSize?: number;
  mode?: MarkMode;
  color?: string;
  weight?: number;
  gap?: number;
}) {
  return (
    <span
      className={dir === "v" ? "cp-lock cp-lock-v" : "cp-lock cp-lock-h"}
      style={dir === "h" ? { gap: "0.34em" } : undefined}
    >
      <Mark size={markSize} mode={mode} color={color} weight={weight} gap={gap} />
      <Wordmark size={wordSize} />
    </span>
  );
}
