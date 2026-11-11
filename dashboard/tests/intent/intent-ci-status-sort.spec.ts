// Sorting CI status Proof by its columns (../../src/CiProofTable.tsx,
// ../../src/ciProofSort.ts): declaration order until a header is activated;
// Test execution time sorts by measured time with the partial row last in
// either direction; Counts sorts by counted results with failed results first
// among equal totals; multi-unit locations move as whole rows, comparing each
// unit in case/file/legacy order without summing types; each header is a
// button reached by Tab and activated by click, Enter or Space, its column
// header carrying aria-sort and a direction arrow; no totals row
// (SEED-259#scan-intent-ci-summaries key example 1). The comparator's cases
// live in ../../../tests/support/intent-ci-proof-sort.test.mjs.

import { expect, test } from "../dashboardTest.ts";
import {
  artifactId,
  openFailedRun,
  proofTable,
  run,
} from "../intentCiProofPage.ts";
import { judged, runUrl } from "../intentCiStatusPage.ts";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import {
  proofSummaryForEntries,
  runArtifactsAnswer,
  summaryZipAnswer,
} from "../support/ciProofArtifacts.ts";
import {
  expectSortedBy,
  rowNames,
  expectUnsortedRows,
  sortButton,
} from "../support/expectSortedColumns.ts";

// tests/a 12.5 s with 4 tests; tests/b 340 ms with 3 tests, 1 failed;
// tests/c Part 2 untimed with 3 tests.
const exampleSummary = () =>
  proofSummaryForEntries(run, [
    makeMe.aCiProofEntry
      .at("tests/a")
      .counting(4, "case")
      .timed(12_500)
      .please(),
    makeMe.aCiProofEntry
      .at("tests/b")
      .holding(
        makeMe.aCiProofEvidence
          .inUnit("case")
          .counting(2, 1, 0)
          .timed(340)
          .inParts(1)
          .please(),
      )
      .please(),
    makeMe.aCiProofEntry
      .at("tests/c")
      .holding(
        makeMe.aCiProofEvidence
          .inUnit("case")
          .counting(2, 0, 0)
          .timed(1_000)
          .inParts(2)
          .withPresentPart(2, { passed: 1, failed: 0, other: 0, untimed: 0 })
          .please(),
      )
      .please(),
  ]);

// Mixed-unit locations: whole-row sort compares case figures first, then file.
const groupedSummary = () =>
  proofSummaryForEntries(run, [
    makeMe.aCiProofEntry
      .at("grouped/slow")
      .holding(
        makeMe.aCiProofEvidence
          .inUnit("case")
          .counting(10)
          .timed(5_000)
          .please(),
        makeMe.aCiProofEvidence.inUnit("file").counting(2).timed(900).please(),
      )
      .please(),
    makeMe.aCiProofEntry
      .at("grouped/fast")
      .holding(
        makeMe.aCiProofEvidence.inUnit("case").counting(10).timed(500).please(),
        makeMe.aCiProofEvidence
          .inUnit("file")
          .counting(4)
          .timed(2_000)
          .please(),
      )
      .please(),
    makeMe.aCiProofEntry
      .at("grouped/gap")
      .holding(
        makeMe.aCiProofEvidence.inUnit("case").counting(3).timed(800).please(),
        makeMe.aCiProofEvidence
          .inUnit("file")
          .inParts(2, { missing: [2] })
          .withPresentPart(1, {
            passed: 1,
            failed: 0,
            other: 0,
            durationMs: 100,
          })
          .please(),
      )
      .please(),
  ]);

test("Proof sorts by Test execution time and Counts by click, Enter and Space, unmeasured last", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  const { proof } = await openFailedRun(
    page,
    () => runArtifactsAnswer(run, artifactId),
    () => summaryZipAnswer(exampleSummary()),
    () => [
      makeMe.aCiRun
        .with({
          headSha: judged,
          conclusion: "success",
          url: runUrl,
          databaseId: run.runId,
        })
        .please(),
    ],
  );
  const table = proofTable(proof);
  // Declaration order, no header sorted, and no totals row.
  await expectUnsortedRows(table, ["tests/a", "tests/b", "tests/c"]);
  await expect(table.locator("tbody tr td:nth-of-type(2)")).toHaveText([
    "12.5 s",
    "340 ms",
    "Part 2 untimed",
  ]);
  await expect(table.getByRole("row")).toHaveCount(4);

  const time = sortButton(table, "Test execution time");
  await time.click();
  await expectSortedBy(table, "Test execution time", "ascending", [
    "tests/b",
    "tests/a",
    "tests/c",
  ]);
  await time.click();
  // The partial row stays last.
  await expectSortedBy(table, "Test execution time", "descending", [
    "tests/a",
    "tests/b",
    "tests/c",
  ]);

  // Tab reaches the next header from the one before it; Enter and Space
  // activate it.
  await sortButton(table, "Entry").focus();
  await page.keyboard.press("Tab");
  const countsButton = sortButton(table, "Counts");
  await expect(countsButton).toBeFocused();
  await page.keyboard.press("Enter");
  // 3 with 1 failed before 3 passed, then 4.
  await expectSortedBy(table, "Counts", "ascending", [
    "tests/b",
    "tests/c",
    "tests/a",
  ]);
  await page.keyboard.press("Space");
  // Failed first among equal totals in either direction.
  await expectSortedBy(table, "Counts", "descending", [
    "tests/a",
    "tests/b",
    "tests/c",
  ]);
  await expect(table.getByRole("row")).toHaveCount(4);
});

test("a multi-unit location sorts as one row by each unit's figures without summing types", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  const { proof } = await openFailedRun(
    page,
    () => runArtifactsAnswer(run, artifactId),
    () => summaryZipAnswer(groupedSummary()),
  );
  const table = proofTable(proof);
  await expect(rowNames(table)).toHaveText([
    "grouped/slow",
    "grouped/fast",
    "grouped/gap",
  ]);
  await expect(table.getByRole("row")).toHaveCount(4);

  const time = sortButton(table, "Test execution time");
  await sortButton(table, "Entry").focus();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await expect(time).toBeFocused();
  await page.keyboard.press("Enter");
  // Case times 500, 800, 5000; gap's file line stays with its row.
  await expectSortedBy(table, "Test execution time", "ascending", [
    "grouped/fast",
    "grouped/gap",
    "grouped/slow",
  ]);
  await expect(
    table
      .locator("tbody tr")
      .nth(1)
      .locator(".intent-ci-proof-unit-line")
      .filter({ hasText: "Part 2 missing" }),
  ).toHaveAttribute("aria-label", "test files: Part 2 missing");

  await page.keyboard.press("Space");
  await expectSortedBy(table, "Test execution time", "descending", [
    "grouped/slow",
    "grouped/gap",
    "grouped/fast",
  ]);

  await sortButton(table, "Counts").click();
  // Case totals 3, then 10/10; file breaks the 10-tie (2 before 4).
  await expectSortedBy(table, "Counts", "ascending", [
    "grouped/gap",
    "grouped/slow",
    "grouped/fast",
  ]);
});
