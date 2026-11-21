import {
  comparisonReading,
  comparisonEntryCell,
} from "../../test-support/intentCiComparisonPage.ts";
// Relative timing changes in a selected story's CI comparison
// (../../src/IntentCiTimeChange.tsx, ../../src/storyCiRelativeChange.ts):
// each comparable change shows its signed words beside a mark whose zero sits
// at its centre, faster extending left and slower right on one scale shared
// by the summary and the entry cells, reaching one side at a 50% change and
// widening for a larger one. An unchanged time stays at zero; an added entry
// and a measured zero baseline show no mark. **Show %** starts off and
// reveals every percentage together, by keyboard too, without changing the
// marks or the order, and stays chosen across the story's views and a visit
// to Project Intent (SEED-275#story-intent-tabs). The comparison and each
// run's proof are canonical endpoint answers
// (../../test-support/support/frontendIntentComparison.ts); rule variants are
// intent-ci-comparison-relative-scale.spec.ts's and
// intent-summary-story-comparison-relative.spec.ts's.

import {
  openProjectIntent,
  returnToStory,
} from "../../test-support/intentModePage.ts";
import {
  chooseStoryTab,
  expectStoryTab,
} from "../../test-support/support/intentStoryPage.ts";
import { expect, test } from "../../test-support/support/frontendApp.ts";
import { prepareFrontendDoneIntent } from "../../test-support/support/frontendIntentDoneStory.ts";
import { selectDoneStoryForCiComparison } from "../../test-support/support/selectDoneStoryForCiComparison.ts";
import {
  rowNames,
  sortButton,
} from "../../test-support/support/expectSortedColumns.ts";
import {
  expectMark,
  markGeometry,
  percentages,
  showPercent,
  timeMarks,
  expectPercentageValues,
} from "../../test-support/support/relativeTimingMarks.ts";
import { relativelyTimed } from "../../test-support/support/relativelyTimedStory.ts";

test("relative changes share one centred scale, without a mark for an added entry or a zero baseline, and Show % reveals every percentage together", async ({
  page,
  frontendServices,
}) => {
  await prepareFrontendDoneIntent(page, frontendServices, undefined, {
    comparison: relativelyTimed,
  });
  const { panel, intent } = await selectDoneStoryForCiComparison(page);

  await test.step("one scale reaching one side at 50%, faster left and slower right", async () => {
    await expect(comparisonEntryCell(panel, "e/slower", "Branch")).toHaveText(
      "+30 s",
    );
    await expectMark(
      comparisonEntryCell(panel, "e/slower", "Branch"),
      "slower",
      0.25,
    );
    await expectMark(
      comparisonEntryCell(panel, "e/slower", "Landed"),
      "slower",
      0.5,
    );
    await expect(comparisonEntryCell(panel, "e/faster", "Landed")).toHaveText(
      "−1 min",
    );
    await expectMark(
      comparisonEntryCell(panel, "e/faster", "Branch"),
      "faster",
      0.5,
    );
    await expectMark(
      comparisonEntryCell(panel, "e/faster", "Landed"),
      "faster",
      1,
    );
    // The summary shares the scale: CI wall time 3 min → 4 min (+33%).
    await expect(comparisonReading(panel).overallWallTime).toHaveText("+1 min");
    await expectMark(comparisonReading(panel).overallWallTime, "slower", 2 / 3);
  });

  await test.step("an unchanged time stays at zero; an added entry and a zero baseline show their words without a mark", async () => {
    await expect(comparisonEntryCell(panel, "e/same", "Landed")).toHaveText(
      "0 s",
    );
    await expectMark(comparisonEntryCell(panel, "e/same", "Landed"), "none", 0);
    for (const [entry, words] of [
      ["e/zero", "+30 s"],
      ["e/added", "30 s"],
    ] as const) {
      await expect(comparisonEntryCell(panel, entry, "Landed")).toHaveText(
        words,
      );
      await expect(
        timeMarks(comparisonEntryCell(panel, entry, "Landed")),
      ).toHaveCount(0);
    }
  });

  // Branch and Landed of slower, faster and same, the summary's wall time and
  // its unchanged 2 min without runner waits.
  const shown = ["+13%", "−25%", "0%", "+25%", "−50%", "0%", "+33%", "0%"];
  await test.step("Show % starts off and reveals every percentage together by keyboard, keeping marks and order", async () => {
    const toggle = showPercent(panel);
    await expect(toggle).not.toBeChecked();
    await expect(percentages(panel)).toHaveCount(0);
    await sortButton(comparisonReading(panel).entryTable, "Landed").click();
    const order = await rowNames(
      comparisonReading(panel).entryTable,
    ).allTextContents();
    const before = await markGeometry(
      comparisonEntryCell(panel, "e/faster", "Landed"),
    );

    await toggle.focus();
    await page.keyboard.press("Space");
    await expect(toggle).toBeChecked();
    await expect(comparisonEntryCell(panel, "e/slower", "Branch")).toHaveText(
      "+30 s+13%",
    );
    await expectPercentageValues(panel, shown);
    await expect(
      percentages(comparisonEntryCell(panel, "e/zero", "Landed")),
    ).toHaveCount(0);
    await expect(rowNames(comparisonReading(panel).entryTable)).toHaveText(
      order,
    );
    expect(
      await markGeometry(comparisonEntryCell(panel, "e/faster", "Landed")),
    ).toEqual(before);
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
