// The separate process (./usageProcess.ts) that runs a usage Refresh
// (./usageRefresh.ts), so the dashboard server's event loop never reads
// rollouts, transcripts or the usage store: node usageRefreshMain.ts <home> <store>. It
// prints the new check time.
import { usageProcessMain } from "./usageProcess.ts";
import { refreshUsageHistory } from "./usageRefresh.ts";

await usageProcessMain(async ([home, store]) => {
  if (home === undefined || store === undefined)
    throw new Error("Name the home and the usage store.");
  return JSON.stringify(await refreshUsageHistory({ home, store }));
});
