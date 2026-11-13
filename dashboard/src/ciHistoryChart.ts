// A dated series for the shared CI wall-time and scope execution-time chart:
// every build in history order, oldest first, each a measured point or a gap.
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
// timing, with its short status words ("Failed build", "No timing · …").
export type HistoryChartGap = {
  readonly kind: "gap";
  readonly key: string;
  readonly date: string;
  readonly status: "failed" | "unavailable";
  readonly words: string;
  readonly selected?: boolean;
};

export type HistoryChartBuild = HistoryChartPoint | HistoryChartGap;

export type HistoryChartSeries = {
  readonly label: string;
  readonly builds: readonly HistoryChartBuild[];
  readonly precise?: boolean;
  readonly selectedLabel?: string;
  readonly reference?: { readonly ms: number; readonly label: string };
};

export const isMeasured = (
  build: HistoryChartBuild,
): build is HistoryChartPoint => build.kind === "point";

// A build without timing's status and short words: "Failed build", or
// "No timing" with its reason's words when it has one.
export const gapStatus = (
  failed: boolean,
  reason?: string,
): Pick<HistoryChartGap, "status" | "words"> =>
  failed
    ? { status: "failed", words: "Failed build" }
    : {
        status: "unavailable",
        words: reason === undefined ? "No timing" : `No timing · ${reason}`,
      };
