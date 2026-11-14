// Whole-row sorting of multi-unit homepage CI proof entries
// (../../../dashboard/src/ciProofSort.ts, ../../../dashboard/src/ciProofEntryCells.ts):
// each unit's figures compare in case/file/legacy order without summing types;
// an unavailable unit follows an available one in either direction. Single-unit
// figure sorting: ./intent-ci-proof-sort.test.mjs. Browser journey:
// ../../../dashboard/tests/intent/intent-ci-status-sort.spec.ts.
import assert from "node:assert/strict";
import { test } from "node:test";
import { sortedRows } from "../../../dashboard/src/ciProofSort.ts";
import { entryProofCellsOf } from "../../../dashboard/src/ciProofEntryCells.ts";
import { makeMe } from "./makeMe.mjs";

const entryRowOf = (entry) => ({
  name: entry.path,
  cells: entryProofCellsOf(entry),
});
const names = (rows) => rows.map((row) => row.name);
const sortBy = (rows, column, direction) =>
  names(sortedRows(rows, { column, direction }));

test("multi-unit entries sort as whole rows by each unit without summing types", () => {
  const rows = [
    entryRowOf(
      makeMe.aCiProofEntry
        .at("g/slow")
        .holding(
          makeMe.aCiProofEvidence
            .inUnit("case")
            .counting(10)
            .timed(5_000)
            .please(),
          makeMe.aCiProofEvidence
            .inUnit("file")
            .counting(2)
            .timed(900)
            .please(),
        )
        .please(),
    ),
    entryRowOf(
      makeMe.aCiProofEntry
        .at("g/fast")
        .holding(
          makeMe.aCiProofEvidence
            .inUnit("case")
            .counting(10)
            .timed(500)
            .please(),
          makeMe.aCiProofEvidence
            .inUnit("file")
            .counting(4)
            .timed(2_000)
            .please(),
        )
        .please(),
    ),
    entryRowOf(
      makeMe.aCiProofEntry
        .at("g/gap")
        .holding(
          makeMe.aCiProofEvidence
            .inUnit("case")
            .counting(3)
            .timed(800)
            .please(),
          makeMe.aCiProofEvidence
            .inUnit("file")
            .inParts(2, { missing: [2] })
            .withPresentPart(1, {
              passed: 1,
              failed: 0,
              other: 0,
              durationMs: 100,
            })
            .please(),
        )
        .please(),
    ),
  ];
  assert.equal(rows[0].cells.unitLines?.length, 2);
  assert.equal(rows[0].cells.countedResults, undefined);
  assert.deepEqual(sortBy(rows, "executionTime", "ascending"), [
    "g/fast",
    "g/gap",
    "g/slow",
  ]);
  assert.deepEqual(sortBy(rows, "executionTime", "descending"), [
    "g/slow",
    "g/gap",
    "g/fast",
  ]);
  assert.deepEqual(sortBy(rows, "counts", "ascending"), [
    "g/gap",
    "g/slow",
    "g/fast",
  ]);
  // File unit breaks a case-total tie; unavailable file follows available.
  const tiedCases = [
    entryRowOf(
      makeMe.aCiProofEntry
        .at("t/with-file")
        .holding(
          makeMe.aCiProofEvidence
            .inUnit("case")
            .counting(5)
            .timed(100)
            .please(),
          makeMe.aCiProofEvidence.inUnit("file").counting(1).timed(50).please(),
        )
        .please(),
    ),
    entryRowOf(
      makeMe.aCiProofEntry.at("t/cases-only").counting(5).timed(100).please(),
    ),
  ];
  assert.deepEqual(sortBy(tiedCases, "counts", "ascending"), [
    "t/with-file",
    "t/cases-only",
  ]);
  assert.deepEqual(sortBy(tiedCases, "counts", "descending"), [
    "t/with-file",
    "t/cases-only",
  ]);
});
