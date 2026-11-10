// Observe collected ancestry once before and once without local Git, using
// the same persisted evidence and a collection-off reader at its own address.
import type { DashboardServer } from "./dashboardServer.ts";
import type { StartOrigin } from "./startOrigin.ts";
import {
  retainedHistory,
  collectedScopeHistory,
} from "./collectedScopeHistory.ts";
import { restartAsLandedCiReader } from "./landedCiHistory.ts";
import { withoutScopeHistoryGit } from "./scopeHistoryCollectedGit.ts";
import { expect } from "./preparationPage.ts";

export async function observeRetainedScopeOrder(
  dashboard: DashboardServer,
  origin: StartOrigin,
  endpoint: {
    path: string;
    revision: string;
    at: string;
    order: readonly string[];
  },
  readers: DashboardServer[],
) {
  let reading = dashboard;
  const read = () =>
    collectedScopeHistory(
      reading.origin,
      endpoint.path,
      endpoint.revision,
      endpoint.at,
    );
  const collected = await read();
  expect(collected.status).toBe(200);
  // The collector's last persisted write supplies the fallback ordering.
  await expect
    .poll(() => retainedHistory(dashboard.home)?.trunkOrder)
    .toEqual(endpoint.order);
  const kept = retainedHistory(dashboard.home);
  expect(kept).toBeDefined();
  if (kept === undefined)
    throw new Error("No collected history for the local Git fault.");
  const reader = await restartAsLandedCiReader(dashboard, origin, "preview");
  readers.push(reader);
  reading = reader;
  const beforeGitFault = dashboard.github.calls.length;
  await withoutScopeHistoryGit(origin, kept, async () => {
    const withoutGit = await read();
    expect(withoutGit.status).toBe(200);
    expect(withoutGit.body).toEqual(collected.body);
    expect(dashboard.github.calls).toHaveLength(beforeGitFault);
  });
  return { collected, read, reader };
}
