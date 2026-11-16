// Scale and placement of one dated series: value ticks with readable labels
// from the series' axis (`./chartValueAxis.ts`), a date axis over every
// entry, each entry's mark in history order with its short readout, and the
// line's strokes. Measured points sit on the value axis, a measured zero
// included; CI builds without timing sit on their own row below it, and
// every such build breaks the line, as does a change of compatible segment.
// A series with trends draws them as its lines instead, a trend of one
// value as a short level at its point. Every named trace shares these value
// and date bounds; its marks and trend carry its style slot.
import {
  placeOverflows,
  type OverflowPlacement,
} from "./historyChartOverflow.ts";
import { trendThrough } from "./historyChartTrend.ts";
import { buildDateWords, selectedLandingWords } from "./ciHistoryWords.ts";
import {
  entryValueWords,
  isMeasured,
  traceSlot,
  traceWords,
  type HistoryChartEntry,
  type HistoryChartSeries,
} from "./historyChartSeries.ts";

export const chartHeight = 184;
export const plotTop = 12;
export const plotBottom = 128;
const gapRow = 148;
export const dateBaseline = 174;
const plotStart = 56;
const plotEndRoom = 16;
export const minimumChartWidth = plotStart + plotEndRoom;
const dateRoom = 64;
const dateEdgeRoom = 22;

export type ChartMark = {
  readonly entry: HistoryChartEntry;
  readonly x: number;
  readonly y: number;
  // Short date and timing or status, as the reader inspects the mark.
  readonly readout: string;
  readonly overflow: OverflowPlacement | undefined;
  // The style slot of the point's named trace (`traceSlot`).
  readonly slot: number;
};

export type ChartLayout = {
  // How the series names its selected entry ("Selected landing" by default).
  readonly selectedLabel: string;
  readonly overflowHeight: number;
  readonly height: number;
  readonly plotLeft: number;
  readonly plotEnd: number;
  readonly ticks: readonly {
    readonly value: number;
    readonly y: number;
    readonly words: string;
  }[];
  // The dashed reference level and its words.
  readonly reference?: { readonly y: number; readonly label: string };
  // Every entry in history order, oldest first.
  readonly marks: readonly ChartMark[];
  // Strokes joining the points of a series without trends.
  readonly line: string;
  // Each trend's strokes with its trace's style slot, in trace order.
  readonly trends: readonly { readonly path: string; readonly slot: number }[];
  readonly trendOnTop: boolean;
  readonly trendOverflows: ReturnType<typeof placeOverflows>["trend"];
  readonly dates: readonly { readonly x: number; readonly words: string }[];
};

// Each run of measured points in one compatible segment, with no build
// without timing between them, is one SVG subpath. A one-point subpath is
// only a move, so it draws no stroke.
function lineThrough(marks: readonly ChartMark[]): string {
  const moves: string[] = [];
  let previous: HistoryChartEntry | undefined;
  for (const mark of marks) {
    if (isMeasured(mark.entry)) {
      const joins =
        previous !== undefined &&
        isMeasured(previous) &&
        previous.segment === mark.entry.segment;
      moves.push(`${joins ? "L" : "M"}${String(mark.x)} ${String(mark.y)}`);
    }
    previous = mark.entry;
  }
  return moves.length < 2 ? "" : moves.join(" ");
}

export function chartLayout(
  series: HistoryChartSeries,
  width: number,
): ChartLayout {
  const { entries, axis, reference, trends } = series;
  const plotEnd = width - plotEndRoom;
  const tickWords = axis.tickWords ?? axis.words;
  const ordinary = entries
    .filter(isMeasured)
    .filter((point) => point.overflow === undefined);
  const tickValues =
    ordinary.length === 0 && series.emptyScaleMaximum !== undefined
      ? [0, series.emptyScaleMaximum / 2, series.emptyScaleMaximum]
      : axis.ticks([
          ...ordinary.map((point) => point.value),
          ...(reference === undefined ? [] : [reference.value]),
          ...(series.independentTrend === undefined ? (trends ?? []) : [])
            .flatMap((trend) => trend.points)
            .map((point) => point.value),
        ]);
  // Whole duration labels can be wider near zero (e.g. 1 min 30 s).
  // Reserve their width so phone readers never lose the leading figures.
  const plotLeft = Math.max(
    plotStart,
    ...tickValues.map((tick) => tickWords(tick).length * 7 + 16),
  );
  const lowest = tickValues[0] ?? 0;
  const highest = tickValues.at(-1) ?? lowest + 1;
  const dates = entries.map((entry) => Date.parse(entry.date));
  const earliest = Math.min(...dates);
  const latest = Math.max(...dates);
  const x = (date: string) =>
    latest === earliest
      ? (plotLeft + plotEnd) / 2
      : plotLeft +
        ((Date.parse(date) - earliest) / (latest - earliest)) *
          (plotEnd - plotLeft);
  const overflows = placeOverflows(series, x, plotLeft, plotEnd, highest);
  const overflowHeight = overflows.height;
  const y = (value: number) =>
    overflowHeight +
    plotBottom -
    ((value - lowest) / (highest - lowest)) * (plotBottom - plotTop);
  const selectedLabel = series.selectedLabel ?? selectedLandingWords;
  const selected = (is: boolean | undefined) =>
    is === true ? `${selectedLabel} · ` : "";
  const marks = entries.map((entry): ChartMark => ({
    entry,
    x: x(entry.date),
    y:
      overflows.placed.get(entry.key)?.y ??
      (isMeasured(entry) ? y(entry.value) : gapRow + overflowHeight),
    overflow: overflows.placed.get(entry.key),
    slot: isMeasured(entry) ? traceSlot(series, entry.trace) : 0,
    readout: `${buildDateWords(entry.date)} · ${isMeasured(entry) ? traceWords(entry.trace) : ""}${selected(entry.selected)}${entryValueWords(entry, axis)}${isMeasured(entry) && entry.overflow !== undefined ? ` · ${entry.overflow}` : ""}`,
  }));
  const dated: { x: number; words: string }[] = [];
  const middle =
    marks.length >= 3 && width >= 480 ? [Math.floor(marks.length / 2)] : [];
  for (const index of [0, ...middle, marks.length - 1]) {
    const mark = marks[index];
    if (mark === undefined) continue;
    const words = buildDateWords(mark.entry.date);
    const under = Math.min(mark.x, width - dateEdgeRoom);
    if (
      dated.some(
        (each) => each.words === words || Math.abs(each.x - under) < dateRoom,
      )
    )
      continue;
    dated.push({ x: under, words });
  }
  return {
    selectedLabel,
    overflowHeight,
    height: chartHeight + overflowHeight,
    plotLeft,
    plotEnd,
    ticks: tickValues.map((value) => ({
      value,
      y: y(value),
      words: tickWords(value),
    })),
    ...(reference === undefined
      ? {}
      : { reference: { y: y(reference.value), label: reference.label } }),
    marks,
    line: trends === undefined ? lineThrough(marks) : "",
    trends: (trends ?? []).map((trend) => ({
      path: trendThrough(
        trend.points,
        x,
        y,
        series.independentTrend === undefined ? undefined : highest,
      ),
      slot: traceSlot(series, trend.trace),
    })),
    trendOnTop: series.independentTrend !== undefined,
    trendOverflows: overflows.trend,
    dates: dated,
  };
}
