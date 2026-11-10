// Cross-story reading preferences: Summary keeps its sort while drilling, uses
// tree order for a missing column, and restores that sort when its story returns.
// Column ordering and zoom rules live in ./intent-summary-story-comparison-mounted-sort.spec.ts.

import type { Locator, Page } from "@playwright/test";
import { expect, test } from "../support/preparationPage.ts";
import { showColumn } from "../boardPage.ts";
import { parts } from "../dashboardPage.ts";
import { scopeTable } from "../intentScopeProofPage.ts";
import { openSummary } from "../intentSummaryCiProofFixtures.ts";
import { expectSelected } from "../storyCardSelection.ts";
import { expectStoryTab } from "../support/intentStoryPage.ts";
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
// The entry's children by their signed landed change, descending, uncomparable rows after them.
// renamed.spec.ts, a shell check's test file at Baseline and a Playwright test
// case after, has no change across units, so it is one of them.
const landedDescending = [
  "folder/",
  "root.spec.ts",
  "added.spec.ts",
  "gone.spec.ts",
  "renamed.spec.ts",
];
// Story B's one-run children in the tree's order: trunk after Story A, so its
// removed file is gone.
const storyBChildren = [
  "folder/",
  "added.spec.ts",
  "later.spec.ts",
  "renamed.spec.ts",
  "root.spec.ts",
];

// Leave Intent, select the story titled TITLE in COLUMN, and come back.
async function selectStoryFromDevelopment(
  page: Page,
  column: "Backlog" | "Recently done",
  title: string,
  previous?: Locator,
) {
  const { development, intentChoice, intent } = parts(page);
  await development.click();
  await showColumn(page, column);
  const card = page
    .getByRole("region", { name: column, exact: true })
    .getByRole("article", { name: title, exact: true });
  await card.getByRole("heading", { level: 3 }).click();
  await expectSelected(card, true);
  if (previous !== undefined) await expectSelected(previous, false);
  await intentChoice.click();
  await expect(intent).toBeVisible();
}

const unsorted = (table: Locator) =>
  expect(table.locator("th[aria-sort]")).toHaveCount(0);

test("Summary keeps its sort through drilling and story selection, falling back for missing columns and restoring it on return", async ({
  page,
  origin,
}) => {
  await publishSummaryComparisonStory(page, origin);
  const { intent, card: storyA } =
    await selectDoneStoryForSummaryComparison(page);
  const summary = await openSummaryComparison(intent, entry);
  const table = scopeTable(summary, entry);

  await test.step("Landed descending orders the children by their signed landed change, uncomparable rows after them, the entry's figures unmoved above", async () => {
    const landed = sortButton(table, "Landed");
    await landed.click();
    await landed.click();
    await expectSortedBy(table, "Landed", "descending");
    await expect(rowNames(table)).toHaveText(landedDescending);
  });

  await test.step("a child folder's comparison opens in the same layout, still sorted by Landed descending", async () => {
    const [own, ...children] = folderComparisonRows;
    await drillComparisonChild(summary, "folder/", own[0], [
      own,
      ...[...children].reverse(),
    ]);
    await expectSortedBy(scopeTable(summary, own[0]), "Landed", "descending");
  });

  await test.step("one run's Summary lacks Landed, so it shows the tree's order; back in the comparison, the kept sort orders the rows by Landed descending again", async () => {
    await selectStoryFromDevelopment(page, "Backlog", "Story B", storyA);
    await expectStoryTab(intent, "CI comparison");
    await openSummary(intent, entry);
    await expect(
      summary.getByRole("columnheader", { name: "Landed" }),
    ).toHaveCount(0);
    await unsorted(table);
    await expect(rowNames(table)).toHaveText(storyBChildren);

    await selectStoryFromDevelopment(page, "Recently done", "Story A");
    await openSummaryComparison(intent, entry);
    await expectSortedBy(table, "Landed", "descending");
    await expect(rowNames(table)).toHaveText(landedDescending);
  });

  await test.step("a Test execution time sort chosen in one run's Summary gives way to the tree's order in the comparison", async () => {
    await selectStoryFromDevelopment(page, "Backlog", "Story B");
    await openSummary(intent, entry);
    await unsorted(table);
    await expect(rowNames(table)).toHaveText(storyBChildren);
    await sortButton(table, "Test execution time").click();
    await expectSortedBy(table, "Test execution time", "ascending");

    await selectStoryFromDevelopment(page, "Recently done", "Story A");
    await openSummaryComparison(intent, entry);
    await expect(rowNames(table)).toHaveText(entryChildren);
    await unsorted(table);
  });
});
