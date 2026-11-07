// A selected done story's entry and folder Summary comparison sorts its table
// of immediate folders and files by its columns (../../src/IntentScopeProof.tsx,
// ../../src/IntentScopeComparisonTable.tsx, ../../src/CiProofTable.tsx):
// Landed by its measured time with removed and later-trunk gaps last, the
// scope's own compared figures above it, and the sort kept while drilling
// down. A sort by a column the next Summary table lacks gives way to the
// tree's order, either way between a comparison and one run's figures
// (SEED-259#scan-intent-ci-summaries). Rows and fixture:
// ../support/summaryComparisonExpectedRows.ts. One run's Summary sorting:
// ./intent-summary-ci-proof-sort.spec.ts.

import type { Locator, Page } from "@playwright/test";
import { expect, test } from "../support/preparationPage.ts";
import { showColumn } from "../boardPage.ts";
import { parts } from "../dashboardPage.ts";
import { scopeFigures, scopeTable } from "../intentScopeProofPage.ts";
import { openSummary } from "../intentSummaryCiProofFixtures.ts";
import { expectSelected } from "../storyCardSelection.ts";
import { publishSummaryComparisonStory } from "../support/intentSummaryStoryComparisonFixture.ts";
import {
  drillComparisonChild,
  openSummaryComparison,
  selectDoneStoryForSummaryComparison,
} from "../support/selectDoneStoryForSummaryComparison.ts";
import {
  expectSortedBy,
  rowNames,
  sortButton,
} from "../support/expectSortedColumns.ts";
import {
  entryComparisonRows,
  folderComparisonRows,
} from "../support/summaryComparisonExpectedRows.ts";

const entry = "dashboard/tests";
// The entry's children in the tree's order, as the comparison names them.
const entryChildren = entryComparisonRows.slice(1).map(([name]) => name);

// Leave Intent, select the story titled TITLE in COLUMN, and come back.
async function selectStoryFromDevelopment(
  page: Page,
  column: "Backlog" | "Recently done",
  title: string,
) {
  const { development, intentChoice, intent } = parts(page);
  await development.click();
  await showColumn(page, column);
  const card = page
    .getByRole("region", { name: column, exact: true })
    .getByRole("article", { name: title, exact: true });
  await card.getByRole("heading", { level: 3 }).click();
  await expectSelected(card, true);
  await intentChoice.click();
  await expect(intent).toBeVisible();
}

const unsorted = (table: Locator) =>
  expect(table.locator("th[aria-sort]")).toHaveCount(0);

test("a story comparison Summary sorts by Landed with gaps last, keeps the sort while drilling down, and a column the next table lacks gives way to the tree's order", async ({
  page,
  origin,
}) => {
  await publishSummaryComparisonStory(page, origin);
  const { intent } = await selectDoneStoryForSummaryComparison(page);
  const summary = await openSummaryComparison(intent, entry);
  const table = scopeTable(summary, entry);

  await test.step("Landed descending orders the children by their landed time, removed and later-trunk gaps after them, the entry's figures unmoved above", async () => {
    await expect(rowNames(table)).toHaveText(entryChildren);
    await unsorted(table);
    const landed = sortButton(table, "Landed");
    await landed.click();
    await landed.click();
    await expectSortedBy(table, "Landed", "descending");
    await expect(rowNames(table)).toHaveText([
      "folder/",
      "renamed.spec.ts renamed",
      "root.spec.ts",
      "added.spec.ts added",
      "gone.spec.ts removed",
      "later.spec.ts",
    ]);
    await expect(
      scopeFigures(summary, entry).getByRole("definition"),
    ).toHaveText([...(entryComparisonRows[0] ?? []).slice(1)]);
  });

  await test.step("a child folder's comparison opens in the same layout, still sorted by Landed descending", async () => {
    const [own, ...children] = folderComparisonRows;
    if (own === undefined) throw new Error("no folder figures");
    await drillComparisonChild(summary, "folder/", own[0], [
      own,
      ...[...children].reverse(),
    ]);
    await expectSortedBy(scopeTable(summary, own[0]), "Landed", "descending");
  });

  await test.step("one run's Summary lacks Landed, so it shows the tree's order; its Test execution time sort gives way again in the comparison", async () => {
    await selectStoryFromDevelopment(page, "Backlog", "Story B");
    await openSummary(intent, entry);
    await expect(
      summary.getByRole("columnheader", { name: "Landed" }),
    ).toHaveCount(0);
    await unsorted(table);
    // Trunk after the story: its removed file is gone.
    await expect(rowNames(table)).toHaveText([
      "folder/",
      "added.spec.ts",
      "later.spec.ts",
      "renamed.spec.ts",
      "root.spec.ts",
    ]);
    await sortButton(table, "Test execution time").click();
    await expectSortedBy(table, "Test execution time", "ascending");

    await selectStoryFromDevelopment(page, "Recently done", "Story A");
    await openSummaryComparison(intent, entry);
    await expect(rowNames(table)).toHaveText(entryChildren);
    await unsorted(table);
  });
});
