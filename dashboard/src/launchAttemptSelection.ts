// Select unresolved retained attempts independently of launch result schemas.
import type { AttemptObservation } from "./launchOutcome.ts";

// A known publication whose required receipt could not be kept stops before
// any native launch. Continue retries its recording checkpoint.
export function publicationRecordingStopped(
  attempt: Pick<AttemptObservation, "publication" | "outcome"> | undefined,
): attempt is Pick<AttemptObservation, "publication" | "outcome"> & {
  outcome: Extract<
    NonNullable<AttemptObservation["outcome"]>,
    { kind: "failed" }
  >;
} {
  return (
    attempt?.publication.kind === "published" &&
    attempt.outcome?.kind === "failed" &&
    attempt.outcome.reason === "unrecorded"
  );
}

// A definite failure whose established unattached start remains resumable.
// This says nothing uncertain about native session existence.
export const sessionStartRetained = (
  attempt: Pick<AttemptObservation, "outcome"> | undefined,
): boolean =>
  attempt?.outcome?.kind === "failed" &&
  attempt.outcome.sessionStartKept === true;

// Incomplete launch-workspace Open Dough support: Update worktree and retry
// or Continue after the developer restores the install.
export const worktreeUpdateNeeded = (
  attempt: Pick<AttemptObservation, "outcome"> | undefined,
): boolean =>
  attempt?.outcome?.kind === "failed" &&
  attempt.outcome.worktreeUpdateNeeded === true;

// Whether an accepted attempt needs reconciliation: unsettled while no
// server runs it, uncertain session or publication, a required receipt that
// failed, a definite failure with an established session start kept, or
// incomplete worktree install recovery. Elapsed time never settles it;
// recheck, continuation, update-and-retry, or completed session evidence does.
export function needsReconciliation(attempt: AttemptObservation): boolean {
  if (attempt.completion?.outcome === "completed") return false;
  return attempt.outcome === undefined
    ? !attempt.running
    : attempt.outcome.kind === "uncertain" ||
        attempt.publication.kind === "unknown" ||
        publicationRecordingStopped(attempt) ||
        sessionStartRetained(attempt) ||
        worktreeUpdateNeeded(attempt);
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
  const unsettled = ofStory.filter(
    (attempt) =>
      attempt.outcome === undefined &&
      attempt.completion?.outcome !== "completed",
  );
  const latest = ofStory.reduce<AttemptObservation | undefined>(
    laterAttempt,
    undefined,
  );
  return (
    unsettled.find((attempt) => attempt.running) ??
    unsettled[0] ??
    (latest !== undefined && needsReconciliation(latest) ? latest : undefined)
  );
}
