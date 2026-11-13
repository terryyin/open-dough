// A Done story's test execution time reads at a glance while drilling from
// its test entry into a folder and a test file: each Summary reads its history
// before the child table, and file Proof's Test cases / Test file choice
// changes the selected value, average and chart scale together, by keyboard
// and touch, in light and dark appearance. Raw retained priors and the
// selected landing's proof, as a machine keeps them, feed the real
// authenticated history read of the Done story the worker keeps
// (../support/projectScopeHistoryFixture.ts). Collecting them is
// ./intent-scope-collected-file-timing-history.spec.ts's.
import { shortSha } from "../../src/baseCiWording.ts";
import { expectReadableContrast } from "../accessibleReading.ts";
import {
  centreOf,
  expectFailedMarkPainted,
  expectMarkOver,
  inspectMark,
} from "../ciHistoryChartPage.ts";
import { fileProofTable } from "../intentFileProofPage.ts";
import {
  fileReadingTab,
  proofRegion,
  purposeRegion,
} from "../intentPerspectivePage.ts";
import {
  chooseTimingUnit,
  expectScopeReadout,
  scopeHistory,
  scopeHistoryChart,
  scopeHistoryReading,
} from "../intentScopeHistoryPage.ts";
import { childName, scopeTable } from "../intentScopeProofPage.ts";
import { expectNoSidewaysScrollIn } from "../pageLayout.ts";
import { expectStackedInOrder } from "../partArrangement.ts";
import {
  expectChangeCue,
  priorBuildReferenceReading,
} from "../priorBuildReferencePage.ts";
import { declaredSummaryComparisonEndpointsIn } from "../support/intentSummaryStoryComparisonRepository.ts";
import { serveSummaryComparisonStory } from "../support/intentSummaryStoryComparisonServing.ts";
import { keepLandedCiHistory } from "../support/landedCiHistory.ts";
import { expect } from "../support/preparationPage.ts";
import { test } from "../support/projectScopeHistoryFixture.ts";
import { openCollectedHistoryStory } from "../support/scopeHistoryCollectedPage.ts";
import { serveKeptScopeProofs } from "../support/scopeHistoryCollection.ts";
import { keptScopeFileProof } from "../support/scopeHistoryProofs.ts";
import { scopePriorReferenceHistory } from "../support/scopePriorReferenceHistory.ts";
import { openSummaryComparison } from "../support/selectDoneStoryForSummaryComparison.ts";

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

test("drilling from a Done story's test entry to a folder and a test file reads each scope's execution time history before its table", async ({
  page,
  dashboard,
  origin,
  github,
}) => {
  const setup = await serveSummaryComparisonStory(
    page,
    origin,
    declaredSummaryComparisonEndpointsIn(origin.project),
  );
  // Five priors per test case of a.spec.ts, c.spec.ts at twice and root.spec.ts
  // at three times, each test file outcome a tenth, make each average; the
  // sixth prior build failed.
  const priorBuilds = [100, 100, 100, 100, 115, "failed"] as const;
  const selectedProof = keptScopeFileProof(
    { revision: setup.completion, runId: 103 },
    [
      ["folder/a.spec.ts", 120, 12],
      ["folder/nested/c.spec.ts", 240, 24],
      ["folder/ghost.spec.ts", 360, 36],
      ["root.spec.ts", 720, 72],
    ],
  );
  serveKeptScopeProofs(setup, [
    [setup.completion, 103, "2026-11-07T10:00:00Z", selectedProof],
  ]);
  await keepLandedCiHistory(
    dashboard.home,
    scopePriorReferenceHistory(origin, setup, priorBuilds, { selectedProof }),
  );
  const { intent } = await openCollectedHistoryStory(page, dashboard.origin);
  const ciCalls = () =>
    github.calls.filter(({ request }) => request.kind.startsWith("actions-"));
  const before = ciCalls().length;
  const landing = `Selected landing ${shortSha(setup.completion)}`;
  const priors = "5 prior builds used";

  const summary = await openSummaryComparison(intent, "dashboard/tests");
  const history = scopeHistory(summary);
  await expectScopeReadout(history, {
    selected: `${landing} · 1.4 s`,
    average: `Prior-build average · 618 ms · ${priors}`,
    change: "vs. prior average · +822 ms (+133%)",
  });
  await expectChangeCue(page, history, "slower");
  await expect(scopeHistoryReading(history).measure).toBeVisible();
  // No build list, membership or methodology; the chart and readout read it.
  await expect(history.getByRole("list")).toHaveCount(0);
  await expect(priorBuildReferenceReading(history).evidence).toHaveCount(0);
  for (const removed of [
    "Builds and evidence",
    "Median",
    "calibration",
    "Represents",
    "Observed scope at each build",
  ])
    await expect(history).not.toContainText(removed);
  await expectStackedInOrder([history, scopeTable(summary, "dashboard/tests")]);
  // Six prior builds and the selected landing, which the readout names.
  const entryChart = scopeHistoryChart(history, "test cases");
  await expect(entryChart.marks).toHaveCount(7);
  await expect(entryChart.readout).toHaveText(
    "Nov 7 · Selected landing · 1.4 s",
  );
  // The failed build is its red × below the axis, under its mark.
  await expectMarkOver(entryChart, "Nov 6 · Failed build", entryChart.failed);
  await expectFailedMarkPainted(page, entryChart);
  await expect(entryChart.averageLabel).toHaveText(
    "Prior-build average 618 ms",
  );

  await childName(summary, "folder/").first().click();
  await expect(summary.locator(".intent-summary-path")).toHaveText(
    "dashboard/tests/folder",
  );
  await expectScopeReadout(history, {
    selected: `${landing} · 720 ms`,
    average: `Prior-build average · 309 ms · ${priors}`,
    change: "vs. prior average · +411 ms (+133%)",
  });
  await expectStackedInOrder([
    history,
    scopeTable(summary, "dashboard/tests/folder"),
  ]);

  // The file's Proof: history above its comparison, Test cases first.
  await childName(summary, "a.spec.ts").first().click();
  await expect(purposeRegion(intent)).toBeVisible();
  await fileReadingTab(intent, "Proof").click();
  const file = proofRegion(intent);
  const fileHistory = scopeHistory(file);
  const path = "dashboard/tests/folder/a.spec.ts";
  await expectStackedInOrder([fileHistory, fileProofTable(file, path)]);
  await expect(fileProofTable(file, path)).toContainText("Baseline");
  const cases = scopeHistoryChart(fileHistory, "test cases");
  await expectScopeReadout(fileHistory, {
    selected: `${landing} · 120 ms`,
    average: `Prior-build average · 103 ms · ${priors}`,
    change: "vs. prior average · +17 ms (+17%)",
  });
  // The dashed 103 ms average lies between its Nov 1/100 ms and Nov 5/115 ms marks.
  await expect(cases.averageLabel).toHaveText("Prior-build average 103 ms");
  const [low, high, average] = await Promise.all(
    [
      cases.mark("Nov 1 · 100 ms"),
      cases.mark("Nov 5 · 115 ms"),
      cases.average,
    ].map(async (mark) => (await centreOf(mark)).y),
  );
  expect(average).toBeCloseTo(
    (low ?? 0) + (((high ?? 0) - (low ?? 0)) * (103 - 100)) / 15,
    0,
  );
  // Each unit's own scale around its own timings.
  await expect(cases.axisLabels).toHaveText([
    "90 ms",
    "100 ms",
    "110 ms",
    "120 ms",
    "130 ms",
  ]);

  // A tap chooses the file's own outcome: its value, average and scale.
  await chooseTimingUnit(fileHistory, "Test file", "touch");
  await expectScopeReadout(fileHistory, {
    selected: `${landing} · 12 ms`,
    average: `Prior-build average · 10 ms · ${priors}`,
    change: "vs. prior average · +2 ms (+17%)",
  });
  const files = scopeHistoryChart(fileHistory, "test files");
  await expect(cases.drawing).toHaveCount(0);
  await expect(files.average).toHaveCount(1);
  await expect(files.axisLabels).toHaveText([
    "5 ms",
    "10 ms",
    "15 ms",
    "20 ms",
  ]);
  await inspectMark(files, "Nov 1 · 10 ms", "touch");

  // The keyboard returns to Test cases; Purpose and the return stay offered.
  await chooseTimingUnit(fileHistory, "Test cases", "keyboard");
  await expect(cases.readout).toHaveText("Nov 7 · Selected landing · 120 ms");
  await expect(
    file.getByRole("button", { name: "View story CI comparison", exact: true }),
  ).toBeVisible();
  await expect(fileReadingTab(intent, "Purpose")).toBeVisible();
  await expectNoSidewaysScrollIn(page, fileHistory);

  await page.emulateMedia({ colorScheme: "dark" });
  await expectChangeCue(page, fileHistory, "slower");
  await expectReadableContrast(
    scopeHistoryReading(fileHistory).unit("Test cases"),
  );
  await expectReadableContrast(
    scopeHistoryReading(fileHistory).unit("Test file"),
  );
  await expectReadableContrast(scopeHistoryReading(fileHistory).selected);
  await expectReadableContrast(cases.readout);
  expect(ciCalls()).toHaveLength(before);
});
