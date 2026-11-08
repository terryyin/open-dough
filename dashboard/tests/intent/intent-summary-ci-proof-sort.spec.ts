// A selected entry's or folder's Summary from one CI proof shows the scope's
// own figures as a labelled group above a table of its immediate folders and
// files, and sorts that table by its columns (../../src/IntentScopeProof.tsx,
// ../../src/IntentScopeFigures.tsx, ../../src/CiProofTable.tsx): the tree's
// order until a header is activated, the row for what no child row shows kept
// last under any sort, the group unmoved, and the sort kept in memory while
// drilling down and across Development and back, never on the URL or in
// storage (SEED-259#scan-intent-ci-summaries key example 2). A story
// comparison's Summary: ./intent-summary-story-comparison-sort.spec.ts.

import type { Locator } from "@playwright/test";
import { expect, test } from "../dashboardTest.ts";
import { run } from "../intentCiProofPage.ts";
import { parts } from "../dashboardPage.ts";
import {
  childName,
  expectScopeRows,
  scopeFigures,
  scopeTable,
  summaryRegion,
} from "../intentScopeProofPage.ts";
import { openIntent, openSummary } from "../intentSummaryCiProofFixtures.ts";
import {
  collectedSummary,
  playwrightRecord,
  summaryTextZipAnswer,
  type RecordedTest,
} from "../support/ciProofCollected.ts";
import {
  expectSortedBy,
  rowNames,
  sortButton,
} from "../support/expectSortedColumns.ts";

const outside = "Not in the rows above";
const one = "1 of 1 part present";

// COUNT tests of FILE, each recorded as OUTCOME taking MS.
const tests = (
  file: string,
  count: number,
  ms: number,
  outcome: RecordedTest[1] = "expected",
): RecordedTest[] =>
  Array.from({ length: count }, (): RecordedTest => [file, outcome, [ms]]);

// `dashboard/tests` holds `folder/` (13 tests, 6 of them in a file the tree
// does not list), `added.spec.ts` (no CI result), `root.spec.ts` (14 tests,
// 1 failed) and 3 tests in a file the tree does not list.
const summaryText = collectedSummary(
  run,
  [["dashboard/tests", 1]],
  [
    {
      entries: ["dashboard/tests"],
      part: 1,
      of: 1,
      byFile: true,
      record: playwrightRecord([
        ...tests("dashboard/tests/folder/a.spec.ts", 1, 300),
        ...tests("dashboard/tests/folder/b.spec.ts", 4, 100),
        ...tests("dashboard/tests/folder/nested/c.spec.ts", 2, 50),
        ...tests("dashboard/tests/folder/old.spec.ts", 6, 10),
        ...tests("dashboard/tests/root.spec.ts", 13, 20),
        ...tests("dashboard/tests/root.spec.ts", 1, 20, "unexpected"),
        ...tests("dashboard/tests/gone.spec.ts", 3, 10),
      ]),
    },
  ],
);

// The group of PATH's own figures sits above its table.
async function expectGroupAbove(summary: Locator, path: string) {
  const group = await scopeFigures(summary, path).boundingBox();
  const table = await scopeTable(summary, path).boundingBox();
  if (group === null || table === null) throw new Error("not shown");
  expect(group.y + group.height).toBeLessThanOrEqual(table.y);
}

test("a folder's Summary shows its own figures above its children and keeps a Counts sort, outside row last, while drilling down and across Development", async ({
  page,
}) => {
  const { intent } = await openIntent(page, () =>
    summaryTextZipAnswer(summaryText),
  );
  const startUrl = page.url();
  const summary = await openSummary(intent, "dashboard/tests");
  const entryFigures = [
    "dashboard/tests",
    "29 passed and 1 failed tests",
    "1.2 s",
    one,
  ] as const;

  await test.step("until a header is activated, the table holds the children in the tree's order, then the outside row", async () => {
    await expectScopeRows(summary, "dashboard/tests", [
      entryFigures,
      ["folder/", "13 passed tests", "860 ms"],
      ["added.spec.ts", "no CI result", "no CI result"],
      ["root.spec.ts", "13 passed and 1 failed tests", "280 ms"],
      [outside, "3 passed tests", "30 ms"],
    ]);
    await expect(
      scopeTable(summary, "dashboard/tests").locator("th[aria-sort]"),
    ).toHaveCount(0);
    await expectGroupAbove(summary, "dashboard/tests");
  });

  const table = scopeTable(summary, "dashboard/tests");
  await test.step("Counts sorts the children by their counted results, the row without one after them and the outside row last either way", async () => {
    const counts = sortButton(table, "Counts");
    await counts.click();
    await expectSortedBy(table, "Counts", "ascending");
    await expect(rowNames(table)).toHaveText([
      "folder/",
      "root.spec.ts",
      "added.spec.ts",
      outside,
    ]);
    await counts.press("Enter");
    await expectSortedBy(table, "Counts", "descending");
    await expect(rowNames(table)).toHaveText([
      "root.spec.ts",
      "folder/",
      "added.spec.ts",
      outside,
    ]);
    // The scope's own figures stay where they are, unsorted.
    await expect(
      scopeFigures(summary, "dashboard/tests").getByRole("definition"),
    ).toHaveText(entryFigures.slice(1));
    await expectGroupAbove(summary, "dashboard/tests");
  });

  const folderPath = "dashboard/tests/folder";
  const folderSorted = async () => {
    const folderTable = scopeTable(summary, folderPath);
    await expectSortedBy(folderTable, "Counts", "descending");
    await expect(rowNames(folderTable)).toHaveText([
      "b.spec.ts",
      "nested/",
      "a.spec.ts",
      outside,
    ]);
    await expect(
      scopeFigures(summary, folderPath).getByRole("definition"),
    ).toHaveText(["13 passed tests", "860 ms", one]);
    await expectGroupAbove(summary, folderPath);
  };

  await test.step("a child's name opens its summary in the same layout, still sorted by Counts descending", async () => {
    await childName(summary, "folder/").click();
    await expect(summary.locator(".intent-summary-path")).toHaveText(
      folderPath,
    );
    await folderSorted();
  });

  await test.step("the sort is kept across Development and back, never on the URL or in storage", async () => {
    const { development, intentChoice } = parts(page);
    await development.click();
    await expect(intent).toBeHidden();
    await intentChoice.click();
    await expect(
      summaryRegion(intent).locator(".intent-summary-path"),
    ).toHaveText(folderPath);
    await folderSorted();
    expect(page.url()).toBe(startUrl);
    const stored = await page.evaluate(() =>
      JSON.stringify([
        Object.entries(localStorage),
        Object.entries(sessionStorage),
      ]),
    );
    expect(stored).not.toMatch(/descending|ascending|summaryCiSort/);
  });
});
