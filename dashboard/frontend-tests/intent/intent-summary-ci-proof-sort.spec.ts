// A selected entry's or folder's Summary from one CI proof shows the scope's
// own figures as a labelled group above a table of its immediate folders and
// files, and sorts that table by its columns (../../src/IntentScopeProof.tsx,
// ../../src/IntentScopeFigures.tsx, ../../src/CiProofTable.tsx): the tree's
// order until a header is activated, the row for what no child row shows kept
// last under any sort, the group unmoved, and the sort kept in memory while
// drilling down and across Development and back, never on the URL or in
// storage (SEED-259#scan-intent-ci-summaries key example 2). The proof answer
// is controlled (../../test-support/support/frontendSummaryCiProof.ts). A story
// comparison's Summary: ./intent-summary-story-comparison-mounted-sort.spec.ts.

import type { Locator } from "@playwright/test";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { parts } from "../../test-support/dashboardPage.ts";
import {
  childName,
  expectScopeRows,
  scopeFigures,
  scopeTable,
  summaryRegion,
} from "../../test-support/intentScopeProofPage.ts";
import { openSummary } from "../../test-support/intentSummaryCiProofFixtures.ts";
import { untilPageReadsAnswered } from "../../test-support/pageRequestNotes.ts";
import {
  expectSortedBy,
  expectUnsortedRows,
  sortButton,
} from "../../test-support/support/expectSortedColumns.ts";
import { openSummaryCiProof } from "../../test-support/support/frontendSummaryCiProof.ts";
import { expect, test } from "../../test-support/support/frontendApp.ts";

const outside = "Not in the rows above";
const one = "1 of 1 part present";

// `dashboard/tests` holds `folder/` (13 tests, 6 of them in a file the tree
// does not list), `added.spec.ts` (no CI result), `root.spec.ts` (14 tests,
// 1 failed) and 3 tests in a file the tree does not list.
const entry = makeMe.aCiProofEntry
  .at("dashboard/tests")
  .holding(
    makeMe.aCiProofEvidence
      .inUnit("case")
      .withFile("dashboard/tests/folder/a.spec.ts", {
        passed: 1,
        durationMs: 300,
      })
      .withFile("dashboard/tests/folder/b.spec.ts", {
        passed: 4,
        durationMs: 400,
      })
      .withFile("dashboard/tests/folder/nested/c.spec.ts", {
        passed: 2,
        durationMs: 100,
      })
      .withFile("dashboard/tests/folder/old.spec.ts", {
        passed: 6,
        durationMs: 60,
      })
      .withFile("dashboard/tests/root.spec.ts", {
        passed: 13,
        failed: 1,
        durationMs: 280,
      })
      .withFile("dashboard/tests/gone.spec.ts", { passed: 3, durationMs: 30 })
      .please(),
  )
  .please();
// The group of PATH's own figures sits above its table.
async function expectGroupAbove(summary: Locator, path: string) {
  const group = await scopeFigures(summary, path).boundingBox();
  const table = await scopeTable(summary, path).boundingBox();
  if (group === null || table === null) throw new Error("not shown");
  expect(group.y + group.height).toBeLessThanOrEqual(table.y);
}

test("a folder's Summary shows its own figures above its children and keeps a Counts sort, outside row last, while drilling down and across Development", async ({
  page,
  frontendServices,
}) => {
  const { intent } = await openSummaryCiProof(page, frontendServices, [entry]);
  const summary = await openSummary(intent, "dashboard/tests");
  const startUrl = page.url();
  const entryFigures = [
    "dashboard/tests",
    "29 passed and 1 failed test cases",
    "1.2 s",
    one,
  ] as const;

  await test.step("until a header is activated, the table holds the children in the tree's order, then the outside row", async () => {
    await expectScopeRows(summary, "dashboard/tests", [
      entryFigures,
      ["folder/", "13 passed test cases", "860 ms"],
      ["added.spec.ts", "no CI result", "no CI result"],
      ["root.spec.ts", "13 passed and 1 failed test cases", "280 ms"],
      [outside, "3 passed test cases", "30 ms"],
    ]);
    await expectUnsortedRows(scopeTable(summary, "dashboard/tests"), [
      "folder/",
      "added.spec.ts",
      "root.spec.ts",
      outside,
    ]);
    await expectGroupAbove(summary, "dashboard/tests");
  });

  const table = scopeTable(summary, "dashboard/tests");
  await test.step("Counts sorts the children by their counted results, the row without one after them and the outside row last either way", async () => {
    const counts = sortButton(table, "Counts");
    await counts.click();
    await expectSortedBy(table, "Counts", "ascending", [
      "folder/",
      "root.spec.ts",
      "added.spec.ts",
      outside,
    ]);
    await counts.press("Enter");
    await expectSortedBy(table, "Counts", "descending", [
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
    await expectSortedBy(folderTable, "Counts", "descending", [
      "b.spec.ts",
      "nested/",
      "a.spec.ts",
      outside,
    ]);
    await expect(
      scopeFigures(summary, folderPath).getByRole("definition"),
    ).toHaveText(["13 passed test cases", "860 ms", one]);
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
    // The fresh judgment and its proof can replace the previously retrieved
    // proof after the folder first reappears.
    await untilPageReadsAnswered(page);
    await folderSorted();
    // The URL holds only what it was opened with, nothing of the sort.
    const opened = new URL(startUrl).searchParams;
    expect(
      [...new URL(page.url()).searchParams].filter(
        ([name, value]) => opened.get(name) !== value,
      ),
    ).toEqual([]);
    expect(page.url()).not.toMatch(/sort|ascending|descending|Counts/i);
    const stored = await page.evaluate(() =>
      JSON.stringify([
        Object.entries(localStorage),
        Object.entries(sessionStorage),
      ]),
    );
    expect(stored).not.toMatch(/descending|ascending|summaryCiSort/);
  });
});
