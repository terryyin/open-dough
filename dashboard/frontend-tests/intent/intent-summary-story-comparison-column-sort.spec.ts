import { expect, onTestFinished, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import {
  proofTableFit,
  wordsBrokenApart,
} from "./intent-attempt-proof-page.ts";
import {
  entryComparisonRows,
  folderComparisonRows,
} from "./intent-summary-comparison-expected.ts";
import { openSummaryComparison } from "./intent-summary-comparison-fixture.ts";
import {
  expectComparisonRows,
  openComparedFolder,
} from "./intent-summary-comparison-page.ts";
import {
  expectOwnScopeFigures,
  expectSortedBy,
  expectUnsortedRows,
  figuresAboveTable,
  openSummary,
  scopeTable,
  sortButton,
} from "./intent-summary-proof-page.ts";

const entry = "dashboard/tests";
const folder = `${entry}/folder`;

test("Summary Change keeps unchanged children last in both directions", async () => {
  await openSummaryComparison(makeMe.aComparedStory.inSummaryScope().please());
  const summary = await openSummary(entry);
  const table = scopeTable(summary, entry);
  await expectUnsortedRows(table, [
    "folder/",
    "added.spec.ts",
    "gone.spec.ts",
    "renamed.spec.ts",
    "root.spec.ts",
  ]);

  const change = sortButton(table, "Change");
  await userEvent.click(change);
  await expectSortedBy(table, "Change", "ascending", [
    "added.spec.ts",
    "gone.spec.ts",
    "renamed.spec.ts",
    "folder/",
    "root.spec.ts",
  ]);
  await userEvent.click(change);
  await expectSortedBy(table, "Change", "descending", [
    "renamed.spec.ts",
    "gone.spec.ts",
    "added.spec.ts",
    "folder/",
    "root.spec.ts",
  ]);
});

test("Summary Landed keeps incomparable children last, own figures stationary and the sort while drilling", async () => {
  await openSummaryComparison(makeMe.aComparedStory.inSummaryScope().please());
  const summary = await openSummary(entry);
  const table = scopeTable(summary, entry);
  await expectComparisonRows(summary, entryComparisonRows);

  const landed = sortButton(table, "Landed");
  await userEvent.click(landed);
  await expect
    .element(table.getByRole("columnheader", { name: "Landed", exact: true }))
    .toHaveAttribute("aria-sort", "ascending");
  await userEvent.click(landed);
  await expectSortedBy(table, "Landed", "descending", [
    "folder/",
    "root.spec.ts",
    "added.spec.ts",
    "gone.spec.ts",
    "renamed.spec.ts",
  ]);
  await expectOwnScopeFigures(summary, entry, entryComparisonRows[0].slice(2), [
    "Counts",
    "Baseline",
    "Branch",
    "Landed",
    "Parts",
  ]);
  expect(figuresAboveTable(summary, entry)).toBe(true);

  await openComparedFolder(summary, folder);
  const [own, ...children] = folderComparisonRows;
  const descending = [...children].reverse();
  await expectComparisonRows(summary, [own, ...descending]);
  await expectSortedBy(
    scopeTable(summary, folder),
    "Landed",
    "descending",
    descending.map(([name]) => name),
  );
});

test("the comparison Summary fits at 200% zoom and keeps complete words without sideways scrolling", async () => {
  await openSummaryComparison(makeMe.aComparedStory.inSummaryScope().please());
  const summary = await openSummary(entry);
  const table = scopeTable(summary, entry);
  await expectComparisonRows(summary, entryComparisonRows);

  const font = document.head.appendChild(document.createElement("style"));
  font.textContent =
    ".intent-ci-proof-box { font-family: Verdana, sans-serif; }";
  onTestFinished(() => {
    font.remove();
  });
  await page.viewport(640, 450);
  table.element().scrollIntoView({ block: "nearest", inline: "nearest" });
  expect(proofTableFit(table.element())).toEqual({
    sideways: 0,
    inPane: true,
    pageSideways: false,
  });
  expect(wordsBrokenApart(table.element(), "th, td")).toEqual([]);
});
