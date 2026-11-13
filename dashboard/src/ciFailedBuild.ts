// The one failed-build rule of every CI history chart and readout: a build
// the dashboard knows failed, from a retained build's state or a landing's
// final failed gap, reads "Failed build" with the failed status; any other
// build without timing reads "No timing" with its reason. Where the state is
// known, the read carries that status beside the reason, so no reader decides
// it from a reason's words.
import { z } from "zod";
import type { LandedCiGap } from "./landedCiHistory.ts";

export const failedBuildWords = "Failed build";

export const timingGapStatusSchema = z.enum(["failed", "unavailable"]);
export type TimingGapStatus = z.infer<typeof timingGapStatusSchema>;

// Whether the dashboard knows the build failed: its retained state, or the
// final reason of the landing gap that stands for it.
export const isKnownFailed = (
  known:
    | { readonly state: "pass" | "failed" }
    | { readonly reason: LandedCiGap["reason"] },
): boolean => ("state" in known ? known.state : known.reason) === "failed";

export const gapStatusOf = (failed: boolean | undefined): TimingGapStatus =>
  failed === true ? "failed" : "unavailable";

// A build without timing's status and short words: "Failed build", or
// "No timing" with its reason's words when it has one.
export const gapStatus = (
  failed: boolean | undefined,
  reason?: string,
): { readonly status: TimingGapStatus; readonly words: string } => {
  const status = gapStatusOf(failed);
  return {
    status,
    words:
      status === "failed"
        ? failedBuildWords
        : reason === undefined
          ? "No timing"
          : `No timing · ${reason}`,
  };
};
