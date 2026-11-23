// A story's CI comparison, read through the local authenticated read
// boundary (`../server/intentCiComparisonRead.ts`) with
// `intent=ci-comparison` and the story's identity, with a revision pair
// for a selected comparison.

import { authenticatedGet, unexpectedAnswer } from "./authenticatedGet.ts";
import { readingCiComparisonOf } from "./authenticatedReadRules.ts";
import type { PublishedSource } from "./publishedSource.ts";
import {
  selectedCiComparisonAnswerSchema,
  type CiComparisonRange,
  type SelectedCiComparisonAnswer,
} from "./selectedCiComparison.ts";
import {
  storyCiComparisonAnswerSchema,
  type StoryCiComparisonAnswer,
} from "./storyCiComparison.ts";

function comparisonQuery(source: PublishedSource, identity: string): string {
  return `source=${encodeURIComponent(source.id)}&intent=ci-comparison&identity=${encodeURIComponent(identity)}`;
}

export async function readIntentCiComparison(
  source: PublishedSource,
  identity: string,
  signal: AbortSignal,
): Promise<StoryCiComparisonAnswer> {
  const reading = readingCiComparisonOf(identity, source.repository);
  const body = await authenticatedGet(
    comparisonQuery(source, identity),
    reading,
    signal,
  );
  const parsed = storyCiComparisonAnswerSchema.safeParse(body);
  if (
    !parsed.success ||
    parsed.data.identity !== identity ||
    (typeof body === "object" && body !== null && "range" in body)
  ) {
    throw unexpectedAnswer(reading);
  }
  return parsed.data;
}

export async function readSelectedIntentCiComparison(
  source: PublishedSource,
  identity: string,
  range: CiComparisonRange,
  signal: AbortSignal,
): Promise<SelectedCiComparisonAnswer> {
  const reading = readingCiComparisonOf(identity, source.repository);
  const body = await authenticatedGet(
    `${comparisonQuery(source, identity)}&start=${encodeURIComponent(range.start)}&end=${encodeURIComponent(range.end)}`,
    reading,
    signal,
  );
  const parsed = selectedCiComparisonAnswerSchema.safeParse(body);
  if (
    !parsed.success ||
    parsed.data.source !== source.id ||
    parsed.data.identity !== identity ||
    parsed.data.range.start !== range.start ||
    parsed.data.range.end !== range.end
  ) {
    throw unexpectedAnswer(reading);
  }
  return parsed.data;
}
