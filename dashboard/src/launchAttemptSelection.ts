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

// An attempt's lane: its project's story, or its project's ad hoc sessions,
// whose latest attempt the page's startup, reconciliation and recovery read.
const laneOf = ({ request }: AttemptObservation) =>
  JSON.stringify([
    request.source,
    request.workflow === "ad-hoc" ? null : request.identity,
  ]);

// Whether an attempt never settled, unless its session completed.
const unsettled = (attempt: AttemptObservation) =>
  attempt.outcome === undefined && attempt.completion?.outcome !== "completed";

// The attempts among `known` that still need attention, which the machine's
// sessions overview carries; the rest are its history
// (`./machineSessionsRevision.ts`). Every attempt a server runs or that never
// settled, as `unresolvedAttempt` reads them, and the latest and first
// attempts of each lane that holds one of those, whose latest attempt needs
// reconciliation, or whose latest is a story's attempt no page has yet
// reconciled with the published snapshot (`./startupReconciliation.ts`). So
// each lane read from the overview has the same latest attempt as read from
// all of them, and its stories are listed in the same order.
export function attemptsNeedingAttention(
  known: readonly AttemptObservation[],
): ReadonlySet<AttemptObservation> {
  const lanes = new Map<string, AttemptObservation[]>();
  for (const attempt of known) {
    const lane = laneOf(attempt);
    const ofLane = lanes.get(lane);
    if (ofLane === undefined) lanes.set(lane, [attempt]);
    else ofLane.push(attempt);
  }
  const attending = new Set<AttemptObservation>();
  for (const ofLane of lanes.values()) {
    const open = ofLane.filter(
      (attempt) => attempt.running || unsettled(attempt),
    );
    for (const attempt of open) attending.add(attempt);
    const latest = ofLane.reduce(laterAttempt);
    if (
      open.length > 0 ||
      needsReconciliation(latest) ||
      (latest.request.workflow !== "ad-hoc" &&
        latest.reconciledAt === undefined)
    ) {
      attending.add(latest);
      attending.add(ofLane[0] ?? latest);
    }
  }
  return attending;
}

// A story's unresolved attempt among its attempts on this machine (`ofStory`),
// which no fresh start of that story may duplicate and only its own
// continuation resumes: one a server runs now, else one that never settled
// and no server runs, else its latest attempt when that needs reconciliation.
export function unresolvedAttempt(
  ofStory: readonly AttemptObservation[],
): AttemptObservation | undefined {
  const unsettledOfStory = ofStory.filter(unsettled);
  const latest = ofStory.reduce<AttemptObservation | undefined>(
    laterAttempt,
    undefined,
  );
  return (
    unsettledOfStory.find((attempt) => attempt.running) ??
    unsettledOfStory[0] ??
    (latest !== undefined && needsReconciliation(latest) ? latest : undefined)
  );
}
