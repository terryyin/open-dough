// Intent's CI proof, read through the local authenticated read boundary
// (`../server/intentCiProofRead.ts`) with `intent=ci-proof`: the proof of
// the one attempt a CI status judgment names (`./IntentCiProof.tsx`), keyed
// by a GitHub Actions run's id, attempt and revision, or by a ciAdapter
// attempt's run, attempt id, discovered branch and revision. An answer for
// any other attempt or revision than the one asked is refused, never shown.

import { z } from "zod";
import { authenticatedGet, unexpectedAnswer } from "./authenticatedGet.ts";
import { readingCiProofOf } from "./authenticatedReadRules.ts";
import {
  ciProofSchema,
  isAdapterProofAttempt,
  type CiProof,
  type CiProofSubject,
} from "./ciProof.ts";
import type { PublishedSource } from "./publishedSource.ts";

const ciProofAnswer = z.object({
  runId: z.union([z.number().int().positive(), z.string().min(1)]),
  runAttempt: z.number().int().positive().optional(),
  attemptId: z.string().min(1).optional(),
  branch: z.string().min(1).optional(),
  revision: z.string().min(1),
  checkedAt: z.iso.datetime(),
  proof: ciProofSchema,
});

function queryOf(subject: CiProofSubject): string {
  if (!isAdapterProofAttempt(subject))
    return `run=${String(subject.runId)}&attempt=${String(subject.runAttempt)}&revision=${subject.revision}`;
  return new URLSearchParams({
    run: subject.runId,
    "attempt-id": subject.attemptId,
    "run-branch": subject.branch,
    revision: subject.revision,
  }).toString();
}

// The proof of `subject` of `source`; a read problem when the boundary could
// not answer at all, or answered for another attempt.
export async function readIntentCiProof(
  source: PublishedSource,
  subject: CiProofSubject,
  signal: AbortSignal,
): Promise<CiProof> {
  const reading = readingCiProofOf(subject, source.repository);
  const body = await authenticatedGet(
    `source=${encodeURIComponent(source.id)}&intent=ci-proof&${queryOf(subject)}`,
    reading,
    signal,
  );
  const parsed = ciProofAnswer.safeParse(body);
  const named = (answer: z.infer<typeof ciProofAnswer>) =>
    isAdapterProofAttempt(subject)
      ? answer.attemptId === subject.attemptId &&
        answer.branch === subject.branch
      : answer.runAttempt === subject.runAttempt;
  if (
    !parsed.success ||
    parsed.data.runId !== subject.runId ||
    !named(parsed.data) ||
    parsed.data.revision !== subject.revision
  ) {
    throw unexpectedAnswer(reading);
  }
  return parsed.data.proof;
}
