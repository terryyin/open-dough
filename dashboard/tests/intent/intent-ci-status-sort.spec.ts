// Sorting CI status Proof by its columns (../../src/CiProofTable.tsx,
// ../../src/ciProofSort.ts): declaration order until a header is activated;
// Test execution time sorts by measured time with the partial row last in
// either direction; Counts sorts by counted results with failed results first
// among equal totals; each header is a button reached by Tab and activated by
// click, Enter or Space, its column header carrying aria-sort and a direction
// arrow; no totals row (SEED-259#scan-intent-ci-summaries key example 1). The
// comparator's cases live in ../../../tests/support/intent-ci-proof-sort.test.mjs.

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
  await expect(rowNames(table)).toHaveText(["tests/a", "tests/b", "tests/c"]);
  await expect(table.locator("tbody tr td:nth-of-type(2)")).toHaveText([
    "12.5 s",
    "340 ms",
    "Part 2 untimed",
  ]);
  await expect(table.locator("th[aria-sort]")).toHaveCount(0);
  await expect(table.getByRole("row")).toHaveCount(4);

  const time = sortButton(table, "Test execution time");
  await time.click();
  await expectSortedBy(table, "Test execution time", "ascending");
  await expect(rowNames(table)).toHaveText(["tests/b", "tests/a", "tests/c"]);
  await time.click();
  await expectSortedBy(table, "Test execution time", "descending");
  // The partial row stays last.
  await expect(rowNames(table)).toHaveText(["tests/a", "tests/b", "tests/c"]);

  // Tab reaches the next header from the one before it; Enter and Space
  // activate it.
  await sortButton(table, "Entry").focus();
  await page.keyboard.press("Tab");
  const countsButton = sortButton(table, "Counts");
  await expect(countsButton).toBeFocused();
  await page.keyboard.press("Enter");
  await expectSortedBy(table, "Counts", "ascending");
  // 3 with 1 failed before 3 passed, then 4.
  await expect(rowNames(table)).toHaveText(["tests/b", "tests/c", "tests/a"]);
  await page.keyboard.press("Space");
  await expectSortedBy(table, "Counts", "descending");
  // Failed first among equal totals in either direction.
  await expect(rowNames(table)).toHaveText(["tests/a", "tests/b", "tests/c"]);
  await expect(table.getByRole("row")).toHaveCount(4);
});
