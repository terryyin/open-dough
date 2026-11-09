// Signed timing for Intent's shared CI comparison
// (../../dashboard/src/ciScopeComparison.ts,
// ../../dashboard/src/ciScopeComparisonTiming.ts): every compared row's and
// a Summary's outside rows' signed timing, relative only to a positive
// measured Baseline; a change only between times of one declared unit, never
// across units or from legacy results, and each unit's own time on its own
// row, never added to another's. Count words:
// ./intent-scope-comparison-wording.test.mjs. Rows per unit:
// ./intent-scope-comparison-units.test.mjs. Browser journeys:
// ../../dashboard/tests/intent/intent-ci-comparison*.spec.ts and
// intent-summary-story-comparison*.spec.ts.
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  outsideComparisonRowsOf,
  scopeComparisonRowsOf,
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
  const cells = (path, precision = "precise") => {
    const [only, ...more] = scopeComparisonRowsOf(
      path,
      before,
      after,
      after,
      precision,
    );
    assert.deepEqual(more, []);
    return only;
  };
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
    scopeComparisonRowsOf(
      "s/file",
      before,
      { kind: "unavailable", line: "Proof expired" },
      { kind: "no-build", explanation: "Build is still running." },
      "precise",
    ).map(({ branch }) => branch),
    [{ text: "Proof expired" }],
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

test("a compared row's signed change exists only between one declared unit at both ends: another unit or legacy results keep each endpoint's own time without a change, relative mark or cue, and each unit's time stays on its own row, never added to another's", () => {
  const before = summary(
    holding("u/same", cases(20_000)),
    holding("u/across", cases(20_000)),
    holding("u/legacy", legacy(20_000)),
    holding("u/both", cases(20_000), files(2_000)),
  );
  const after = summary(
    holding("u/same", cases(23_000)),
    holding("u/across", files(23_000)),
    holding("u/legacy", legacy(23_000)),
    holding("u/both", cases(24_000), files(3_000)),
  );
  const rows = (path) =>
    scopeComparisonRowsOf(path, before, after, after, "precise");
  assert.deepEqual(
    rows("u/same").map(({ landed }) => landed),
    [
      {
        text: "+3.0 s",
        ms: 23_000,
        changeMs: 3_000,
        relative: 3_000 / 20_000,
      },
    ],
  );
  for (const [path, counts] of [
    ["u/across", "1 test case → 1 test file (different units)"],
    [
      "u/legacy",
      "1 legacy test result → 1 legacy test result (legacy unit unknown)",
    ],
  ]) {
    const [scope, ...more] = rows(path);
    assert.deepEqual(more, []);
    assert.equal(scope.counts, counts);
    assert.deepEqual(scope.baseline, { text: "20.0 s", ms: 20_000 });
    assert.deepEqual(scope.branch, { text: "23.0 s", ms: 23_000 });
    assert.deepEqual(scope.landed, scope.branch);
    assert.deepEqual(scope.cues.duration, {
      kind: "none",
      reason: "units not comparable",
    });
  }
  // The test files' time is never added to the test cases' or spread over
  // them: each unit changes on its own row.
  assert.deepEqual(
    rows("u/both").map(({ counts, baseline, landed, units }) => [
      units,
      counts,
      baseline,
      landed,
    ]),
    [
      [
        "test cases",
        "1 test case (no change)",
        { text: "20.0 s", ms: 20_000 },
        { text: "+4.0 s", ms: 24_000, changeMs: 4_000, relative: 0.2 },
      ],
      [
        "test files",
        "1 test file (no change)",
        { text: "2.0 s", ms: 2_000 },
        { text: "+1.0 s", ms: 3_000, changeMs: 1_000, relative: 0.5 },
      ],
    ],
  );
});

test("a Summary's outside rows change only within one declared unit at both ends", () => {
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
    outsideComparisonRowsOf(
      "o",
      children,
      proof("case", 500),
      proof(afterUnit, 600),
      proof(afterUnit, 600),
      "precise",
    ).map(({ counts, landed }) => [counts, landed]);
  assert.deepEqual(outside("case"), [
    [
      "1 test case (no change)",
      { text: "+100 ms", ms: 600, changeMs: 100, relative: 100 / 500 },
    ],
  ]);
  assert.deepEqual(outside("file"), [
    [
      "1 test case → 1 test file (different units)",
      { text: "600 ms", ms: 600 },
    ],
  ]);
});
