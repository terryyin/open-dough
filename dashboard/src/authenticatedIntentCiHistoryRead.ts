// Project Intent's CI history, read through the local authenticated read
// boundary (`../server/intentCiHistoryRead.ts`) with `intent=ci-history`: the
// window of the project's measured landed builds and gaps from this machine's
// collected history, which asks CI nothing (`./landedCiHistory.ts`). Project
// CI status names the measure capability (`./ciHistoryMeasureCapability.ts`)
// so each point carries CI time without runner waits. A Done scope names its
// published endpoint/date and path at that same boundary, reading collected
// test execution time. The Done and scope views ask for the glance answer
// (`./ciHistoryGlanceCapability.ts`); CI status keeps the full one.

import {
  doneWallTimeGlanceSchema,
  type DoneWallTimeHistory,
} from "./ciDoneWallTimeHistory.ts";
import { historyGlance } from "./ciHistoryGlanceCapability.ts";
import { historyMeasure } from "./ciHistoryMeasureCapability.ts";
import { authenticatedGet, unexpectedAnswer } from "./authenticatedGet.ts";
import {
  readingCiHistoryOf,
  readingCiMeasureHistoryOf,
  readingCiScopeHistoryOf,
} from "./authenticatedReadRules.ts";
import {
  scopeHistoryGlanceSchema,
  type ScopeHistoryEndpoint,
  type ScopeHistoryGlance,
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
  const reading = readingCiMeasureHistoryOf(source.repository);
  const query = new URLSearchParams({
    source: source.id,
    intent: "ci-history",
    "gap-reasons": "timing-basis",
    [historyMeasure.name]: historyMeasure.value,
  });
  const body = await authenticatedGet(query.toString(), reading, signal, {
    local: true,
  });
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
): Promise<ScopeHistoryGlance> {
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
    [historyGlance.name]: historyGlance.value,
  });
  const parsed = scopeHistoryGlanceSchema.safeParse(
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
    "gap-reasons": "timing-basis",
    revision: endpoint.revision,
    through: endpoint.at,
    [historyGlance.name]: historyGlance.value,
  });
  const parsed = doneWallTimeGlanceSchema.safeParse(
    await authenticatedGet(query.toString(), reading, signal, { local: true }),
  );
  const measured = parsed.success
    ? measuredHistoryOf({ entries: parsed.data.entries })
    : undefined;
  if (
    !parsed.success ||
    measured === undefined ||
    parsed.data.selectedRevision !== endpoint.revision ||
    parsed.data.reference.endpoint !== endpoint.revision
  )
    throw unexpectedAnswer(reading);
  return { ...parsed.data, entries: measured.entries };
}
