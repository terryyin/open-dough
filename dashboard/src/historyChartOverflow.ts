// Above-scale task labels share dated x coordinates; colliding labels/buttons
// occupy separate rows, adding room above the ordinary plot rather than hiding.
import { buildDateWords } from "./ciHistoryWords.ts";
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
  ceiling: number,
) {
  const rows: { left: number; right: number }[][] = [];
  const placed = new Map<string, OverflowPlacement>();
  const place = (label: string, date: string): OverflowPlacement => {
    const half = Math.min((right - left) / 2, Math.max(22, label.length * 3.5));
    const labelX = Math.max(left + half, Math.min(x(date), right - half));
    const span = {
      left: Math.min(x(date) - 16, labelX - half),
      right: Math.max(x(date) + 16, labelX + half),
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
    return { y: 20 + row * 40, label, labelX };
  };
  for (const entry of series.entries) {
    if (!isMeasured(entry) || entry.overflow === undefined) continue;
    placed.set(
      entry.key,
      place(entryValueWords(entry, series.axis), entry.date),
    );
  }
  const independent = series.independentTrend;
  const trend =
    independent === undefined
      ? []
      : (series.trend ?? []).flatMap((point) => {
          if (point.value <= ceiling) return [];
          const value = series.axis.words(point.value);
          return [
            {
              ...place(`${independent.shortLabel} ↑ ${value}`, point.date),
              x: x(point.date),
              readout: `${buildDateWords(point.date)} · ${independent.label} above scale · ${value}`,
            },
          ];
        });
  return { placed, trend, height: rows.length * 40 };
}
