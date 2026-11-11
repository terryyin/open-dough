import { attemptLink } from "../ciEvidenceLabelsPage.ts";
import {
  scopeHistory,
  scopeHistoryReading,
  scopeHistoryChart,
} from "../intentScopeHistoryPage.ts";
// Real collected artifacts distinguish entry-only, partial and absent-unit
// history while a Done file keeps earlier supported evidence in Proof.
import { shortSha } from "../../src/baseCiWording.ts";
import { fileReadingTab, proofRegion } from "../intentPerspectivePage.ts";
import { childName } from "../intentScopeProofPage.ts";
import { collectedScopeFileSummary } from "../support/scopeHistoryProofs.ts";
import type { DashboardServer } from "../support/dashboardServer.ts";
import { publishSummaryComparisonStory } from "../support/intentSummaryStoryComparisonFixture.ts";
import {
  collectingLandedCi,
  resultToLand,
} from "../support/landedCiHistory.ts";
import {
  expect,
  queuedClaudePreviewTest as test,
} from "../support/preparationPage.ts";
import { observeRetainedScopeOrder } from "../support/scopeHistoryCollectedOrder.ts";
import { openCollectedHistoryStory } from "../support/scopeHistoryCollectedPage.ts";
import {
  recordScopeHistoryLandings,
  retainedProofs,
  serveCollectedScopeProofs,
} from "../support/scopeHistoryCollection.ts";
import { openSummaryComparison } from "../support/selectDoneStoryForSummaryComparison.ts";
import { land } from "../support/startSessionLandingContext.ts";
import { git } from "../support/storyReviewWorktree.ts";

test.use({ extraEnv: collectingLandedCi });
const readers: DashboardServer[] = [];
test.afterEach(async () => {
  await Promise.all(readers.splice(0).map((reader) => reader.close()));
});

test("a collected file explains breakdown and partial gaps and keeps earlier file units beside the selected case zero", async ({
  page,
  dashboard,
  origin,
  github,
}) => {
  test.setTimeout(60_000); // Same real publication/collection boundary as the full journey.
  const setup = await publishSummaryComparisonStory(page, origin);
  const earlier = git(origin.project, "rev-parse", `${setup.completion}^`);
  expect(earlier).not.toBe(setup.baseline);
  expect(earlier).not.toBe(setup.branchSide);
  expect(git(origin.project, "merge-base", setup.baseline, earlier)).toBe(
    setup.baseline,
  );
  const newest = await resultToLand(dashboard, "later-file-gap-history.txt");
  const revisions = [
    setup.baseline,
    earlier,
    setup.completion,
    newest.revision,
  ];
  recordScopeHistoryLandings(
    dashboard,
    origin,
    setup.identity,
    revisions.map((revision, at) => ({
      revision,
      at: `2026-11-0${String(at + 4)}T10:10:00.000Z`,
      workflow: at < 2 ? ("refinement" as const) : ("execution" as const),
      receipt: `30000000-0000-4000-8000-00000000000${String(at + 1)}`,
      title: at === 2 ? "Story A" : "Story A historical publication",
    })),
  );
  // case part-count, breakdown, case milliseconds, optional file milliseconds.
  const facts = [
    [setup.baseline, 201, "2026-11-04T10:00:00Z", 1, false, 700, 70],
    [earlier, 205, "2026-11-05T10:00:00Z", 2, true, 200, 20],
    [setup.branchSide, 202, "2026-11-06T09:00:00Z", 1, true, 300, 30],
    [setup.completion, 203, "2026-11-06T10:00:00Z", 1, true, 0, undefined],
    [newest.revision, 204, "2026-11-07T10:00:00Z", 1, true, 9900, 990],
  ] as const;
  serveCollectedScopeProofs(
    setup,
    facts.map(([revision, runId, startedAt, parts, byFile, caseMs, fileMs]) => [
      revision,
      runId,
      startedAt,
      collectedScopeFileSummary(
        { repository: "terryyin/open-dough", revision, runId, attempt: 1 },
        [["folder/a.spec.ts", caseMs, fileMs]],
        { caseParts: parts, byFile },
      ),
    ]),
  );
  expect(
    land(newest.record, origin, dashboard.home).result.landing.receipt.revision,
  ).toBe(newest.revision);
  for (const key of ["run/201/1", "run/205/1", "run/203/1", "run/204/1"])
    await expect
      .poll(() => retainedProofs(dashboard.home)[key]?.kind)
      .toBe("summary");
  const { reader } = await observeRetainedScopeOrder(
    dashboard,
    origin,
    {
      path: "dashboard/tests/folder/a.spec.ts",
      revision: setup.completion,
      at: "2026-11-06T10:10:00.000Z",
      order: revisions,
    },
    readers,
  );
  const { intent } = await openCollectedHistoryStory(page, reader.origin);
  const ciCalls = () =>
    github.calls.filter(({ request }) => request.kind.startsWith("actions-"));
  const before = ciCalls().length;
  const summary = await openSummaryComparison(intent, "dashboard/tests");
  const entryHistory = scopeHistory(summary);
  await expect(scopeHistoryReading(entryHistory).rows.first()).toContainText(
    "700 ms · test cases",
  );
  await expect(scopeHistoryReading(entryHistory).rows.first()).toContainText(
    "70 ms · test files",
  );
  await childName(summary, "folder/").first().click();
  const folder = scopeHistory(summary);
  await expect(scopeHistoryReading(folder).rows.nth(0)).toContainText(
    "No file breakdown in this build's CI proof",
  );
  await expect(scopeHistoryReading(folder).rows.nth(1)).toContainText(
    "Partial: part 2 of 2 missing",
  );
  await expect(scopeHistoryReading(folder).rows.nth(1)).toContainText(
    "20 ms · test files",
  );
  await childName(summary, "a.spec.ts").first().click();
  await fileReadingTab(intent, "Proof").click();
  const history = scopeHistory(proofRegion(intent));
  const rows = scopeHistoryReading(history).rows;
  await expect(rows).toHaveCount(3);
  await expect(rows.nth(0)).toContainText(
    "No file breakdown in this build's CI proof",
  );
  await expect(rows.nth(0)).not.toContainText("700 ms");
  await expect(rows.nth(1)).toContainText("Partial: part 2 of 2 missing");
  await expect(rows.nth(1)).not.toContainText("200 ms");
  await expect(rows.nth(1)).toContainText(
    "20 ms · test files · entry dashboard/tests",
  );
  await expect(rows.nth(2)).toContainText(
    "0 ms · test cases · entry dashboard/tests",
  );
  await expect(rows.nth(2)).toContainText(
    "No declared test files evidence in this build's CI proof",
  );
  await expect(rows.nth(2)).toContainText("Selected landing");
  await expect(rows.nth(2)).toContainText(shortSha(setup.completion));
  await expect(history).toContainText("2 measured builds · Nov 5–Nov 6");
  await expect(history).not.toContainText(shortSha(newest.revision));
  const files = scopeHistoryChart(history, "test files");
  await expect(files).toBeVisible();
  await expect(files.getByText("Selected gap", { exact: true })).toBeVisible();
  await expect(
    attemptLink(scopeHistoryReading(history).evidence, "Run 205 · attempt 1"),
  ).toHaveAttribute("href", "https://ci.invalid/runs/205");
  expect(ciCalls()).toHaveLength(before);
});
