// Column sorting of Intent's story CI comparison tables
// (../../dashboard/src/ciProofSort.ts): an entry comparison's Baseline by
// measured time, Branch by signed change with added and gap rows last and
// Counts by the after count, and a Summary's Change by kind (added,
// modified, removed, renamed) with unchanged scopes last in either
// direction. Branch and Landed by signed change at every comparison scope:
// ./intent-ci-comparison-signed-sort.test.mjs. One run's columns:
// ./intent-ci-proof-sort.test.mjs. Browser journey:
// ../../dashboard/tests/intent/intent-summary-story-comparison-sort.spec.ts.
import assert from "node:assert/strict";
import { test } from "node:test";
import { sortedRows } from "../../dashboard/src/ciProofSort.ts";
import { scopeComparisonRowsOf } from "../../dashboard/src/ciScopeComparison.ts";
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
  ].flatMap(([path, kind]) =>
    scopeComparisonRowsOf(
      path,
      before,
      after,
      after,
      "precise",
      path,
      kind,
    ).map((cells) => ({ name: path, cells })),
  );
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
