// Project Intent's CI wall time history, read through the local
// authenticated read boundary (`../server/intentCiHistoryRead.ts`) with
// `intent=ci-history`: the window of the project's measured landed builds and
// gaps from this machine's collected history, which asks CI nothing
// (`./landedCiHistory.ts`), each point with its CI wall time. A Done scope
// names its published endpoint/date and path at that same boundary, reading
// collected test execution time.

import {
  ciDoneWallTimeHistorySchema,
  type DoneWallTimeHistory,
} from "./ciDoneWallTimeHistory.ts";
import { authenticatedGet, unexpectedAnswer } from "./authenticatedGet.ts";
import {
  readingCiHistoryOf,
  readingCiScopeHistoryOf,
} from "./authenticatedReadRules.ts";
import {
  ciScopeHistorySchema,
  type CiScopeHistory,
  type ScopeHistoryEndpoint,
} from "./ciScopeHistory.ts";
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
    { local: true },
  );
  const parsed = landedCiHistorySchema.safeParse(body);
  const history = parsed.success ? measuredHistoryOf(parsed.data) : undefined;
  if (history === undefined) throw unexpectedAnswer(reading);
  return history;
}

export async function readIntentCiScopeHistory(
  source: PublishedSource,
  path: string,
  endpoint: ScopeHistoryEndpoint,
  signal: AbortSignal,
): Promise<CiScopeHistory> {
  const reading = readingCiScopeHistoryOf(
    source.repository,
    path,
    endpoint.revision,
  );
  const query = new URLSearchParams({
    source: source.id,
    intent: "ci-history",
    scope: path,
    revision: endpoint.revision,
    through: endpoint.at,
  });
  const parsed = ciScopeHistorySchema.safeParse(
    await authenticatedGet(query.toString(), reading, signal, { local: true }),
  );
  if (
    !parsed.success ||
    parsed.data.path !== path ||
    parsed.data.selectedRevision !== endpoint.revision ||
    parsed.data.references?.some(
      ({ reference }) => reference.endpoint !== endpoint.revision,
    ) === true
  )
    throw unexpectedAnswer(reading);
  return parsed.data;
}

// Done wall time uses the same local read with its exact published endpoint.
export async function readIntentCiDoneWallTimeHistory(
  source: PublishedSource,
  endpoint: ScopeHistoryEndpoint,
  signal: AbortSignal,
): Promise<DoneWallTimeHistory> {
  const reading = readingCiHistoryOf(source.repository);
  const query = new URLSearchParams({
    source: source.id,
    intent: "ci-history",
    revision: endpoint.revision,
    through: endpoint.at,
  });
  const parsed = ciDoneWallTimeHistorySchema.safeParse(
    await authenticatedGet(query.toString(), reading, signal, { local: true }),
  );
  const measured = parsed.success ? measuredHistoryOf(parsed.data) : undefined;
  if (
    !parsed.success ||
    measured === undefined ||
    parsed.data.selectedRevision !== endpoint.revision ||
    parsed.data.reference?.endpoint !== endpoint.revision
  )
    throw unexpectedAnswer(reading);
  return {
    ...measured,
    selectedRevision: parsed.data.selectedRevision,
    availability: parsed.data.availability,
  };
}
