// Summary's real sortable columns use independent signed/count/change examples.
import { test, expect } from "../../test-support/support/pageTest.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  scopeFigures,
  scopeTable,
} from "../../test-support/intentScopeProofPage.ts";
import {
  expectRenderedSortedBy,
  expectUnsortedRows,
} from "../../test-support/support/expectSortedColumns.ts";
import {
  entryComparisonRows,
  folderComparisonRows,
} from "../../test-support/support/summaryComparisonExpectedRows.ts";
import { expectComparisonScopeRows } from "../../test-support/intentScopeProofPage.ts";
import { twiceZoomedWindow } from "../../test-support/accessibleReading.ts";
import { wordsBrokenApart } from "../../test-support/wholeWords.ts";

const entry = "dashboard/tests";
test("Summary Change keeps unchanged children last in both directions", async ({
  page,
  renderComparison,
}) => {
  const story = makeMe.aComparedStory.inSummaryScope();
  await renderComparison(story.please());
  const summary = page.getByRole("region", { name: "Summary", exact: true });
  const table = scopeTable(summary, entry);
  await expectUnsortedRows(table, [
    "folder/",
    "added.spec.ts",
    "gone.spec.ts",
    "renamed.spec.ts",
    "root.spec.ts",
  ]);
  await renderComparison(story.please(), {
    sort: { column: "change", direction: "ascending" },
  });
  await expectRenderedSortedBy(table, "Change", "ascending", [
    "added.spec.ts",
    "gone.spec.ts",
    "renamed.spec.ts",
    "folder/",
    "root.spec.ts",
  ]);
  await renderComparison(story.please(), {
    sort: { column: "change", direction: "descending" },
  });
  await expectRenderedSortedBy(table, "Change", "descending", [
    "renamed.spec.ts",
    "gone.spec.ts",
    "added.spec.ts",
    "folder/",
    "root.spec.ts",
  ]);
});

test("Summary Landed keeps incomparable children last, own figures stationary and the sort while drilling", async ({
  page,
  renderComparison,
}) => {
  const story = makeMe.aComparedStory.inSummaryScope();
  await renderComparison(story.please());
  const summary = page.getByRole("region", { name: "Summary", exact: true });
  const table = scopeTable(summary, entry);
  await expectComparisonScopeRows(summary, entry, entryComparisonRows);
  await renderComparison(story.please(), {
    sort: { column: "landed", direction: "descending" },
  });
  await expectRenderedSortedBy(table, "Landed", "descending", [
    "folder/",
    "root.spec.ts",
    "added.spec.ts",
    "gone.spec.ts",
    "renamed.spec.ts",
  ]);
  await expect(scopeFigures(summary, entry).getByRole("definition")).toHaveText(
    entryComparisonRows[0].slice(2),
  );
  await renderComparison(
    story.selecting("dashboard/tests/folder", "folder").please(),
    { sort: { column: "landed", direction: "descending" } },
  );
  const [own, ...children] = folderComparisonRows;
  await expectComparisonScopeRows(summary, "dashboard/tests/folder", [
    own,
    ...[...children].reverse(),
  ]);
  await expectRenderedSortedBy(
    scopeTable(summary, "dashboard/tests/folder"),
    "Landed",
    "descending",
  );
});

test("the comparison Summary fits at 200% zoom and keeps complete words without sideways scrolling", async ({
  page,
  renderComparison,
}) => {
  const story = makeMe.aComparedStory.inSummaryScope();
  await renderComparison(story.please());
  const summary = page.getByRole("region", { name: "Summary", exact: true });
  const table = scopeTable(summary, entry);
  await expectComparisonScopeRows(summary, entry, entryComparisonRows);
  await page.addStyleTag({
    content: ".intent-ci-proof-box { font-family: Verdana, sans-serif; }",
  });
  await page.setViewportSize(twiceZoomedWindow);
  await table.scrollIntoViewIfNeeded();
  const fit = await summary
    .locator(".intent-proof-table")
    .evaluate((element) => ({
      sideways: element.scrollWidth - element.clientWidth,
      pageSideways:
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    }));
  expect(fit).toEqual({ sideways: 0, pageSideways: false });
  expect(await wordsBrokenApart(table, "th, td")).toEqual([]);
});
