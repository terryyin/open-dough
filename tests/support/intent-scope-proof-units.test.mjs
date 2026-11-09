// Each unit's results at a selected Intent entry, folder or file
// (../../dashboard/src/ciScopeProof.ts `unitResultsAt`), worded as the
// Summary and file Proof word them (../../dashboard/src/ciProofWording.ts
// `unitCellsAt`): test cases, test files and legacy test results apart,
// each with its own time and parts, a gap naming its unit beside another
// unit's results, and how many paths a scope matches never a count of test
// files. Browser journey:
// ../../dashboard/tests/intent/intent-ci-proof-units.spec.ts.
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  immediateChildrenOf,
  scopeFiguresOf,
} from "../../dashboard/src/ciScopeProof.ts";
import {
  ciProofCellsOf,
  ciScopeCellsOf,
  unitCellsAt,
} from "../../dashboard/src/ciProofWording.ts";
import { makeMe } from "./makeMe.mjs";

test("a folder's two source files keep five test cases and one failed test file apart, each unit with its own time and parts, and the paths it matches are no count of test files (example 40)", () => {
  const entry = makeMe.aCiProofEntry
    .at("tests")
    .holding(
      makeMe.aCiProofEvidence
        .inUnit("case")
        .brokenDown({
          path: "tests/folder/a.spec.ts",
          passed: 5,
          durationMs: 1500,
        })
        .please(),
      makeMe.aCiProofEvidence
        .inUnit("file")
        .brokenDown({
          path: "tests/folder/b.test.mjs",
          failed: 1,
          durationMs: 300,
        })
        .please(),
    )
    .please();
  // The source count stays the inventory's two files.
  const inventory = ["tests/folder/a.spec.ts", "tests/folder/b.test.mjs"];
  assert.equal(immediateChildrenOf("tests/folder", inventory).length, 2);
  const shownAt = (scope) =>
    unitCellsAt(entry, scope).map(({ evidence, figures, cells }) => [
      evidence.unit,
      figures?.paths,
      cells.counts,
      cells.executionTime.text,
      cells.completeness,
    ]);
  assert.deepEqual(shownAt("tests/folder"), [
    ["case", 1, "5 passed test cases", "1.5 s", "1 of 1 part present"],
    ["file", 1, "1 failed test file", "300 ms", "1 of 1 part present"],
  ]);
  // Each child shows the unit it has results in, and only that one.
  assert.deepEqual(shownAt("tests/folder/a.spec.ts"), [
    ["case", 1, "5 passed test cases", "1.5 s", "1 of 1 part present"],
  ]);
  assert.deepEqual(shownAt("tests/folder/b.test.mjs"), [
    ["file", 1, "1 failed test file", "300 ms", "1 of 1 part present"],
  ]);
  // A path with no unit's result says so once.
  assert.deepEqual(shownAt("tests/folder/c.md"), [
    ["case", 0, "no CI result", "no CI result", "1 of 1 part present"],
  ]);
  // The entry's own figures: each unit's totals, never one combined count.
  assert.deepEqual(shownAt("tests"), [
    ["case", undefined, "5 passed test cases", "1.5 s", "1 of 1 part present"],
    ["file", undefined, "1 failed test file", "300 ms", "1 of 1 part present"],
  ]);
});

test("one path's five test cases and its own test file outcome show apart, never as six results (example 36)", () => {
  const path = "tests/check.test.mjs";
  const entry = makeMe.aCiProofEntry
    .at("tests")
    .holding(
      makeMe.aCiProofEvidence
        .inUnit("case")
        .brokenDown({ path, passed: 5, durationMs: 500 })
        .please(),
      makeMe.aCiProofEvidence
        .inUnit("file")
        .brokenDown({ path, passed: 1, durationMs: 700 })
        .please(),
    )
    .please();
  assert.deepEqual(
    unitCellsAt(entry, path).map(({ cells }) => [
      cells.counts,
      cells.executionTime.text,
      cells.countedResults,
    ]),
    [
      ["5 passed test cases", "500 ms", { total: 5, failed: 0 }],
      ["1 passed test file", "700 ms", { total: 1, failed: 0 }],
    ],
  );
});

test("legacy results read as legacy test results whatever unit they spelled; a declared unit that counted nothing names it; a unit without a breakdown beside another names its unit (examples 37, 38)", () => {
  const legacy = makeMe.aCiProofEvidence.legacy("tests").counting(5).please();
  assert.equal(ciProofCellsOf(legacy).counts, "5 passed legacy test results");
  const nothing = (evidence) => ({
    ...evidence,
    passed: 0,
    parts: [{ part: 1, status: "missing" }],
  });
  assert.equal(
    ciProofCellsOf(nothing(makeMe.aCiProofEvidence.legacy(null).please()))
      .counts,
    "nothing counted",
  );
  assert.deepEqual(
    ciProofCellsOf(nothing(makeMe.aCiProofEvidence.inUnit("file").please())),
    {
      counts: "nothing counted as test files",
      countedResults: { total: 0, failed: 0 },
      executionTime: {
        text: "Part 1 missing",
        explanation: "Partial: part 1 of 1 missing",
      },
      completeness: "0 of 1 part present",
      gaps: ["part 1 of 1 missing"],
    },
  );
  const files = makeMe.aCiProofEvidence.inUnit("file").counting(1).please();
  const figures = scopeFiguresOf(files, "tests/a.sh");
  assert.equal(ciScopeCellsOf(files, figures).counts, "no file breakdown");
  assert.equal(
    ciScopeCellsOf(files, figures, true).counts,
    "no file breakdown of test files",
  );
});
