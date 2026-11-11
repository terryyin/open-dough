import {
  scopeHistory,
  scopeHistoryReading,
  expectScopeHistoryEvidence,
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
import { intentFile, storyTitle } from "../support/intentStoryPage.ts";

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
  const expectHistory = async (
    scope: Locator,
    values: readonly [string, string],
  ) => {
    const history = scopeHistory(scope);
    await expectScopeHistoryEvidence(history, {
      selected: `Selected landing ${shortSha(setup.completion)}`,
      absent: [shortSha(newest.revision), "Run 104"],
      chartUnits: ["test cases", "test files"],
      selectedMarks: ["Selected", "Selected"],
      extent: "2 measured builds · Nov 5–Nov 6",
      rows: [
        `Nov 5 · ${values[0]} · Exact build ${shortSha(setup.baseline)} · Run 101 · attempt 1 · Represents ${shortSha(setup.baseline)} (exact build)`,
        `Nov 6 · ${values[1]} · Selected landing · Exact build ${shortSha(setup.completion)} · Run 103 · attempt 1 · Represents ${shortSha(setup.completion)} (selected landing) (exact build)`,
      ],
    });
    const evidence = scopeHistoryReading(history).evidence;
    const build = evidence.getByRole("link", { name: "Run 103 · attempt 1" });
    await expect(build).toHaveAttribute("href", "https://ci.invalid/runs/103");
    await scopeHistoryReading(history).disclosure.focus();
    await page.keyboard.press("Tab");
    await expect(
      evidence.getByRole("link", { name: "Run 101 · attempt 1" }),
    ).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(build).toBeFocused();
    await expectNoSidewaysScrollIn(page, history);
    expect(ciCalls()).toHaveLength(before);
    return history;
  };
  const summary = await openSummaryComparison(intent, "dashboard/tests");
  await expectHistory(summary, [
    "700 ms · test cases · entry dashboard/tests · 70 ms · test files · entry dashboard/tests",
    "1.5 s · test cases · entry dashboard/tests · 150 ms · test files · entry dashboard/tests",
  ]);
  // Each declared-unit row opens the same child path, as existing unit journeys do.
  await childName(summary, "folder/").first().click();
  await expect(summary.locator(".intent-summary-path")).toHaveText(
    "dashboard/tests/folder",
  );
  await expectHistory(summary, [
    "300 ms · test cases · entry dashboard/tests · 30 ms · test files · entry dashboard/tests",
    "900 ms · test cases · entry dashboard/tests · 90 ms · test files · entry dashboard/tests",
  ]);
  await expect(
    intentFile(intent, "dashboard/tests/folder/ghost.spec.ts"),
  ).toHaveCount(0);
  await expect(summary.getByRole("table")).toBeVisible();
  await childName(summary, "nested/").first().click();
  await expectHistory(summary, [
    "200 ms · test cases · entry dashboard/tests · 20 ms · test files · entry dashboard/tests",
    "400 ms · test cases · entry dashboard/tests · 40 ms · test files · entry dashboard/tests",
  ]);
  await childName(summary, "c.spec.ts").first().click();
  await expect(purposeRegion(intent)).toBeVisible();
  await fileReadingTab(intent, "Proof").click();
  await expectHistory(proofRegion(intent), [
    "200 ms · test cases · entry dashboard/tests · 20 ms · test files · entry dashboard/tests",
    "400 ms · test cases · entry dashboard/tests · 40 ms · test files · entry dashboard/tests",
  ]);
  await intentFile(intent, summaryComparisonChanges.modified).click();
  const file = proofRegion(intent);
  const zero = [
    "100 ms · test cases · entry dashboard/tests · 10 ms · test files · entry dashboard/tests",
    "0 ms · test cases · entry dashboard/tests · 0 ms · test files · entry dashboard/tests",
  ] as const;
  await expectHistory(file, zero);
  await expect(
    file.getByRole("table", {
      name: "CI proof of dashboard/tests/folder/a.spec.ts",
      exact: true,
    }),
  ).toBeVisible();
  await fileReadingTab(intent, "Purpose").click();
  await expect(
    purposeRegion(intent).locator(".intent-story-diff-name"),
  ).toHaveText(summaryComparisonChanges.modified);
  await fileReadingTab(intent, "Proof").click();
  await expectHistory(file, zero);
  await expect(storyTitle(intent)).toHaveText("Story A");
  await expect(
    intentFile(intent, summaryComparisonChanges.modified),
  ).toHaveAttribute("aria-pressed", "true");
  expect(ciCalls()).toHaveLength(before);
});
