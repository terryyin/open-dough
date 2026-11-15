// System settings → Usage's local JSON endpoint: the Codex Execution cohort's
// Token index chart (./tokenIndexCohort.ts) from the latest per-task usage
// summary (./usageTaskSummaryCache.ts), for every project configured now,
// hidden ones included, under the Codex tariff (./usageTariffs.ts).
import type { IncomingMessage } from "node:http";
import {
  usageTokenIndexEndpoint,
  type TokenIndexAnswer,
} from "../src/usageTokenIndex.ts";
import { RefusedRequest } from "./localOrigin.ts";
import { localJsonEndpoints } from "./localJsonEndpoints.ts";
import { configuredProjects } from "./projectConfiguration.ts";
import { tokenIndexCohort } from "./tokenIndexCohort.ts";
import { usageHistoryFile } from "./usageHistory.ts";
import { currentUsageTaskSummary } from "./usageTaskSummaryCache.ts";
import { codexTariff } from "./usageTariffs.ts";

async function answer(req: IncomingMessage): Promise<TokenIndexAnswer> {
  if (req.method !== "GET")
    throw new RefusedRequest(405, "Only GET is accepted.");
  const summary = await currentUsageTaskSummary(usageHistoryFile());
  return tokenIndexCohort(
    summary,
    configuredProjects().map((project) => project.id),
    codexTariff,
  );
}

export const installUsageMiddleware = localJsonEndpoints(
  [usageTokenIndexEndpoint],
  answer,
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
