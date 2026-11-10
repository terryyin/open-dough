// Visible unit identity in the real scope comparison's Counts cells,
// including endpoints that never measured a later total or measured nothing.
import assert from "node:assert/strict";
import { test } from "node:test";
import { scopeComparisonRowsOf } from "../../dashboard/src/ciScopeComparison.ts";
import { makeMe } from "./makeMe.mjs";

const file = "x/folder/a.spec.ts";
const scopes = ["x", "x/folder", file];
const proof = (...evidence) =>
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
const counts = (scope, before, after, change) =>
  scopeComparisonRowsOf(
    scope,
    before,
    after,
    after,
    "precise",
    scope,
    change,
  ).map((row) => row.counts);

test("a Baseline-only unit names its measured total at entry, folder and file scopes", () => {
  const cases = makeMe.aCiProofEvidence
    .inUnit("case")
    .brokenDown({ path: file, passed: 3 })
    .please();
  const before = proof(
    cases,
    makeMe.aCiProofEvidence
      .inUnit("file")
      .brokenDown({ path: file, passed: 1 })
      .please(),
  );
  const after = proof(cases);
  for (const scope of scopes)
    assert.deepEqual(counts(scope, before, after), [
      "3 test cases (no change)",
      "1 test file → —",
    ]);
});

test("removed rows name both units at entry, folder and file scopes", () => {
  const before = proof(
    makeMe.aCiProofEvidence
      .inUnit("case")
      .brokenDown({ path: file, passed: 5 })
      .please(),
    makeMe.aCiProofEvidence
      .inUnit("file")
      .brokenDown({ path: file, passed: 1 })
      .please(),
  );
  const after = makeMe.aComparisonEndpointProof
    .with({ kind: "summary", entries: [] })
    .please();
  for (const scope of scopes)
    assert.deepEqual(counts(scope, before, after, "deleted"), [
      "5 test cases → removed",
      "1 test file → removed",
    ]);
});

test("nothing-counted rows name each known unit using the CI status wording", () => {
  const endpoint = proof(
    makeMe.aCiProofEvidence
      .inUnit("case")
      .inParts(1, { missing: [1] })
      .please(),
    makeMe.aCiProofEvidence
      .inUnit("file")
      .inParts(1, { missing: [1] })
      .please(),
  );
  assert.deepEqual(counts("x", endpoint, endpoint), [
    "nothing counted as test cases",
    "nothing counted as test files",
  ]);
});

test("gap-only folder and file rows visibly name each no-breakdown unit", () => {
  const endpoint = proof(
    makeMe.aCiProofEvidence.inUnit("case").counting(3).please(),
    makeMe.aCiProofEvidence.inUnit("file").counting(1).please(),
  );
  for (const scope of ["x/folder", file])
    assert.deepEqual(counts(scope, endpoint, endpoint), [
      "no file breakdown of test cases",
      "no file breakdown of test files",
    ]);
});

test("a single known no-breakdown unit names its folder and file rows", () => {
  const endpoint = proof(
    makeMe.aCiProofEvidence.inUnit("file").counting(1).please(),
  );
  for (const scope of ["x/folder", file])
    assert.deepEqual(counts(scope, endpoint, endpoint), [
      "no file breakdown of test files",
    ]);
});

test("a no-breakdown Baseline cannot place a file absent from every later proof", () => {
  const before = proof(
    makeMe.aCiProofEvidence.inUnit("file").counting(1).please(),
  );
  const after = makeMe.aComparisonEndpointProof
    .with({ kind: "summary", entries: [] })
    .please();
  const [row] = scopeComparisonRowsOf(file, before, after, after, "precise");
  assert.equal(row.counts, "no CI result");
  assert.equal(row.baseline.text, "not in the compared builds");
  assert.equal(row.landed.text, "not in the compared builds");
  assert.equal(row.countedResults, undefined);
  assert.equal(row.units, undefined);
});

test("a gap-only partial unit names its unit beside complete cases", () => {
  const endpoint = proof(
    makeMe.aCiProofEvidence
      .inUnit("case")
      .brokenDown({ path: file, passed: 3 })
      .please(),
    makeMe.aCiProofEvidence
      .inUnit("file")
      .brokenDown({ path: "x/elsewhere/check.sh", passed: 1 })
      .missingPart(2)
      .please(),
  );
  for (const scope of ["x/folder", file]) {
    const rows = scopeComparisonRowsOf(
      scope,
      endpoint,
      endpoint,
      endpoint,
      "precise",
    );
    assert.equal(rows[1].counts, "no CI result (test files)");
    assert.deepEqual(rows[1].gaps, ["part 2 of 2 missing"]);
    assert.equal(rows[1].countedResults, undefined);
    assert.equal(rows[1].cues.count.kind, "none");
  }
});

test("unmatched empty units name their own endpoint units without comparing them", () => {
  const before = proof(
    makeMe.aCiProofEvidence
      .inUnit("case")
      .inParts(1, { missing: [1] })
      .please(),
  );
  const after = proof(
    makeMe.aCiProofEvidence
      .inUnit("file")
      .inParts(1, { missing: [1] })
      .please(),
  );
  assert.deepEqual(counts("x", before, after), [
    "nothing counted as test cases → nothing counted as test files",
  ]);
});

test("an unmatched row retains every known empty unit rather than only its first group", () => {
  const before = proof(
    makeMe.aCiProofEvidence
      .inUnit("case")
      .inParts(1, { missing: [1] })
      .please(),
    makeMe.aCiProofEvidence
      .inUnit("file")
      .inParts(1, { missing: [1] })
      .please(),
  );
  const after = proof(
    makeMe.aCiProofEvidence
      .legacy("tests")
      .inParts(1, { missing: [1] })
      .please(),
  );
  assert.deepEqual(counts("x", before, after), [
    "nothing counted as test cases and nothing counted as test files → nothing counted as legacy test results",
  ]);
});
