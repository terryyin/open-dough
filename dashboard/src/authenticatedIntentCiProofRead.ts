// Intent's CI proof, read through the local authenticated read boundary
// (`../server/intentCiProofRead.ts`) with `intent=ci-proof`: the proof of
// the one GitHub Actions run attempt a CI status judgment names, keyed by
// its run id, attempt and revision (`./IntentCiProof.tsx`). An answer for any
// other run, attempt or revision than the one asked is refused, never shown.

import { z } from "zod";
import { authenticatedGet, unexpectedAnswer } from "./authenticatedGet.ts";
import { readingCiProofOf } from "./authenticatedReadRules.ts";
import { ciProofSchema, type CiProof, type CiProofRun } from "./ciProof.ts";
import type { PublishedSource } from "./publishedSource.ts";

const ciProofAnswer = z.object({
  runId: z.number().int().positive(),
  runAttempt: z.number().int().positive(),
  revision: z.string().min(1),
  checkedAt: z.iso.datetime(),
  proof: ciProofSchema,
});

// The proof of `run` of `source`; a read problem when the boundary could not
// answer at all, or answered for another run.
export async function readIntentCiProof(
  source: PublishedSource,
  run: CiProofRun,
  signal: AbortSignal,
): Promise<CiProof> {
  const reading = readingCiProofOf(run, source.repository);
  const body = await authenticatedGet(
    `source=${encodeURIComponent(source.id)}&intent=ci-proof&run=${String(run.runId)}&attempt=${String(run.runAttempt)}&revision=${run.revision}`,
    reading,
    signal,
  );
  const parsed = ciProofAnswer.safeParse(body);
  if (
    !parsed.success ||
    parsed.data.runId !== run.runId ||
    parsed.data.runAttempt !== run.runAttempt ||
    parsed.data.revision !== run.revision
  ) {
    throw unexpectedAnswer(reading);
  }
  return parsed.data.proof;
}
