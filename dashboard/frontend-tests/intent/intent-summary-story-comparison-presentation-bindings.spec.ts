// Native Summary header callbacks absent from static rendering.
import {
  test,
  expect,
  mountComparison,
} from "../../tests/support/comparisonMountPage.ts";
import {
  serveComparison,
  summaryScopeFacts,
} from "../../tests/support/comparisonScopeFacts.ts";
import {
  expectSortedBy,
  sortButton,
} from "../../tests/support/expectSortedColumns.ts";
import { scopeTable } from "../../tests/intentScopeProofPage.ts";
import { entry } from "../../tests/support/ciComparisonUnitsJourney.ts";

test("Summary header bindings route Change, Baseline, Branch and Counts", async ({
  page,
  comparisonServer,
  comparisonServices,
}) => {
  const facts = summaryScopeFacts();
  serveComparison(comparisonServices, facts, facts.entries);
  await mountComparison(page, comparisonServer, facts);
  const summary = page.getByRole("region", { name: "Summary", exact: true });
  const table = scopeTable(summary, entry);
  await sortButton(table, "Change").click();
  await expectSortedBy(table, "Change", "ascending", [
    "added.spec.ts",
    "gone.spec.ts",
    "renamed.spec.ts",
    "folder/",
    "root.spec.ts",
  ]);
  await sortButton(table, "Baseline").press("Enter");
  await expectSortedBy(table, "Baseline", "ascending", [
    "gone.spec.ts",
    "root.spec.ts",
    "renamed.spec.ts",
    "folder/",
    "added.spec.ts",
  ]);
  await sortButton(table, "Branch").click();
  await expectSortedBy(table, "Branch", "ascending", [
    "root.spec.ts",
    "folder/",
    "added.spec.ts",
    "gone.spec.ts",
    "renamed.spec.ts",
  ]);
  await sortButton(table, "Counts").focus();
  await page.keyboard.press("Space");
  await expectSortedBy(table, "Counts", "ascending", [
    "added.spec.ts",
    "renamed.spec.ts",
    "root.spec.ts",
    "folder/",
    "gone.spec.ts",
  ]);
  expect(comparisonServices.comparisons).toBe(1);
  expect(comparisonServices.proofs).toBe(3);
});
