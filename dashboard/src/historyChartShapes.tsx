// The marks a history chart's trace draws (`./HistoryChartPlot.tsx`), shared
// with keys that show them: a circle per measured point, a hollow diamond per
// partial one, the second trace's points as triangles, filled or hollow alike,
// and a stretch of a trace's trend.
import type { ReactNode } from "react";

// The extra class of trace style slot `slot`; the first trace needs none.
export const traceClass = (slot: number) =>
  slot === 0 ? "" : ` history-chart-trace-${String(slot)}`;

// A diamond centred on (x, y), `reach` from its centre to each corner.
export const diamond = (x: number, y: number, reach: number) =>
  `M${String(x)} ${String(y - reach)} l${String(reach)} ${String(reach)} l${String(-reach)} ${String(reach)} l${String(-reach)} ${String(-reach)} Z`;

// An upward triangle centred on (x, y), for the second trace's points.
const triangle = (x: number, y: number) =>
  `${String(x)},${String(y - 6)} ${String(x + 6)},${String(y + 4)} ${String(x - 6)},${String(y + 4)}`;

// An unselected point of trace slot `slot` centred on (x, y): a circle, or a
// diamond when partial; the second trace's are triangles, filled or hollow.
export function PointShape({
  slot,
  partial,
  x,
  y,
  children,
}: {
  readonly slot: number;
  readonly partial: boolean;
  readonly x: number;
  readonly y: number;
  readonly children?: ReactNode;
}) {
  const className = `history-chart-${partial ? "partial" : "point"}${traceClass(slot)}`;
  if (slot === 1)
    return (
      <polygon className={className} points={triangle(x, y)}>
        {children}
      </polygon>
    );
  return partial ? (
    <path className={className} d={diamond(x, y, 5)}>
      {children}
    </path>
  ) : (
    <circle className={className} cx={x} cy={y} r={4}>
      {children}
    </circle>
  );
}

// A key swatch for trace slot `slot`, drawn as the plot draws it: its point,
// its partial point or a stretch of its trend.
export function HistoryChartKey({
  slot,
  kind,
}: {
  readonly slot: number;
  readonly kind: "point" | "partial" | "trend";
}) {
  return (
    <svg
      className="history-chart-key"
      width={kind === "trend" ? 20 : 16}
      height={14}
      aria-hidden="true"
    >
      {kind === "trend" ? (
        <line
          className={`history-chart-trend${traceClass(slot)}`}
          x1={1}
          x2={19}
          y1={7}
          y2={7}
        />
      ) : (
        <PointShape slot={slot} partial={kind === "partial"} x={8} y={8} />
      )}
    </svg>
  );
}
