// Column sorting of Intent CI figures tables
// (../../dashboard/src/ciProofSort.ts): rows sort by the figures beside their
// words (path name, counted results with failed first among equal totals,
// measured time, number of gaps); a row without a figure for the sorted column
// follows the rows with one in either direction; ties and unmeasured rows keep
// the given order; a pinned row stays last. Story comparison columns:
// ./intent-ci-comparison-sort.test.mjs. Browser journey:
// ../../dashboard/tests/intent/intent-ci-status-sort.spec.ts.
import assert from "node:assert/strict";
import { test } from "node:test";
import { nextSort, sortedRows } from "../../dashboard/src/ciProofSort.ts";
import { ciProofCellsOf } from "../../dashboard/src/ciProofWording.ts";

const part = (number, extra = {}) => ({
  part: number,
  status: "present",
  passed: 1,
  failed: 0,
  other: 0,
  ...extra,
});

// An entry at PATH from PARTS, its counts the sum of theirs.
const entryOf = (path, parts) => ({
  path,
  unit: "tests",
  passed: parts.reduce((sum, p) => sum + (p.passed ?? 0), 0),
  failed: parts.reduce((sum, p) => sum + (p.failed ?? 0), 0),
  other: 0,
  parts,
});

const rowOf = (entry) => ({ name: entry.path, cells: ciProofCellsOf(entry) });
const names = (rows) => rows.map((row) => row.name);
const sortBy = (rows, column, direction) =>
  names(sortedRows(rows, { column, direction }));

// Key example 1: 12.5 s, 340 ms and Part 2 untimed.
const exampleRows = [
  rowOf(entryOf("tests/a", [part(1, { durationMs: 12_500 })])),
  rowOf(entryOf("tests/b", [part(1, { durationMs: 340 })])),
  rowOf(entryOf("tests/c", [part(1, { durationMs: 1_000 }), part(2, {})])),
];

test("rows keep the given order until a column is sorted", () => {
  assert.deepEqual(names(sortedRows(exampleRows, undefined)), [
    "tests/a",
    "tests/b",
    "tests/c",
  ]);
});

test("the first activation sorts ascending and the next reverses it", () => {
  const first = nextSort(undefined, "executionTime");
  assert.deepEqual(first, { column: "executionTime", direction: "ascending" });
  assert.deepEqual(nextSort(first, "executionTime"), {
    column: "executionTime",
    direction: "descending",
  });
  assert.deepEqual(
    nextSort(nextSort(first, "executionTime"), "executionTime"),
    {
      column: "executionTime",
      direction: "ascending",
    },
  );
  // Another column starts ascending.
  assert.deepEqual(nextSort(first, "counts"), {
    column: "counts",
    direction: "ascending",
  });
});

test("measured time sorts both ways with the partial row last", () => {
  assert.equal(exampleRows[2].cells.executionTime.text, "Part 2 untimed");
  assert.deepEqual(sortBy(exampleRows, "executionTime", "ascending"), [
    "tests/b",
    "tests/a",
    "tests/c",
  ]);
  assert.deepEqual(sortBy(exampleRows, "executionTime", "descending"), [
    "tests/a",
    "tests/b",
    "tests/c",
  ]);
});

test("unmeasured rows keep their given order after measured ones in either direction", () => {
  const rows = [
    rowOf(entryOf("x/untimed-1", [part(1, {})])),
    rowOf(entryOf("x/fast", [part(1, { durationMs: 10 })])),
    rowOf(
      entryOf("x/missing", [
        part(1, { durationMs: 5 }),
        { part: 2, status: "missing" },
      ]),
    ),
    rowOf(entryOf("x/slow", [part(1, { durationMs: 900 })])),
    {
      name: "x/unavailable",
      cells: {
        ...rowOf(entryOf("x/u", [part(1)])).cells,
        executionTime: { text: "no CI result" },
      },
    },
  ];
  for (const direction of ["ascending", "descending"]) {
    assert.deepEqual(
      sortBy(rows, "executionTime", direction).slice(2),
      ["x/untimed-1", "x/missing", "x/unavailable"],
      direction,
    );
  }
});

test("ties keep the given order", () => {
  const rows = ["t/3", "t/1", "t/2"].map((path) =>
    rowOf(entryOf(path, [part(1, { durationMs: 100 })])),
  );
  for (const direction of ["ascending", "descending"])
    assert.deepEqual(sortBy(rows, "executionTime", direction), [
      "t/3",
      "t/1",
      "t/2",
    ]);
});

test("Counts sorts by counted results with failed first among equal totals", () => {
  const rows = [
    rowOf(entryOf("c/three-passed", [part(1, { passed: 3 })])),
    rowOf(entryOf("c/one", [part(1, { passed: 1 })])),
    rowOf(entryOf("c/three-one-failed", [part(1, { passed: 2, failed: 1 })])),
    rowOf(entryOf("c/three-two-failed", [part(1, { passed: 1, failed: 2 })])),
  ];
  assert.deepEqual(sortBy(rows, "counts", "ascending"), [
    "c/one",
    "c/three-two-failed",
    "c/three-one-failed",
    "c/three-passed",
  ]);
  assert.deepEqual(sortBy(rows, "counts", "descending"), [
    "c/three-two-failed",
    "c/three-one-failed",
    "c/three-passed",
    "c/one",
  ]);
});

test("Entry sorts by path name", () => {
  const rows = [
    rowOf(
      entryOf("p/b", [
        part(1),
        { part: 2, status: "missing" },
        { part: 3, status: "missing" },
      ]),
    ),
    rowOf(entryOf("p/c", [part(1)])),
    rowOf(entryOf("p/a", [part(1), { part: 2, status: "ambiguous" }])),
  ];
  assert.deepEqual(sortBy(rows, "scope", "ascending"), ["p/a", "p/b", "p/c"]);
  assert.deepEqual(sortBy(rows, "scope", "descending"), ["p/c", "p/b", "p/a"]);
});

test("a pinned row stays last under any sort", () => {
  const rows = [
    {
      ...rowOf(entryOf("z/outside", [part(1, { passed: 9, durationMs: 1 })])),
      pinned: true,
    },
    rowOf(entryOf("z/b", [part(1, { durationMs: 20 })])),
    rowOf(entryOf("z/a", [part(1, { durationMs: 10 })])),
  ];
  for (const column of ["scope", "counts", "executionTime"])
    for (const direction of ["ascending", "descending"])
      assert.equal(sortBy(rows, column, direction).at(-1), "z/outside");
});
