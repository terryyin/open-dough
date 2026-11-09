// Signed timing for Intent's shared CI comparison
// (../../dashboard/src/ciScopeComparison.ts,
// ../../dashboard/src/ciScopeComparisonTiming.ts): every compared scope's
// and a Summary's outside row's signed timing, relative only to a positive
// measured Baseline; a change only between times of one declared unit, never
// across units, from legacy results or of several units. Count words:
// ./intent-scope-comparison-wording.test.mjs. Browser journeys:
// ../../dashboard/tests/intent/intent-ci-comparison*.spec.ts and
// intent-summary-story-comparison*.spec.ts.
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  outsideComparisonCellsOf,
  scopeComparisonCellsOf,
} from "../../dashboard/src/ciScopeComparison.ts";
import { immediateChildrenOf } from "../../dashboard/src/ciScopeProof.ts";
import { makeMe } from "./makeMe.mjs";

// A proof summary of ENTRIES.
const summary = (...entries) => ({ kind: "summary", entries });

test("every compared scope carries precise signed timing and its comparable values, while added and gaps keep their meaning", () => {
  const timed = (path, ms) => makeMe.aCiProofEntry.at(path).timed(ms).please();
  const before = summary(timed("s/file", 340), timed("s/zero", 0));
  const after = summary(
    timed("s/file", 410),
    timed("s/zero", 70),
    timed("s/added", 410),
  );
  const cells = (path, precision = "precise") =>
    scopeComparisonCellsOf(path, before, after, after, precision);
  const precise = cells("s/file");
  assert.deepEqual(precise.baseline, { text: "340 ms", ms: 340 });
  assert.deepEqual(precise.branch, {
    text: "+70 ms",
    ms: 410,
    changeMs: 70,
    relative: 70 / 340,
  });
  assert.deepEqual(precise.landed, precise.branch);
  assert.equal(cells("s/file", "whole-second").branch.text, "+0 s");
  assert.deepEqual(cells("s/zero").branch, {
    text: "+70 ms",
    ms: 70,
    changeMs: 70,
  });
  assert.deepEqual(cells("s/added").branch, { text: "410 ms", ms: 410 });
  assert.deepEqual(
    scopeComparisonCellsOf(
      "s/file",
      before,
      { kind: "unavailable", line: "Proof expired" },
      { kind: "no-build", explanation: "Build is still running." },
      "precise",
    ).branch,
    { text: "Proof expired" },
  );
  const absent = cells("s/absent");
  assert.deepEqual(absent.branch, { text: "not in the compared builds" });
});

// An entry at PATH holding EVIDENCE, and one unit's evidence timed MS.
const holding = (path, ...evidence) =>
  makeMe.aCiProofEntry
    .at(path)
    .holding(...evidence)
    .please();
const cases = (ms) => makeMe.aCiProofEvidence.inUnit("case").timed(ms).please();
const files = (ms) => makeMe.aCiProofEvidence.inUnit("file").timed(ms).please();
const legacy = (ms) =>
  makeMe.aCiProofEvidence.legacy("tests").timed(ms).please();

test("a compared scope's signed change exists only between one declared unit at both ends: another unit, legacy results or several units keep each endpoint's own time without a change, relative mark or cue", () => {
  const before = summary(
    holding("u/same", cases(20_000)),
    holding("u/across", cases(20_000)),
    holding("u/legacy", legacy(20_000)),
    holding("u/several", cases(20_000)),
  );
  const after = summary(
    holding("u/same", cases(23_000)),
    holding("u/across", files(23_000)),
    holding("u/legacy", legacy(23_000)),
    holding("u/several", cases(24_000), files(3_000)),
  );
  const cells = (path) =>
    scopeComparisonCellsOf(path, before, after, after, "precise");
  assert.deepEqual(cells("u/same").landed, {
    text: "+3.0 s",
    ms: 23_000,
    changeMs: 3_000,
    relative: 3_000 / 20_000,
  });
  for (const [path, counts] of [
    ["u/across", "1 test case → 1 test file"],
    ["u/legacy", "1 legacy test result → 1 legacy test result"],
  ]) {
    const scope = cells(path);
    assert.equal(scope.counts, counts);
    assert.deepEqual(scope.baseline, { text: "20.0 s", ms: 20_000 });
    assert.deepEqual(scope.branch, { text: "23.0 s", ms: 23_000 });
    assert.deepEqual(scope.landed, scope.branch);
    assert.deepEqual(scope.cues.duration, {
      kind: "none",
      reason: "units not comparable",
    });
  }
  const several = cells("u/several");
  assert.equal(several.counts, "1 test case → 1 test case and 1 test file");
  assert.deepEqual(several.landed, {
    text: "24.0 s (test cases); 3.0 s (test files)",
  });
  assert.deepEqual(several.cues.duration, {
    kind: "none",
    reason: "several units",
  });
});

test("a Summary's outside row changes only within one declared unit at both ends", () => {
  const children = immediateChildrenOf("o", ["o/a.spec.ts"]);
  // Entry o in UNIT, its unlisted ghost.spec.ts timed GHOST_MS.
  const proof = (unit, ghostMs) =>
    summary(
      holding(
        "o",
        makeMe.aCiProofEvidence
          .inUnit(unit)
          .brokenDown(
            { path: "o/a.spec.ts", passed: 1, durationMs: 1_000 },
            { path: "o/ghost.spec.ts", passed: 1, durationMs: ghostMs },
          )
          .please(),
      ),
    );
  const outside = (afterUnit) =>
    outsideComparisonCellsOf(
      "o",
      children,
      proof("case", 500),
      proof(afterUnit, 600),
      proof(afterUnit, 600),
      "precise",
    );
  assert.deepEqual(outside("case").landed, {
    text: "+100 ms",
    ms: 600,
    changeMs: 100,
    relative: 100 / 500,
  });
  assert.deepEqual(outside("file").landed, { text: "600 ms", ms: 600 });
});
