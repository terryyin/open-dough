import {
  chooseTimingUnit,
  scopeHistory,
  scopeHistoryReading,
  scopeHistoryChart,
} from "../../dashboard/tests/intentScopeHistoryPage.ts";
// Real collected artifacts distinguish entry-only, partial and absent-unit
// history while a Done file keeps earlier supported evidence in Proof.
import { shortSha } from "../../dashboard/src/baseCiWording.ts";
import {
  fileReadingTab,
  proofRegion,
} from "../../dashboard/tests/intentPerspectivePage.ts";
import { childName } from "../../dashboard/tests/intentScopeProofPage.ts";
import { collectedScopeFileSummary } from "../../dashboard/tests/support/scopeHistoryProofs.ts";
import type { DashboardServer } from "../../dashboard/tests/support/dashboardServer.ts";
import { publishSummaryComparisonStory } from "../../dashboard/tests/support/intentSummaryStoryComparisonFixture.ts";
import {
  collectingLandedCi,
  resultToLand,
} from "../../dashboard/tests/support/landedCiHistory.ts";
import {
  expect,
  queuedClaudePreviewTest as test,
} from "../../dashboard/tests/support/preparationPage.ts";
import { observeRetainedScopeOrder } from "../../dashboard/tests/support/scopeHistoryCollectedOrder.ts";
import { openCollectedHistoryStory } from "../../dashboard/tests/support/scopeHistoryCollectedPage.ts";
import {
  recordScopeHistoryLandings,
  retainedProofs,
  serveCollectedScopeProofs,
} from "../../dashboard/tests/support/scopeHistoryCollection.ts";
import { openSummaryComparison } from "../../dashboard/tests/support/selectDoneStoryForSummaryComparison.ts";
import { land } from "../../dashboard/tests/support/startSessionLandingContext.ts";
import { git } from "../../dashboard/tests/support/storyReviewWorktree.ts";

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
  const noBreakdown = "No timing · No file breakdown in this build's CI proof";
  const partial = "No timing · Partial: part 2 of 2 missing";
  await expect(
    scopeHistoryChart(entryHistory, "test cases").mark("Nov 4 · 700 ms"),
  ).toHaveCount(1);
  await chooseTimingUnit(entryHistory, "Test files", "pointer");
  await expect(
    scopeHistoryChart(entryHistory, "test files").mark("Nov 4 · 70 ms"),
  ).toHaveCount(1);
  // The folder has no breakdown at Nov 4 and partial case timing at Nov 5.
  await childName(summary, "folder/").first().click();
  const folder = scopeHistory(summary);
  const folderCases = scopeHistoryChart(folder, "test cases");
  await expect(folderCases.mark(`Nov 4 · ${noBreakdown}`)).toHaveCount(1);
  await expect(folderCases.mark(`Nov 5 · ${partial}`)).toHaveCount(1);
  await chooseTimingUnit(folder, "Test files", "pointer");
  const folderFiles = scopeHistoryChart(folder, "test files");
  await expect(folderFiles.mark(`Nov 4 · ${noBreakdown}`)).toHaveCount(1);
  await expect(folderFiles.mark("Nov 5 · 20 ms")).toHaveCount(1);
  await childName(summary, "a.spec.ts").first().click();
  await fileReadingTab(intent, "Proof").click();
  const history = scopeHistory(proofRegion(intent));
  const reading = scopeHistoryReading(history);
  const landing = `Selected landing ${shortSha(setup.completion)}`;
  await expect(reading.selected).toHaveText(`${landing} · 0 ms`);
  const cases = scopeHistoryChart(history, "test cases");
  await expect(cases.marks).toHaveCount(3);
  await expect(cases.mark(`Nov 4 · ${noBreakdown}`)).toHaveCount(1);
  await expect(cases.mark(`Nov 5 · ${partial}`)).toHaveCount(1);
  await expect(cases.readout).toHaveText("Nov 6 · Selected landing · 0 ms");
  await expect(history).not.toContainText(shortSha(newest.revision));
  // The file outcome has no selected timing: its status, and no change.
  await chooseTimingUnit(history, "Test file", "keyboard");
  const absent =
    "No timing · No declared test files evidence in this build's CI proof";
  await expect(reading.selected).toHaveText(`${landing} · ${absent}`);
  await expect(reading.change).toHaveCount(0);
  const files = scopeHistoryChart(history, "test files");
  await expect(files.mark("Nov 5 · 20 ms")).toHaveCount(1);
  await expect(files.readout).toHaveText(
    `Nov 6 · Selected landing · ${absent}`,
  );
  await expect(files.unavailable).toHaveCount(2);
  expect(ciCalls()).toHaveLength(before);
});
