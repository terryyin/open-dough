// Intent's story CI comparison read for the local authenticated read
// boundary (`./authenticatedRead.ts`): `intent=ci-comparison` with one story
// `identity`. Resolves baseline, branch and landed endpoints from published
// history (done) or the published claim and live profile (Taken). Malformed
// identities are refused here before any `gh` or Git call. A done story's
// final answer is remembered for this process
// (`./intentCiComparisonAnswers.ts`); Taken answers, unavailable answers and
// answers with unavailable slots are read afresh. Internal Landed pending
// judgment survives public projection and keeps Done answers refreshable.

import { readWaitLimitMs } from "../src/authenticatedReadRules.ts";
import type { StoryCiComparisonAnswer } from "../src/storyCiComparison.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import {
  ciComparisonAnswerKey,
  keptCiComparisonAnswer,
  rememberCiComparisonAnswer,
  type CiComparisonAnswers,
} from "./intentCiComparisonAnswers.ts";
import {
  parseIntentCiComparisonRead,
  type IntentCiComparisonRead,
} from "./intentCiComparisonParse.ts";
import {
  performDoneComparison,
  performTakenComparison,
} from "./intentCiComparisonResolve.ts";
import { answered, type Outcome } from "./readOutcome.ts";
import {
  storyCiComparisonSource,
  type StoryCiComparisonSource,
} from "./storyCiComparisonSource.ts";

export type { IntentCiComparisonRead, StoryCiComparisonAnswer };
export { parseIntentCiComparisonRead };

export function readingIntentCiComparisonOf(
  source: PublishedSource,
  read: IntentCiComparisonRead,
): string {
  return `the CI comparison of ${read.identity} of ${source.repository}`;
}

export async function performIntentCiComparisonRead(
  source: PublishedSource,
  read: IntentCiComparisonRead,
  signal: AbortSignal,
  evidence?: StoryCiComparisonSource,
): Promise<Outcome> {
  return defaultReader(source, read, signal, evidence);
}

const defaultReader = ciComparisonReader({
  get: keptCiComparisonAnswer,
  set: rememberCiComparisonAnswer,
});

// The authenticated reader and isolated owners execute this same read path.
export function ciComparisonReader(
  answers: Pick<CiComparisonAnswers, "get" | "set">,
) {
  return async (
    source: PublishedSource,
    read: IntentCiComparisonRead,
    signal: AbortSignal,
    evidence?: StoryCiComparisonSource,
  ): Promise<Outcome> => {
    const key = ciComparisonAnswerKey(source.repository, read.identity);
    const kept = answers.get(key);
    if (kept !== undefined) return answered(kept);

    const bound = AbortSignal.timeout(readWaitLimitMs);
    const controller = AbortSignal.any([bound, signal]);
    const checkedAt = new Date().toISOString();
    const acquisition = evidence ?? storyCiComparisonSource(source, controller);
    const done = await performDoneComparison(
      acquisition,
      read.identity,
      checkedAt,
    );
    const answer =
      done?.answer ??
      (await performTakenComparison(acquisition, read.identity, checkedAt));
    signal.throwIfAborted();
    if (done?.landedPending !== true) answers.set(key, answer);
    return answered(answer);
  };
}
