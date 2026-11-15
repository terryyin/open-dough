// A usage Refresh for the running dashboard: the refresh process
// (./usageRefreshMain.ts) runs off this server's event loop
// (./usageProcess.ts), then the per-task summary is derived again from the
// store it wrote (./usageTaskSummaryCache.ts). Concurrent presses share one
// run; a failed run leaves the store, the summary and the check time as they
// were.
import { runUsageProcess, sharedRuns } from "./usageProcess.ts";
import { currentUsageTaskSummary } from "./usageTaskSummaryCache.ts";

const refresher = new URL("./usageRefreshMain.ts", import.meta.url);
const shared = sharedRuns<string>();

async function refresh(home: string, store: string): Promise<string> {
  const { checkedAt } = JSON.parse(
    await runUsageProcess(
      refresher,
      [home, store],
      "Usage could not be refreshed",
    ),
  ) as { checkedAt: string };
  await currentUsageTaskSummary(store);
  return checkedAt;
}

// The check time the Refresh of `store` recorded.
export function refreshUsage(home: string, store: string): Promise<string> {
  return shared(store, () => refresh(home, store));
}
