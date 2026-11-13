// One scope's locally collected history, independent of the live comparison.
// Its last answered reading survives navigation in the existing Project/story
// reading place; explicit CI judgment rounds and retry can refresh local evidence.

import { useCallback } from "react";
import { readIntentCiScopeHistory } from "./authenticatedIntentCiHistoryRead.ts";
import type { ScopeHistoryEndpoint } from "./ciScopeHistory.ts";
import type { PublishedSource } from "./publishedSource.ts";
import {
  useIntentCiEndpointHistory,
  type EndpointHistoryAnswer,
} from "./useIntentCiEndpointHistory.ts";
import type { ScopeHistoryGlance } from "./ciScopeHistory.ts";
import { useKeptReading } from "./pageIntentReading.tsx";

export function useIntentCiScopeHistory(
  source: PublishedSource | undefined,
  path: string,
  endpoint: ScopeHistoryEndpoint | undefined,
  checkedAgain?: string,
) {
  const [kept, remember] = useKeptReading<
    EndpointHistoryAnswer<ScopeHistoryGlance> | undefined
  >("ciScopeHistory", () => undefined);
  const read = useCallback(
    (
      selectedSource: PublishedSource,
      selectedEndpoint: ScopeHistoryEndpoint,
      signal: AbortSignal,
    ) =>
      readIntentCiScopeHistory(selectedSource, path, selectedEndpoint, signal),
    [path],
  );
  return useIntentCiEndpointHistory({
    source,
    endpoint,
    scope: path,
    kept,
    onAnswer: remember,
    checkedAgain,
    read,
    unreadReason:
      "The collected test execution time history could not be read.",
  });
}
