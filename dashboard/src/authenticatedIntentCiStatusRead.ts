// Intent's CI status, read through the local authenticated read boundary
// (`../server/intentCiStatusRead.ts`) with `intent=ci-status`: the selected
// check's judgment of one branch, the source's configured ref unless a story
// branch is named as `judged`, as the launch's base-CI check judges it, with
// the branch it belongs to and when it was checked (`./IntentCiStatus.tsx`).
// The boundary resolves the branch head itself. An answer naming any other
// branch than the one asked is refused, never shown.

import { z } from "zod";
import { authenticatedGet, unexpectedAnswer } from "./authenticatedGet.ts";
import { readingCiStatusOf } from "./authenticatedReadRules.ts";
import {
  baseCiFoundSchema,
  baseCiStates,
  runIdentityShape,
} from "./baseCiConfirmation.ts";
import type { PublishedSource } from "./publishedSource.ts";

// The launch's base-CI answer (`./baseCiConfirmation.ts`) with a passing
// state possible, when it was checked, whether GitHub has no published
// branch of that name, the run the result rests on, and whether the
// project's CI is read through a ciAdapter, whose results name no run.
const ciStatus = baseCiFoundSchema.omit({ kind: true }).extend({
  ...runIdentityShape,
  checkedAt: z.iso.datetime(),
  state: z.enum(["pass", ...baseCiStates]),
  unpublished: z.literal(true).optional(),
  ciAdapter: z.literal(true).optional(),
});

export type IntentCiStatus = z.infer<typeof ciStatus>;

// The CI status of `branch` of `source`; a read problem when the boundary
// could not answer at all, or answered for another branch.
export async function readIntentCiStatus(
  source: PublishedSource,
  branch: string,
  signal: AbortSignal,
): Promise<IntentCiStatus> {
  const reading = readingCiStatusOf(branch, source.repository);
  const named =
    branch === source.ref ? "" : `&judged=${encodeURIComponent(branch)}`;
  const body = await authenticatedGet(
    `source=${encodeURIComponent(source.id)}&intent=ci-status${named}`,
    reading,
    signal,
  );
  const parsed = ciStatus.safeParse(body);
  if (!parsed.success || parsed.data.branch !== branch) {
    throw unexpectedAnswer(reading);
  }
  return parsed.data;
}
