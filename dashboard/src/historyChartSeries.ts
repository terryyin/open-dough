// A dated series for the shared history chart: CI wall time, scope
// execution time and Usage's Token index. Every entry is in history order,
// oldest first, each a measured point on the series' value axis
// (`./chartValueAxis.ts`) or, for CI, a build without timing.
import type { TimingGapStatus } from "./ciFailedBuild.ts";
import type { ValueAxis } from "./chartValueAxis.ts";

export type HistoryChartPoint = {
  readonly kind: "point";
  readonly key: string;
  readonly date: string;
  readonly value: number;
  readonly description: string;
  // A known value displayed above the ordinary scale, with its meaning.
  readonly overflow?: string;
  readonly segment?: string;
  readonly selected?: boolean;
  // Words for a point whose value is or may be incomplete, such as a Usage
  // task with missing usage ("Partial") or one finished after the last usage
  // check ("Provisional"); it is drawn hollow and its readout ends with them.
  readonly partial?: string;
  // Words for a point whose value is partly or wholly estimated, such as a
  // Usage task weighed at substitute rates ("Estimated rate"); it is drawn
  // with an estimate cue and its readout ends with them.
  readonly estimate?: string;
  // The named trace (`HistoryChartSeries.traces`) the point belongs to.
  readonly trace?: string;
};

// A dated build with no timing: a failed build, or any other unavailable
// timing, with its short status words ("Failed build", "No timing · …") from
// `./ciFailedBuild.ts`.
export type HistoryChartGap = {
  readonly kind: "gap";
  readonly key: string;
  readonly date: string;
  readonly status: TimingGapStatus;
  readonly words: string;
  readonly selected?: boolean;
};

export type HistoryChartEntry = HistoryChartPoint | HistoryChartGap;

// A dated trend drawn as a line instead of joining the points, such as one
// tool's rolling median; a trend of one value is a short level at it.
export type HistoryChartTrend = {
  // The named trace whose points the trend summarizes.
  readonly trace?: string;
  // Each observation's date and value, and the key of the entry it is
  // anchored on, where the series is placed in order.
  readonly points: readonly {
    readonly date: string;
    readonly value: number;
    readonly key?: string;
  }[];
};

export type HistoryChartSeries = {
  readonly label: string;
  readonly entries: readonly HistoryChartEntry[];
  readonly axis: ValueAxis;
  readonly selectedLabel?: string;
  // Fallback when no ordinary point exists; absent for timing charts.
  readonly emptyScaleMaximum?: number;
  // This trend is read against ordinary points without determining their scale.
  readonly independentTrend?: {
    readonly label: string;
    readonly shortLabel: string;
  };
  // A level drawn as the dashed line, such as CI's prior-build average.
  readonly reference?:
    { readonly value: number; readonly label: string } | undefined;
  // Names of the groups of points and trends that share these coordinates,
  // in drawing order, such as tools; each names its marks in readouts and
  // gives them a distinct style. Absent for a chart of one unnamed series.
  readonly traces?: readonly string[];
  // Trends drawn as lines instead of joining the points.
  readonly trends?: readonly HistoryChartTrend[];
  // Places each entry in its own equal-width slot in entry order instead of
  // over time, its axis saying these words (`./historyChartPlacement.ts`).
  readonly order?: { readonly axisWords: string };
};

export const isMeasured = (
  entry: HistoryChartEntry,
): entry is HistoryChartPoint => entry.kind === "point";

// The same value/coverage words label a mark and its inspected readout.
export function entryValueWords(
  entry: HistoryChartEntry,
  axis: ValueAxis,
): string {
  if (!isMeasured(entry)) return entry.words;
  const value = axis.words(entry.value);
  return [value, entry.partial, entry.estimate]
    .filter((each) => each !== undefined)
    .join(" · ");
}

// The trace's position among the series' traces, which selects its style.
export const traceSlot = (
  series: HistoryChartSeries,
  trace: string | undefined,
): number => Math.max(0, series.traces?.indexOf(trace ?? "") ?? 0);

// A named trace's words before its readouts ("Codex · "); none when unnamed.
export const traceWords = (trace: string | undefined): string =>
  trace === undefined ? "" : `${trace} · `;
