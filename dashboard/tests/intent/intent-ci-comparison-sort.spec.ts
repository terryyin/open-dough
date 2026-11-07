// Sorting a selected story's CI entry timing comparison by its columns
// (../../src/IntentCiComparison.tsx, ../../src/CiProofTable.tsx): the given
// entry order until a header is activated; Baseline sorts by its measured
// time with the entry added after baseline last in either direction; Counts
// sorts by the after endpoint's counted results; headers are activated by
// click, Enter or Space and carry aria-sort with a direction arrow
// (SEED-259#scan-intent-ci-summaries). Rows and fixture:
// ../support/expectCiComparisonEntryRows.ts.

import { expect, test } from "../support/preparationPage.ts";
import { publishComparedStoryBranch } from "../support/storyCiComparisonDoneFixture.ts";
import { selectDoneStoryForCiComparison } from "../support/selectDoneStoryForCiComparison.ts";
import {
  expectSortedBy,
  rowNames,
  sortButton,
} from "../support/expectSortedColumns.ts";

test("the entry comparison sorts by Baseline and Counts with the added entry's baseline gap last", async ({
  page,
  origin,
}) => {
  await publishComparedStoryBranch(page, origin);
  const { panel } = await selectDoneStoryForCiComparison(page);
  const table = panel.getByRole("table", {
    name: "CI entry timing comparison",
  });
  // Baseline 4 min, 2 min and added; Landed counts 2,092, 5 and 3.
  await expect(rowNames(table)).toHaveText([
    "dashboard/tests",
    "tests",
    "src/skills",
  ]);
  await expect(table.locator("th[aria-sort]")).toHaveCount(0);

  const baseline = sortButton(table, "Baseline");
  await baseline.click();
  await expectSortedBy(table, "Baseline", "ascending");
  await expect(rowNames(table)).toHaveText([
    "tests",
    "dashboard/tests",
    "src/skills",
  ]);
  await baseline.press("Enter");
  await expectSortedBy(table, "Baseline", "descending");
  await expect(rowNames(table)).toHaveText([
    "dashboard/tests",
    "tests",
    "src/skills",
  ]);

  const countsButton = sortButton(table, "Counts");
  await countsButton.focus();
  await page.keyboard.press("Space");
  await expectSortedBy(table, "Counts", "ascending");
  await expect(rowNames(table)).toHaveText([
    "src/skills",
    "tests",
    "dashboard/tests",
  ]);
  await countsButton.click();
  await expectSortedBy(table, "Counts", "descending");
  await expect(rowNames(table)).toHaveText([
    "dashboard/tests",
    "tests",
    "src/skills",
  ]);
});
