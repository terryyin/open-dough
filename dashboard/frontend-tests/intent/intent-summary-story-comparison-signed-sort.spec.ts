import { expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { comparisonIn } from "./intent-ci-scope-page.tsx";
import { openSummaryComparison } from "./intent-summary-comparison-fixture.ts";
import { openComparedFileProof } from "./intent-summary-comparison-page.ts";
import {
  expectSortedBy,
  expectUnsortedRows,
  openSummary,
  scopeTable,
  sortButton,
} from "./intent-summary-proof-page.ts";
import {
  expectNoRelativeTiming,
  expectTimingWords,
  togglePercent,
} from "./intent-summary-relative-reading.ts";

const entry = "dashboard/tests";
const timed = (path: string, ms: number) =>
  makeMe.aCiProofEntry.at(path).timed(ms).please();

async function openTimedSummary() {
  const after = [
    timed(entry, 1_000_000),
    timed(`${entry}/folder`, 90_000),
    timed(`${entry}/root.spec.ts`, 660_000),
    timed(`${entry}/renamed.spec.ts`, 280_000),
    timed(`${entry}/added.spec.ts`, 5_000),
  ];
  await openSummaryComparison(
    makeMe.aComparedStory
      .inSummaryScope()
      .withEntries([
        [
          timed(entry, 1_000_000),
          timed(`${entry}/folder`, 60_000),
          timed(`${entry}/root.spec.ts`, 600_000),
          timed("tests/old.sh", 300_000),
        ],
        after,
        after,
      ])
      .please(),
  );
  const summary = await openSummary(entry);
  const table = scopeTable(summary, entry);
  await expectUnsortedRows(table, [
    "folder/",
    "added.spec.ts",
    "gone.spec.ts",
    "renamed.spec.ts",
    "root.spec.ts",
  ]);
  await expect.element(comparisonIn(summary).showPercent).not.toBeChecked();
  await togglePercent(summary, true);
  return { summary, table };
}

async function showsSignedSort(column: "Branch" | "Landed") {
  const { summary, table } = await openTimedSummary();
  const comparison = comparisonIn(summary);
  const button = sortButton(table, column);
  await userEvent.click(button);
  await expectSortedBy(table, column, "ascending", [
    "renamed.spec.ts",
    "folder/",
    "root.spec.ts",
    "added.spec.ts",
    "gone.spec.ts",
  ]);
  await expectTimingWords(
    comparison.cell(entry, "folder/", column),
    "+30.0 s+50%",
  );
  await expectTimingWords(
    comparison.cell(entry, "root.spec.ts", column),
    "+1 min+10%",
  );
  await expectTimingWords(
    comparison.cell(entry, "renamed.spec.ts", column),
    "−20.0 s−7%",
  );
  await userEvent.click(button);
  await expectSortedBy(table, column, "descending", [
    "root.spec.ts",
    "folder/",
    "renamed.spec.ts",
    "added.spec.ts",
    "gone.spec.ts",
  ]);
}

test("Summary Branch sorts its displayed quantity with gaps last in both directions", async () => {
  await showsSignedSort("Branch");
});

test("Summary Landed sorts its displayed quantity with gaps last in both directions", async () => {
  await showsSignedSort("Landed");
});

test("Summary Baseline sorts its displayed quantity with gaps last in both directions", async () => {
  const { table } = await openTimedSummary();
  const baseline = sortButton(table, "Baseline");
  await userEvent.click(baseline);
  await expectSortedBy(table, "Baseline", "ascending", [
    "folder/",
    "renamed.spec.ts",
    "root.spec.ts",
    "added.spec.ts",
    "gone.spec.ts",
  ]);
  await userEvent.click(baseline);
  await expectSortedBy(table, "Baseline", "descending", [
    "root.spec.ts",
    "renamed.spec.ts",
    "folder/",
    "added.spec.ts",
    "gone.spec.ts",
  ]);
});

test("a measured zero Baseline file keeps its signed change without relative marks or percentages", async () => {
  const path = `${entry}/root.spec.ts`;
  const after = [timed(entry, 350_000), timed(path, 30_000)];
  await openSummaryComparison(
    makeMe.aComparedStory
      .inSummaryScope()
      .withEntries([[timed(entry, 300_000), timed(path, 0)], after, after])
      .please(),
  );
  const proof = await openComparedFileProof(
    await openSummary(entry),
    "root.spec.ts",
  );
  const comparison = comparisonIn(proof);
  await expectTimingWords(comparison.fileCell(path, "Baseline"), "0 ms");
  await togglePercent(proof, true);
  for (const column of ["Branch", "Landed"] as const) {
    const cell = comparison.fileCell(path, column);
    await expectTimingWords(cell, "+30.0 s");
    expectNoRelativeTiming(cell);
  }
});
