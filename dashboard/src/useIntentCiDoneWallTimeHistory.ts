// Independent local history refresh: retain the last reading on failure and
// discard it when the exact published endpoint changes.
import type { ScopeHistoryEndpoint } from "./ciScopeHistory.ts";
import { useIntentCiReads } from "./pageReads.tsx";
import type { PublishedSource } from "./publishedSource.ts";
import { useIntentCiEndpointHistory } from "./useIntentCiEndpointHistory.ts";

export function useIntentCiDoneWallTimeHistory(
  source: PublishedSource | undefined,
  endpoint: ScopeHistoryEndpoint | undefined,
  checkedAgain: number | undefined,
) {
  const { readDoneWallTimeHistory } = useIntentCiReads();
  return useIntentCiEndpointHistory({
    source,
    endpoint,
    checkedAgain,
    read: readDoneWallTimeHistory,
    unreadReason: "The collected CI wall time history could not be read.",
  });
}
