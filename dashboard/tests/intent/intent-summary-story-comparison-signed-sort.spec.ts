// Summary timing sorting uses the signed quantities shown, independent of
// measured duration or percentage. Real published story fixtures reach the
// comparison; independently declared proof entries provide adversarial times.

import type { Locator } from "@playwright/test";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { expect, test } from "../support/preparationPage.ts";
import { scopeTable } from "../intentScopeProofPage.ts";
import { fileReadingTab, proofRegion } from "../intentPerspectivePage.ts";
import { publishSummaryComparisonStory } from "../support/intentSummaryStoryComparisonFixture.ts";
import { entryProofs } from "../support/storyCiComparisonEntryProofs.ts";
import { intentFile } from "../support/intentStoryPage.ts";
import {
  openSummaryComparison,
  selectDoneStoryForSummaryComparison,
} from "../support/selectDoneStoryForSummaryComparison.ts";
import {
  expectSortedBy,
  rowNames,
  sortButton,
} from "../support/expectSortedColumns.ts";
import { showPercent } from "../support/relativeTimingMarks.ts";

const entry = "dashboard/tests";
const rootFile = `${entry}/root.spec.ts`;
const timed = (path: string, ms: number) =>
  makeMe.aCiProofEntry.at(path).timed(ms).please();

const timingCell = (table: Locator, name: string, side: "Branch" | "Landed") =>
  table
    .locator("tbody tr")
    .filter({ has: table.page().getByRole("rowheader", { name, exact: true }) })
    .getByRole("cell")
    .nth(side === "Branch" ? 3 : 4);

test("Summary Branch and Landed sort signed changes rather than measured times or percentages, with uncomparable rows last in both directions", async ({
  page,
  origin,
}) => {
  const setup = await publishSummaryComparisonStory(page, origin);
  const after = [
    timed(entry, 1_000_000),
    timed(`${entry}/folder`, 90_000),
    timed(rootFile, 660_000),
    timed(`${entry}/renamed.spec.ts`, 280_000),
    timed(`${entry}/added.spec.ts`, 5_000),
  ];
  setup.serveProofs(
    entryProofs(setup, {
      baseline: [
        timed(entry, 1_000_000),
        timed(`${entry}/folder`, 60_000),
        timed(rootFile, 600_000),
        timed("tests/old.sh", 300_000),
      ],
      branch: after,
      landed: after,
    }),
  );
  const { intent } = await selectDoneStoryForSummaryComparison(page);
  const summary = await openSummaryComparison(intent, entry);
  const table = scopeTable(summary, entry);
  const gaps = ["added.spec.ts", "gone.spec.ts"];
  await expect(rowNames(table)).toHaveText([
    "folder/",
    "added.spec.ts",
    "gone.spec.ts",
    "renamed.spec.ts",
    "root.spec.ts",
  ]);
  await expect(showPercent(summary)).not.toBeChecked();
  await showPercent(summary).check();

  // +30 seconds is +50%; +60 seconds is only +10%; −20 seconds is −7%.
  // The displayed signed values, rather than either other quantity, order them.
  for (const side of ["Branch", "Landed"] as const) {
    await expect(timingCell(table, "folder/", side)).toHaveText("+30.0 s+50%");
    await expect(timingCell(table, "root.spec.ts", side)).toHaveText(
      "+1 min+10%",
    );
    await expect(timingCell(table, "renamed.spec.ts", side)).toHaveText(
      "−20.0 s−7%",
    );
    const toggle = sortButton(table, side);
    await toggle.click();
    await expectSortedBy(table, side, "ascending");
    await expect(rowNames(table)).toHaveText([
      "renamed.spec.ts",
      "folder/",
      "root.spec.ts",
      ...gaps,
    ]);
    await toggle.click();
    await expectSortedBy(table, side, "descending");
    await expect(rowNames(table)).toHaveText([
      "root.spec.ts",
      "folder/",
      "renamed.spec.ts",
      ...gaps,
    ]);
  }
  await sortButton(table, "Baseline").click();
  await expectSortedBy(table, "Baseline", "ascending");
  await expect(rowNames(table)).toHaveText([
    "folder/",
    "renamed.spec.ts",
    "root.spec.ts",
    ...gaps,
  ]);
  await sortButton(table, "Baseline").click();
  await expectSortedBy(table, "Baseline", "descending");
  await expect(rowNames(table)).toHaveText([
    "root.spec.ts",
    "renamed.spec.ts",
    "folder/",
    ...gaps,
  ]);
});

test("a file Proof with a measured zero Baseline keeps its signed change without a relative mark or percentage", async ({
  page,
  origin,
}) => {
  const setup = await publishSummaryComparisonStory(page, origin);
  const after = [timed(entry, 350_000), timed(rootFile, 30_000)];
  setup.serveProofs(
    entryProofs(setup, {
      baseline: [timed(entry, 300_000), timed(rootFile, 0)],
      branch: after,
      landed: after,
    }),
  );
  const { intent } = await selectDoneStoryForSummaryComparison(page);
  await intentFile(intent, rootFile).click();
  await fileReadingTab(intent, "Proof").click();
  const proof = proofRegion(intent);
  const table = proof.getByRole("table", {
    name: `CI proof of ${rootFile}`,
    exact: true,
  });
  const cells = table.locator("tbody tr").getByRole("cell");
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
