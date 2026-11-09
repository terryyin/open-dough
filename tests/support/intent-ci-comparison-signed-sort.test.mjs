// Branch and Landed sorting of Intent's story CI comparison tables
// (../../dashboard/src/ciProofSort.ts): at every comparison scope by signed
// change from Baseline in one declared unit, each compared unit's row by its
// own, not by time or relative change, with ties in their given order, added
// entries, gaps, times of another unit or legacy results and a unit Baseline
// does not report last in either direction, and a Summary's outside row
// pinned last; Baseline by measured time. Other
// comparison columns: ./intent-ci-comparison-sort.test.mjs. Browser journey:
// ../../dashboard/tests/intent/intent-summary-story-comparison-signed-sort.spec.ts.
import assert from "node:assert/strict";
import { test } from "node:test";
import { sortedRows } from "../../dashboard/src/ciProofSort.ts";
import { scopeComparisonRowsOf } from "../../dashboard/src/ciScopeComparison.ts";
import { comparisonEntriesOf } from "../../dashboard/src/storyCiComparisonEntries.ts";
import { makeMe } from "./makeMe.mjs";

// An entry at PATH with one present part of one test in DURATIONMS.
const timed = (path, durationMs) =>
  makeMe.aCiProofEntry.at(path).timed(durationMs).please();
const summary = (...entries) => ({ kind: "summary", entries });
const sortBy = (rows, column, direction) =>
  sortedRows(rows, { column, direction }).map((row) => row.name);

test("Branch and Landed order entries by signed change, not by time or relative change, with rows lacking a change last either way", () => {
  // Times after, changes and relative changes order the measured rows
  // differently: big 600 → 660 s (+60 s, +10%), small 60 → 90 s (+30 s,
  // +50%), down 300 → 280 s (−20 s, −7%).
  const before = summary(
    timed("e/big", 600_000),
    timed("e/small", 60_000),
    timed("e/down", 300_000),
    makeMe.aCiProofEntry.at("e/untimed").please(),
  );
  const after = summary(
    timed("e/big", 660_000),
    timed("e/added", 5_000),
    timed("e/small", 90_000),
    makeMe.aCiProofEntry.at("e/untimed").please(),
    timed("e/down", 280_000),
  );
  const result = comparisonEntriesOf(before, after, after);
  assert.equal(result.kind, "rows");
  const rows = result.rows.map((row) => ({ name: row.path, cells: row.cells }));
  const lacking = ["e/added", "e/untimed"];
  for (const column of ["branch", "landed"]) {
    assert.deepEqual(sortBy(rows, column, "ascending"), [
      "e/down",
      "e/small",
      "e/big",
      ...lacking,
    ]);
    assert.deepEqual(sortBy(rows, column, "descending"), [
      "e/big",
      "e/small",
      "e/down",
      ...lacking,
    ]);
  }
  // Baseline keeps its measured-time order with the added entry last.
  assert.deepEqual(sortBy(rows, "baseline", "ascending"), [
    "e/small",
    "e/down",
    "e/big",
    "e/added",
    "e/untimed",
  ]);
});

test("Summary comparisons sort the shown signed changes, keep ties and uncomparable rows stable, and pin outside last", () => {
  const before = summary(
    timed("s/big", 600_000),
    timed("s/small", 60_000),
    timed("s/down", 300_000),
    timed("s/tie", 120_000),
    timed("s/zero", 0),
    makeMe.aCiProofEntry.at("s/gap").please(),
    timed("s/outside", 900_000),
  );
  const after = summary(
    timed("s/big", 660_000),
    timed("s/small", 90_000),
    timed("s/down", 280_000),
    timed("s/tie", 150_000),
    timed("s/zero", 10_000),
    timed("s/added", 5_000),
    makeMe.aCiProofEntry.at("s/gap").please(),
    timed("s/outside", 0),
  );
  const paths = after.entries.map(({ path }) => path);
  const rows = paths.flatMap((path) =>
    scopeComparisonRowsOf(path, before, after, after, "precise").map(
      (cells) => ({
        name: path,
        ...(path === "s/outside" ? { pinned: true } : {}),
        cells,
      }),
    ),
  );
  // Durations and percentages disagree with signed changes. The equal +30s
  // rows retain supplied order, the zero baseline has a comparable +10s,
  // and outside stays last even though it has the largest reduction.
  for (const column of ["branch", "landed"]) {
    assert.deepEqual(sortBy(rows, column, "ascending"), [
      "s/down",
      "s/zero",
      "s/small",
      "s/tie",
      "s/big",
      "s/added",
      "s/gap",
      "s/outside",
    ]);
    assert.deepEqual(sortBy(rows, column, "descending"), [
      "s/big",
      "s/small",
      "s/tie",
      "s/zero",
      "s/down",
      "s/added",
      "s/gap",
      "s/outside",
    ]);
  }
  assert.deepEqual(sortBy(rows, "baseline", "ascending"), [
    "s/zero",
    "s/small",
    "s/tie",
    "s/down",
    "s/big",
    "s/added",
    "s/gap",
    "s/outside",
  ]);
});

test("each compared unit's row sorts by its own signed change, while a time in another unit, as legacy results, or of a unit Baseline does not report gives Branch and Landed no change to sort by, so it follows comparable changes either way while Baseline still sorts its measured time", () => {
  const holding = (path, ...evidence) =>
    makeMe.aCiProofEntry
      .at(path)
      .holding(...evidence)
      .please();
  const cases = (ms) =>
    makeMe.aCiProofEvidence.inUnit("case").timed(ms).please();
  const files = (ms) =>
    makeMe.aCiProofEvidence.inUnit("file").timed(ms).please();
  const legacy = (ms) =>
    makeMe.aCiProofEvidence.legacy("tests").timed(ms).please();
  // Subtracted, test cases 10 s → a test file's 1 s would be the largest
  // reduction and legacy 15 s → 60 s the largest increase.
  const before = summary(
    holding("s/across", cases(10_000)),
    holding("s/up", cases(20_000)),
    holding("s/legacy", legacy(15_000)),
    holding("s/down", cases(30_000)),
    holding("s/both", cases(5_000)),
  );
  const after = summary(
    holding("s/across", files(1_000)),
    holding("s/up", cases(23_000)),
    holding("s/legacy", legacy(60_000)),
    holding("s/down", cases(25_000)),
    // Its test cases +45 s; its test files Baseline did not report.
    holding("s/both", cases(50_000), files(3_000)),
  );
  const rows = after.entries.flatMap(({ path }) =>
    scopeComparisonRowsOf(path, before, after, after, "precise").map(
      (cells) => ({ name: `${path} ${cells.units ?? ""}`, cells }),
    ),
  );
  const uncomparable = [
    "s/across test cases and test files",
    "s/legacy legacy test results",
    "s/both test files",
  ];
  for (const column of ["branch", "landed"]) {
    assert.deepEqual(sortBy(rows, column, "ascending"), [
      "s/down test cases",
      "s/up test cases",
      "s/both test cases",
      ...uncomparable,
    ]);
    assert.deepEqual(sortBy(rows, column, "descending"), [
      "s/both test cases",
      "s/up test cases",
      "s/down test cases",
      ...uncomparable,
    ]);
  }
  assert.deepEqual(sortBy(rows, "baseline", "ascending"), [
    "s/both test cases",
    "s/across test cases and test files",
    "s/legacy legacy test results",
    "s/up test cases",
    "s/down test cases",
    "s/both test files",
  ]);
});
