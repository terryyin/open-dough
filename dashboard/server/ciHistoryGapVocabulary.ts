// The history wire contract keeps the reader already open before deployment
// usable. Newly named final reasons require an explicit reader capability;
// internal collection and reference calculations keep their specific reasons.
import type { LandedCiEntry } from "../src/landedCiHistory.ts";

// The final-gap vocabulary of the prior deployed reader (49367c2e4).
const priorGapReasons = new Set<string>([
  "failed",
  "cancelled",
  "no-build",
  "no-equivalent",
  "no-proof",
  "expired",
  "unreadable",
  "not-recorded",
  "unclassified",
  "identity",
]);

export function readableHistoryEntries(
  entries: readonly LandedCiEntry[],
  gapReasons?: "timing-basis",
): LandedCiEntry[] {
  return entries.map((entry) =>
    entry.kind === "gap" &&
    entry.reason !== "pending" &&
    !priorGapReasons.has(entry.reason) &&
    !(gapReasons === "timing-basis" && entry.reason === "timing-basis")
      ? { ...entry, reason: "not-recorded" }
      : entry,
  );
}
