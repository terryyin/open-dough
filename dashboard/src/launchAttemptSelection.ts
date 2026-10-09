// Select unresolved retained attempts independently of launch result schemas.
import type { AttemptObservation } from "./launchOutcome.ts";

// Whether an accepted attempt needs reconciliation before its story's
// startup is known: unsettled while no server runs it, or settled while its
// session or its publication may or may not exist. Elapsed time never
// settles it; recheck or continuation does.
export function needsReconciliation(attempt: AttemptObservation): boolean {
  return attempt.outcome === undefined
    ? !attempt.owned
    : attempt.outcome.kind === "uncertain" ||
        attempt.publication.kind === "unknown";
}

export const laterAttempt = (
  one: AttemptObservation | undefined,
  other: AttemptObservation,
): AttemptObservation =>
  one === undefined || one.acceptedAt < other.acceptedAt ? other : one;

// A story's unresolved attempt among its attempts on this machine (`ofStory`),
// which no fresh start of that story may duplicate and only its own
// continuation resumes: one a server runs now, else one that never settled
// and no server runs, else its latest attempt when that needs reconciliation.
export function unresolvedAttempt(
  ofStory: readonly AttemptObservation[],
): AttemptObservation | undefined {
  const unsettled = ofStory.filter((attempt) => attempt.outcome === undefined);
  const latest = ofStory.reduce<AttemptObservation | undefined>(
    laterAttempt,
    undefined,
  );
  return (
    unsettled.find((attempt) => attempt.owned) ??
    unsettled[0] ??
    (latest !== undefined && needsReconciliation(latest) ? latest : undefined)
  );
}
