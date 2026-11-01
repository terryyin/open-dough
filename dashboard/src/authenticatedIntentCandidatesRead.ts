// Test Optimization Candidates published beside the backlog, read through
// the local authenticated read boundary (`../server/authenticatedRead.ts`)
// at a revision already resolved: with `intent=test-optimization-candidates`,
// the fixed record path's text, or distinct absent / unreadable outcomes
// (`./IntentCandidatesRecord.tsx`).

import { z } from "zod";
import {
  authenticatedGet,
  commitSha,
  unexpectedAnswer,
} from "./authenticatedGet.ts";
import { readingPathAt } from "./authenticatedReadRules.ts";
import type { PublishedSource } from "./publishedSource.ts";
import { testOptimizationCandidatesPath } from "./testOptimizationCandidatesPath.ts";

const okCandidates = z.object({
  revision: commitSha,
  candidates: z.string().nullable(),
  candidatesProblem: z.literal("unreadable").optional(),
});

export type IntentCandidatesReadResult =
  | { readonly status: "absent" }
  | { readonly status: "unreadable" }
  | { readonly status: "present"; readonly text: string };

// The candidates record published at `revision`, or absent / unreadable when
// the fixed path is missing or could not be read.
export async function readIntentCandidatesAt(
  source: PublishedSource,
  revision: string,
  signal: AbortSignal,
): Promise<IntentCandidatesReadResult> {
  const reading = readingPathAt(testOptimizationCandidatesPath, revision);
  const body = await authenticatedGet(
    `source=${encodeURIComponent(source.id)}&revision=${encodeURIComponent(revision)}&intent=test-optimization-candidates`,
    reading,
    signal,
  );
  const parsed = okCandidates.safeParse(body);
  if (!parsed.success || parsed.data.revision !== revision) {
    throw unexpectedAnswer(reading);
  }
  if (parsed.data.candidatesProblem !== undefined) {
    if (parsed.data.candidates !== null) {
      throw unexpectedAnswer(reading);
    }
    return { status: "unreadable" };
  }
  return parsed.data.candidates === null
    ? { status: "absent" }
    : { status: "present", text: parsed.data.candidates };
}
