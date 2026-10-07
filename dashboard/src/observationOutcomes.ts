// Settled read outcomes for one active published observation
// (`./publishedObservation.ts`): each question's validated success, established
// absence, terminal failure, or interruption by the owned wait bound
// (`./readWaitBound.ts`). Failures are retained as typed meaning for recovery,
// never as cached content; successful answers stay in the existing pinned and
// browser file caches. Scope is the observation and its pinned revision: a
// new project or a different revision clears it. Departure without the bound
// does not settle a question.

import { gapCauseOf, type GapCause } from "./readWaitBound.ts";

// Existing read operations the local boundary already names, plus the listing
// reads that collect several paths under one ask.
export type ReadOperation =
  | "ref"
  | "backlog"
  | "file"
  | "commit-time"
  | "profiles"
  | "done-records"
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

  // A newly shown membership at another revision abandons prior outcomes;
  // the same revision keeps them for selective recovery.
  pinRevision(revision: string): void {
    if (this.pinnedRevision !== undefined && this.pinnedRevision !== revision) {
      this.settled.clear();
    }
    this.pinnedRevision = revision;
  }

  // Another project is observed, or the observation is cleared.
  clear(): void {
    this.settled.clear();
    this.pinnedRevision = undefined;
  }
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

// How a resolved ask maps to a settled outcome; the question may gain a head
// or revision only known after success.
export type AskSettlement =
  | { readonly kind: "answered"; readonly question?: ReadQuestion }
  | { readonly kind: "missing"; readonly question?: ReadQuestion };

// Settles a shared ask when it answers, establishes absence, or fails with a
// typed gap cause. Failure uses the question known before the ask.
export function trackSettledAsk<T>(
  outcomes: ObservationOutcomes,
  ask: Promise<T>,
  settle: {
    readonly question: ReadQuestion;
    readonly of?: (value: T) => AskSettlement | "answered" | "missing";
    readonly untilEither: AbortSignal;
    readonly bound: AbortSignal;
    readonly reading: string;
    readonly unreadable: string;
  },
): Promise<T> {
  return ask.then(
    (value) => {
      const result = settle.of?.(value) ?? "answered";
      if (result === "answered") {
        settleAnswered(outcomes, settle.question);
      } else if (result === "missing") {
        settleMissing(outcomes, settle.question);
      } else if (result.kind === "answered") {
        settleAnswered(outcomes, result.question ?? settle.question);
      } else {
        settleMissing(outcomes, result.question ?? settle.question);
      }
      return value;
    },
    (error: unknown) => {
      settleGapCause(
        outcomes,
        settle.question,
        gapCauseOf(
          error,
          settle.untilEither,
          settle.bound,
          settle.reading,
          settle.unreadable,
        ),
      );
      throw error;
    },
  );
}
