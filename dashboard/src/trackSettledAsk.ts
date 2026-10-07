// Settles a shared ask against the observation's outcome owner
// (`./observationOutcomes.ts`) when it answers, establishes absence, or fails
// with a typed gap cause.

import { gapCauseOf } from "./readWaitBound.ts";
import {
  settleAnswered,
  settleGapCause,
  settleMissing,
  type ObservationOutcomes,
  type ReadQuestion,
} from "./observationOutcomes.ts";

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
