// Count words for Intent's shared CI comparison
// (../../dashboard/src/ciScopeComparisonCounts.ts,
// ../../dashboard/src/ciScopeComparisonCountsCell.ts): a count cell's
// difference only between totals of one declared unit, never across units,
// from legacy results, of several units or from a unit an endpoint does not
// report, which show both labelled ends and why (SEED-281 examples 38, 39).
// Overall counts: ./intent-ci-comparison-overall-counts.test.mjs. Compared
// rows per unit: ./intent-scope-comparison-units.test.mjs. Signed timing:
// ./intent-scope-comparison-timing.test.mjs. Browser journeys:
// ../../dashboard/tests/intent/intent-ci-comparison*.spec.ts and
// intent-summary-story-comparison*.spec.ts.
import assert from "node:assert/strict";
import { test } from "node:test";
import { measuredCountsChangeWords } from "../../dashboard/src/ciScopeComparisonCounts.ts";
import { countsCellText } from "../../dashboard/src/ciScopeComparisonCountsCell.ts";

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

test("a count difference exists only between totals of one declared unit: different units, legacy results and several units show each endpoint in its units and why there is none", () => {
  // Once worded "5 → 1 checks (−4)", subtracting test files from test cases.
  assert.equal(
    countsCellText(
      measured(5, "case"),
      measured(1, "file"),
      measured(1, "file"),
      true,
      true,
    ),
    "5 test cases → 1 test file (different units)",
  );
  // Equal totals in different units are no "no change".
  assert.equal(
    countsCellText(
      measured(6, "case"),
      measured(6, "file"),
      measured(6, "file"),
      true,
      true,
    ),
    "6 test cases → 6 test files (different units)",
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
    "5 legacy test results → 5 legacy test results (legacy unit unknown)",
  );
  const several = {
    kind: "units",
    counts: [measured(5, "case"), measured(1, "file")],
  };
  assert.equal(
    countsCellText(measured(6, "legacy"), several, several, true, true),
    "6 legacy test results → 5 test cases and 1 test file (legacy unit unknown)",
  );
  assert.equal(
    countsCellText(
      measured(5, "case"),
      measured(6, "case"),
      measured(1, "file"),
      true,
      true,
    ),
    "5 test cases → 6 test cases → 1 test file (different units)",
  );
  // One measured end: the gap or "—" already says why.
  assert.equal(
    countsCellText(
      measured(3, "legacy"),
      { kind: "unreported" },
      { kind: "unreported" },
      true,
      true,
    ),
    "3 legacy test results → —",
  );
});

test("a unit Branch does not report keeps Landed's own difference from Baseline, and a unit Baseline does not report is no zero", () => {
  assert.equal(
    countsCellText(
      measured(5),
      { kind: "unreported" },
      measured(7),
      true,
      true,
    ),
    "5 test cases → — → 7 test cases (+2)",
  );
  assert.equal(
    countsCellText(
      { kind: "unreported" },
      measured(1, "file"),
      measured(1, "file"),
      true,
      true,
    ),
    "— → 1 test file",
  );
  // A reported zero is a real zero.
  assert.equal(
    countsCellText(
      measured(0, "file"),
      measured(1, "file"),
      measured(1, "file"),
      true,
      true,
    ),
    "0 → 1 test file (+1)",
  );
});
