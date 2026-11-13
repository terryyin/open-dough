// Scale and placement of one dated CI timing series: duration ticks with
// readable labels, a date axis over every build, each build's mark in
// history order with its short readout, and the line's strokes. Measured builds sit
// on the duration axis, a measured zero included; builds without timing sit
// on their own row below it, and every such build breaks the line, as does a
// change of compatible segment.
import { buildDateWords } from "./ciHistoryWords.ts";
import { executionTimeWords, wholeSecondWords } from "./ciProofTimeWords.ts";
import {
  isMeasured,
  type HistoryChartBuild,
  type HistoryChartSeries,
} from "./ciHistoryChart.ts";

export const chartHeight = 184;
export const plotTop = 12;
export const plotBottom = 128;
const gapRow = 148;
export const dateBaseline = 174;
const plotStart = 56;
const plotEndRoom = 16;
export const minimumChartWidth = plotStart + plotEndRoom;
const shortestRangeMs = 2 * 60_000;
const tickStepsSeconds = [
  10, 15, 30, 60, 120, 300, 600, 900, 1800, 3600, 7200, 14_400,
];
const dateRoom = 64;
const dateEdgeRoom = 22;

function timeTicks(values: readonly number[], precise: boolean): number[] {
  const minimumRange = precise ? 2_000 : shortestRangeMs;
  let low = Math.min(...values);
  let high = Math.max(...values);
  if (high - low < minimumRange) {
    const middle = (low + high) / 2;
    low = middle - minimumRange / 2;
    high = middle + minimumRange / 2;
  }
  low = Math.max(0, low);
  const scale = Math.pow(
    10,
    Math.floor(Math.log10(Math.max(1, high - low) / 4)),
  );
  const preciseStep =
    [1, 2, 5, 10]
      .map((factor) => factor * scale)
      .find(
        (candidate) =>
          Math.ceil(high / candidate) - Math.floor(low / candidate) <= 4,
      ) ?? scale * 10;
  const step = precise
    ? preciseStep
    : (tickStepsSeconds.find(
        (seconds) =>
          Math.ceil(high / (seconds * 1000)) -
            Math.floor(low / (seconds * 1000)) <=
          4,
      ) ?? 14_400) * 1000;
  const ticks: number[] = [];
  for (
    let at = Math.floor(low / step) * step;
    at <= Math.ceil(high / step) * step;
    at += step
  )
    ticks.push(at);
  return ticks;
}

export type ChartMark = {
  readonly build: HistoryChartBuild;
  readonly x: number;
  readonly y: number;
  // Short date and timing or status, as the reader inspects the mark.
  readonly readout: string;
};

export type ChartLayout = {
  // How the series names its selected build ("Selected" by default).
  readonly selectedLabel: string;
  readonly plotLeft: number;
  readonly plotEnd: number;
  readonly ticks: readonly {
    readonly ms: number;
    readonly y: number;
    readonly words: string;
  }[];
  readonly reference?: { readonly y: number; readonly label: string };
  // Every build in history order, oldest first.
  readonly marks: readonly ChartMark[];
  readonly line: string;
  readonly dates: readonly { readonly x: number; readonly words: string }[];
};

// Each run of measured builds in one compatible segment, with no build
// without timing between them, is one SVG subpath. A one-point subpath is
// only a move, so it draws no stroke.
function lineThrough(marks: readonly ChartMark[]): string {
  const moves: string[] = [];
  let previous: HistoryChartBuild | undefined;
  for (const mark of marks) {
    if (isMeasured(mark.build)) {
      const joins =
        previous !== undefined &&
        isMeasured(previous) &&
        previous.segment === mark.build.segment;
      moves.push(`${joins ? "L" : "M"}${String(mark.x)} ${String(mark.y)}`);
    }
    previous = mark.build;
  }
  return moves.length < 2 ? "" : moves.join(" ");
}

export function chartLayout(
  series: HistoryChartSeries,
  width: number,
): ChartLayout {
  const { builds } = series;
  const plotEnd = width - plotEndRoom;
  const precise = series.precise === true;
  const timeLabel = (ms: number) =>
    precise ? executionTimeWords(ms) : wholeSecondWords(ms);
  const tickValues = timeTicks(
    [
      ...builds.filter(isMeasured).map((point) => point.ms),
      ...(series.reference === undefined ? [] : [series.reference.ms]),
    ],
    precise,
  );
  // Whole duration labels can be wider near zero (e.g. 1 min 30 s).
  // Reserve their width so phone readers never lose the leading figures.
  const plotLeft = Math.max(
    plotStart,
    ...tickValues.map((tick) => timeLabel(tick).length * 7 + 16),
  );
  const lowest = tickValues[0] ?? 0;
  const highest = tickValues.at(-1) ?? lowest + shortestRangeMs;
  const y = (ms: number) =>
    plotBottom - ((ms - lowest) / (highest - lowest)) * (plotBottom - plotTop);
  const dates = builds.map((build) => Date.parse(build.date));
  const earliest = Math.min(...dates);
  const latest = Math.max(...dates);
  const x = (date: string) =>
    latest === earliest
      ? (plotLeft + plotEnd) / 2
      : plotLeft +
        ((Date.parse(date) - earliest) / (latest - earliest)) *
          (plotEnd - plotLeft);
  const selectedLabel = series.selectedLabel ?? "Selected";
  const selected = (is: boolean | undefined) =>
    is === true ? `${selectedLabel} · ` : "";
  const marks = builds.map((build): ChartMark => ({
    build,
    x: x(build.date),
    y: isMeasured(build) ? y(build.ms) : gapRow,
    readout: `${buildDateWords(build.date)} · ${selected(build.selected)}${isMeasured(build) ? timeLabel(build.ms) : build.words}`,
  }));
  const dated: { x: number; words: string }[] = [];
  const middle =
    marks.length >= 3 && width >= 480 ? [Math.floor(marks.length / 2)] : [];
  for (const index of [0, ...middle, marks.length - 1]) {
    const mark = marks[index];
    if (mark === undefined) continue;
    const words = buildDateWords(mark.build.date);
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
    ticks: tickValues.map((ms) => ({ ms, y: y(ms), words: timeLabel(ms) })),
    ...(series.reference === undefined
      ? {}
      : {
          reference: {
            y: y(series.reference.ms),
            label: series.reference.label,
          },
        }),
    marks,
    line: lineThrough(marks),
    dates: dated,
  };
}
