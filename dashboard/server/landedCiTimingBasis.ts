// Refresh only the wall interval of the same retained attempt. Its original
// selection, verdict, proof and identity survive concurrent/stale collectors.
import { buildKeyOf } from "../src/landedCiBuildKey.ts";
import { hasAttemptTiming } from "../src/ciAttemptTiming.ts";
import type { KeptBuild } from "./landedCiObservation.ts";

export function withRefreshedAttemptTiming(
  held: KeptBuild | undefined,
  incoming: KeptBuild,
): KeptBuild {
  if (held === undefined) return incoming;
  if (
    hasAttemptTiming(held) ||
    !hasAttemptTiming(incoming) ||
    held.revision !== incoming.revision ||
    held.state !== incoming.state ||
    buildKeyOf(held) !== buildKeyOf(incoming)
  )
    return held;
  return {
    ...held,
    startedAt: incoming.startedAt,
    completedAt: incoming.completedAt,
    timingBasis: incoming.timingBasis,
  };
}
