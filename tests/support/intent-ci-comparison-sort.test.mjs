// Column sorting of Intent's story CI comparison tables
// (../../dashboard/src/ciProofSort.ts): Baseline by measured time, Branch and
// Landed at every comparison scope by signed change from Baseline, with added
// entries and gaps last, Counts by the after count, and a Summary's Change by
// kind (added, modified, removed, renamed) with unchanged scopes last in
// either direction. One run's columns: ./intent-ci-proof-sort.test.mjs.
// Browser journey:
// ../../dashboard/tests/intent/intent-summary-story-comparison-sort.spec.ts.
import assert from "node:assert/strict";
import { test } from "node:test";
import { sortedRows } from "../../dashboard/src/ciProofSort.ts";
import { scopeComparisonCellsOf } from "../../dashboard/src/ciScopeComparison.ts";
import { comparisonEntriesOf } from "../../dashboard/src/storyCiComparisonEntries.ts";
import { makeMe } from "./makeMe.mjs";

// An entry at PATH with one present part of PASSED tests in DURATIONMS.
const timed = (path, durationMs, passed = 1) =>
  makeMe.aCiProofEntry.at(path).counting(passed).timed(durationMs).please();
const summary = (...entries) => ({ kind: "summary", entries });
const sortBy = (rows, column, direction) =>
  sortedRows(rows, { column, direction }).map((row) => row.name);

test("an entry comparison sorts Baseline by measured time, Branch by signed change with added and gap rows last, and Counts by the after count", () => {
  const result = comparisonEntriesOf(
    summary(timed("e/slow", 300), timed("e/fast", 100)),
    summary(
      timed("e/slow", 400, 5),
      timed("e/fast", 50, 2),
      timed("e/added", 70, 9),
    ),
    { kind: "unavailable", line: "no proof" },
    "branch",
  );
  assert.equal(result.kind, "rows");
  const rows = result.rows.map((row) => ({ name: row.path, cells: row.cells }));
  // Changes −50 and +100; the added entry has no change.
  assert.deepEqual(sortBy(rows, "branch", "ascending"), [
    "e/fast",
    "e/slow",
    "e/added",
  ]);
  // Baseline has no figure for the added entry.
  assert.deepEqual(sortBy(rows, "baseline", "descending"), [
    "e/slow",
    "e/fast",
    "e/added",
  ]);
  // Landed is an endpoint gap for every row: the given order stays.
  assert.deepEqual(sortBy(rows, "landed", "ascending"), [
    "e/slow",
    "e/fast",
    "e/added",
  ]);
  assert.deepEqual(sortBy(rows, "counts", "descending"), [
    "e/added",
    "e/slow",
    "e/fast",
  ]);
  // A column the comparison lacks leaves the given order.
  assert.deepEqual(sortBy(rows, "executionTime", "ascending"), [
    "e/slow",
    "e/fast",
    "e/added",
  ]);
});

test("Change sorts a story comparison by kind with unchanged rows last in either direction", () => {
  const timedAll = (paths) => summary(...paths.map((path) => timed(path, 100)));
  const before = timedAll(["c/u1", "c/r", "c/u2", "c/d", "c/m"]);
  const after = timedAll(["c/u1", "c/r", "c/a", "c/u2", "c/m"]);
  const rows = [
    ["c/u1", undefined],
    ["c/r", "renamed"],
    ["c/a", "added"],
    ["c/u2", undefined],
    ["c/d", "deleted"],
    ["c/m", "modified"],
  ].map(([path, kind]) => ({
    name: path,
    cells: scopeComparisonCellsOf(
      path,
      before,
      after,
      after,
      "precise",
      path,
      kind,
    ),
  }));
  assert.deepEqual(sortBy(rows, "change", "ascending"), [
    "c/a",
    "c/m",
    "c/d",
    "c/r",
    "c/u1",
    "c/u2",
  ]);
  assert.deepEqual(sortBy(rows, "change", "descending"), [
    "c/r",
    "c/d",
    "c/m",
    "c/a",
    "c/u1",
    "c/u2",
  ]);
});

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
  const rows = paths.map((path) => ({
    name: path,
    ...(path === "s/outside" ? { pinned: true } : {}),
    cells: scopeComparisonCellsOf(path, before, after, after, "precise"),
  }));
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
