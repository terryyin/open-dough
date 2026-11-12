// Project and Done scope history read from what a machine keeps: Story A
// delivered through a story branch on the summary comparison's trunk, kept by
// the worker (./keptPublishedStory.ts), the history of the builds and
// landings a case names (makeMe.aLandedCiHistory), and the provider's live
// answers for its runs, read by a dashboard that collects nothing
// (./landedCiReader.ts). Collection of those builds stays with
// ../intent/intent-project-scope-timing-history.spec.ts.
import type { Page } from "@playwright/test";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { pausePageClockAt } from "../dashboardTest.ts";
import type { DashboardServer } from "./dashboardServer.ts";
import { declaredSummaryComparisonEndpointsIn } from "./intentSummaryStoryComparisonRepository.ts";
import { serveSummaryComparisonStory } from "./intentSummaryStoryComparisonServing.ts";
import { startingFromKeptSummaryComparisonStory } from "./keptPublishedStory.ts";
import { keepLandedCiHistory } from "./landedCiHistory.ts";
import { startLandedCiReader } from "./landedCiReader.ts";
import { commonGitDir } from "./launchLanding.ts";
import { chooseStoryTab } from "./intentStoryPage.ts";
import { queuedClaudePreviewTest } from "./preparationPage.ts";
import { openDoneStoryIntent } from "./scopeHistoryCollectedPage.ts";
import { serveCollectedScopeProofs } from "./scopeHistoryCollection.ts";
import {
  keptScopeFileProof,
  type ScopeFileTiming,
} from "./scopeHistoryProofs.ts";
import { originMain } from "./sessionDialog.ts";
import type { StartOrigin } from "./startOrigin.ts";
import { git } from "./storyReviewWorktree.ts";

// The page's dashboard is the reader itself: no collecting dashboard runs on
// the machine before it or beside it.
export const test = queuedClaudePreviewTest
  .extend(startingFromKeptSummaryComparisonStory)
  .extend({
    dashboard: async ({ github, origin }, use) => {
      const reader = await startLandedCiReader({ github }, origin, "preview");
      await use(reader);
      await reader.close();
    },
  });

type Point = "baseline" | "branchSide" | "completion" | "latest";

// The machine keeps each landing's build of `runs` measured with its proof;
// the provider answers every run of `runs` live. Opens the Done story's
// Changed tests.
export async function readKeptProjectHistory(
  page: Page,
  dashboard: DashboardServer,
  origin: StartOrigin,
  facts: {
    readonly landings: readonly {
      readonly point: Point;
      readonly at: string;
      readonly receipt: string;
    }[];
    readonly runs: readonly (readonly [
      point: Point,
      runId: number,
      at: string,
      files: readonly ScopeFileTiming[],
    ])[];
  },
) {
  // Its runs' proofs are the summaries served next.
  const setup = await serveSummaryComparisonStory(
    page,
    origin,
    declaredSummaryComparisonEndpointsIn(origin.project),
    {},
  );
  const latest = await originMain(origin);
  const revisions = { ...setup, latest };
  // Each run's proof as the machine keeps it. The provider serves its summary,
  // so no case spawns the summary producer; producing it stays with collection.
  const runs = facts.runs.map(([point, runId, startedAt, files]) => {
    const revision = revisions[point];
    const proof = keptScopeFileProof({ revision, runId }, files);
    return { point, runId, startedAt, revision, proof };
  });
  serveCollectedScopeProofs(
    setup,
    runs.map(({ point, runId, startedAt, revision, proof }) => {
      if (proof.kind !== "summary") throw new Error(`No proof of ${point}`);
      return [
        revision,
        runId,
        startedAt,
        JSON.stringify(proof.summary),
      ] as const;
    }),
  );
  const history = makeMe.aLandedCiHistory.inTrunkOrder(
    git(
      origin.project,
      "rev-list",
      "--first-parent",
      "--reverse",
      "main",
    ).split("\n"),
  );
  for (const { point, at, receipt } of facts.landings) {
    const run = runs.find((candidate) => candidate.point === point);
    if (run === undefined) throw new Error(`No run builds ${point}`);
    const { runId, startedAt, revision, proof } = run;
    history
      .measuredLanding({
        receipt,
        revision,
        identity: setup.identity,
        repository: commonGitDir(origin.project),
        receivedAt: at,
        runId,
        startedAt,
        completedAt: new Date(Date.parse(startedAt) + 60_000).toISOString(),
      })
      .proofFor(`run/${String(runId)}/1`, proof);
  }
  await keepLandedCiHistory(dashboard.home, history.please());
  await pausePageClockAt(page, new Date());
  await page.setViewportSize({ width: 1280, height: 700 });
  // The Done comparison's reads go on while the case reads Changed tests; a
  // case waits for the page's reads before it counts acquisitions.
  const { intent } = await openDoneStoryIntent(page, dashboard.origin);
  await chooseStoryTab(intent, "Changed tests");
  return { setup, latest, intent };
}
