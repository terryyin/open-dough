// Column sorting of Intent CI figures tables
// (../../../dashboard/src/ciProofSort.ts): rows sort by the figures beside their
// words (path name, counted results with failed first among equal totals,
// measured time, number of gaps); a row without a figure for the sorted column
// follows the rows with one in either direction; ties and unmeasured rows keep
// the given order; a pinned row stays last. Multi-unit homepage entries:
// ./intent-ci-proof-grouped-sort.test.mjs. Story comparison columns:
// ./intent-ci-comparison-sort.test.mjs. Browser journey:
// ../../../dashboard/tests/intent/intent-ci-status-sort.spec.ts.
import assert from "node:assert/strict";
import { test } from "node:test";
import { nextSort, sortedRows } from "../../../dashboard/src/ciProofSort.ts";
import { ciProofCellsOf } from "../../../dashboard/src/ciProofWording.ts";
import { makeMe } from "./makeMe.mjs";

const rowOf = (entry) => ({
  name: entry.path,
  cells: ciProofCellsOf(entry.evidence[0]),
});
const names = (rows) => rows.map((row) => row.name);
const sortBy = (rows, column, direction) =>
  names(sortedRows(rows, { column, direction }));

// Key example 1: 12.5 s, 340 ms and Part 2 untimed.
const exampleRows = [
  rowOf(makeMe.aCiProofEntry.at("tests/a").timed(12_500).please()),
  rowOf(makeMe.aCiProofEntry.at("tests/b").timed(340).please()),
  rowOf(
    makeMe.aCiProofEntry
      .at("tests/c")
      .timed(1_000)
      .withUnbrokenPart({ passed: 1, untimed: 0 })
      .please(),
  ),
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
    rowOf(makeMe.aCiProofEntry.at("x/untimed-1").please()),
    rowOf(makeMe.aCiProofEntry.at("x/fast").timed(10).please()),
    rowOf(
      makeMe.aCiProofEntry.at("x/missing").timed(5).missingParts(2).please(),
    ),
    rowOf(makeMe.aCiProofEntry.at("x/slow").timed(900).please()),
    {
      name: "x/unavailable",
      cells: {
        ...rowOf(makeMe.aCiProofEntry.at("x/u").please()).cells,
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
    rowOf(makeMe.aCiProofEntry.at(path).timed(100).please()),
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
    rowOf(makeMe.aCiProofEntry.at("c/three-passed").counting(3).please()),
    rowOf(makeMe.aCiProofEntry.at("c/one").counting(1).please()),
    rowOf(
      makeMe.aCiProofEntry
        .at("c/three-one-failed")
        .holding(makeMe.aCiProofEvidence.inUnit("case").counting(2, 1).please())
        .please(),
    ),
    rowOf(
      makeMe.aCiProofEntry
        .at("c/three-two-failed")
        .holding(makeMe.aCiProofEvidence.inUnit("case").counting(1, 2).please())
        .please(),
    ),
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
      makeMe.aCiProofEntry
        .at("p/b")
        .inParts(3, { missing: [2, 3] })
        .please(),
    ),
    rowOf(makeMe.aCiProofEntry.at("p/c").please()),
    rowOf(
      makeMe.aCiProofEntry
        .at("p/a")
        .inParts(2, { ambiguous: [2] })
        .please(),
    ),
  ];
  assert.deepEqual(sortBy(rows, "scope", "ascending"), ["p/a", "p/b", "p/c"]);
  assert.deepEqual(sortBy(rows, "scope", "descending"), ["p/c", "p/b", "p/a"]);
});

test("a pinned row stays last under any sort", () => {
  const rows = [
    {
      ...rowOf(
        makeMe.aCiProofEntry.at("z/outside").counting(9).timed(1).please(),
      ),
      pinned: true,
    },
    rowOf(makeMe.aCiProofEntry.at("z/b").timed(20).please()),
    rowOf(makeMe.aCiProofEntry.at("z/a").timed(10).please()),
  ];
  for (const column of ["scope", "counts", "executionTime"])
    for (const direction of ["ascending", "descending"])
      assert.equal(sortBy(rows, column, direction).at(-1), "z/outside");
});
