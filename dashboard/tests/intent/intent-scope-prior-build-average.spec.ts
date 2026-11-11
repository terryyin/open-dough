import { attemptLink } from "../ciEvidenceLabelsPage.ts";
import {
  scopeHistory,
  scopeHistoryReading,
  scopeHistoryUnit,
} from "../intentScopeHistoryPage.ts";
// Actual selected artifact collection, raw retained priors and the normal
// authenticated read own the entry → folder → file comparison promise.
import { readFileSync, writeFileSync } from "node:fs";
import type { Locator } from "@playwright/test";
import {
  expect,
  queuedClaudePreviewTest as test,
} from "../support/preparationPage.ts";
import { publishSummaryComparisonStory } from "../support/intentSummaryStoryComparisonFixture.ts";
import { scopePriorReferenceHistory } from "../support/scopePriorReferenceHistory.ts";
import {
  keepLandedCiHistory,
  recheckingLandedCi,
  restartAsLandedCiReader,
} from "../support/landedCiHistory.ts";
import {
  historyFile,
  collectedScopeHistory,
} from "../support/collectedScopeHistory.ts";
import {
  recordScopeHistoryLandings,
  retainedProofs,
  serveCollectedScopeFileRuns,
} from "../support/scopeHistoryCollection.ts";
import { openCollectedHistoryStory } from "../support/scopeHistoryCollectedPage.ts";
import { openSummaryComparison } from "../support/selectDoneStoryForSummaryComparison.ts";
import { childName } from "../intentScopeProofPage.ts";
import {
  fileReadingTab,
  proofRegion,
  purposeRegion,
  intentLocationName,
} from "../intentPerspectivePage.ts";
import { intentFile, storyTitle } from "../support/intentStoryPage.ts";
import { priorBuildReferenceReading } from "../priorBuildReferencePage.ts";
import { expectNoSidewaysScrollIn } from "../pageLayout.ts";
import type { DashboardServer } from "../support/dashboardServer.ts";

test.use({ extraEnv: recheckingLandedCi });
const readers: DashboardServer[] = [];
test.afterEach(async () => {
  await Promise.all(readers.splice(0).map((reader) => reader.close()));
});

test("each Done scope compares its own collected time through restart, accessible drill and independent history retry", async ({
  page,
  dashboard,
  origin,
  github,
}) => {
  const setup = await publishSummaryComparisonStory(page, origin);
  keepLandedCiHistory(
    dashboard.home,
    scopePriorReferenceHistory(origin, setup, [100, 100, 100, 100, 115, 116]),
  );
  serveCollectedScopeFileRuns(setup, [
    [
      setup.baseline,
      101,
      "2026-11-05T12:00:00Z",
      [["folder/a.spec.ts", 100, 10]],
    ],
    [
      setup.branchSide,
      102,
      "2026-11-06T09:00:00Z",
      [["folder/a.spec.ts", 110, 11]],
    ],
    [
      setup.completion,
      103,
      "2026-11-07T10:00:00Z",
      [
        ["folder/a.spec.ts", 120, 12],
        ["folder/nested/c.spec.ts", 240, 24],
        ["folder/ghost.spec.ts", 360, 36],
        ["root.spec.ts", 720, 72],
      ],
    ],
  ]);
  recordScopeHistoryLandings(dashboard, origin, setup.identity, [
    {
      revision: setup.completion,
      at: "2026-11-07T10:10:00Z",
      workflow: "execution",
      receipt: "10000000-0000-4000-8000-000000000002",
      title: "Story A execution",
    },
  ]);
  await expect
    .poll(() => retainedProofs(dashboard.home)["run/103/1"])
    .toMatchObject({
      kind: "summary",
      summary: {
        entries: [
          {
            evidence: [
              { unit: "case", durationMs: 1440 },
              { unit: "file", durationMs: 144 },
            ],
          },
        ],
      },
    });
  const reader = await restartAsLandedCiReader(dashboard, origin, "preview");
  readers.push(reader);
  const api = await collectedScopeHistory(
    reader.origin,
    "dashboard/tests/folder",
    setup.completion,
    "2026-11-07T10:10:00Z",
  );
  expect(api.status).toBe(200);
  expect(api.body.selectedRevision).toBe(setup.completion);
  expect(
    api.body.references?.find(({ unit }) => unit === "case")?.reference,
  ).toMatchObject({
    endpoint: setup.completion,
    averageMs: 309,
    sampleCount: 5,
    selected: { ms: 720 },
    difference: { changeMs: 411 },
  });
  await page.setViewportSize({ width: 390, height: 844 });
  const { intent } = await openCollectedHistoryStory(page, reader.origin);
  const ciCalls = () =>
    github.calls.filter(({ request }) => request.kind.startsWith("actions-"));
  const before = ciCalls().length;
  const summary = await openSummaryComparison(intent, "dashboard/tests");
  const check = async (
    scope: Locator,
    average: string,
    selected: string,
    difference: string,
  ) => {
    const history = scopeHistory(scope);
    const cases = scopeHistoryUnit(history, "Test cases");
    await expect(cases).toContainText(`Prior-build average · ${average}`);
    await expect(cases).toContainText(selected);
    await expect(cases).toContainText(difference);
    await expect(cases).toContainText("5 prior builds used · Nov 1–Nov 5");
    await expect(cases).toContainText("reference for normal timing");
    await expect(cases).toContainText(
      "exclude values strictly more than 15% above that median, once",
    );
    await expect(scopeHistoryReading(cases).reference).toHaveCount(1);
    await expect(scopeHistoryReading(cases).points).toHaveCount(7);
    const samples = priorBuildReferenceReading(cases);
    await expect(samples.included).toHaveCount(5);
    await expect(samples.excluded).toContainText("Slow outlier");
    await expect(samples.selected).toContainText("Exact build");
    const link = attemptLink(samples.evidence, "Run 201 · attempt 1");
    await link.focus();
    await expect(link).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(
      attemptLink(samples.evidence, "Run 202 · attempt 1"),
    ).toBeFocused();
    await expect(link).toHaveAttribute("href", "https://ci.invalid/runs/201");
    await expectNoSidewaysScrollIn(page, history);
    expect(ciCalls()).toHaveLength(before);
    return history;
  };
  await check(summary, "618 ms", "1.4 s", "+822 ms (+133%)");
  await childName(summary, "folder/").first().click();
  await expect(summary.locator(".intent-summary-path")).toHaveText(
    "dashboard/tests/folder",
  );
  await check(summary, "309 ms", "720 ms", "+411 ms (+133%)");
  await expect(
    intentFile(intent, "dashboard/tests/folder/ghost.spec.ts"),
  ).toHaveCount(0);
  await childName(summary, "a.spec.ts").first().click();
  await expect(purposeRegion(intent)).toBeVisible();
  await fileReadingTab(intent, "Proof").click();
  const file = proofRegion(intent);
  await check(file, "103 ms", "120 ms", "+17 ms (+17%)");
  // The file's 103 ms reference lies between its Nov 1/100 ms and Nov 5/115 ms anchors.
  const caseHistory = scopeHistoryUnit(scopeHistory(file), "Test cases");
  const plot = scopeHistoryReading(caseHistory);
  await expect(plot.charts).toBeVisible();
  const low = plot.unselectedPoints.filter({
    hasText: /^Nov 1 · 100 ms · test cases ·/,
  });
  const high = plot.unselectedPoints.filter({
    hasText: /^Nov 5 · 115 ms · test cases ·/,
  });
  const [lowY, highY, y1, y2] = await Promise.all([
    low.getAttribute("cy"),
    high.getAttribute("cy"),
    plot.referenceLine.getAttribute("y1"),
    plot.referenceLine.getAttribute("y2"),
  ]);
  expect([lowY, highY, y1, y2]).not.toContain(null);
  expect(Number(lowY)).not.toBe(Number(highY));
  expect(Number(y1)).toBeCloseTo(
    Number(lowY) + (Number(highY) - Number(lowY)) * ((103 - 100) / (115 - 100)),
    6,
  );
  expect(Number(y2)).toBe(Number(y1));
  await expect(scopeHistoryUnit(file, "Test files")).toContainText(
    "Prior-build average · 10 ms",
  );
  await expect(
    file.getByRole("table", {
      name: "CI proof of dashboard/tests/folder/a.spec.ts",
      exact: true,
    }),
  ).toBeVisible();
  await fileReadingTab(intent, "Purpose").click();
  await expect(purposeRegion(intent)).toBeVisible();
  await fileReadingTab(intent, "Proof").click();
  await check(file, "103 ms", "120 ms", "+17 ms (+17%)");
  await expect(storyTitle(intent)).toHaveText("Story A");
  await expect(
    file.getByRole("table", {
      name: "CI proof of dashboard/tests/folder/a.spec.ts",
      exact: true,
    }),
  ).toContainText("Baseline");

  // Fail only the local history read and preserve the selected story/Proof.
  const filePath = historyFile(dashboard.home);
  const retained = readFileSync(filePath, "utf8");
  try {
    writeFileSync(filePath, "{broken local history");
    await intentLocationName(intent, "dashboard/tests").click();
    const history = scopeHistory(summary);
    await expect(scopeHistoryReading(history).failure).toContainText(
      "collected CI history could not be read",
    );
    await expect(storyTitle(intent)).toHaveText("Story A");
    await expect(summary.getByRole("table")).toBeVisible();
    writeFileSync(filePath, retained);
    await scopeHistoryReading(history).retry.click();
    await expect(scopeHistoryReading(history).failure).toHaveCount(0);
    await check(summary, "618 ms", "1.4 s", "+822 ms (+133%)");
  } finally {
    writeFileSync(filePath, retained);
  }
  expect(ciCalls()).toHaveLength(before);
});
