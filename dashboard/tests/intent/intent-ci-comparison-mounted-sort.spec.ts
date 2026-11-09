// Actual sortable headers over canonical endpoint proof, without acquisition setup.
import { makeMe } from "../../../tests/support/makeMe.mjs";
import {
  test,
  expect,
  mountComparison,
} from "../support/comparisonMountPage.ts";
import { serveComparison } from "../support/comparisonScopeFacts.ts";
import {
  mixedEntryFacts,
  timedEntry,
  wallComparedFacts,
} from "../support/mountedComparisonFacts.ts";
import {
  expectSortedBy,
  rowNames,
  sortButton,
} from "../support/expectSortedColumns.ts";
import { expectCiComparisonEntryRows } from "../support/expectCiComparisonEntryRows.ts";

test("Baseline and Counts sort with click, Enter and Space, directions and baseline gaps last", async ({
  page,
  comparisonServer,
  comparisonServices,
}) => {
  const facts = wallComparedFacts();
  serveComparison(comparisonServices, facts, mixedEntryFacts());
  const panel = await mountComparison(page, comparisonServer, facts);
  const table = panel.getByRole("table", {
    name: "CI entry timing comparison",
  });
  await expect(rowNames(table)).toHaveText([
    "dashboard/tests",
    "tests",
    "src/skills",
  ]);
  await expect(table.locator("th[aria-sort]")).toHaveCount(0);
  const baseline = sortButton(table, "Baseline");
  await baseline.click();
  await expectSortedBy(table, "Baseline", "ascending");
  await expect(rowNames(table)).toHaveText([
    "tests",
    "dashboard/tests",
    "src/skills",
  ]);
  await baseline.press("Enter");
  await expectSortedBy(table, "Baseline", "descending");
  await expect(rowNames(table)).toHaveText([
    "dashboard/tests",
    "tests",
    "src/skills",
  ]);
  await sortButton(table, "Counts").focus();
  await page.keyboard.press("Space");
  await expectSortedBy(table, "Counts", "ascending");
  await expect(rowNames(table)).toHaveText([
    "src/skills",
    "tests",
    "dashboard/tests",
  ]);
  await sortButton(table, "Counts").click();
  await expectSortedBy(table, "Counts", "descending");
  await expect(rowNames(table)).toHaveText([
    "dashboard/tests",
    "tests",
    "src/skills",
  ]);
});

for (const column of ["Branch", "Landed"] as const) {
  test(`${column} sorts signed changes rather than duration or percentage and keeps gaps last both ways`, async ({
    page,
    comparisonServer,
    comparisonServices,
  }) => {
    const facts = wallComparedFacts();
    const untimed = makeMe.aCiProofEntry.at("e/untimed").please();
    serveComparison(comparisonServices, facts, [
      [
        timedEntry("e/big", 600_000),
        timedEntry("e/small", 60_000),
        timedEntry("e/down", 300_000),
        untimed,
      ],
      [
        timedEntry("e/big", 660_000),
        timedEntry("e/small", 90_000),
        timedEntry("e/down", 280_000),
        untimed,
        timedEntry("e/added", 5_000),
      ],
      [
        timedEntry("e/big", 720_000),
        timedEntry("e/small", 100_000),
        timedEntry("e/down", 240_000),
        untimed,
        timedEntry("e/added", 5_000),
      ],
    ]);
    const panel = await mountComparison(page, comparisonServer, facts);
    await expectCiComparisonEntryRows(panel, [
      ["e/big", "1 test case (no change)", "10 min", "+1 min", "+2 min"],
      ["e/small", "1 test case (no change)", "1 min", "+30 s", "+40 s"],
      ["e/down", "1 test case (no change)", "5 min", "−20 s", "−1 min"],
      [
        "e/untimed",
        "1 test case (no change)",
        "No timings",
        "No timings",
        "No timings",
      ],
      ["e/added", "added → 1 test case", "added", "5 s", "5 s"],
    ]);
    const table = panel.getByRole("table", {
      name: "CI entry timing comparison",
    });
    const header = sortButton(table, column);
    await header.click();
    await expectSortedBy(table, column, "ascending");
    await expect(rowNames(table)).toHaveText([
      "e/down",
      "e/small",
      "e/big",
      "e/untimed",
      "e/added",
    ]);
    await header.press("Enter");
    await expectSortedBy(table, column, "descending");
    await expect(rowNames(table)).toHaveText([
      "e/big",
      "e/small",
      "e/down",
      "e/untimed",
      "e/added",
    ]);
  });
}
