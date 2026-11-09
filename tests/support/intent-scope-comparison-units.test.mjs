// Compared rows per unit in Intent's shared CI comparison
// (../../dashboard/src/ciScopeComparison.ts,
// ../../dashboard/src/ciScopeComparisonUnits.ts): at an entry, a folder and a
// file, each declared unit Baseline and a later endpoint both show compares
// on its own row, with its own counts, time, relative change and cues, and
// legacy results at Baseline show both labelled ends on one row with why
// there is no difference (SEED-281 example 39). Legacy labels, unreported
// units, reported zeros and outside rows:
// ./intent-scope-comparison-unit-gaps.test.mjs. Count words:
// ./intent-scope-comparison-wording.test.mjs. Overall counts:
// ./intent-ci-comparison-overall-counts.test.mjs. Browser journey:
// ../../dashboard/tests/intent/intent-ci-comparison-units.spec.ts.
import assert from "node:assert/strict";
import { test } from "node:test";
import { scopeComparisonRowsOf } from "../../dashboard/src/ciScopeComparison.ts";
import { makeMe } from "./makeMe.mjs";

const summary = (...entries) => ({ kind: "summary", entries });
const entry = "dashboard/tests";
const aSpec = `${entry}/folder/a.spec.ts`;
const rootSpec = `${entry}/root.spec.ts`;

// The dashboard/tests entry: CASES of a.spec.ts, its own test file outcome
// and root.spec.ts's two test cases, each broken down by file with its time.
const dashboardTests = ({ cases, casesMs, fileMs }) =>
  summary(
    makeMe.aCiProofEntry
      .at(entry)
      .holding(
        makeMe.aCiProofEvidence
          .inUnit("case")
          .brokenDown(
            { path: aSpec, passed: cases, durationMs: casesMs },
            { path: rootSpec, passed: 2, durationMs: 1_000 },
          )
          .please(),
        makeMe.aCiProofEvidence
          .inUnit("file")
          .brokenDown({ path: aSpec, passed: 1, durationMs: fileMs })
          .please(),
      )
      .please(),
  );

// Five test cases and one test file at Baseline; six and one at Branch;
// seven and one at Landed.
const baseline = dashboardTests({ cases: 3, casesMs: 3_000, fileMs: 700 });
const branch = dashboardTests({ cases: 4, casesMs: 3_500, fileMs: 800 });
const landed = dashboardTests({ cases: 5, casesMs: 4_000, fileMs: 700 });

const rowsAt = (path, before = baseline) =>
  scopeComparisonRowsOf(path, before, branch, landed, "precise").map(
    (cells) => [
      cells.units,
      cells.counts,
      cells.baseline.text,
      cells.branch.text,
      cells.landed.text,
    ],
  );

test("Baseline's five test cases and one test file against six at Branch and seven at Landed show +1 and +2 test cases and no change in test files, each unit on its own row with its own time, at the entry, its folder and its file (example 39)", () => {
  assert.deepEqual(rowsAt(entry), [
    [
      "test cases",
      "5 → 6 test cases (+1) → 7 test cases (+2)",
      "4.0 s",
      "+500 ms",
      "+1.0 s",
    ],
    ["test files", "1 test file (no change)", "700 ms", "+100 ms", "0 ms"],
  ]);
  const folderRows = [
    [
      "test cases",
      "3 → 4 test cases (+1) → 5 test cases (+2)",
      "3.0 s",
      "+500 ms",
      "+1.0 s",
    ],
    ["test files", "1 test file (no change)", "700 ms", "+100 ms", "0 ms"],
  ];
  assert.deepEqual(rowsAt(`${entry}/folder`), folderRows);
  assert.deepEqual(rowsAt(aSpec), folderRows);
  assert.deepEqual(rowsAt(rootSpec), [
    ["test cases", "2 test cases (no change)", "1.0 s", "0 ms", "0 ms"],
  ]);
  const [cases, files] = scopeComparisonRowsOf(
    aSpec,
    baseline,
    branch,
    landed,
    "precise",
  );
  // Each row's relative change, sort keys and cues belong to its one unit.
  assert.deepEqual(
    [cases.landed.relative, files.landed.relative],
    [1_000 / 3_000, 0],
  );
  assert.deepEqual(
    [cases.countedResults, files.countedResults],
    [
      { total: 5, failed: 0 },
      { total: 1, failed: 0 },
    ],
  );
  assert.deepEqual(cases.cues.count, {
    kind: "border",
    direction: "more",
    strength: "strong",
  });
  assert.deepEqual(files.cues.count, { kind: "none", reason: "unchanged" });
  assert.deepEqual(
    [cases.completeness, files.completeness],
    ["1 of 1 part present", "1 of 1 part present"],
  );
});

test("with only legacy results at Baseline, every scope shows both labelled ends and why, with no test case or test file difference, change, relative mark or cue (example 39)", () => {
  const legacyBaseline = summary(
    makeMe.aCiProofEntry
      .at(entry)
      .holding(
        makeMe.aCiProofEvidence
          .legacy("tests")
          .brokenDown(
            { path: aSpec, passed: 4, durationMs: 3_500 },
            { path: rootSpec, passed: 2, durationMs: 1_000 },
          )
          .please(),
      )
      .please(),
  );
  assert.deepEqual(rowsAt(aSpec, legacyBaseline), [
    [
      "test cases, test files and legacy test results",
      "4 legacy test results → 4 test cases and 1 test file → 5 test cases and 1 test file (legacy unit unknown)",
      "3.5 s",
      "3.5 s (test cases); 800 ms (test files)",
      "4.0 s (test cases); 700 ms (test files)",
    ],
  ]);
  // Equal totals in a changed unit read as no "no change".
  assert.deepEqual(rowsAt(rootSpec, legacyBaseline), [
    [
      "test cases and legacy test results",
      "2 legacy test results → 2 test cases (legacy unit unknown)",
      "1.0 s",
      "1.0 s",
      "1.0 s",
    ],
  ]);
  for (const cells of scopeComparisonRowsOf(
    entry,
    legacyBaseline,
    branch,
    landed,
    "precise",
  )) {
    assert.equal(cells.branch.changeMs, undefined);
    assert.equal(cells.landed.relative, undefined);
    assert.equal(cells.cues.count.kind, "none");
    assert.equal(cells.cues.duration.kind, "none");
  }
});
