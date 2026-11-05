// Intent's CI status, read through the local authenticated read boundary
// (`../server/intentCiStatusRead.ts`) with `intent=ci-status`: the selected
// check's judgment of one branch, the source's configured ref unless a story
// branch is named as `judged`, as the launch's base-CI check judges it, with
// the branch it belongs to, when it was checked, and whether the answer is
// the process's kept one or a fresh CI read (`./IntentCiStatus.tsx`). The
// kept form (`kept=1`) answers without any CI request. The boundary resolves
// the branch head itself. An answer naming any other branch than the one
// asked is refused, never shown.

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
// branch of that name, the run the result rests on, whether the project's
// CI is read through a ciAdapter, whose results name no run, and whether
// this answer is kept or freshly read.
const ciStatus = baseCiFoundSchema.omit({ kind: true }).extend({
  ...runIdentityShape,
  checkedAt: z.iso.datetime(),
  freshness: z.enum(["kept", "fresh"]),
  state: z.enum(["pass", ...baseCiStates]),
  unpublished: z.literal(true).optional(),
  ciAdapter: z.literal(true).optional(),
});

export type IntentCiStatus = z.infer<typeof ciStatus>;

const keptNone = z.object({ none: z.literal(true) });

function queryOf(source: PublishedSource, branch: string, kept: boolean) {
  const named =
    branch === source.ref ? "" : `&judged=${encodeURIComponent(branch)}`;
  const form = kept ? "&kept=1" : "";
  return `source=${encodeURIComponent(source.id)}&intent=ci-status${form}${named}`;
}

// The CI status of `branch` of `source`; a read problem when the boundary
// could not answer at all, or answered for another branch.
export async function readIntentCiStatus(
  source: PublishedSource,
  branch: string,
  signal: AbortSignal,
): Promise<IntentCiStatus> {
  const reading = readingCiStatusOf(branch, source.repository);
  const body = await authenticatedGet(
    queryOf(source, branch, false),
    reading,
    signal,
  );
  const parsed = ciStatus.safeParse(body);
  if (
    !parsed.success ||
    parsed.data.branch !== branch ||
    parsed.data.freshness !== "fresh"
  ) {
    throw unexpectedAnswer(reading);
  }
  return parsed.data;
}

// What this process already kept for `branch` of `source`, or `none` when
// it holds nothing; a read problem when the boundary answered something else.
export async function readKeptIntentCiStatus(
  source: PublishedSource,
  branch: string,
  signal: AbortSignal,
): Promise<IntentCiStatus | { readonly none: true }> {
  const reading = `the kept ${readingCiStatusOf(branch, source.repository)}`;
  const body = await authenticatedGet(
    queryOf(source, branch, true),
    reading,
    signal,
  );
  if (keptNone.safeParse(body).success) return { none: true };
  const parsed = ciStatus.safeParse(body);
  if (
    !parsed.success ||
    parsed.data.branch !== branch ||
    parsed.data.freshness !== "kept"
  ) {
    throw unexpectedAnswer(reading);
  }
  return parsed.data;
}
