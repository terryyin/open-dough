// Legacy results at Baseline and Branch, spelled alike with different totals,
// keep both labelled ends readable and say why there is no test case or test
// file difference (examples 38, 39) in the comparison, the location Summary
// and the changed file's Proof.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import {
  aSpec,
  dashboardTests,
  entry,
} from "../../test-support/support/ciComparisonUnitsJourney.ts";
import { mountComparison } from "./intent-ci-comparison-page.ts";
import { mountCiScope, scopeReadsOf } from "./intent-ci-scope-page.tsx";

const legacyStory = () =>
  makeMe.aComparedStory
    .inSummaryScope()
    .withEntries([
      [dashboardTests({ legacy: "tests" }, 4, 35_000)],
      [dashboardTests({ legacy: "tests" }, 7, 42_000)],
      [dashboardTests({ cases: true }, 5, 40_000, 7_000)],
    ]);

const parts = "1 of 1 part present";
const entryCounts =
  "6 legacy test results → 9 legacy test results → 7 test cases and 1 test file (legacy unit unknown)";
const folderCounts =
  "4 legacy test results → 7 legacy test results → 5 test cases and 1 test file (legacy unit unknown)";
const bothUnits = "40.0 s (test cases); 7.0 s (test files)";

test("with legacy results at Baseline and at Branch, the overall Counts and entry row keep both labelled ends readable and say why there is no difference", async () => {
  const comparison = await mountComparison({
    ...legacyStory().please(),
    scope: undefined,
  });
  await expect
    .poll(() => comparison.entryRows())
    .toEqual([
      [
        entry,
        entryCounts,
        "45 s",
        "52 s",
        "50 s (test cases); 7 s (test files)",
      ],
    ]);
  expect(comparison.overallCounts()).toEqual([
    "6 legacy test results → 7 test cases and 1 test file (legacy unit unknown)",
  ]);
  expect(comparison.overallCountsCues()).toMatchObject([
    { count: "none", countReason: "no overall count" },
  ]);
});

test("with legacy results at Baseline and at Branch, the location Summary's own figures and child rows keep both labelled ends readable", async () => {
  const summaryFacts = legacyStory().please();
  const scope = await mountCiScope(
    summaryFacts,
    scopeReadsOf(summaryFacts).source,
  );
  const children = `CI proof of the immediate folders and files of ${entry}`;
  await expect
    .poll(() => scope.summary.figuresOf(`CI proof of ${entry}`))
    .toEqual([
      entryCounts,
      "45.0 s",
      "52.0 s",
      "50.0 s (test cases); 7.0 s (test files)",
      `test cases: ${parts}; test files: ${parts}`,
    ]);
  const named = new Set(["folder/", "root.spec.ts"]);
  expect(
    scope.summary.rowsOf(children).filter(([name]) => named.has(name ?? "")),
  ).toEqual([
    ["folder/", "", folderCounts, "35.0 s", "42.0 s", bothUnits],
    // Equal totals in a changed unit are no "no change".
    [
      "root.spec.ts",
      "",
      "2 legacy test results → 2 legacy test results → 2 test cases (legacy unit unknown)",
      "10.0 s",
      "10.0 s",
      "10.0 s",
    ],
  ]);
});

test("with legacy results at Baseline and at Branch, the changed file's Proof row keeps both labelled ends readable", async () => {
  const fileFacts = legacyStory().selecting(aSpec, "file").please();
  const scope = await mountCiScope(fileFacts, scopeReadsOf(fileFacts).source);
  await expect
    .poll(() => scope.proof.rowsOf(`CI proof of ${aSpec}`))
    .toEqual([
      [`${aSpec} modified`, folderCounts, "35.0 s", "42.0 s", bothUnits],
    ]);
});
