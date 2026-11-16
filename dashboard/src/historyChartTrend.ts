// Independent trends break at above-scale observations instead of flattening
// their real values onto the ceiling or joining across an invisible value.
import type { Placeable } from "./historyChartPlacement.ts";
import type { HistoryChartTrend } from "./historyChartSeries.ts";
type Trend = HistoryChartTrend["points"];
export function trendThrough(
  trend: Trend,
  x: (at: Placeable) => number,
  y: (value: number) => number,
  ceiling?: number,
): string {
  const chunks: Trend[number][][] = [];
  let current: Trend[number][] = [];
  for (const point of trend) {
    if (ceiling !== undefined && point.value > ceiling) {
      current = [];
      continue;
    }
    if (current.length === 0) chunks.push(current);
    current.push(point);
  }
  return chunks
    .map((chunk) => {
      const only = chunk[0];
      if (chunk.length === 1 && only !== undefined) {
        const at = x(only),
          level = y(only.value);
        return `M${at - 8} ${level} L${at + 8} ${level}`;
      }
      return chunk
        .map(
          (point, index) =>
            `${index === 0 ? "M" : "L"}${x(point)} ${y(point.value)}`,
        )
        .join(" ");
    })
    .join(" ");
}
