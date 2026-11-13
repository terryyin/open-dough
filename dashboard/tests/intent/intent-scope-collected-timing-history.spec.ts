import {
  chooseTimingUnit,
  scopeHistory,
  scopeHistoryChart,
  scopeHistoryReading,
} from "../intentScopeHistoryPage.ts";
import { readFileSync, writeFileSync } from "node:fs";
import { historyFile } from "../support/collectedScopeHistory.ts";
import {
  expectComparisonUnitFigures,
  scopeTable,
} from "../intentScopeProofPage.ts";
import { expectNoSidewaysScrollIn } from "../pageLayout.ts";
import { expectStackedInOrder } from "../partArrangement.ts";
// A real collector-to-Summary journey. Published CLI history supplies the Done
// endpoint. Historical landing/Done inputs are arranged through MakeMe; an
// additional real landing submission nudges collection with Intent closed.
// No history answer or retained proof payload is injected into the product.
import { shortSha } from "../../src/baseCiWording.ts";
import { purposeRegion, intentLocationName } from "../intentPerspectivePage.ts";
import type { DashboardServer } from "../support/dashboardServer.ts";
import {
  collectingLandedCi,
  resultToLand,
} from "../support/landedCiHistory.ts";
import { publishSummaryComparisonStory } from "../support/intentSummaryStoryComparisonFixture.ts";
import {
  expect,
  queuedClaudePreviewTest as test,
} from "../support/preparationPage.ts";
import { openSummaryComparison } from "../support/selectDoneStoryForSummaryComparison.ts";
import { land } from "../support/startSessionLandingContext.ts";
import { intentFile, storyTitle } from "../support/intentStoryPage.ts";
import {
  retainedProofs,
  recordScopeHistoryLandings,
  serveCollectedScopeRuns,
} from "../support/scopeHistoryCollection.ts";
import { observeRetainedScopeOrder } from "../support/scopeHistoryCollectedOrder.ts";
import { openCollectedHistoryStory } from "../support/scopeHistoryCollectedPage.ts";

test.use({ extraEnv: collectingLandedCi });

const readers: DashboardServer[] = [];
test.afterEach(async () => {
  await Promise.all(readers.splice(0).map((reader) => reader.close()));
});

test("a Done entry shows collector-acquired test timing through its middle landing while later unrelated evidence stays out", async ({
  page,
  dashboard,
  origin,
  github,
}) => {
  // Actual publication and collection previously used 29.8s before navigation.
  test.setTimeout(60_000);
  // Publish the actual CLI completion, owning merge and historical Intent tree.
  const setup = await publishSummaryComparisonStory(page, origin);
  const newest = await resultToLand(dashboard, "later-unrelated-history.txt");
  const recorded = [
    // Receipt dates deliberately disagree with trunk ancestry: a delayed
    // preparation receipt arrives after E, while R's clock appears before E.
    {
      revision: setup.baseline,
      at: "2026-11-08T10:10:00.000Z",
      workflow: "refinement" as const,
      receipt: "10000000-0000-4000-8000-000000000001",
      title: "Story A preparation",
    },
    {
      revision: setup.completion,
      at: "2026-11-06T10:10:00.000Z",
      workflow: "execution" as const,
      receipt: "10000000-0000-4000-8000-000000000002",
      title: "Story A",
    },
    // A later publication R shares the story identity. It must not become
    // the endpoint in place of the published Done result E.
    {
      revision: newest.revision,
      at: "2026-11-04T10:10:00.000Z",
      workflow: "execution" as const,
      receipt: "10000000-0000-4000-8000-000000000003",
      title: "Story A later publication",
    },
  ];
  // These are the recorded historical landing/Done inputs, not collected
  // history. The collector must resolve builds and acquire all proof itself.
  recordScopeHistoryLandings(dashboard, origin, setup.identity, recorded);
  // Raw producer facts: revision, run ID, actual date and execution time.
  serveCollectedScopeRuns(setup, [
    [setup.baseline, 101, "2026-11-05T10:00:00Z", 1200, 80],
    [setup.branchSide, 102, "2026-11-06T09:00:00Z", 3000, 300],
    [setup.completion, 103, "2026-11-06T10:00:00Z", 0, 900],
    [newest.revision, 104, "2026-11-07T10:00:00Z", 9900, 99000],
  ]);

  // This accepted landing is the collection trigger. No page has been opened.
  expect(
    land(newest.record, origin, dashboard.home).result.landing.receipt.revision,
  ).toBe(newest.revision);
  for (const [key, revision, caseMs, fileMs] of [
    ["run/101/1", setup.baseline, 1200, 80],
    ["run/103/1", setup.completion, 0, 900],
    ["run/104/1", newest.revision, 9900, 99000],
  ] as const) {
    await expect
      .poll(() => retainedProofs(dashboard.home)[key])
      .toMatchObject({
        kind: "summary",
        summary: {
          revision,
          entries: [
            {
              evidence: [
                { unit: "case", durationMs: caseMs },
                { unit: "file", durationMs: fileMs },
              ],
            },
          ],
        },
      });
  }
  const { collected, read, reader } = await observeRetainedScopeOrder(
    dashboard,
    origin,
    {
      path: "dashboard/tests",
      revision: setup.completion,
      at: "2026-11-06T10:10:00.000Z",
      order: [setup.baseline, setup.completion, newest.revision],
    },
    readers,
  );
  expect(collected.status).toBe(200);
  // The page's charts below read each unit's collected readings.
  expect(collected.body).toMatchObject({
    selectedRevision: setup.completion,
    availability: "retained",
  });
  expect(
    github.calls.filter(
      ({ request }) => request.kind === "actions-artifact-zip",
    ),
  ).toHaveLength(3);

  await page.setViewportSize({ width: 390, height: 844 });
  const { intent } = await openCollectedHistoryStory(page, reader.origin);
  const ciCalls = () =>
    github.calls.filter(({ request }) => request.kind.startsWith("actions-"));
  const beforeHistory = ciCalls().length;
  const summary = await openSummaryComparison(intent, "dashboard/tests");
  const history = scopeHistory(summary);
  // Two builds through the selected landing, above the child table.
  const reading = scopeHistoryReading(history);
  await expect(reading.selected).toHaveText(
    `Selected landing ${shortSha(setup.completion)} · 0 ms`,
  );
  // One comparable prior: its observations, no average and no change.
  await expect(reading.average).toHaveText(
    "Prior-build average · Insufficient history · 1 prior build used",
  );
  await expect(reading.change).toHaveCount(0);
  const cases = scopeHistoryChart(history, "test cases");
  await expect(cases.marks).toHaveCount(2);
  await expect(cases.mark("Nov 5 · 1.2 s")).toHaveCount(1);
  await expect(cases.readout).toHaveText("Nov 6 · Selected landing · 0 ms");
  await expect(history).not.toContainText(shortSha(newest.revision));
  await expectStackedInOrder([history, scopeTable(summary, "dashboard/tests")]);
  await chooseTimingUnit(history, "Test files", "keyboard");
  await expect(reading.selected).toHaveText(
    `Selected landing ${shortSha(setup.completion)} · 900 ms`,
  );
  const files = scopeHistoryChart(history, "test files");
  await expect(files.marks).toHaveCount(2);
  await expect(files.mark("Nov 5 · 80 ms")).toHaveCount(1);
  await expectNoSidewaysScrollIn(page, history);
  const entry = "dashboard/tests";
  const expectComparison = async () => {
    await expectComparisonUnitFigures(summary, entry, "test cases", [
      "1 test case (no change)",
      "1.2 s",
      "+1.8 s",
      "−1.2 s",
      "1 of 1 part present",
    ]);
    await expectComparisonUnitFigures(summary, entry, "test files", [
      "1 test file (no change)",
      "80 ms",
      "+220 ms",
      "+820 ms",
      "1 of 1 part present",
    ]);
  };
  await expectComparison();
  expect(ciCalls()).toHaveLength(beforeHistory);

  // Visit the existing Purpose reading, then the same entry Summary. These
  // source reads are allowed; neither visit acquires historical CI evidence.
  await intentFile(intent, "dashboard/tests/root.spec.ts").click();
  await expect(purposeRegion(intent)).toBeVisible();
  await intentLocationName(intent, "dashboard/tests").click();
  await expect(scopeHistoryChart(history, "test cases").marks).toHaveCount(2);
  await expect(storyTitle(intent)).toHaveText("Story A");
  await expectComparison();
  expect(ciCalls()).toHaveLength(beforeHistory);

  // The real store fault, failed HTTP read, kept comparison and retry order are explicit.
  const file = historyFile(dashboard.home);
  const retained = readFileSync(file, "utf8");
  try {
    writeFileSync(file, "{broken collected history", "utf8");
    expect(await read()).toMatchObject({
      status: 502,
      body: {
        error:
          "The collected CI history could not be read. Retry the local history read.",
      },
    });
    await intentFile(intent, "dashboard/tests/root.spec.ts").click();
    await expect(purposeRegion(intent)).toBeVisible();
    await intentLocationName(intent, "dashboard/tests").click();
    const shown = scopeHistoryReading(history);
    await expect(shown.failure).toContainText(
      "The collected CI history could not be read.",
    );
    await expect(shown.failure).not.toContainText("gh auth");
    await expect(storyTitle(intent)).toHaveText("Story A");
    await expectComparison();
    writeFileSync(file, retained, "utf8");
    await shown.retry.click();
    await expect(shown.failure).toHaveCount(0);
    await expect(shown.selected).toHaveText(
      `Selected landing ${shortSha(setup.completion)} · 0 ms`,
    );
    await expect(scopeHistoryChart(history, "test cases").marks).toHaveCount(2);
  } finally {
    writeFileSync(file, retained, "utf8");
  }
  expect(ciCalls()).toHaveLength(beforeHistory);
});
