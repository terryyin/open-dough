// A dated series for the shared CI wall-time and scope execution-time chart:
// every build in history order, oldest first, each a measured point or a gap.
import { failedBuildReason } from "./ciScopeHistory.ts";

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

// A failed build's status words, also its wall-time reference reason
// (`../server/ciWallTimeReference.ts`).
export const failedBuildWords = "Failed build";

// A build without timing's status and short words: "Failed build", or
// "No timing" with its reason's words when it has one.
export const gapStatus = (
  failed: boolean,
  reason?: string,
): Pick<HistoryChartGap, "status" | "words"> =>
  failed
    ? { status: "failed", words: failedBuildWords }
    : {
        status: "unavailable",
        words: reason === undefined ? "No timing" : `No timing · ${reason}`,
      };

// A reference's selected timing reason as status and short words: a failed
// build's wall-time or scope reason reads "Failed build"; any other reads
// "No timing" with the reason as its reader words it. Scope history marks
// carry their typed status instead.
export const reasonStatus = (
  reason: string | undefined,
  words: (reason: string) => string = (reason) => reason,
) =>
  gapStatus(
    reason === failedBuildWords || reason === failedBuildReason,
    reason === undefined ? undefined : words(reason),
  );
