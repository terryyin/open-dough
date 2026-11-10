// Relative timing changes in a selected story's CI comparison
// (../../src/IntentCiTimeChange.tsx, ../../src/storyCiRelativeChange.ts):
// each comparable change shows its signed words beside a mark whose zero sits
// at its centre, faster extending left and slower right on one scale shared
// by the summary and the entry cells, reaching one side at a 50% change and
// widening for a larger one. An unchanged time stays at zero; an added entry
// and a measured zero baseline show no mark. **Show %** starts off and
// reveals every percentage together, by keyboard too, without changing the
// marks or the order, and stays chosen across the story's views and a visit
// to Project Intent (SEED-275#story-intent-tabs).

import type { Locator } from "@playwright/test";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { openProjectIntent, returnToStory } from "../intentModePage.ts";
import { chooseStoryTab, expectStoryTab } from "../support/intentStoryPage.ts";
import { expect, test } from "../dashboardTest.ts";
import { prepareRelativeComparisonReading } from "../support/relativeCiComparisonReading.ts";
import { selectDoneStoryForCiComparison } from "../support/selectDoneStoryForCiComparison.ts";
import { rowNames, sortButton } from "../support/expectSortedColumns.ts";
import {
  expectMark,
  markGeometry,
  percentages,
  showPercent,
} from "../support/relativeTimingMarks.ts";

const timed = (path: string, ms: number) =>
  makeMe.aCiProofEntry.at(path).timed(ms).please();

// Baseline → Branch → Landed: slower 4 min → 4 min 30 s (+13%) → 5 min
// (+25%); faster 2 min → 1 min 30 s (−25%) → 1 min (−50%); same 45 s
// throughout; zero 0 s → 30 s twice; added only after Baseline.
const entries = {
  baseline: [
    timed("e/slower", 240_000),
    timed("e/faster", 120_000),
    timed("e/same", 45_000),
    timed("e/zero", 0),
  ],
  branch: [
    timed("e/slower", 270_000),
    timed("e/faster", 90_000),
    timed("e/same", 45_000),
    timed("e/zero", 30_000),
    timed("e/added", 30_000),
  ],
  landed: [
    timed("e/slower", 300_000),
    timed("e/faster", 60_000),
    timed("e/same", 45_000),
    timed("e/zero", 30_000),
    timed("e/added", 30_000),
  ],
};

const entryTable = (panel: Locator) =>
  panel.getByRole("table", { name: "CI entry timing comparison" });

// The Branch (3) or Landed (4) cell of ENTRY's row.
const cell = (panel: Locator, entry: string, column: "Branch" | "Landed") =>
  entryTable(panel)
    .locator("tbody tr")
    .filter({ has: panel.page().getByRole("rowheader", { name: entry }) })
    .getByRole("cell")
    .nth(column === "Branch" ? 2 : 3);

const wallChange = (panel: Locator) =>
  panel.locator(".intent-ci-comparison-overall-wall");

test("relative changes share one centred scale, without a mark for an added entry or a zero baseline, and Show % reveals every percentage together", async ({
  page,
}) => {
  await prepareRelativeComparisonReading(page, entries, {
    baseline: 180000,
    branch: 200000,
    landed: 240000,
  });
  const { panel, intent } = await selectDoneStoryForCiComparison(page);

  await test.step("one scale reaching one side at 50%, faster left and slower right", async () => {
    await expect(cell(panel, "e/slower", "Branch")).toHaveText("+30 s");
    await expectMark(cell(panel, "e/slower", "Branch"), "slower", 0.25);
    await expectMark(cell(panel, "e/slower", "Landed"), "slower", 0.5);
    await expect(cell(panel, "e/faster", "Landed")).toHaveText("−1 min");
    await expectMark(cell(panel, "e/faster", "Branch"), "faster", 0.5);
    await expectMark(cell(panel, "e/faster", "Landed"), "faster", 1);
    // The summary shares the scale: CI wall time 3 min → 4 min (+33%).
    await expect(wallChange(panel)).toHaveText("+1 min");
    await expectMark(wallChange(panel), "slower", 2 / 3);
  });

  await test.step("an unchanged time stays at zero; an added entry and a zero baseline show their words without a mark", async () => {
    await expect(cell(panel, "e/same", "Landed")).toHaveText("0 s");
    await expectMark(cell(panel, "e/same", "Landed"), "none", 0);
    for (const [entry, words] of [
      ["e/zero", "+30 s"],
      ["e/added", "30 s"],
    ] as const) {
      await expect(cell(panel, entry, "Landed")).toHaveText(words);
      await expect(
        cell(panel, entry, "Landed").locator(".intent-ci-time-mark"),
      ).toHaveCount(0);
    }
  });

  // Branch and Landed of slower, faster and same, and the summary's wall time.
  const shown = ["+13%", "−25%", "0%", "+25%", "−50%", "0%", "+33%"];
  await test.step("Show % starts off and reveals every percentage together by keyboard, keeping marks and order", async () => {
    const toggle = showPercent(panel);
    await expect(toggle).not.toBeChecked();
    await expect(percentages(panel)).toHaveCount(0);
    await sortButton(entryTable(panel), "Landed").click();
    const order = await rowNames(entryTable(panel)).allTextContents();
    const before = await markGeometry(cell(panel, "e/faster", "Landed"));

    await toggle.focus();
    await page.keyboard.press("Space");
    await expect(toggle).toBeChecked();
    await expect(cell(panel, "e/slower", "Branch")).toHaveText("+30 s+13%");
    expect((await percentages(panel).allTextContents()).sort()).toEqual(
      [...shown].sort(),
    );
    await expect(
      cell(panel, "e/zero", "Landed").locator(".intent-ci-time-percent"),
    ).toHaveCount(0);
    await expect(rowNames(entryTable(panel))).toHaveText(order);
    expect(await markGeometry(cell(panel, "e/faster", "Landed"))).toEqual(
      before,
    );
  });

  await test.step("Show % stays chosen across the story's views and a visit to Project Intent", async () => {
    await chooseStoryTab(intent, "Changed tests");
    await chooseStoryTab(intent, "CI comparison");
    await expect(showPercent(panel)).toBeChecked();
    await openProjectIntent(intent);
    await returnToStory(intent);
    await expectStoryTab(intent, "CI comparison");
    await expect(showPercent(panel)).toBeChecked();
    await expect(percentages(panel)).toHaveCount(shown.length);
  });
});
