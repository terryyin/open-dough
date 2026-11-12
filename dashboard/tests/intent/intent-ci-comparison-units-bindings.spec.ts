import { expectFileComparisonRows } from "../intentFileProofPage.ts";
import {
  expectNamedScopeRows,
  expectNamedScopeFigures,
} from "../intentScopeProofPage.ts";
// The actual mixed-unit tree → folder → file callbacks.
import {
  test,
  expect,
  mountComparison,
} from "../support/comparisonMountPage.ts";
import {
  serveComparison,
  summaryScopeFacts,
} from "../support/comparisonScopeFacts.ts";
import { childName } from "../intentScopeProofPage.ts";
import {
  dashboardTests,
  entry,
  folder,
  aSpec,
} from "../support/ciComparisonUnitsJourney.ts";
import {
  expandIntentFolders,
  intentLocationName,
} from "../intentPerspectivePage.ts";
import { intentFile } from "../support/intentStoryPage.ts";
import { summaryComparisonChanges } from "../support/intentSummaryStoryComparisonFixture.ts";
import { expectCueState } from "../support/expectCiComparisonCues.ts";

test("mixed-unit tree and Summary callbacks keep both units through folder and file Proof", async ({
  page,
  comparisonServer,
  comparisonServices,
}) => {
  const facts = summaryScopeFacts();
  serveComparison(comparisonServices, facts, [
    [dashboardTests({ cases: true }, 3, 30000, 7000)],
    [dashboardTests({ cases: true }, 4, 35000, 8000)],
    [dashboardTests({ cases: true }, 5, 40000, 7000)],
  ]);
  await mountComparison(page, comparisonServer, facts);
  const intent = page.locator("#root");
  await expandIntentFolders(intent, entry);
  const file = intentFile(intent, summaryComparisonChanges.modified);
  const cases = "3 → 4 test cases (+1) → 5 test cases (+2)";
  const files = "1 test file (no change)";
  await expect(file).toHaveAttribute(
    "aria-label",
    `${summaryComparisonChanges.modified}, ${cases}, +10.0 s; ${files}, 0 ms`,
  );
  await expectCueState(file, {
    count: "more-strong",
    duration: "slower-light",
  });
  await expect(intentLocationName(intent, entry)).toHaveAttribute(
    "aria-label",
    `${entry}, typescript, **/*.spec.ts, 5 → 6 test cases (+1) → 7 test cases (+2), +10.0 s; ${files}, 0 ms`,
  );
  const summary = page.getByRole("region", { name: "Summary", exact: true });
  await expectNamedScopeRows(summary, entry, "folder/", [
    ["", cases, "30.0 s", "+5.0 s", "+10.0 s"],
    ["", files, "7.0 s", "+1.0 s", "0 ms"],
  ]);
  await childName(summary, "folder/").first().click();
  await expect(summary.locator(".intent-summary-path")).toHaveText(folder);
  await expectNamedScopeFigures(summary, `CI proof of ${folder}: test cases`, [
    cases,
    "30.0 s",
    "+5.0 s",
    "+10.0 s",
    "1 of 1 part present",
  ]);
  await expectNamedScopeFigures(summary, `CI proof of ${folder}: test files`, [
    files,
    "7.0 s",
    "+1.0 s",
    "0 ms",
    "1 of 1 part present",
  ]);
  await expectNamedScopeRows(summary, folder, "a.spec.ts", [
    ["modified", cases, "30.0 s", "+5.0 s", "+10.0 s"],
    ["modified", files, "7.0 s", "+1.0 s", "0 ms"],
  ]);
  await summary
    .getByRole("button", { name: "a.spec.ts", exact: true })
    .first()
    .click();
  await expectFileComparisonRows(intent, aSpec, [
    [`${aSpec} modified`, cases, "30.0 s", "+5.0 s", "+10.0 s"],
    [`${aSpec} modified`, files, "7.0 s", "+1.0 s", "0 ms"],
  ]);
  expect(comparisonServices.comparisons).toBe(1);
  expect(comparisonServices.proofs).toBe(3);
});
