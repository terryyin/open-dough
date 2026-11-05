// Test Optimization Candidates published beside the backlog, read through
// the local authenticated read boundary (`../server/authenticatedRead.ts`)
// at a revision already resolved: with `intent=test-optimization-candidates`,
// the fixed record path's text, or distinct absent / unreadable outcomes
// (`./IntentCandidatesRecord.tsx`). An absent or present record is asked
// once per page per revision (`./answerMemo.ts`); a failed read or an
// unreadable record is asked again.

import { z } from "zod";
import {
  authenticatedGet,
  commitSha,
  transientReadRecovery,
  unexpectedAnswer,
} from "./authenticatedGet.ts";
import { keptAnswer, memoizedAnswer } from "./answerMemo.ts";
import { readingPathAt } from "./authenticatedReadRules.ts";
import type { PublishedSource } from "./publishedSource.ts";
import { testOptimizationCandidatesPath } from "./testOptimizationCandidatesPath.ts";

const okCandidates = z.object({
  revision: commitSha,
  candidates: z.string().nullable(),
  candidatesProblem: z.literal("unreadable").optional(),
  recovery: transientReadRecovery,
});

export type IntentCandidatesReadResult =
  | { readonly status: "absent" }
  | {
      readonly status: "unreadable";
      readonly recovery: z.infer<typeof transientReadRecovery>;
    }
  | { readonly status: "present"; readonly text: string };

const candidatesQuery = (source: PublishedSource, revision: string) =>
  `source=${encodeURIComponent(source.id)}&revision=${encodeURIComponent(revision)}&intent=test-optimization-candidates`;

// The candidates record published at `revision` already read on this page.
export function keptIntentCandidatesAt(
  source: PublishedSource,
  revision: string,
): IntentCandidatesReadResult | undefined {
  return keptAnswer(candidatesQuery(source, revision)) as
    IntentCandidatesReadResult | undefined;
}

// The candidates record published at `revision`, or absent / unreadable when
// the fixed path is missing or could not be read.
export function readIntentCandidatesAt(
  source: PublishedSource,
  revision: string,
  signal: AbortSignal,
): Promise<IntentCandidatesReadResult> {
  const query = candidatesQuery(source, revision);
  return memoizedAnswer(
    query,
    (shared) => askIntentCandidatesAt(query, revision, shared),
    signal,
    (read) => read.status !== "unreadable",
  );
}

async function askIntentCandidatesAt(
  query: string,
  revision: string,
  signal: AbortSignal,
): Promise<IntentCandidatesReadResult> {
  const reading = readingPathAt(testOptimizationCandidatesPath, revision);
  const body = await authenticatedGet(query, reading, signal);
  const parsed = okCandidates.safeParse(body);
  if (!parsed.success || parsed.data.revision !== revision) {
    throw unexpectedAnswer(reading);
  }
  if (parsed.data.candidatesProblem !== undefined) {
    if (parsed.data.candidates !== null) {
      throw unexpectedAnswer(reading);
    }
    return { status: "unreadable", recovery: parsed.data.recovery };
  }
  return parsed.data.candidates === null
    ? { status: "absent" }
    : { status: "present", text: parsed.data.candidates };
}
