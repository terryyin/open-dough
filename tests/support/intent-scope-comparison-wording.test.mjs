// Count words for Intent's shared CI comparison
// (../../dashboard/src/ciScopeComparisonCounts.ts,
// ../../dashboard/src/ciScopeComparisonCountsCell.ts,
// ../../dashboard/src/storyCiComparisonCountsWords.ts): count cells and the
// overall sum with units kept apart; a count difference only between totals
// of one declared unit, never across units, from legacy results, of several
// units or from a unit a build does not report. Signed timing:
// ./intent-scope-comparison-timing.test.mjs. Browser journeys:
// ../../dashboard/tests/intent/intent-ci-comparison*.spec.ts and
// intent-summary-story-comparison*.spec.ts.
import assert from "node:assert/strict";
import { test } from "node:test";
import { measuredCountsChangeWords } from "../../dashboard/src/ciScopeComparisonCounts.ts";
import { countsCellText } from "../../dashboard/src/ciScopeComparisonCountsCell.ts";
import {
  overallCountsCue,
  overallCountsWords,
} from "../../dashboard/src/storyCiComparisonCountsWords.ts";
import { makeMe } from "./makeMe.mjs";

const measured = (total, unit = "case") => ({
  kind: "measured",
  total,
  failed: 0,
  unit,
});

test("count cells read before → after with the difference in parentheses", () => {
  assert.equal(
    measuredCountsChangeWords(12, 10, "case"),
    "12 → 10 test cases (−2)",
  );
  assert.equal(
    measuredCountsChangeWords(6, 6, "case"),
    "6 test cases (no change)",
  );
  assert.equal(
    countsCellText(measured(12), measured(10), measured(10), true, true),
    "12 → 10 test cases (−2)",
  );
  assert.equal(
    countsCellText(
      measured(5, "file"),
      measured(5, "file"),
      measured(5, "file"),
      true,
      true,
    ),
    "5 test files (no change)",
  );
  assert.equal(
    countsCellText({ kind: "absent" }, measured(1), measured(1), true, false),
    "added → 1 test case",
  );
});

test("a count difference exists only between totals of one declared unit: different units, legacy results and several units show each endpoint in its units without one", () => {
  // Once worded "5 → 1 checks (−4)", subtracting test files from test cases.
  assert.equal(
    countsCellText(
      measured(5, "case"),
      measured(1, "file"),
      measured(1, "file"),
      true,
      true,
    ),
    "5 test cases → 1 test file",
  );
  // Equal legacy totals are not compared either.
  assert.equal(
    countsCellText(
      measured(5, "legacy"),
      measured(5, "legacy"),
      measured(5, "legacy"),
      true,
      true,
    ),
    "5 legacy test results → 5 legacy test results",
  );
  const several = {
    kind: "units",
    counts: [measured(5, "case"), measured(1, "file")],
  };
  assert.equal(
    countsCellText(measured(5, "case"), several, several, true, true),
    "5 test cases → 5 test cases and 1 test file",
  );
  assert.equal(
    countsCellText(
      measured(5, "case"),
      measured(6, "case"),
      measured(1, "file"),
      true,
      true,
    ),
    "5 test cases → 6 test cases → 1 test file",
  );
});

// A proof summary of ENTRIES.
const summary = (...entries) => ({ kind: "summary", entries });
const entry = (path, passed, unit) =>
  makeMe.aCiProofEntry.at(path).counting(passed, unit).please();

test("overall counts keep test cases and test files apart and say partial when a side is missing", () => {
  const baseline = summary(
    entry("dashboard/tests", 1098, "case"),
    entry("tests", 982, "case"),
    entry("scripts", 492, "file"),
  );
  const landed = summary(
    entry("dashboard/tests", 1100, "case"),
    entry("tests", 982, "case"),
    entry("scripts", 492, "file"),
  );
  assert.equal(
    overallCountsWords(baseline, landed),
    "2,080 → 2,082 test cases (+2); 492 test files (no change)",
  );
  assert.equal(
    overallCountsWords(baseline, {
      kind: "unavailable",
      line: "This run's CI proof summary has expired.",
    }),
    "Overall count partial: This run's CI proof summary has expired.",
  );
  assert.equal(
    overallCountsWords(
      { kind: "no-build", explanation: "Build is still running." },
      landed,
    ),
    "Overall count partial: Build is still running.",
  );
  assert.equal(
    overallCountsWords(
      { kind: "summary", entries: [] },
      { kind: "summary", entries: [] },
    ),
    "No overall count: neither compared build has a usable total.",
  );
});

test("the overall count compares only declared units both builds report: a unit one build lacks is no zero, and legacy results are neither totalled nor compared", () => {
  const casesOnly = summary(entry("dashboard/tests", 5, "case"));
  const both = summary(
    entry("dashboard/tests", 7, "case"),
    entry("tests", 1, "file"),
  );
  assert.equal(
    overallCountsWords(casesOnly, both),
    "5 → 7 test cases (+2); — → 1 test file",
  );
  assert.deepEqual(overallCountsCue(casesOnly, both), {
    kind: "border",
    direction: "more",
    strength: "light",
  });
  const legacy = summary(
    makeMe.aCiProofEntry
      .at("tests")
      .holding(makeMe.aCiProofEvidence.legacy("checks").counting(5).please())
      .please(),
  );
  assert.equal(
    overallCountsWords(legacy, legacy),
    "No overall count: legacy test results are not compared.",
  );
  assert.equal(
    overallCountsWords(legacy, both),
    "— → 7 test cases; — → 1 test file; legacy test results not compared",
  );
  assert.deepEqual(overallCountsCue(legacy, both), {
    kind: "none",
    reason: "no overall count",
  });
});
