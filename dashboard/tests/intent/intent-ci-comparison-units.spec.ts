// Test cases and test files compared apart through a selected done story's
// CI comparison (../../src/storyCiComparisonCountsWords.ts,
// ../../src/ciScopeComparison.ts, ../../src/ciScopeComparisonUnits.ts): the
// overall Counts, the CI entry rows, the location and folder Summaries, the
// tree and a file's Proof show each declared unit Baseline and a later build
// both report on its own row with its own difference and time; with legacy
// results at Baseline and Branch, both ends stay readable with why there is
// no difference, even where the two legacy builds spell their unit alike
// (SEED-281 examples 38, 39). Each test opens only the views it reads. Rules:
// ../../../tests/support/intent-scope-comparison-units.test.mjs and
// intent-ci-comparison-overall-counts.test.mjs.

import { expect, test } from "../support/preparationPage.ts";
import {
  expandIntentFolders,
  expandIntentGroup,
  intentLocationName,
} from "../intentPerspectivePage.ts";
import { childName } from "../intentScopeProofPage.ts";
import {
  aSpec,
  dashboardTests,
  entry,
  expectFileProofRows,
  expectNamedRows,
  expectOwnFigures,
  folder,
  publishUnitsComparison,
} from "../support/ciComparisonUnitsJourney.ts";
import { expectCueState } from "../support/expectCiComparisonCues.ts";
import { expectCiComparisonEntryRows } from "../support/expectCiComparisonEntryRows.ts";
import { summaryComparisonChanges } from "../support/intentSummaryStoryComparisonFixture.ts";
import { selectDoneStoryForCiComparison } from "../support/selectDoneStoryForCiComparison.ts";
import {
  openSummaryComparison,
  selectDoneStoryForSummaryComparison,
} from "../support/selectDoneStoryForSummaryComparison.ts";
import { intentFile } from "../support/intentStoryPage.ts";

// Seven test cases and one test file at Landed.
const landed = dashboardTests({ cases: true }, 5, 40_000, 7_000);
// Five test cases and one test file at Baseline, six and one at Branch.
const casesAndFiles = {
  baseline: [dashboardTests({ cases: true }, 3, 30_000, 7_000)],
  branch: [dashboardTests({ cases: true }, 4, 35_000, 8_000)],
  landed: [landed],
};
// Six legacy "tests" results at Baseline, nine at Branch.
const legacyAtBaselineAndBranch = {
  baseline: [dashboardTests({ legacy: "tests" }, 4, 35_000)],
  branch: [dashboardTests({ legacy: "tests" }, 7, 42_000)],
  landed: [landed],
};

const parts = "1 of 1 part present";
const casesChange = "3 → 4 test cases (+1) → 5 test cases (+2)";
const filesUnchanged = "1 test file (no change)";
// The entry's and folder's Counts with legacy results at Baseline and Branch.
const entryCounts =
  "6 legacy test results → 9 legacy test results → 7 test cases and 1 test file (legacy unit unknown)";
const folderCounts =
  "4 legacy test results → 7 legacy test results → 5 test cases and 1 test file (legacy unit unknown)";

test("Baseline's five test cases and one test file against seven test cases and one test file show +2 test cases and no change in test files in the overall Counts, and each unit on its own entry row with its own time (example 39)", async ({
  page,
  origin,
}) => {
  await publishUnitsComparison(page, origin, casesAndFiles);
  const { panel } = await selectDoneStoryForCiComparison(page);
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
  origin,
}) => {
  await publishUnitsComparison(page, origin, casesAndFiles);
  const { intent } = await selectDoneStoryForSummaryComparison(page);
  const summary = await openSummaryComparison(intent, entry);
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
  origin,
}) => {
  await publishUnitsComparison(page, origin, casesAndFiles);
  const { intent } = await selectDoneStoryForSummaryComparison(page);
  const summary = await openSummaryComparison(intent, entry);
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
  origin,
}) => {
  await publishUnitsComparison(page, origin, casesAndFiles);
  const { intent } = await selectDoneStoryForSummaryComparison(page);
  // The tree's one control per path names each unit's row and takes the
  // cue its rows agree on: more test cases (+67%), slower test cases.
  await expandIntentGroup(intent, entry);
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
  await expectFileProofRows(intent, aSpec, [
    [casesChange, "30.0 s", "+5.0 s", "+10.0 s"],
    [filesUnchanged, "7.0 s", "+1.0 s", "0 ms"],
  ]);
});

test("with legacy results at Baseline and at Branch, spelled alike with different totals, the overall Counts and entry row keep both labelled ends readable and say why there is no test case or test file difference (examples 38, 39)", async ({
  page,
  origin,
}) => {
  await publishUnitsComparison(page, origin, legacyAtBaselineAndBranch);
  const { panel } = await selectDoneStoryForCiComparison(page);
  const overall = panel.locator(".intent-ci-comparison-overall-counts");
  await expect(overall).toHaveText(
    "6 legacy test results → 7 test cases and 1 test file (legacy unit unknown)",
  );
  await expectCueState(overall, {
    count: "none",
    countReason: "no overall count",
  });
  await expectCiComparisonEntryRows(panel, [
    [entry, entryCounts, "45 s", "52 s", "50 s (test cases); 7 s (test files)"],
  ]);
});

test("with legacy results at Baseline and at Branch, spelled alike with different totals, the location Summary's own figures and child rows keep both labelled ends readable and say why there is no difference (examples 38, 39)", async ({
  page,
  origin,
}) => {
  await publishUnitsComparison(page, origin, legacyAtBaselineAndBranch);
  const { intent } = await selectDoneStoryForSummaryComparison(page);
  const summary = await openSummaryComparison(intent, entry);
  await expectOwnFigures(summary, `CI proof of ${entry}`, [
    entryCounts,
    "45.0 s",
    "52.0 s",
    "50.0 s (test cases); 7.0 s (test files)",
    `test cases: ${parts}; test files: ${parts}`,
  ]);
  await expectNamedRows(summary, entry, "folder/", [
    [
      "",
      folderCounts,
      "35.0 s",
      "42.0 s",
      "40.0 s (test cases); 7.0 s (test files)",
    ],
  ]);
  // Equal totals in a changed unit are no "no change".
  await expectNamedRows(summary, entry, "root.spec.ts", [
    [
      "",
      "2 legacy test results → 2 legacy test results → 2 test cases (legacy unit unknown)",
      "10.0 s",
      "10.0 s",
      "10.0 s",
    ],
  ]);
});

test("with legacy results at Baseline and at Branch, spelled alike with different totals, the changed file's Proof row keeps both labelled ends readable and says why there is no difference (examples 38, 39)", async ({
  page,
  origin,
}) => {
  await publishUnitsComparison(page, origin, legacyAtBaselineAndBranch);
  const { intent } = await selectDoneStoryForSummaryComparison(page);
  await expandIntentGroup(intent, entry);
  await expandIntentFolders(intent, entry);
  await expectFileProofRows(intent, aSpec, [
    [
      folderCounts,
      "35.0 s",
      "42.0 s",
      "40.0 s (test cases); 7.0 s (test files)",
    ],
  ]);
});
