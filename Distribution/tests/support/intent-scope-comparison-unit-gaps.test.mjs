// Compared rows per unit in Intent's shared CI comparison
// (../../../dashboard/src/ciScopeComparison.ts,
// ../../../dashboard/src/ciScopeComparisonUnits.ts) where units do not match:
// two legacy builds spelling their unit alike compare nothing, a unit an
// endpoint does not report is no zero while a reported zero is a real one, a
// unit Branch lacks keeps Landed's change, and a Summary's outside figures
// compare each unit apart with that unit's own Parts (SEED-281 example 38).
// Rows at every depth: ./intent-scope-comparison-units.test.mjs.
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  outsideComparisonRowsOf,
  scopeComparisonRowsOf,
} from "../../../dashboard/src/ciScopeComparison.ts";
import { immediateChildrenOf } from "../../../dashboard/src/ciScopeProof.ts";
import { makeMe } from "./makeMe.mjs";

const summary = (...entries) => ({ kind: "summary", entries });

// Entry x holding EVIDENCE.
const x = (...evidence) =>
  summary(
    makeMe.aCiProofEntry
      .at("x")
      .holding(...evidence)
      .please(),
  );
const timed = (unit, passed, ms) =>
  makeMe.aCiProofEvidence.inUnit(unit).counting(passed).timed(ms).please();
const legacyTimed = (label, passed, ms) =>
  makeMe.aCiProofEvidence.legacy(label).counting(passed).timed(ms).please();
const cellsOf = (before, after, later = after) =>
  scopeComparisonRowsOf("x", before, after, later, "precise").map(
    ({ units, counts, baseline: cell, branch: mid, landed: end }) => [
      units,
      counts,
      cell,
      mid,
      end,
    ],
  );

test("two version 1 summaries spelling their unit tests, or checks, with different totals compare nothing: the same label is no unit match (example 38)", () => {
  for (const label of ["tests", "checks"]) {
    assert.deepEqual(
      cellsOf(x(legacyTimed(label, 5, 2_000)), x(legacyTimed(label, 9, 3_000))),
      [
        [
          "legacy test results",
          "5 legacy test results → 9 legacy test results (legacy unit unknown)",
          { text: "2.0 s", ms: 2_000 },
          { text: "3.0 s", ms: 3_000 },
          { text: "3.0 s", ms: 3_000 },
        ],
      ],
    );
  }
});

test("a unit an endpoint does not report shows as unreported, never as a measured zero, while a reported zero in that unit is a real zero", () => {
  const later = x(timed("case", 5, 1_000), timed("file", 1, 300));
  const [, unreported] = cellsOf(x(timed("case", 5, 1_000)), later);
  assert.deepEqual(unreported, [
    "test files",
    "— → 1 test file",
    { text: "—" },
    { text: "300 ms", ms: 300 },
    { text: "300 ms", ms: 300 },
  ]);
  const [, zero] = cellsOf(
    x(timed("case", 5, 1_000), timed("file", 0, 0)),
    later,
  );
  assert.deepEqual(zero, [
    "test files",
    "0 → 1 test file (+1)",
    { text: "0 ms", ms: 0 },
    { text: "+300 ms", ms: 300, changeMs: 300 },
    { text: "+300 ms", ms: 300, changeMs: 300 },
  ]);
  // Branch reports only test cases: Landed keeps its test files' change.
  const [, filesRow] = cellsOf(
    x(timed("case", 5, 1_000), timed("file", 1, 300)),
    x(timed("case", 6, 1_000)),
    later,
  );
  assert.deepEqual(filesRow, [
    "test files",
    "1 test file → — → 1 test file (0)",
    { text: "300 ms", ms: 300 },
    { text: "—" },
    { text: "0 ms", ms: 300, changeMs: 0, relative: 0 },
  ]);
});

test("a Summary's outside figures compare each unit on its own row", () => {
  const children = immediateChildrenOf("o", ["o/a.spec.ts"]);
  // Entry o: one test case and one test file outcome of a listed file and of
  // a ghost file the tree does not list, GHOST_MS each.
  const proof = (ghostMs) =>
    summary(
      makeMe.aCiProofEntry
        .at("o")
        .holding(
          ...["case", "file"].map((unit) =>
            makeMe.aCiProofEvidence
              .inUnit(unit)
              .brokenDown(
                { path: "o/a.spec.ts", passed: 1, durationMs: 1_000 },
                { path: "o/ghost.spec.ts", passed: 1, durationMs: ghostMs },
              )
              .please(),
          ),
        )
        .please(),
    );
  assert.deepEqual(
    outsideComparisonRowsOf(
      "o",
      children,
      proof(500),
      proof(600),
      proof(600),
      "precise",
    ).map(({ units, counts, landed }) => [units, counts, landed.text]),
    [
      ["test cases", "1 test case (no change)", "+100 ms"],
      ["test files", "1 test file (no change)", "+100 ms"],
    ],
  );
});

test("a Summary's outside row shows its own unit's Parts, never the chosen build's other unit's, when the chosen build reports none of that unit outside the rows above", () => {
  const children = immediateChildrenOf("o", ["o/a.spec.ts"]);
  // UNIT's result of the file at PATH: by default a ghost file the tree does
  // not list under o, so outside the rows above.
  const result = (unit, path = "o/ghost.spec.ts") =>
    makeMe.aCiProofEvidence.inUnit(unit).brokenDown({ path, passed: 1 });
  const o = (...evidence) =>
    summary(
      makeMe.aCiProofEntry
        .at("o")
        .holding(...evidence)
        .please(),
    );
  const baseline = o(result("case").please(), result("file").please());
  // Landed, the chosen build: test cases with part 2 missing, beside FILES.
  const landed = (...files) =>
    o(result("case").missingPart(2).please(), ...files);
  const partsOf = (after) =>
    outsideComparisonRowsOf(
      "o",
      children,
      baseline,
      after,
      after,
      "precise",
    ).map(({ units, completeness, gaps }) => [units, completeness, gaps]);
  const ownParts = [
    ["test cases", "1 of 2 parts present", ["part 2 of 2 missing"]],
    ["test files", "1 of 1 part present", []],
  ];
  // Landed reports no test files, or test files of the listed file alone.
  assert.deepEqual(
    [landed(), landed(result("file", "o/a.spec.ts").please())].map(partsOf),
    [ownParts, ownParts],
  );
});
