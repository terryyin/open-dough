// Above-scale task labels share the series' x placement; colliding labels/buttons
// occupy separate rows, adding room above the ordinary plot rather than hiding.
// One allocator places every trace's task labels and trend values.
import { buildDateWords } from "./ciHistoryWords.ts";
import type { Placeable } from "./historyChartPlacement.ts";
import {
  entryValueWords,
  isMeasured,
  traceSlot,
  traceWords,
  type HistoryChartSeries,
} from "./historyChartSeries.ts";
export type OverflowPlacement = {
  readonly y: number;
  readonly label: string;
  readonly labelX: number;
};
export function placeOverflows(
  series: HistoryChartSeries,
  x: (at: Placeable) => number,
  left: number,
  right: number,
  ceiling: number,
) {
  const rows: { left: number; right: number }[][] = [];
  const placed = new Map<string, OverflowPlacement>();
  const place = (label: string, at: Placeable): OverflowPlacement => {
    const half = Math.min((right - left) / 2, Math.max(22, label.length * 3.5));
    const labelX = Math.max(left + half, Math.min(x(at), right - half));
    const span = {
      left: Math.min(x(at) - 16, labelX - half),
      right: Math.max(x(at) + 16, labelX + half),
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
    placed.set(entry.key, place(entryValueWords(entry, series.axis), entry));
  }
  const independent = series.independentTrend;
  // Every trace's trend shares the one allocator with the task labels.
  const trend =
    independent === undefined
      ? []
      : (series.trends ?? []).flatMap(({ trace, points }) =>
          points.flatMap((point) => {
            if (point.value <= ceiling) return [];
            const value = series.axis.words(point.value);
            const named = trace === undefined ? "" : `${trace} `;
            return [
              {
                ...place(`${named}${independent.shortLabel} ↑ ${value}`, point),
                x: x(point),
                slot: traceSlot(series, trace),
                readout: `${buildDateWords(point.date)} · ${traceWords(trace)}${independent.label} above scale · ${value}`,
              },
            ];
          }),
        );
  return { placed, trend, height: rows.length * 40 };
}
