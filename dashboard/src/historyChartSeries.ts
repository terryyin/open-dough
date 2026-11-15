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
  readonly segment?: string;
  readonly selected?: boolean;
  // Words for a point whose value is known to be incomplete, such as a Usage
  // task with missing usage ("Partial"); it is drawn hollow and its readout
  // ends with them.
  readonly partial?: string;
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

export type HistoryChartSeries = {
  readonly label: string;
  readonly entries: readonly HistoryChartEntry[];
  readonly axis: ValueAxis;
  readonly selectedLabel?: string;
  // A level drawn as the dashed line, such as CI's prior-build average.
  readonly reference?:
    { readonly value: number; readonly label: string } | undefined;
  // A dated trend drawn as the line instead of joining the points, such as
  // Usage's moving average; a trend of one value is a short level at it.
  readonly trend?: readonly { readonly date: string; readonly value: number }[];
};

export const isMeasured = (
  entry: HistoryChartEntry,
): entry is HistoryChartPoint => entry.kind === "point";
