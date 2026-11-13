// A dated series for the shared CI wall-time and scope execution-time chart:
// every build in history order, oldest first, each a measured point or a gap.
import type { TimingGapStatus } from "./ciFailedBuild.ts";

export type HistoryChartPoint = {
  readonly kind: "point";
  readonly key: string;
  readonly date: string;
  readonly ms: number;
  readonly description: string;
  readonly segment?: string;
  readonly selected?: boolean;
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

export type HistoryChartBuild = HistoryChartPoint | HistoryChartGap;

export type HistoryChartSeries = {
  readonly label: string;
  readonly builds: readonly HistoryChartBuild[];
  readonly precise?: boolean;
  readonly selectedLabel?: string;
  // The prior-build average, drawn as the dashed line.
  readonly averageMs?: number | undefined;
};

export const isMeasured = (
  build: HistoryChartBuild,
): build is HistoryChartPoint => build.kind === "point";
