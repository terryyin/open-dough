// Intent's story CI comparison read for the local authenticated read
// boundary (`./authenticatedRead.ts`): `intent=ci-comparison` with one story
// `identity`. Resolves baseline, branch and landed endpoints from published
// history (done) or the published claim and live profile (Taken). Malformed
// identities are refused here before any `gh` or Git call. A done story's
// final answer is remembered for this process
// (`./intentCiComparisonAnswers.ts`); Taken answers, unavailable answers and
// answers with unavailable slots are read afresh. Done resolution also carries
// the shared Landed pending judgment separately from the public answer, before
// projection drops internal proof detail; pending Landed answers stay live.

import { readWaitLimitMs } from "../src/authenticatedReadRules.ts";
import type { StoryCiComparisonAnswer } from "../src/storyCiComparison.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import {
  ciComparisonAnswerKey,
  keptCiComparisonAnswer,
  rememberCiComparisonAnswer,
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
): Promise<Outcome> {
  const key = ciComparisonAnswerKey(source.repository, read.identity);
  const kept = keptCiComparisonAnswer(key);
  if (kept !== undefined) return answered(kept);

  const bound = AbortSignal.timeout(readWaitLimitMs);
  const controller = AbortSignal.any([bound, signal]);
  const checkedAt = new Date().toISOString();
  const done = await performDoneComparison(
    source,
    read.identity,
    controller,
    checkedAt,
  );
  const answer =
    done?.answer ??
    (await performTakenComparison(
      source,
      read.identity,
      controller,
      checkedAt,
    ));
  signal.throwIfAborted();
  if (done?.landedPending !== true) rememberCiComparisonAnswer(key, answer);
  return answered(answer);
}
