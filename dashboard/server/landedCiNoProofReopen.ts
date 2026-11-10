// Retained final equivalent `No CI proof summary` gaps reopen once under
// timed wall-time reuse without proof (`./exactSkippedEquivalent.ts`).
import type { Observation } from "./landedCiObservation.ts";

// Final `No CI proof summary` for a confirmed skip naming its equivalent
// build, not yet settled under timed wall-time reuse without proof.
export function reopenableRetainedNoProofSkip(
  held: Observation,
): held is Extract<Observation, { kind: "gap"; reason: "no-proof" }> {
  return (
    held.kind === "gap" &&
    held.reason === "no-proof" &&
    held.build?.provenance === "equivalent" &&
    held.reuseSettled !== true
  );
}

// After reopening a retained no-proof skip, mark a still-unmeasured
// equivalent no-proof gap settled so the next pass leaves it final.
export function observationAfterNoProofReopen(
  held: Observation | undefined,
  observed: Observation,
): Observation {
  if (
    held === undefined ||
    !reopenableRetainedNoProofSkip(held) ||
    observed.kind !== "gap" ||
    observed.reason !== "no-proof" ||
    observed.build?.provenance !== "equivalent"
  )
    return observed;
  return { ...observed, reuseSettled: true };
}
