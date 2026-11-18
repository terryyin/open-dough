// Frozen previous deployed reader from Open Dough 49367c2e4.
// Preserve its independent response/gap vocabulary; only supporting imports
// are relocated to the unchanged shared validators in dashboard/src.
// Shared readable reasons for retained project history gaps.
import type {
  LandedCiGap,
  PendingWait,
  FinalGapReason,
} from "./landedCiHistory.ts";

// What a pending gap waits for, said as not measured yet: a pending landing
// has no CI wall time until collection finds it final.
const pendingWords: Readonly<Record<PendingWait, string>> = {
  run: "no CI run yet",
  build: "CI queued or running",
  "later-build": "waiting for a later trunk build",
  proof: "CI proof not read yet",
  read: "CI not read yet",
  order: "local landing order unavailable",
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
  unclassified: "Historical CI evidence unavailable",
  identity: "Retained adapter attempt identity unavailable",
};

// Why a gap has no CI wall time: "Pending · CI queued or running" while it
// may still be measured; "Failed", "No build" and the like once it never
// will be.
export function gapReasonWords(gap: LandedCiGap): string {
  if (gap.reason === "unclassified" || gap.reason === "identity")
    return gap.explanation ?? finalWords[gap.reason];
  return gap.reason === "pending"
    ? `Pending · ${pendingWords[gap.waitsFor]}`
    : finalWords[gap.reason];
}
