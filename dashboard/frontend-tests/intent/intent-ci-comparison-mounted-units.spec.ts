import { expectFileComparisonRows } from "../../tests/intentFileProofPage.ts";
import {
  expectNamedScopeRows,
  expectNamedScopeFigures,
} from "../../tests/intentScopeProofPage.ts";
import { comparisonReading } from "../../tests/intentCiComparisonPage.ts";
import { test, expect } from "../../tests/support/pageTest.ts";
import {
  renderComparison,
  renderComparisonTree,
} from "../../tests/support/comparisonRendering.ts";
import { comparisonRenderFacts } from "../../tests/support/comparisonRenderFacts.ts";
import { summaryScopeFacts } from "../../tests/support/comparisonScopeFacts.ts";
import { intentLocationName } from "../../tests/intentPerspectivePage.ts";
import {
  aSpec,
  dashboardTests,
  entry,
  folder,
} from "../../tests/support/ciComparisonUnitsJourney.ts";
import { expectCueState } from "../../tests/support/expectCiComparisonCues.ts";
import { expectCiComparisonEntryRows } from "../../tests/support/expectCiComparisonEntryRows.ts";
import { summaryComparisonChanges } from "../../tests/support/intentSummaryStoryComparisonFixture.ts";
import { intentFile } from "../../tests/support/intentStoryPage.ts";

// Five/six/seven test cases and one test file, arranged anew by every case.
function casesAndFiles() {
  return [
    [dashboardTests({ cases: true }, 3, 30_000, 7_000)],
    [dashboardTests({ cases: true }, 4, 35_000, 8_000)],
    [dashboardTests({ cases: true }, 5, 40_000, 7_000)],
  ];
}
const parts = "1 of 1 part present";
const casesChange = "3 → 4 test cases (+1) → 5 test cases (+2)";
const filesUnchanged = "1 test file (no change)";
test("Baseline's five test cases and one test file against seven test cases and one test file show +2 test cases and no change in test files in the overall Counts, and each unit on its own entry row with its own time (example 39)", async ({
  page,
  comparisonRenderer,
}) => {
  const facts = summaryScopeFacts();
  const rendered = comparisonRenderFacts(facts, casesAndFiles());
  const panel = await renderComparison(page, comparisonRenderer, {
    ...rendered,
    scope: undefined,
  });
  const overall = comparisonReading(panel).overallCounts;
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
  comparisonRenderer,
}) => {
  const facts = summaryScopeFacts();
  const rendered = comparisonRenderFacts(facts, casesAndFiles());
  await renderComparison(page, comparisonRenderer, rendered);
  const summary = page.getByRole("region", { name: "Summary", exact: true });
  await expectNamedScopeFigures(summary, `CI proof of ${entry}: test cases`, [
    "5 → 6 test cases (+1) → 7 test cases (+2)",
    "40.0 s",
    "+5.0 s",
    "+10.0 s",
    parts,
  ]);
  await expectNamedScopeFigures(summary, `CI proof of ${entry}: test files`, [
    filesUnchanged,
    "7.0 s",
    "+1.0 s",
    "0 ms",
    parts,
  ]);
  await expectNamedScopeRows(summary, entry, "folder/", [
    ["", casesChange, "30.0 s", "+5.0 s", "+10.0 s"],
    ["", filesUnchanged, "7.0 s", "+1.0 s", "0 ms"],
  ]);
  await expectNamedScopeRows(summary, entry, "root.spec.ts", [
    ["", "2 test cases (no change)", "10.0 s", "0 ms", "0 ms"],
  ]);
});

test("Baseline's five test cases and one test file against seven test cases and one test file show each unit's own figures and file rows with their own time in the folder Summary (example 39)", async ({
  page,
  comparisonRenderer,
}) => {
  const facts = summaryScopeFacts();
  const rendered = comparisonRenderFacts(facts, casesAndFiles());
  await renderComparison(page, comparisonRenderer, {
    ...rendered,
    scope: { ...facts.scope, selection: { path: folder, scope: "folder" } },
  });
  const summary = page.getByRole("region", { name: "Summary", exact: true });
  await expect(summary.locator(".intent-summary-path")).toHaveText(folder);
  await expectNamedScopeFigures(summary, `CI proof of ${folder}: test cases`, [
    casesChange,
    "30.0 s",
    "+5.0 s",
    "+10.0 s",
    parts,
  ]);
  await expectNamedScopeFigures(summary, `CI proof of ${folder}: test files`, [
    filesUnchanged,
    "7.0 s",
    "+1.0 s",
    "0 ms",
    parts,
  ]);
  await expectNamedScopeRows(summary, folder, "a.spec.ts", [
    ["modified", casesChange, "30.0 s", "+5.0 s", "+10.0 s"],
    ["modified", filesUnchanged, "7.0 s", "+1.0 s", "0 ms"],
  ]);
});

test("Baseline's five test cases and one test file against seven test cases and one test file name each unit's change and time on the tree's file and location controls, which take the cue their rows agree on, and on the file's Proof rows (example 39)", async ({
  page,
  comparisonRenderer,
}) => {
  const facts = summaryScopeFacts();
  const rendered = comparisonRenderFacts(facts, casesAndFiles());
  await renderComparisonTree(page, comparisonRenderer, rendered);
  const intent = page.locator("#root");
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
  await renderComparison(page, comparisonRenderer, {
    ...rendered,
    scope: { ...facts.scope, selection: { path: aSpec, scope: "file" } },
  });
  await expectFileComparisonRows(intent, aSpec, [
    [`${aSpec} modified`, casesChange, "30.0 s", "+5.0 s", "+10.0 s"],
    [`${aSpec} modified`, filesUnchanged, "7.0 s", "+1.0 s", "0 ms"],
  ]);
});
