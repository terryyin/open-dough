// Independent trends break at above-scale observations instead of flattening
// their real values onto the ceiling or joining across an invisible value.
import type { HistoryChartSeries } from "./historyChartSeries.ts";
type Trend = NonNullable<HistoryChartSeries["trend"]>;
export function trendThrough(
  trend: Trend,
  x: (date: string) => number,
  y: (value: number) => number,
  ceiling?: number,
): string {
  const chunks: { date: string; value: number }[][] = [];
  let current: { date: string; value: number }[] = [];
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
        const at = x(only.date),
          level = y(only.value);
        return `M${at - 8} ${level} L${at + 8} ${level}`;
      }
      return chunk
        .map(
          (point, index) =>
            `${index === 0 ? "M" : "L"}${x(point.date)} ${y(point.value)}`,
        )
        .join(" ");
    })
    .join(" ");
}
