// Timing change in a story's CI comparison
// (../../../dashboard/src/storyCiRelativeChange.ts,
// ../../../dashboard/src/ciProofTimeWords.ts): relative only to a positive
// baseline, one scale reaching one side at 50% and widening for a larger
// change, and signed whole percentages. The summary's and entries' marks in
// the browser: ../../../dashboard/tests/intent/intent-ci-comparison-relative.spec.ts.
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  executionTimeDifferenceWords,
  relativePercentWords,
} from "../../../dashboard/src/ciProofTimeWords.ts";
import {
  relativeDirectionOf,
  relativeReachOf,
  relativeScaleOf,
  timeChangeOf,
} from "../../../dashboard/src/storyCiRelativeChange.ts";

test("a change is relative only to a positive measured baseline", () => {
  assert.deepEqual(timeChangeOf(240_000, 270_000), {
    text: "+30 s",
    changeMs: 30_000,
    relative: 0.125,
  });
  assert.equal(timeChangeOf(120_000, 60_000).relative, -0.5);
  assert.equal(timeChangeOf(45_000, 45_000).relative, 0);
  assert.deepEqual(timeChangeOf(0, 30_000), {
    text: "+30 s",
    changeMs: 30_000,
  });
});

test("one scale reaches one side at 50% unless a larger change widens it", () => {
  assert.equal(relativeScaleOf([]), 0.5);
  assert.equal(relativeScaleOf([0.125, -0.25, undefined, 0]), 0.5);
  assert.equal(relativeScaleOf([0.125, -1.5, undefined]), 1.5);
  assert.equal(relativeReachOf(-0.5, 0.5), 1);
  assert.equal(relativeReachOf(0.125, 0.5), 0.25);
  assert.equal(relativeReachOf(0.5, 1.5), 1 / 3);
  assert.equal(relativeReachOf(0, 0.5), 0);
});

test("faster extends left, slower right, and no change stays at zero", () => {
  assert.equal(relativeDirectionOf(-0.25), "faster");
  assert.equal(relativeDirectionOf(0.125), "slower");
  assert.equal(relativeDirectionOf(0), "none");
});

test("percentages are signed whole numbers at the existing precision", () => {
  assert.equal(relativePercentWords(0.125), "+13%");
  assert.equal(relativePercentWords(-0.5), "−50%");
  assert.equal(relativePercentWords(0.004), "0%");
  assert.equal(relativePercentWords(1.5), "+150%");
});

test("the same signed change keeps the chosen duration precision without changing its ratio", () => {
  assert.deepEqual(timeChangeOf(340, 410, executionTimeDifferenceWords), {
    text: "+70 ms",
    changeMs: 70,
    relative: 70 / 340,
  });
  assert.equal(timeChangeOf(340, 410).text, "+0 s");
});
