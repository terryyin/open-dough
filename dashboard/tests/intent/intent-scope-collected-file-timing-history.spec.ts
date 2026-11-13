import {
  chooseTimingUnit,
  scopeHistory,
  scopeHistoryChart,
  scopeHistoryReading,
} from "../intentScopeHistoryPage.ts";
import { expectNoSidewaysScrollIn } from "../pageLayout.ts";
// Actual CLI artifacts, collected with Intent closed, remain readable while
// navigating a Done entry, folders and file Proof. Hidden published results
// contribute; later trunk and browsing acquisition do not.
import type { Locator } from "@playwright/test";
import { shortSha } from "../../src/baseCiWording.ts";
import {
  fileReadingTab,
  proofRegion,
  purposeRegion,
} from "../intentPerspectivePage.ts";
import { childName } from "../intentScopeProofPage.ts";
import type { DashboardServer } from "../support/dashboardServer.ts";
import {
  publishSummaryComparisonStory,
  summaryComparisonChanges,
} from "../support/intentSummaryStoryComparisonFixture.ts";
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
  serveCollectedScopeFileRuns,
} from "../support/scopeHistoryCollection.ts";
import { openSummaryComparison } from "../support/selectDoneStoryForSummaryComparison.ts";
import { land } from "../support/startSessionLandingContext.ts";
import {
  intentFile,
  storyTitle,
  intentDiffReading,
} from "../support/intentStoryPage.ts";

test.use({ extraEnv: collectingLandedCi });
const readers: DashboardServer[] = [];
test.afterEach(async () => {
  await Promise.all(readers.splice(0).map((reader) => reader.close()));
});

test("a Done folder and file keep their collected history through Proof and Purpose without acquiring CI", async ({
  page,
  dashboard,
  origin,
  github,
}) => {
  // The real publication/collector journey needs more than the default30s.
  test.setTimeout(60_000);
  const setup = await publishSummaryComparisonStory(page, origin);
  const newest = await resultToLand(dashboard, "later-folder-history.txt");
  recordScopeHistoryLandings(dashboard, origin, setup.identity, [
    {
      revision: setup.baseline,
      at: "2026-11-08T10:10:00.000Z",
      workflow: "refinement",
      receipt: "20000000-0000-4000-8000-000000000001",
      title: "Story A preparation",
    },
    {
      revision: setup.completion,
      at: "2026-11-06T10:10:00.000Z",
      workflow: "execution",
      receipt: "20000000-0000-4000-8000-000000000002",
      title: "Story A",
    },
    {
      revision: newest.revision,
      at: "2026-11-04T10:10:00.000Z",
      workflow: "execution",
      receipt: "20000000-0000-4000-8000-000000000003",
      title: "Story A later publication",
    },
  ]);
  // Exact producer facts, milliseconds for each case and each file outcome.
  const observations = [
    [
      setup.baseline,
      101,
      "2026-11-05T10:00:00Z",
      [
        ["folder/a.spec.ts", 100, 10],
        ["folder/nested/c.spec.ts", 200, 20],
        ["root.spec.ts", 400, 40],
      ],
    ],
    [
      setup.branchSide,
      102,
      "2026-11-06T09:00:00Z",
      [
        ["folder/a.spec.ts", 200, 20],
        ["folder/nested/c.spec.ts", 300, 30],
        ["root.spec.ts", 500, 50],
      ],
    ],
    [
      setup.completion,
      103,
      "2026-11-06T10:00:00Z",
      [
        ["folder/a.spec.ts", 0, 0],
        ["folder/nested/c.spec.ts", 400, 40],
        ["folder/ghost.spec.ts", 500, 50],
        ["root.spec.ts", 600, 60],
      ],
    ],
    [
      newest.revision,
      104,
      "2026-11-07T10:00:00Z",
      [
        ["folder/a.spec.ts", 9900, 990],
        ["folder/nested/c.spec.ts", 8800, 880],
      ],
    ],
  ] as const;
  serveCollectedScopeFileRuns(setup, observations);
  expect(
    land(newest.record, origin, dashboard.home).result.landing.receipt.revision,
  ).toBe(newest.revision);
  for (const key of ["run/101/1", "run/103/1", "run/104/1"])
    await expect
      .poll(() => retainedProofs(dashboard.home)[key]?.kind)
      .toBe("summary");
  const proof = retainedProofs(dashboard.home)["run/103/1"];
  expect(proof).toMatchObject({
    kind: "summary",
    summary: {
      entries: [
        {
          evidence: [
            { unit: "case", durationMs: 1500 },
            { unit: "file", durationMs: 150 },
          ],
        },
      ],
    },
  });
  const { reader } = await observeRetainedScopeOrder(
    dashboard,
    origin,
    {
      path: "dashboard/tests/folder",
      revision: setup.completion,
      at: "2026-11-06T10:10:00.000Z",
      order: [setup.baseline, setup.completion, newest.revision],
    },
    readers,
  );
  await page.setViewportSize({ width: 390, height: 844 });
  const { intent } = await openCollectedHistoryStory(page, reader.origin);
  const ciCalls = () =>
    github.calls.filter(({ request }) => request.kind.startsWith("actions-"));
  const before = ciCalls().length;
  // Each scope's test case timing at Nov 5 and at the selected Nov 6 landing;
  // the later Nov 7 build stays out.
  const expectHistory = async (
    scope: Locator,
    [prior, selected]: readonly [string, string],
  ) => {
    const history = scopeHistory(scope);
    await expect(scopeHistoryReading(history).selected).toHaveText(
      `Selected landing ${shortSha(setup.completion)} · ${selected}`,
    );
    const cases = scopeHistoryChart(history, "test cases");
    await expect(cases.marks).toHaveCount(2);
    await expect(cases.mark(`Nov 5 · ${prior}`)).toHaveCount(1);
    await expect(cases.readout).toHaveText(
      `Nov 6 · Selected landing · ${selected}`,
    );
    await expect(history).not.toContainText(shortSha(newest.revision));
    await expectNoSidewaysScrollIn(page, history);
    expect(ciCalls()).toHaveLength(before);
    return history;
  };
  const summary = await openSummaryComparison(intent, "dashboard/tests");
  await expectHistory(summary, ["700 ms", "1.5 s"]);
  // Each declared-unit row opens the same child path, as existing unit journeys do.
  await childName(summary, "folder/").first().click();
  await expect(summary.locator(".intent-summary-path")).toHaveText(
    "dashboard/tests/folder",
  );
  await expectHistory(summary, ["300 ms", "900 ms"]);
  await expect(
    intentFile(intent, "dashboard/tests/folder/ghost.spec.ts"),
  ).toHaveCount(0);
  await expect(summary.getByRole("table")).toBeVisible();
  await childName(summary, "nested/").first().click();
  await expectHistory(summary, ["200 ms", "400 ms"]);
  await childName(summary, "c.spec.ts").first().click();
  await expect(purposeRegion(intent)).toBeVisible();
  await fileReadingTab(intent, "Proof").click();
  await expectHistory(proofRegion(intent), ["200 ms", "400 ms"]);
  await intentFile(intent, summaryComparisonChanges.modified).click();
  const file = proofRegion(intent);
  const zero = ["100 ms", "0 ms"] as const;
  const history = await expectHistory(file, zero);
  // The file's own outcome: its Test file timing, a measured zero selected.
  await chooseTimingUnit(history, "Test file", "pointer");
  const files = scopeHistoryChart(history, "test files");
  await expect(files.mark("Nov 5 · 10 ms")).toHaveCount(1);
  await expect(files.readout).toHaveText("Nov 6 · Selected landing · 0 ms");
  await expect(
    file.getByRole("table", {
      name: "CI proof of dashboard/tests/folder/a.spec.ts",
      exact: true,
    }),
  ).toBeVisible();
  await fileReadingTab(intent, "Purpose").click();
  await expect(intentDiffReading(intent).name).toHaveText(
    summaryComparisonChanges.modified,
  );
  await fileReadingTab(intent, "Proof").click();
  // Proof returns with its Test file choice.
  await expect(scopeHistoryReading(history).unit("Test file")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(files.readout).toHaveText("Nov 6 · Selected landing · 0 ms");
  await expect(storyTitle(intent)).toHaveText("Story A");
  await expect(
    intentFile(intent, summaryComparisonChanges.modified),
  ).toHaveAttribute("aria-pressed", "true");
  expect(ciCalls()).toHaveLength(before);
});
