// System settings → Usage's local JSON endpoints. A GET answers the Token
// index chart of the Codex cohort its query selects (./tokenIndexCohort.ts)
// from the latest per-task usage summary (./usageTaskSummaryCache.ts) and how
// each retained launch's record says it ended now (./retainedUsageTasks.ts),
// for every project configured now, hidden ones included, under the Codex
// tariff (./usageTariffs.ts), with the last check time (./usageCheck.ts). A
// POST to Refresh brings in the Codex usage written since then
// (./usageRefreshRun.ts) and answers the new check time.
import type { IncomingMessage } from "node:http";
import { homedir } from "node:os";
import {
  requestedCohort,
  usageRefreshEndpoint,
  usageTokenIndexEndpoint,
  type TokenIndexAnswer,
  type UsageRefreshAnswer,
} from "../src/usageTokenIndex.ts";
import { RefusedRequest } from "./localOrigin.ts";
import { localJsonEndpoints } from "./localJsonEndpoints.ts";
import { configuredProjects } from "./projectConfiguration.ts";
import { retainedLaunchEnds } from "./retainedUsageTasks.ts";
import { tokenIndexCohort } from "./tokenIndexCohort.ts";
import { lastUsageCheck } from "./usageCheck.ts";
import { usageHistoryFile } from "./usageHistory.ts";
import { refreshUsage } from "./usageRefreshRun.ts";
import { currentUsageTaskSummary } from "./usageTaskSummaryCache.ts";
import { codexTariff } from "./usageTariffs.ts";

async function tokenIndex(req: IncomingMessage): Promise<TokenIndexAnswer> {
  if (req.method !== "GET")
    throw new RefusedRequest(405, "Only GET is accepted.");
  const cohort = requestedCohort(
    new URL(req.url ?? "", "http://local").searchParams,
  );
  if (cohort === undefined)
    throw new RefusedRequest(400, "Choose a known launch workflow.");
  const store = usageHistoryFile();
  const [summary, launches, checkedAt] = await Promise.all([
    currentUsageTaskSummary(store),
    retainedLaunchEnds(homedir()),
    lastUsageCheck(store),
  ]);
  return {
    ...tokenIndexCohort(
      summary,
      {
        projects: new Map(
          configuredProjects().map(({ id, label }) => [id, label]),
        ),
        launches,
        tariff: codexTariff,
      },
      cohort,
    ),
    checkedAt,
  };
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
