// Intent's CI status, read through the local authenticated read boundary
// (`../server/intentCiStatusRead.ts`) with `intent=ci-status`: the selected
// check's judgment of the source's configured ref, as the launch's base-CI
// check judges it, with the branch it belongs to and when it was checked
// (`./IntentCiStatus.tsx`). The boundary resolves the branch head itself.

import { z } from "zod";
import { authenticatedGet, unexpectedAnswer } from "./authenticatedGet.ts";
import { readingCiStatusOf } from "./authenticatedReadRules.ts";
import { baseCiFoundSchema, baseCiStates } from "./baseCiConfirmation.ts";
import type { PublishedSource } from "./publishedSource.ts";

// The launch's base-CI answer (`./baseCiConfirmation.ts`) with a passing
// state possible and when it was checked.
const ciStatus = baseCiFoundSchema.omit({ kind: true }).extend({
  checkedAt: z.iso.datetime(),
  state: z.enum(["pass", ...baseCiStates]),
});

export type IntentCiStatus = z.infer<typeof ciStatus>;

// The trunk's CI status of `source`; a read problem when the boundary could
// not answer at all.
export async function readIntentCiStatus(
  source: PublishedSource,
  signal: AbortSignal,
): Promise<IntentCiStatus> {
  const reading = readingCiStatusOf(source.ref, source.repository);
  const body = await authenticatedGet(
    `source=${encodeURIComponent(source.id)}&intent=ci-status`,
    reading,
    signal,
  );
  const parsed = ciStatus.safeParse(body);
  if (!parsed.success || parsed.data.branch !== source.ref) {
    throw unexpectedAnswer(reading);
  }
  return parsed.data;
}
