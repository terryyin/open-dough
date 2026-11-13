import { expectFileComparisonRows } from "../../tests/intentFileProofPage.ts";
import {
  expectNamedScopeRows,
  expectNamedScopeFigures,
} from "../../tests/intentScopeProofPage.ts";
import { comparisonReading } from "../../tests/intentCiComparisonPage.ts";
import { test, expect } from "../../tests/support/pageTest.ts";
import { renderComparison } from "../../tests/support/comparisonRendering.ts";
import { comparisonRenderFacts } from "../../tests/support/comparisonRenderFacts.ts";
import { summaryScopeFacts } from "../../tests/support/comparisonScopeFacts.ts";
import {
  aSpec,
  dashboardTests,
  entry,
} from "../../tests/support/ciComparisonUnitsJourney.ts";
import { expectCueState } from "../../tests/support/expectCiComparisonCues.ts";
import { expectCiComparisonEntryRows } from "../../tests/support/expectCiComparisonEntryRows.ts";

// Legacy Baseline and Branch remain independent facts inside each case.
function legacyAtBaselineAndBranch() {
  return [
    [dashboardTests({ legacy: "tests" }, 4, 35_000)],
    [dashboardTests({ legacy: "tests" }, 7, 42_000)],
    [dashboardTests({ cases: true }, 5, 40_000, 7_000)],
  ];
}

const parts = "1 of 1 part present";
// The entry's and folder's Counts with legacy results at Baseline and Branch.
const entryCounts =
  "6 legacy test results → 9 legacy test results → 7 test cases and 1 test file (legacy unit unknown)";
const folderCounts =
  "4 legacy test results → 7 legacy test results → 5 test cases and 1 test file (legacy unit unknown)";

test("with legacy results at Baseline and at Branch, spelled alike with different totals, the overall Counts and entry row keep both labelled ends readable and say why there is no test case or test file difference (examples 38, 39)", async ({
  page,
  comparisonRenderer,
}) => {
  const facts = summaryScopeFacts();
  const rendered = comparisonRenderFacts(facts, legacyAtBaselineAndBranch());
  const panel = await renderComparison(page, comparisonRenderer, {
    ...rendered,
    scope: undefined,
  });
  const overall = comparisonReading(panel).overallCounts;
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
  comparisonRenderer,
}) => {
  const facts = summaryScopeFacts();
  const rendered = comparisonRenderFacts(facts, legacyAtBaselineAndBranch());
  await renderComparison(page, comparisonRenderer, rendered);
  const summary = page.getByRole("region", { name: "Summary", exact: true });
  await expectNamedScopeFigures(summary, `CI proof of ${entry}`, [
    entryCounts,
    "45.0 s",
    "52.0 s",
    "50.0 s (test cases); 7.0 s (test files)",
    `test cases: ${parts}; test files: ${parts}`,
  ]);
  await expectNamedScopeRows(summary, entry, "folder/", [
    [
      "",
      folderCounts,
      "35.0 s",
      "42.0 s",
      "40.0 s (test cases); 7.0 s (test files)",
    ],
  ]);
  // Equal totals in a changed unit are no "no change".
  await expectNamedScopeRows(summary, entry, "root.spec.ts", [
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
  comparisonRenderer,
}) => {
  const facts = summaryScopeFacts();
  const rendered = comparisonRenderFacts(facts, legacyAtBaselineAndBranch());
  await renderComparison(page, comparisonRenderer, {
    ...rendered,
    scope: { ...facts.scope, selection: { path: aSpec, scope: "file" } },
  });
  const intent = page.locator("#root");
  await expectFileComparisonRows(intent, aSpec, [
    [
      `${aSpec} modified`,
      folderCounts,
      "35.0 s",
      "42.0 s",
      "40.0 s (test cases); 7.0 s (test files)",
    ],
  ]);
});
