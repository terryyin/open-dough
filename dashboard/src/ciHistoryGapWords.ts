// Shared readable reasons for retained project history gaps.
import { unverifiedAttemptTiming } from "./ciAttemptTiming.ts";
import type {
  FinalGap,
  PendingGap,
  PendingWait,
  FinalGapReason,
} from "./landedCiHistory.ts";

// What a pending gap waits for, said as not measured yet: a pending landing
// has no CI wall time until collection finds it final. Reference exclusion for
// an absent kept measure uses the same wait words without the Pending frame.
export const pendingWaitWords: Readonly<Record<PendingWait, string>> = {
  run: "no CI run yet",
  build: "CI queued or running",
  "later-build": "waiting for a later trunk build",
  proof: "CI proof not read yet",
  read: "CI not read yet",
  order: "local landing order unavailable",
  "time-without-runner-waits": "CI time without runner waits not read yet",
};

// Why a final gap will never have a CI wall time.
const finalWords: Readonly<Record<FinalGapReason, string>> = {
  failed: "Failed",
  cancelled: "Cancelled",
  "no-build": "No build",
  "no-equivalent": "Equivalent timing unavailable",
  "no-proof": "No CI proof summary",
  expired: "CI proof expired",
  unreadable: "CI proof unreadable",
  "not-recorded": "CI wall time not recorded",
  "timing-basis": unverifiedAttemptTiming,
  "time-without-runner-waits": "CI time without runner waits unavailable",
  unclassified: "Historical CI evidence unavailable",
  identity: "Retained adapter attempt identity unavailable",
};

// Why a gap has no CI wall time or scope timing: "Pending · CI queued or
// running" while it may still be measured; "Failed", "No build" and the like
// once it never will be.
export function gapReasonWords(
  gap:
    | Pick<PendingGap, "reason" | "waitsFor">
    | Pick<FinalGap, "reason" | "explanation">,
): string {
  if (
    gap.reason === "unclassified" ||
    gap.reason === "identity" ||
    gap.reason === "time-without-runner-waits"
  )
    return gap.explanation ?? finalWords[gap.reason];
  return gap.reason === "pending"
    ? `Pending · ${pendingWaitWords[gap.waitsFor]}`
    : finalWords[gap.reason];
}
