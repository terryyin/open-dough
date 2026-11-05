// Reads of a project's Test Optimization Candidates record at a pinned
// revision for the local authenticated read boundary
// (`./authenticatedRead.ts`): one fixed path
// (`.planning/TEST-OPTIMIZATION-CANDIDATES.md`), never a client-supplied
// path (`intent=test-optimization-candidates`). Distinct absent and
// unreadable outcomes; Markdown shape (matched or mismatched) is the
// browser parser's. Modelled on Intent locations (`./intentLocationsRead.ts`).

import { readingPathAt } from "../src/authenticatedReadRules.ts";
import { testOptimizationCandidatesPath } from "../src/testOptimizationCandidatesPath.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import { isNotFound, rateLimitStop } from "./ghFailure.ts";
import type { PinnedTexts } from "./pinnedTexts.ts";
import { answered, type Outcome } from "./readOutcome.ts";
import { readFailureRecovery } from "./readFailureMessage.ts";
import { parsePinnedIntentRead } from "./intentReadParameters.ts";
import type { RefusedParameters } from "./refusedParameters.ts";

export type IntentCandidatesRead = {
  readonly kind: "intent-candidates-at";
  readonly revision: string;
};

const candidatesRefusal =
  "A Test Optimization Candidates read names only a pinned revision.";

// The candidates read a request names, undefined when it names none.
export function parseIntentCandidatesRead(
  params: URLSearchParams,
): IntentCandidatesRead | RefusedParameters | undefined {
  return parsePinnedIntentRead(
    params,
    "test-optimization-candidates",
    "intent-candidates-at",
    candidatesRefusal,
  );
}

// What a candidates read names as being read before any file is.
export function readingIntentCandidatesOf({
  revision,
}: IntentCandidatesRead): string {
  return readingPathAt(testOptimizationCandidatesPath, revision);
}

// Performs one candidates read: the fixed record's text, or absent /
// unreadable when the file is missing or could not be read. Rate limits
// still fail the whole read.
export async function performIntentCandidatesRead(
  pinned: PinnedTexts,
  source: PublishedSource,
  read: IntentCandidatesRead,
  signal: AbortSignal,
  naming: (reading: string) => void,
): Promise<Outcome> {
  const { revision } = read;
  naming(readingPathAt(testOptimizationCandidatesPath, revision));
  try {
    const candidates = await pinned.reader(
      source,
      revision,
      signal,
    )(testOptimizationCandidatesPath);
    return answered({ revision, candidates });
  } catch (error) {
    if (rateLimitStop(error) !== undefined) throw error;
    if (isNotFound(error)) {
      return answered({ revision, candidates: null });
    }
    return answered({
      revision,
      candidates: null,
      candidatesProblem: "unreadable",
      recovery: readFailureRecovery(error),
    });
  }
}
