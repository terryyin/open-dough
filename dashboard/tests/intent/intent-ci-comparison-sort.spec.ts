// Sorting a selected story's CI entry timing comparison by its columns
// (../../src/IntentCiComparison.tsx, ../../src/CiProofTable.tsx): the given
// entry order until a header is activated; Baseline sorts by its measured
// time with the entry added after baseline last in either direction; Branch
// and Landed sort by the signed change they show, with an added or untimed
// entry last in either direction; Counts sorts by the after endpoint's
// counted results; headers are activated by click, Enter or Space and carry
// aria-sort with a direction arrow (SEED-259#scan-intent-ci-summaries,
// SEED-275#story-intent-tabs). Rows and fixture:
// ../support/expectCiComparisonEntryRows.ts.

import { makeMe } from "../../../tests/support/makeMe.mjs";
import { expect, test } from "../support/preparationPage.ts";
import { entryProofs } from "../support/storyCiComparisonEntrySummaries.ts";
import { expectCiComparisonEntryRows } from "../support/expectCiComparisonEntryRows.ts";
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

test("Branch and Landed sort by signed change, not by time or relative change, with added and untimed entries last", async ({
  page,
  origin,
}) => {
  const setup = await publishComparedStoryBranch(page, origin);
  const timed = (path: string, ms: number) =>
    makeMe.aCiProofEntry.at(path).timed(ms).please();
  const untimed = makeMe.aCiProofEntry.at("e/untimed").please();
  // Branch: big 10 min → 11 min (+1 min, +10%), small 1 min → 1 min 30 s
  // (+30 s, +50%), down 5 min → 4 min 40 s (−20 s, −7%). Landed: big
  // → 12 min (+2 min, +20%), small → 1 min 40 s (+40 s, +67%), down → 4 min
  // (−1 min, −20%). Times, changes and relative changes each order the
  // measured entries differently.
  setup.serveProofs(
    entryProofs(setup, {
      baseline: [
        timed("e/big", 600_000),
        timed("e/small", 60_000),
        timed("e/down", 300_000),
        untimed,
      ],
      branch: [
        timed("e/big", 660_000),
        timed("e/small", 90_000),
        timed("e/down", 280_000),
        untimed,
        timed("e/added", 5_000),
      ],
      landed: [
        timed("e/big", 720_000),
        timed("e/small", 100_000),
        timed("e/down", 240_000),
        untimed,
        timed("e/added", 5_000),
      ],
    }),
  );
  const { panel } = await selectDoneStoryForCiComparison(page);
  await expectCiComparisonEntryRows(panel, [
    ["e/big", "1 test case (no change)", "10 min", "+1 min", "+2 min"],
    ["e/small", "1 test case (no change)", "1 min", "+30 s", "+40 s"],
    ["e/down", "1 test case (no change)", "5 min", "−20 s", "−1 min"],
    [
      "e/untimed",
      "1 test case (no change)",
      "No timings",
      "No timings",
      "No timings",
    ],
    ["e/added", "added → 1 test case", "added", "5 s", "5 s"],
  ]);
  const table = panel.getByRole("table", {
    name: "CI entry timing comparison",
  });
  const lacking = ["e/untimed", "e/added"];
  for (const column of ["Branch", "Landed"]) {
    const header = sortButton(table, column);
    await header.click();
    await expectSortedBy(table, column, "ascending");
    await expect(rowNames(table)).toHaveText([
      "e/down",
      "e/small",
      "e/big",
      ...lacking,
    ]);
    await header.press("Enter");
    await expectSortedBy(table, column, "descending");
    await expect(rowNames(table)).toHaveText([
      "e/big",
      "e/small",
      "e/down",
      ...lacking,
    ]);
  }
});
