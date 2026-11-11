// Real published history and a collection-off reader for Project/Done journeys.
// Cases supply recorded landing/build facts and keep all expected readings.
import type { Page } from "@playwright/test";
import { pausePageClockAt } from "../dashboardTest.ts";
import type { DashboardServer } from "./dashboardServer.ts";
import { publishSummaryComparisonStory } from "./intentSummaryStoryComparisonFixture.ts";
import { startLandedCiReader } from "./landedCiReader.ts";
import { openCollectedHistoryStory } from "./scopeHistoryCollectedPage.ts";
import {
  recordScopeHistoryLandings,
  retainedProofs,
  serveCollectedScopeFileRuns,
} from "./scopeHistoryCollection.ts";
import type { ScopeFileTiming } from "./scopeHistoryProofs.ts";
import { originMain } from "./sessionDialog.ts";
import type { StartOrigin } from "./startOrigin.ts";
import { expect } from "./preparationPage.ts";

type Point = "baseline" | "branchSide" | "completion" | "latest";
type Landing = Omit<
  Parameters<typeof recordScopeHistoryLandings>[3][number],
  "revision"
> & { readonly point: Point };

export async function readCollectedProjectHistory(
  page: Page,
  dashboard: DashboardServer,
  origin: StartOrigin,
  facts: {
    readonly landings: readonly Landing[];
    readonly runs: readonly (readonly [
      point: Point,
      runId: number,
      at: string,
      files: readonly ScopeFileTiming[],
    ])[];
    readonly retainedRunIds: readonly number[];
  },
) {
  const setup = await publishSummaryComparisonStory(page, origin);
  // The actual later trunk commit the publisher leaves is the final landing.
  const latest = await originMain(origin);
  const revisions = { ...setup, latest };
  recordScopeHistoryLandings(
    dashboard,
    origin,
    setup.identity,
    facts.landings.map(({ point, ...landing }) => ({
      ...landing,
      revision: revisions[point],
    })),
  );
  serveCollectedScopeFileRuns(
    setup,
    facts.runs.map(
      ([point, run, at, files]) => [revisions[point], run, at, files] as const,
    ),
  );
  const reader = await startLandedCiReader(dashboard, origin, "preview");
  try {
    await pausePageClockAt(page, new Date());
    await page.setViewportSize({ width: 1280, height: 700 });
    // Initial live comparison reads do not depend on collected history. Stop
    // collection before the case opens file history or counts acquisitions.
    const [{ intent }] = await Promise.all([
      openCollectedHistoryStory(page, reader.origin),
      (async () => {
        for (const id of facts.retainedRunIds)
          await expect
            .poll(
              () => retainedProofs(dashboard.home)[`run/${String(id)}/1`]?.kind,
            )
            .toBe("summary");
      })(),
    ]);
    await dashboard.close();
    return { setup, latest, intent, reader };
  } catch (error) {
    await reader.close();
    throw error;
  }
}
