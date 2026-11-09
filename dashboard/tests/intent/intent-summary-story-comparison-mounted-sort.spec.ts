// Summary's real sortable columns use independent signed/count/change examples.
import type { Locator } from "@playwright/test";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import {
  test,
  expect,
  mountComparison,
} from "../support/comparisonMountPage.ts";
import {
  serveComparison,
  summaryScopeFacts,
} from "../support/comparisonScopeFacts.ts";
import {
  childName,
  scopeFigures,
  scopeTable,
} from "../intentScopeProofPage.ts";
import {
  expectSortedBy,
  rowNames,
  sortButton,
} from "../support/expectSortedColumns.ts";
import {
  entryComparisonRows,
  folderComparisonRows,
} from "../support/summaryComparisonExpectedRows.ts";
import { expectComparisonScopeRows } from "../intentScopeProofPage.ts";
import { showPercent } from "../support/relativeTimingMarks.ts";
import { twiceZoomedWindow } from "../accessibleReading.ts";
import { mountedSummarySortExpected } from "../support/mountedSummarySortExpected.ts";
import { wordsBrokenApart } from "../wholeWords.ts";

const entry = "dashboard/tests";
const timed = (path: string, ms: number) =>
  makeMe.aCiProofEntry.at(path).timed(ms).please();
const timingCell = (table: Locator, name: string, side: "Branch" | "Landed") =>
  table
    .locator("tbody tr")
    .filter({
      has: table.page().getByRole("rowheader", { name, exact: true }),
    })
    .getByRole("cell")
    .nth(side === "Branch" ? 3 : 4);

test("Summary Change keeps unchanged children last in both directions", async ({
  page,
  comparisonServer,
  comparisonServices,
}) => {
  const facts = summaryScopeFacts();
  serveComparison(comparisonServices, facts, facts.entries);
  await mountComparison(page, comparisonServer, facts);
  const summary = page.getByRole("region", { name: "Summary", exact: true });
  const table = scopeTable(summary, entry);
  await expect(rowNames(table)).toHaveText([
    "folder/",
    "added.spec.ts",
    "gone.spec.ts",
    "renamed.spec.ts",
    "root.spec.ts",
  ]);
  await expect(table.locator("th[aria-sort]")).toHaveCount(0);
  await sortButton(table, "Change").click();
  await expectSortedBy(table, "Change", "ascending");
  await expect(rowNames(table)).toHaveText([
    "added.spec.ts",
    "gone.spec.ts",
    "renamed.spec.ts",
    "folder/",
    "root.spec.ts",
  ]);
  await sortButton(table, "Change").click();
  await expectSortedBy(table, "Change", "descending");
  await expect(rowNames(table)).toHaveText([
    "renamed.spec.ts",
    "gone.spec.ts",
    "added.spec.ts",
    "folder/",
    "root.spec.ts",
  ]);
});

test("Summary Landed keeps incomparable children last, own figures stationary and the sort while drilling", async ({
  page,
  comparisonServer,
  comparisonServices,
}) => {
  const facts = summaryScopeFacts();
  serveComparison(comparisonServices, facts, facts.entries);
  await mountComparison(page, comparisonServer, facts);
  const summary = page.getByRole("region", { name: "Summary", exact: true });
  const table = scopeTable(summary, entry);
  await expectComparisonScopeRows(summary, entry, entryComparisonRows);
  await sortButton(table, "Landed").click();
  await sortButton(table, "Landed").click();
  await expectSortedBy(table, "Landed", "descending");
  await expect(rowNames(table)).toHaveText([
    "folder/",
    "root.spec.ts",
    "added.spec.ts",
    "gone.spec.ts",
    "renamed.spec.ts",
  ]);
  await expect(scopeFigures(summary, entry).getByRole("definition")).toHaveText(
    entryComparisonRows[0].slice(2),
  );
  await childName(summary, "folder/").click();
  const [own, ...children] = folderComparisonRows;
  await expectComparisonScopeRows(summary, "dashboard/tests/folder", [
    own,
    ...[...children].reverse(),
  ]);
  await expectSortedBy(
    scopeTable(summary, "dashboard/tests/folder"),
    "Landed",
    "descending",
  );
});

for (const column of ["Branch", "Landed", "Baseline"] as const) {
  test(`Summary ${column} sorts its displayed quantity with gaps last in both directions`, async ({
    page,
    comparisonServer,
    comparisonServices,
  }) => {
    const facts = summaryScopeFacts();
    const after = [
      timed(entry, 1_000_000),
      timed(`${entry}/folder`, 90_000),
      timed(`${entry}/root.spec.ts`, 660_000),
      timed(`${entry}/renamed.spec.ts`, 280_000),
      timed(`${entry}/added.spec.ts`, 5_000),
    ];
    serveComparison(comparisonServices, facts, [
      [
        timed(entry, 1_000_000),
        timed(`${entry}/folder`, 60_000),
        timed(`${entry}/root.spec.ts`, 600_000),
        timed("tests/old.sh", 300_000),
      ],
      after,
      after,
    ]);
    await mountComparison(page, comparisonServer, facts);
    const summary = page.getByRole("region", { name: "Summary", exact: true });
    const table = scopeTable(summary, entry);
    await expect(rowNames(table)).toHaveText([
      "folder/",
      "added.spec.ts",
      "gone.spec.ts",
      "renamed.spec.ts",
      "root.spec.ts",
    ]);
    await expect(showPercent(summary)).not.toBeChecked();
    await showPercent(summary).check();
    if (column !== "Baseline") {
      await expect(timingCell(table, "folder/", column)).toHaveText(
        "+30.0 s+50%",
      );
      await expect(timingCell(table, "root.spec.ts", column)).toHaveText(
        "+1 min+10%",
      );
      await expect(timingCell(table, "renamed.spec.ts", column)).toHaveText(
        "−20.0 s−7%",
      );
    }
    const { ascending, descending } =
      mountedSummarySortExpected[column === "Baseline" ? "baseline" : "signed"];
    await sortButton(table, column).click();
    await expectSortedBy(table, column, "ascending");
    await expect(rowNames(table)).toHaveText(ascending);
    await sortButton(table, column).click();
    await expectSortedBy(table, column, "descending");
    await expect(rowNames(table)).toHaveText(descending);
  });
}

test("a measured zero Baseline file keeps its signed change without relative marks or percentages", async ({
  page,
  comparisonServer,
  comparisonServices,
}) => {
  const facts = summaryScopeFacts();
  const path = `${entry}/root.spec.ts`;
  const after = [timed(entry, 350_000), timed(path, 30_000)];
  serveComparison(comparisonServices, facts, [
    [timed(entry, 300_000), timed(path, 0)],
    after,
    after,
  ]);
  await mountComparison(page, comparisonServer, {
    ...facts,
    scope: { ...facts.scope, selection: { path, scope: "file" } },
  });
  const proof = page.getByRole("region", { name: "Proof", exact: true });
  const cells = proof
    .getByRole("table", { name: `CI proof of ${path}`, exact: true })
    .locator("tbody tr")
    .getByRole("cell");
  await expect(cells.nth(1)).toHaveText("0 ms");
  await showPercent(proof).check();
  for (const at of [2, 3]) {
    await expect(cells.nth(at)).toHaveText("+30.0 s");
    await expect(cells.nth(at).locator(".intent-ci-time-mark")).toHaveCount(0);
    await expect(cells.nth(at).locator(".intent-ci-time-percent")).toHaveCount(
      0,
    );
  }
});

test("the comparison Summary fits at 200% zoom and keeps complete words without sideways scrolling", async ({
  page,
  comparisonServer,
  comparisonServices,
}) => {
  const facts = summaryScopeFacts();
  serveComparison(comparisonServices, facts, facts.entries);
  await mountComparison(page, comparisonServer, facts);
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
