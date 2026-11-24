// System settings → Usage's local JSON endpoints. A GET answers the Token
// index chart of the cohort its query selects (./tokenIndexCohort.ts)
// from the latest per-task usage summary (./usageTaskSummaryCache.ts) and how
// each retained launch's record says it ended now (./retainedUsageTasks.ts),
// for every project configured now, hidden ones included, under the chosen
// tool's tariff (./usageTariffs.ts), with the last check time
// (./usageCheck.ts). A POST to Refresh brings in the Codex and Claude Code
// usage written since then (./usageRefreshRun.ts) and answers the new check
// time.
import type { IncomingMessage } from "node:http";
import { homedir } from "node:os";
import {
  usageRefreshEndpoint,
  usageTokenIndexEndpoint,
  type TokenIndexAnswer,
  type UsageRefreshAnswer,
} from "../src/usageTokenIndex.ts";
import { RefusedRequest } from "./localOrigin.ts";
import { localJsonEndpoints } from "./localJsonEndpoints.ts";
import { configuredProjects } from "./projectConfiguration.ts";
import { retainedLaunchEnds } from "./retainedUsageTasks.ts";
import { readTokenIndex } from "./tokenIndexRead.ts";
import { lastUsageCheck } from "./usageCheck.ts";
import { usageHistoryFile } from "./usageHistory.ts";
import { refreshUsage } from "./usageRefreshRun.ts";
import { currentUsageTaskSummary } from "./usageTaskSummaryCache.ts";
import { usageTariffs } from "./usageTariffs.ts";

function tokenIndex(req: IncomingMessage): Promise<TokenIndexAnswer> {
  const query = new URL(req.url ?? "", "http://local").searchParams;
  return readTokenIndex(req.method, query, async (tool) => {
    const home = homedir();
    const store = usageHistoryFile(home);
    const [summary, launches, checkedAt] = await Promise.all([
      currentUsageTaskSummary(store),
      retainedLaunchEnds(home),
      lastUsageCheck(store),
    ]);
    return {
      summary,
      projects: configuredProjects(),
      launches,
      tariff: usageTariffs[tool],
      checkedAt,
    };
  });
}

async function refresh(req: IncomingMessage): Promise<UsageRefreshAnswer> {
  if (req.method !== "POST")
    throw new RefusedRequest(405, "Only POST is accepted.");
  return { checkedAt: await refreshUsage(homedir(), usageHistoryFile()) };
}

export const installUsageMiddleware = localJsonEndpoints(
  [usageTokenIndexEndpoint, usageRefreshEndpoint],
  (req, pathname) =>
    pathname === usageRefreshEndpoint ? refresh(req) : tokenIndex(req),
  (error) => ({
    status: 503,
    body: {
      error:
        error instanceof Error
          ? error.message
          : "Usage could not be read. Retry the operation.",
    },
  }),
);
