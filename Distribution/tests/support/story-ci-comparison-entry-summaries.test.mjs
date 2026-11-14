// The browser comparison's served proof retains MakeMe's decisive evidence.
import assert from "node:assert/strict";
import { test } from "node:test";
import { entryProofs } from "../../../dashboard/tests/support/storyCiComparisonEntrySummaries.ts";
import { summaryProblems } from "../../src/skills/dough-test-optimization/scripts/ci-proof-summary.mjs";
import { makeMe } from "./makeMe.mjs";

const revisions = {
  baseline: "a".repeat(40),
  branchSide: "b".repeat(40),
  completion: "c".repeat(40),
};

test("served Baseline, Branch and Landed retain missing and ambiguous parts beside multipart file and unassigned observations", () => {
  for (const status of ["missing", "ambiguous"]) {
    const evidence = makeMe.aCiProofEvidence
      .inUnit("case")
      .withFile("t/a.ts", { passed: 5, durationMs: 200 })
      .withUnassigned({ failed: 2, passed: 0, durationMs: 300 })
      .inParts(2, { [status]: [2] })
      .please();
    const entry = makeMe.aCiProofEntry.at("t").holding(evidence).please();
    const served = entryProofs(revisions, {
      baseline: [entry],
      branch: [entry],
      landed: [entry],
    });
    for (const [run, revision] of [
      [101, revisions.baseline],
      [102, revisions.branchSide],
      [103, revisions.completion],
    ]) {
      const summary = served[run].summary;
      assert.deepEqual(summaryProblems(summary), []);
      assert.equal(summary.revision, revision);
      const [actual] = summary.entries[0].evidence;
      assert.deepEqual(
        actual.parts.map(({ part, status }) => [part, status]),
        [
          [1, "present"],
          [2, status],
        ],
      );
      assert.equal(actual.passed, 5);
      assert.equal(actual.failed, 2);
      assert.deepEqual(actual.files, [
        { path: "t/a.ts", passed: 5, failed: 0, other: 0, durationMs: 200 },
      ]);
      assert.deepEqual(actual.unassigned, {
        passed: 0,
        failed: 2,
        other: 0,
        durationMs: 300,
      });
      assert.deepEqual(actual, evidence);
    }
  }
});

test("several present parts keep their breakdown once and keep an unbroken part's counts and time", () => {
  const evidence = makeMe.aCiProofEvidence
    .inUnit("case")
    .withFile("t/a.ts", { passed: 5, durationMs: 200 })
    .withUnassigned({ passed: 2, durationMs: 300 })
    .inParts(2)
    .withUnbrokenPart({ passed: 3, durationMs: 400 })
    .please();
  const entry = makeMe.aCiProofEntry.at("t").holding(evidence).please();
  const { summary } = entryProofs(revisions, {
    baseline: [entry],
    branch: [entry],
    landed: [entry],
  })[101];
  assert.deepEqual(summaryProblems(summary), []);
  assert.deepEqual(summary.entries[0].evidence[0], evidence);
});

test("entirely missing or ambiguous declared units remain unobserved and legacy labels keep their original meaning", () => {
  for (const status of ["missing", "ambiguous"]) {
    const absent = makeMe.aCiProofEvidence
      .inUnit("file")
      .inParts(2, { [status]: [1, 2] })
      .please();
    const legacy = makeMe.aCiProofEvidence
      .legacy("checks")
      .counting(0)
      .please();
    const entry = makeMe.aCiProofEntry.at("t").holding(absent, legacy).please();
    const { summary } = entryProofs(revisions, {
      baseline: [entry],
      branch: [entry],
      landed: [entry],
    })[101];
    assert.deepEqual(summaryProblems(summary), []);
    assert.deepEqual(summary.entries[0], entry);
  }
});

test("legacy units with no present part keep their null provenance at every compared build", () => {
  for (const status of ["missing", "ambiguous"]) {
    const evidence = makeMe.aCiProofEvidence
      .legacy(null)
      .inParts(2, { [status]: [1, 2] })
      .please();
    const entry = makeMe.aCiProofEntry.at("t").holding(evidence).please();
    const served = entryProofs(revisions, {
      baseline: [entry],
      branch: [entry],
      landed: [entry],
    });
    for (const run of [101, 102, 103]) {
      const { summary } = served[run];
      assert.deepEqual(summaryProblems(summary), []);
      assert.deepEqual(summary.entries[0], entry);
    }
  }
});
