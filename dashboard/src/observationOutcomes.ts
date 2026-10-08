// Settled read outcomes for one active published observation
// (`./publishedObservation.ts`): each question's validated success, established
// absence, terminal failure, or interruption by the owned wait bound
// (`./readWaitBound.ts`). Failures are retained as typed meaning for recovery,
// never as cached content; successful answers stay in the existing pinned and
// browser file caches. Scope is the observation and its pinned revision: a
// new project or a different revision clears it. Departure without the bound
// does not settle a question.

import type { GapCause } from "./readWaitBound.ts";

// Existing read operations the local boundary already names, plus the listing
// reads that collect several paths under one ask.
export type ReadOperation =
  | "ref"
  | "backlog"
  | "file"
  | "commit-time"
  | "profiles"
  | "done-catalog"
  | "addition"
  | "branch-head"
  | "branch-file";

// One question of the observation: configured source, pinned revision/head
// when known, and the existing operation/path.
export type ReadQuestion = {
  readonly sourceId: string;
  readonly revision?: string;
  readonly head?: string;
  readonly operation: ReadOperation;
  readonly path?: string;
};

export type SettledOutcome =
  | { readonly kind: "answered" }
  | { readonly kind: "missing" }
  | {
      readonly kind: "failed";
      readonly message: string;
      readonly resumesAt?: Date;
      readonly recovery?: "transient";
    }
  | {
      // Interrupted by the owned wait bound, not caller departure.
      readonly kind: "bound";
      readonly message: string;
      readonly recovery: "transient";
    };

function questionKey({
  sourceId,
  revision,
  head,
  operation,
  path,
}: ReadQuestion): string {
  return [sourceId, revision ?? "", head ?? "", operation, path ?? ""].join(
    "\0",
  );
}

// Eligible for the observation's project-local recovery: owned-bound
// interruption or a typed transient failure. Answered, missing, and
// non-retryable failures are not.
export function isEligibleUnanswered(
  outcome: SettledOutcome | undefined,
): boolean {
  return (
    outcome?.kind === "bound" ||
    (outcome?.kind === "failed" && outcome.recovery === "transient")
  );
}

export class ObservationOutcomes {
  private readonly settled = new Map<string, SettledOutcome>();
  private pinnedRevision: string | undefined;

  // Outcomes retained for the observation's current pinned revision, if any.
  of(question: ReadQuestion): SettledOutcome | undefined {
    return this.settled.get(questionKey(question));
  }

  settle(question: ReadQuestion, outcome: SettledOutcome): void {
    this.settled.set(questionKey(question), outcome);
  }

  // Whether any settled question still needs a recovery ask.
  hasEligibleUnanswered(): boolean {
    for (const outcome of this.settled.values()) {
      if (isEligibleUnanswered(outcome)) {
        return true;
      }
    }
    return false;
  }

  // A newly shown membership at another revision abandons prior outcomes;
  // the same revision keeps them for selective recovery. The first pin also
  // drops pre-membership questions (ref/backlog asked before the revision
  // was known) so an empty-page recovery does not keep their failures.
  pinRevision(revision: string): void {
    if (this.pinnedRevision !== undefined && this.pinnedRevision !== revision) {
      this.settled.clear();
    } else if (this.pinnedRevision === undefined) {
      for (const key of [...this.settled.keys()]) {
        const pinned = key.split("\0")[1] ?? "";
        if (pinned !== revision) {
          this.settled.delete(key);
        }
      }
    }
    this.pinnedRevision = revision;
  }

  // Another project is observed, or the observation is cleared.
  clear(): void {
    this.settled.clear();
    this.pinnedRevision = undefined;
  }
}

// Whether a fresh read should reach GitHub for this question. Answered,
// missing, and terminal non-limit failures stay settled for this pin.
// Eligible transient failures and rate-limit gaps (resumesAt) are asked
// again; the latter ride the existing rate-limit recovery, not the
// project-local transient schedule.
export function shouldAsk(
  outcomes: ObservationOutcomes,
  question: ReadQuestion,
): boolean {
  const settled = outcomes.of(question);
  if (settled === undefined || isEligibleUnanswered(settled)) {
    return true;
  }
  return settled.kind === "failed" && settled.resumesAt !== undefined;
}

// Public gap wording stays the caller's; typed meaning comes from the settled
// outcome so recovery does not re-ask this pin. Answered outcomes project no
// gap.
export function gapCauseFromOutcome(
  outcome: SettledOutcome,
  problem: string,
): GapCause | undefined {
  if (outcome.kind === "answered") {
    return undefined;
  }
  if (outcome.kind === "missing") {
    return { problem };
  }
  if (outcome.kind === "bound") {
    return { problem, bound: true, recovery: "transient" };
  }
  return {
    problem,
    ...(outcome.resumesAt !== undefined
      ? { resumesAt: outcome.resumesAt }
      : {}),
    ...(outcome.recovery !== undefined ? { recovery: outcome.recovery } : {}),
  };
}

// Records a validated success without storing its content.
export function settleAnswered(
  outcomes: ObservationOutcomes,
  question: ReadQuestion,
): void {
  outcomes.settle(question, { kind: "answered" });
}

// Records a validated established absence (not a failure to ask again as if
// unknown).
export function settleMissing(
  outcomes: ObservationOutcomes,
  question: ReadQuestion,
): void {
  outcomes.settle(question, { kind: "missing" });
}

// Records a typed failure or owned-bound interruption from a gap cause.
// Caller departure without the bound settles nothing.
export function settleGapCause(
  outcomes: ObservationOutcomes,
  question: ReadQuestion,
  cause: GapCause,
): void {
  if (cause.departed) {
    return;
  }
  if (cause.bound) {
    outcomes.settle(question, {
      kind: "bound",
      message: cause.problem,
      recovery: "transient",
    });
    return;
  }
  outcomes.settle(question, {
    kind: "failed",
    message: cause.problem,
    ...(cause.resumesAt !== undefined ? { resumesAt: cause.resumesAt } : {}),
    ...(cause.recovery !== undefined ? { recovery: cause.recovery } : {}),
  });
}

export type { AskSettlement } from "./trackSettledAsk.ts";
export { trackSettledAsk } from "./trackSettledAsk.ts";
