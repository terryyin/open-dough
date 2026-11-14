import { comparisonReading } from "../../tests/intentCiComparisonPage.ts";
// Native entry header callbacks absent from static rendering.
import {
  test,
  expect,
  mountComparison,
} from "../../tests/support/comparisonMountPage.ts";
import { serveComparison } from "../../tests/support/comparisonScopeFacts.ts";
import {
  wallComparedFacts,
  mixedEntryFacts,
} from "../../tests/support/mountedComparisonFacts.ts";
import {
  expectSortedBy,
  sortButton,
} from "../../tests/support/expectSortedColumns.ts";

test("entry header bindings route Baseline, Counts, Branch and Landed with native Enter and Space", async ({
  page,
  comparisonServer,
  comparisonServices,
}) => {
  const facts = wallComparedFacts();
  serveComparison(comparisonServices, facts, mixedEntryFacts());
  const panel = await mountComparison(page, comparisonServer, facts);
  const table = comparisonReading(panel).entryTable;
  const baseline = sortButton(table, "Baseline");
  await baseline.click();
  await expectSortedBy(table, "Baseline", "ascending", [
    "tests",
    "dashboard/tests",
    "src/skills",
  ]);
  await baseline.press("Enter");
  await expectSortedBy(table, "Baseline", "descending", [
    "dashboard/tests",
    "tests",
    "src/skills",
  ]);
  await sortButton(table, "Counts").focus();
  await page.keyboard.press("Space");
  await expectSortedBy(table, "Counts", "ascending", [
    "src/skills",
    "tests",
    "dashboard/tests",
  ]);
  await sortButton(table, "Branch").click();
  await expectSortedBy(table, "Branch", "ascending", [
    "tests",
    "dashboard/tests",
    "src/skills",
  ]);
  await sortButton(table, "Landed").click();
  await expectSortedBy(table, "Landed", "ascending", [
    "tests",
    "dashboard/tests",
    "src/skills",
  ]);
  expect(comparisonServices.comparisons).toBe(1);
  expect(comparisonServices.proofs).toBe(3);
});
