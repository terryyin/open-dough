// Above-scale task labels share dated x coordinates; colliding labels/buttons
// occupy separate rows, adding room above the ordinary plot rather than hiding.
import {
  entryValueWords,
  isMeasured,
  type HistoryChartSeries,
} from "./historyChartSeries.ts";
export type OverflowPlacement = {
  readonly y: number;
  readonly label: string;
  readonly labelX: number;
};
export function placeOverflows(
  series: HistoryChartSeries,
  x: (date: string) => number,
  left: number,
  right: number,
) {
  const rows: { left: number; right: number }[][] = [];
  const placed = new Map<string, OverflowPlacement>();
  for (const entry of series.entries) {
    if (!isMeasured(entry) || entry.overflow === undefined) continue;
    const label = entryValueWords(entry, series.axis);
    const half = Math.min((right - left) / 2, Math.max(22, label.length * 3.5));
    const labelX = Math.max(left + half, Math.min(x(entry.date), right - half));
    const span = {
      left: Math.min(x(entry.date) - 16, labelX - half),
      right: Math.max(x(entry.date) + 16, labelX + half),
    };
    let row = rows.findIndex((items) =>
      items.every(
        (item) => span.left > item.right + 8 || span.right < item.left - 8,
      ),
    );
    if (row < 0) {
      row = rows.length;
      rows.push([]);
    }
    rows[row]?.push(span);
    placed.set(entry.key, { y: 20 + row * 40, label, labelX });
  }
  return { placed, height: rows.length * 40 };
}
