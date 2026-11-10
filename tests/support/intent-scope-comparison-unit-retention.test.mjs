// Below-entry CI comparison evidence retains each unit's own gap at folder
// and file scopes, including units without any breakdown or present part.
// Entry-level and outside-row gap behavior: ./intent-scope-comparison-unit-gaps.test.mjs.
import assert from "node:assert/strict";
import { test } from "node:test";
import { scopeComparisonRowsOf } from "../../dashboard/src/ciScopeComparison.ts";
import { makeMe } from "./makeMe.mjs";

// Entry x holding EVIDENCE.
const x = (...evidence) =>
  makeMe.aComparisonEndpointProof
    .with({
      kind: "summary",
      entries: [
        makeMe.aCiProofEntry
          .at("x")
          .holding(...evidence)
          .please(),
      ],
    })
    .please();

for (const [gap, files, countGap, timeGap, expectedGaps] of [
  [
    "missing part",
    () =>
      makeMe.aCiProofEvidence
        .inUnit("file")
        .brokenDown({
          path: "x/elsewhere/check.sh",
          passed: 1,
          durationMs: 100,
        })
        .missingPart(2)
        .please(),
    "no CI result (test files)",
    "Part 2 missing",
    ["part 2 of 2 missing"],
  ],
  [
    "ambiguous part",
    () =>
      makeMe.aCiProofEvidence
        .inUnit("file")
        .brokenDown({
          path: "x/elsewhere/check.sh",
          passed: 1,
          durationMs: 100,
        })
        .inParts(2, { ambiguous: [2] })
        .please(),
    "no CI result (test files)",
    "Part 2 ambiguous",
    ["part 2 of 2 ambiguous"],
  ],
  [
    "part without a breakdown",
    () =>
      makeMe.aCiProofEvidence
        .inUnit("file")
        .brokenDown({
          path: "x/elsewhere/check.sh",
          passed: 1,
          durationMs: 100,
        })
        .withUnbrokenPart({ passed: 1, durationMs: 200 })
        .please(),
    "no CI result (test files)",
    "Part 2 no breakdown",
    ["part 2 of 2 has no file breakdown"],
  ],
  [
    "no breakdown",
    () =>
      makeMe.aCiProofEvidence.inUnit("file").counting(1).timed(100).please(),
    "no file breakdown of test files",
    "no file breakdown",
    ["part 1 of 1 has no file breakdown"],
  ],
  [
    "no present part",
    () =>
      makeMe.aCiProofEvidence
        .inUnit("file")
        .inParts(1, { missing: [1] })
        .please(),
    "no file breakdown of test files",
    "no file breakdown",
    ["part 1 of 1 missing"],
  ],
]) {
  test(`a unit with ${gap} keeps its gap endpoint rather than unreported or a measured zero at folder and file comparisons`, () => {
    const cases = makeMe.aCiProofEvidence
      .inUnit("case")
      .brokenDown({ path: "x/folder/a.spec.ts", passed: 3, durationMs: 1000 })
      .please();
    const before = x(
      cases,
      makeMe.aCiProofEvidence
        .inUnit("file")
        .brokenDown({ path: "x/folder/a.spec.ts", passed: 1, durationMs: 100 })
        .please(),
    );
    const after = x(cases, files());
    for (const scope of ["x/folder", "x/folder/a.spec.ts"]) {
      const rows = scopeComparisonRowsOf(
        scope,
        before,
        after,
        after,
        "precise",
      );
      assert.deepEqual(
        rows.map(({ units }) => units),
        ["test cases", "test files"],
      );
      const row = rows[1];
      assert.equal(row.counts, `1 test file → ${countGap}`);
      assert.equal(row.countedResults, undefined);
      assert.equal(row.branch.text, timeGap);
      assert.equal(row.landed.text, timeGap);
      assert.deepEqual(row.gaps, expectedGaps);
      assert.equal(row.cues.count.kind, "none");
      assert.equal(row.cues.duration.kind, "none");
    }
  });
}

test("mixed-unit comparisons retain each no-breakdown unit even when no unit has a measured result at the folder or file", () => {
  const proof = x(
    makeMe.aCiProofEvidence.inUnit("case").counting(3).please(),
    makeMe.aCiProofEvidence.inUnit("file").counting(1).please(),
  );
  for (const scope of ["x/folder", "x/folder/a.spec.ts"]) {
    assert.deepEqual(
      scopeComparisonRowsOf(scope, proof, proof, proof, "precise").map(
        ({ units, counts, baseline, landed, gaps }) => [
          units,
          counts,
          baseline.text,
          landed.text,
          gaps,
        ],
      ),
      [
        [
          "test cases",
          "no file breakdown of test cases",
          "no file breakdown",
          "no file breakdown",
          ["part 1 of 1 has no file breakdown"],
        ],
        [
          "test files",
          "no file breakdown of test files",
          "no file breakdown",
          "no file breakdown",
          ["part 1 of 1 has no file breakdown"],
        ],
      ],
    );
  }
});

test("a lone no-breakdown unit in a mixed-unit entry keeps its identity when the other unit rules out results at the scope", () => {
  const proof = x(
    makeMe.aCiProofEvidence
      .inUnit("case")
      .brokenDown({ path: "x/elsewhere/a.spec.ts", passed: 3 })
      .please(),
    makeMe.aCiProofEvidence.inUnit("file").counting(1).please(),
  );
  for (const scope of ["x/folder", "x/folder/a.spec.ts"]) {
    const rows = scopeComparisonRowsOf(scope, proof, proof, proof, "precise");
    assert.equal(rows.length, 1);
    assert.equal(rows[0].units, "test files");
    assert.equal(rows[0].counts, "no file breakdown of test files");
    assert.deepEqual(rows[0].gaps, ["part 1 of 1 has no file breakdown"]);
  }
});
