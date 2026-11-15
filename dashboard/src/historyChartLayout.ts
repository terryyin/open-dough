// Scale and placement of one dated series: value ticks with readable labels
// from the series' axis (`./chartValueAxis.ts`), a date axis over every
// entry, each entry's mark in history order with its short readout, and the
// line's strokes. Measured points sit on the value axis, a measured zero
// included; CI builds without timing sit on their own row below it, and
// every such build breaks the line, as does a change of compatible segment.
// A series with a trend draws the trend as its line instead.
import { buildDateWords, selectedLandingWords } from "./ciHistoryWords.ts";
import {
  isMeasured,
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
};

export type ChartLayout = {
  // How the series names its selected entry ("Selected landing" by default).
  readonly selectedLabel: string;
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
  readonly line: string;
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

function trendThrough(
  trend: NonNullable<HistoryChartSeries["trend"]>,
  x: (date: string) => number,
  y: (value: number) => number,
): string {
  return trend.length < 2
    ? ""
    : trend
        .map(
          ({ date, value }, index) =>
            `${index === 0 ? "M" : "L"}${String(x(date))} ${String(y(value))}`,
        )
        .join(" ");
}

export function chartLayout(
  series: HistoryChartSeries,
  width: number,
): ChartLayout {
  const { entries, axis, reference, trend } = series;
  const plotEnd = width - plotEndRoom;
  const tickWords = axis.tickWords ?? axis.words;
  const tickValues = axis.ticks([
    ...entries.filter(isMeasured).map((point) => point.value),
    ...(reference === undefined ? [] : [reference.value]),
    ...(trend ?? []).map((point) => point.value),
  ]);
  // Whole duration labels can be wider near zero (e.g. 1 min 30 s).
  // Reserve their width so phone readers never lose the leading figures.
  const plotLeft = Math.max(
    plotStart,
    ...tickValues.map((tick) => tickWords(tick).length * 7 + 16),
  );
  const lowest = tickValues[0] ?? 0;
  const highest = tickValues.at(-1) ?? lowest + 1;
  const y = (value: number) =>
    plotBottom -
    ((value - lowest) / (highest - lowest)) * (plotBottom - plotTop);
  const dates = entries.map((entry) => Date.parse(entry.date));
  const earliest = Math.min(...dates);
  const latest = Math.max(...dates);
  const x = (date: string) =>
    latest === earliest
      ? (plotLeft + plotEnd) / 2
      : plotLeft +
        ((Date.parse(date) - earliest) / (latest - earliest)) *
          (plotEnd - plotLeft);
  const selectedLabel = series.selectedLabel ?? selectedLandingWords;
  const selected = (is: boolean | undefined) =>
    is === true ? `${selectedLabel} · ` : "";
  const marks = entries.map((entry): ChartMark => ({
    entry,
    x: x(entry.date),
    y: isMeasured(entry) ? y(entry.value) : gapRow,
    readout: `${buildDateWords(entry.date)} · ${selected(entry.selected)}${isMeasured(entry) ? axis.words(entry.value) : entry.words}`,
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
    line: trend === undefined ? lineThrough(marks) : trendThrough(trend, x, y),
    dates: dated,
  };
}
