// A story's CI comparison, read through the local authenticated read
// boundary (`../server/intentCiComparisonRead.ts`) with
// `intent=ci-comparison` and the story's identity. An answer for another
// identity than the one asked is refused, never shown.

import { authenticatedGet, unexpectedAnswer } from "./authenticatedGet.ts";
import { readingCiComparisonOf } from "./authenticatedReadRules.ts";
import type { PublishedSource } from "./publishedSource.ts";
import {
  storyCiComparisonAnswerSchema,
  type StoryCiComparisonAnswer,
} from "./storyCiComparison.ts";

export async function readIntentCiComparison(
  source: PublishedSource,
  identity: string,
  signal: AbortSignal,
): Promise<StoryCiComparisonAnswer> {
  const reading = readingCiComparisonOf(identity, source.repository);
  const body = await authenticatedGet(
    `source=${encodeURIComponent(source.id)}&intent=ci-comparison&identity=${encodeURIComponent(identity)}`,
    reading,
    signal,
  );
  const parsed = storyCiComparisonAnswerSchema.safeParse(body);
  if (!parsed.success || parsed.data.identity !== identity) {
    throw unexpectedAnswer(reading);
  }
  return parsed.data;
}
