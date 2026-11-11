import {
  scopeHistory,
  scopeHistoryReading,
  expectScopeHistoryEvidence,
} from "../intentScopeHistoryPage.ts";
import { readFileSync, writeFileSync } from "node:fs";
import { historyFile } from "../support/collectedScopeHistory.ts";
import { expectComparisonUnitFigures } from "../intentScopeProofPage.ts";
import { expectNoSidewaysScrollIn } from "../pageLayout.ts";
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
  expect(collected.body).toMatchObject({
    selectedRevision: setup.completion,
    availability: "retained",
    entries: [
      {
        kind: "point",
        readings: [
          { kind: "point", unit: "case", ms: 1200 },
          { kind: "point", unit: "file", ms: 80 },
        ],
        selected: false,
      },
      {
        kind: "point",
        readings: [
          { kind: "point", unit: "case", ms: 0 },
          { kind: "point", unit: "file", ms: 900 },
        ],
        selected: true,
      },
    ],
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
  await expectScopeHistoryEvidence(history, {
    selected: `Selected landing ${shortSha(setup.completion)}`,
    absent: [shortSha(newest.revision), "Run 104"],
    chartUnits: ["test cases", "test files"],
    selectedMarks: ["Selected", "Selected"],
    extent: "2 measured builds · Nov 5–Nov 6",
    rows: [
      `Nov 5 · 1.2 s · test cases · entry dashboard/tests · 80 ms · test files · entry dashboard/tests · Exact build ${shortSha(setup.baseline)} · Run 101 · attempt 1 · Represents ${shortSha(setup.baseline)} (exact build)`,
      `Nov 6 · 0 ms · test cases · entry dashboard/tests · 900 ms · test files · entry dashboard/tests · Selected landing · Exact build ${shortSha(setup.completion)} · Run 103 · attempt 1 · Represents ${shortSha(setup.completion)} (selected landing) (exact build)`,
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
  await expect(scopeHistoryReading(history).rows).toHaveCount(2);
  await expect(storyTitle(intent)).toHaveText("Story A");
  await expectComparison();
  expect(ciCalls()).toHaveLength(beforeHistory);

  // The real store fault, failed HTTP read, kept comparison and retry order are explicit.
  const file = historyFile(dashboard.home);
  const retained = readFileSync(file, "utf8");
  try {
    writeFileSync(file, "{broken collected history", "utf8");
    const failed = await read();
    expect(failed.status).toBe(502);
    expect(failed.body).toMatchObject({
      error:
        "The collected CI history could not be read. Retry the local history read.",
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
    await expect(shown.rows).toHaveCount(2);
    await expect(history).toContainText("2 measured builds · Nov 5–Nov 6");
    await expect(history).toContainText("0 ms");
  } finally {
    writeFileSync(file, retained, "utf8");
  }
  expect(ciCalls()).toHaveLength(beforeHistory);
});
