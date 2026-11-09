import {
  expect,
  test,
  mountComparison,
} from "../support/comparisonMountPage.ts";
import {
  summaryScopeFacts,
  serveComparison,
} from "../support/comparisonScopeFacts.ts";
import {
  expandIntentFolders,
  intentLocationName,
} from "../intentPerspectivePage.ts";
import { childName } from "../intentScopeProofPage.ts";
import {
  aSpec,
  dashboardTests,
  entry,
  expectNamedRows,
  expectOwnFigures,
  folder,
} from "../support/ciComparisonUnitsJourney.ts";
import { expectCueState } from "../support/expectCiComparisonCues.ts";
import { expectCiComparisonEntryRows } from "../support/expectCiComparisonEntryRows.ts";
import { summaryComparisonChanges } from "../support/intentSummaryStoryComparisonFixture.ts";
import { intentFile } from "../support/intentStoryPage.ts";
import type { Locator } from "@playwright/test";

async function fileProofRows(
  intent: Locator,
  file: string,
  rows: readonly (readonly string[])[],
) {
  await intentFile(intent, summaryComparisonChanges.modified).click();
  const body = intent
    .getByRole("table", { name: `CI proof of ${file}`, exact: true })
    .locator("tbody tr");
  await expect(body).toHaveCount(rows.length);
  for (const [at, cells] of rows.entries()) {
    await expect(body.nth(at).getByRole("rowheader")).toHaveText(
      `${file} modified`,
    );
    await expect(body.nth(at).getByRole("cell")).toHaveText([...cells]);
  }
}

// Seven test cases and one test file at Landed.
const landed = dashboardTests({ cases: true }, 5, 40_000, 7_000);
// Five test cases and one test file at Baseline, six and one at Branch.
const casesAndFiles = {
  baseline: [dashboardTests({ cases: true }, 3, 30_000, 7_000)],
  branch: [dashboardTests({ cases: true }, 4, 35_000, 8_000)],
  landed: [landed],
};
const parts = "1 of 1 part present";
const casesChange = "3 → 4 test cases (+1) → 5 test cases (+2)";
const filesUnchanged = "1 test file (no change)";
test("Baseline's five test cases and one test file against seven test cases and one test file show +2 test cases and no change in test files in the overall Counts, and each unit on its own entry row with its own time (example 39)", async ({
  page,
  comparisonServer,
  comparisonServices,
}) => {
  const facts = summaryScopeFacts();
  serveComparison(comparisonServices, facts, Object.values(casesAndFiles));
  const panel = await mountComparison(page, comparisonServer, {
    ...facts,
    scope: undefined,
  });
  const overall = panel.locator(".intent-ci-comparison-overall-counts");
  await expect(overall).toHaveText(
    "5 → 7 test cases (+2); 1 test file (no change)",
  );
  await expectCueState(overall, { count: "more-light" });
  await expectCiComparisonEntryRows(panel, [
    [
      entry,
      "5 → 6 test cases (+1) → 7 test cases (+2)",
      "40 s",
      "+5 s",
      "+10 s",
    ],
    [entry, filesUnchanged, "7 s", "+1 s", "0 s"],
  ]);
});

test("Baseline's five test cases and one test file against seven test cases and one test file show each unit's own figures and child rows with their own time in the location Summary (example 39)", async ({
  page,
  comparisonServer,
  comparisonServices,
}) => {
  const facts = summaryScopeFacts();
  serveComparison(comparisonServices, facts, Object.values(casesAndFiles));
  await mountComparison(page, comparisonServer, facts);
  const summary = page.getByRole("region", { name: "Summary", exact: true });
  await expectOwnFigures(summary, `CI proof of ${entry}: test cases`, [
    "5 → 6 test cases (+1) → 7 test cases (+2)",
    "40.0 s",
    "+5.0 s",
    "+10.0 s",
    parts,
  ]);
  await expectOwnFigures(summary, `CI proof of ${entry}: test files`, [
    filesUnchanged,
    "7.0 s",
    "+1.0 s",
    "0 ms",
    parts,
  ]);
  await expectNamedRows(summary, entry, "folder/", [
    ["", casesChange, "30.0 s", "+5.0 s", "+10.0 s"],
    ["", filesUnchanged, "7.0 s", "+1.0 s", "0 ms"],
  ]);
  await expectNamedRows(summary, entry, "root.spec.ts", [
    ["", "2 test cases (no change)", "10.0 s", "0 ms", "0 ms"],
  ]);
});

test("Baseline's five test cases and one test file against seven test cases and one test file show each unit's own figures and file rows with their own time in the folder Summary (example 39)", async ({
  page,
  comparisonServer,
  comparisonServices,
}) => {
  const facts = summaryScopeFacts();
  serveComparison(comparisonServices, facts, Object.values(casesAndFiles));
  await mountComparison(page, comparisonServer, facts);
  const summary = page.getByRole("region", { name: "Summary", exact: true });
  await childName(summary, "folder/").first().click();
  await expect(summary.locator(".intent-summary-path")).toHaveText(folder);
  await expectOwnFigures(summary, `CI proof of ${folder}: test cases`, [
    casesChange,
    "30.0 s",
    "+5.0 s",
    "+10.0 s",
    parts,
  ]);
  await expectOwnFigures(summary, `CI proof of ${folder}: test files`, [
    filesUnchanged,
    "7.0 s",
    "+1.0 s",
    "0 ms",
    parts,
  ]);
  await expectNamedRows(summary, folder, "a.spec.ts", [
    ["modified", casesChange, "30.0 s", "+5.0 s", "+10.0 s"],
    ["modified", filesUnchanged, "7.0 s", "+1.0 s", "0 ms"],
  ]);
});

test("Baseline's five test cases and one test file against seven test cases and one test file name each unit's change and time on the tree's file and location controls, which take the cue their rows agree on, and on the file's Proof rows (example 39)", async ({
  page,
  comparisonServer,
  comparisonServices,
}) => {
  const facts = summaryScopeFacts();
  serveComparison(comparisonServices, facts, Object.values(casesAndFiles));
  await mountComparison(page, comparisonServer, facts);
  const intent = page.locator("#root");
  // The tree's one control per path names each unit's row and takes the
  // cue its rows agree on: more test cases (+67%), slower test cases.
  await expandIntentFolders(intent, entry);
  const file = intentFile(intent, summaryComparisonChanges.modified);
  await expect(file).toHaveAttribute(
    "aria-label",
    `${summaryComparisonChanges.modified}, ${casesChange}, +10.0 s; ${filesUnchanged}, 0 ms`,
  );
  await expectCueState(file, {
    count: "more-strong",
    duration: "slower-light",
  });
  await expect(intentLocationName(intent, entry)).toHaveAttribute(
    "aria-label",
    `${entry}, typescript, **/*.spec.ts, 5 → 6 test cases (+1) → 7 test cases (+2), +10.0 s; ${filesUnchanged}, 0 ms`,
  );
  await fileProofRows(intent, aSpec, [
    [casesChange, "30.0 s", "+5.0 s", "+10.0 s"],
    [filesUnchanged, "7.0 s", "+1.0 s", "0 ms"],
  ]);
});
