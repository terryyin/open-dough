// One scope's locally collected history, independent of the live comparison.
// A failed read keeps its last answer and retries only on the reader's action.

import { useCallback } from "react";
import { readIntentCiScopeHistory } from "./authenticatedIntentCiHistoryRead.ts";
import type { ScopeHistoryEndpoint } from "./ciScopeHistory.ts";
import type { PublishedSource } from "./publishedSource.ts";
import { useIntentCiEndpointHistory } from "./useIntentCiEndpointHistory.ts";

export function useIntentCiScopeHistory(
  source: PublishedSource | undefined,
  path: string,
  endpoint: ScopeHistoryEndpoint | undefined,
) {
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
    read,
    unreadReason:
      "The collected test execution time history could not be read.",
  });
}
