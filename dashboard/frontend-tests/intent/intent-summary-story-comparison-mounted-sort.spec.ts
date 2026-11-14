// Summary's real sortable columns use independent signed/count/change examples.
import { test, expect } from "../../tests/support/pageTest.ts";
import { renderComparison } from "../../tests/support/comparisonRendering.ts";
import { comparisonRenderFacts } from "../../tests/support/comparisonRenderFacts.ts";
import { summaryScopeFacts } from "../../tests/support/comparisonScopeFacts.ts";
import { scopeFigures, scopeTable } from "../../tests/intentScopeProofPage.ts";
import {
  expectRenderedSortedBy,
  expectUnsortedRows,
} from "../../tests/support/expectSortedColumns.ts";
import {
  entryComparisonRows,
  folderComparisonRows,
} from "../../tests/support/summaryComparisonExpectedRows.ts";
import { expectComparisonScopeRows } from "../../tests/intentScopeProofPage.ts";
import { twiceZoomedWindow } from "../../tests/accessibleReading.ts";
import { wordsBrokenApart } from "../../tests/wholeWords.ts";

const entry = "dashboard/tests";
test("Summary Change keeps unchanged children last in both directions", async ({
  page,
  comparisonRenderer,
}) => {
  const facts = summaryScopeFacts();
  const rendered = comparisonRenderFacts(facts, facts.entries);
  await renderComparison(page, comparisonRenderer, rendered);
  const summary = page.getByRole("region", { name: "Summary", exact: true });
  const table = scopeTable(summary, entry);
  await expectUnsortedRows(table, [
    "folder/",
    "added.spec.ts",
    "gone.spec.ts",
    "renamed.spec.ts",
    "root.spec.ts",
  ]);
  await renderComparison(page, comparisonRenderer, rendered, {
    sort: { column: "change", direction: "ascending" },
  });
  await expectRenderedSortedBy(table, "Change", "ascending", [
    "added.spec.ts",
    "gone.spec.ts",
    "renamed.spec.ts",
    "folder/",
    "root.spec.ts",
  ]);
  await renderComparison(page, comparisonRenderer, rendered, {
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
  comparisonRenderer,
}) => {
  const facts = summaryScopeFacts();
  const rendered = comparisonRenderFacts(facts, facts.entries);
  await renderComparison(page, comparisonRenderer, rendered);
  const summary = page.getByRole("region", { name: "Summary", exact: true });
  const table = scopeTable(summary, entry);
  await expectComparisonScopeRows(summary, entry, entryComparisonRows);
  await renderComparison(page, comparisonRenderer, rendered, {
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
    page,
    comparisonRenderer,
    {
      ...rendered,
      scope: {
        ...facts.scope,
        selection: { path: "dashboard/tests/folder", scope: "folder" },
      },
    },
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
  comparisonRenderer,
}) => {
  const facts = summaryScopeFacts();
  const rendered = comparisonRenderFacts(facts, facts.entries);
  await renderComparison(page, comparisonRenderer, rendered);
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
