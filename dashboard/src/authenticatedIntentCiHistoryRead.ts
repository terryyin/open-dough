// Project Intent's CI wall time history, read through the local
// authenticated read boundary (`../server/intentCiHistoryRead.ts`) with
// `intent=ci-history`: the project's measured landed builds from this
// machine's collected history, which asks CI nothing (`./landedCiHistory.ts`),
// each with its CI wall time.

import { authenticatedGet, unexpectedAnswer } from "./authenticatedGet.ts";
import { readingCiHistoryOf } from "./authenticatedReadRules.ts";
import {
  landedCiHistorySchema,
  measuredHistoryOf,
  type MeasuredHistory,
} from "./landedCiHistory.ts";
import type { PublishedSource } from "./publishedSource.ts";

export async function readIntentCiHistory(
  source: PublishedSource,
  signal: AbortSignal,
): Promise<MeasuredHistory> {
  const reading = readingCiHistoryOf(source.repository);
  const body = await authenticatedGet(
    `source=${encodeURIComponent(source.id)}&intent=ci-history`,
    reading,
    signal,
  );
  const parsed = landedCiHistorySchema.safeParse(body);
  const history = parsed.success ? measuredHistoryOf(parsed.data) : undefined;
  if (history === undefined) throw unexpectedAnswer(reading);
  return history;
}
