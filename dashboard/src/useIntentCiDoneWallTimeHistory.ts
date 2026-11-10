// Independent local history refresh: retain the last reading on failure and
// discard it when the exact published endpoint changes.
import { readIntentCiDoneWallTimeHistory } from "./authenticatedIntentCiHistoryRead.ts";
import type { ScopeHistoryEndpoint } from "./ciScopeHistory.ts";
import type { PublishedSource } from "./publishedSource.ts";
import { useIntentCiEndpointHistory } from "./useIntentCiEndpointHistory.ts";

export function useIntentCiDoneWallTimeHistory(
  source: PublishedSource | undefined,
  endpoint: ScopeHistoryEndpoint | undefined,
  checkedAgain: number | undefined,
) {
  return useIntentCiEndpointHistory({
    source,
    endpoint,
    checkedAgain,
    read: readIntentCiDoneWallTimeHistory,
    unreadReason: "The collected CI wall time history could not be read.",
  });
}
