// Classification of Intent CI comparison count borders and duration tints
// (../../dashboard/src/ciScopeComparisonCues.ts) on the seed's key examples.
// Browser journeys: ../../dashboard/tests/intent/intent-ci-comparison.spec.ts,
// intent-summary-story-comparison*.spec.ts.
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  comparisonAfterSideOf,
  countCueOf,
  durationCueOf,
  overallCountCueOf,
  overallDurationCueOf,
  scopeComparisonCuesOf,
} from "../../dashboard/src/ciScopeComparisonCues.ts";

const measuredCount = (total, unit = "tests") => ({
  kind: "measured",
  total,
  unit,
});
const measuredMs = (ms) => ({ kind: "measured", ms });

test("count cue: any change shows; strong at ≥50% of baseline", () => {
  assert.deepEqual(countCueOf(measuredCount(12), measuredCount(10)), {
    kind: "border",
    direction: "fewer",
    strength: "light",
  });
  assert.deepEqual(countCueOf(measuredCount(10), measuredCount(15)), {
    kind: "border",
    direction: "more",
    strength: "strong",
  });
  assert.deepEqual(countCueOf(measuredCount(6), measuredCount(6)), {
    kind: "none",
    reason: "unchanged",
  });
});

test("duration cue: thresholds, zero baseline, and no comparable sides", () => {
  assert.deepEqual(durationCueOf(measuredMs(8_000), measuredMs(12_000)), {
    kind: "tint",
    direction: "slower",
    strength: "strong",
  });
  assert.deepEqual(durationCueOf(measuredMs(4_000), measuredMs(3_000)), {
    kind: "tint",
    direction: "faster",
    strength: "light",
  });
  assert.deepEqual(durationCueOf(measuredMs(10_000), measuredMs(10_700)), {
    kind: "none",
    reason: "below threshold",
  });
  assert.deepEqual(durationCueOf(measuredMs(1_400), measuredMs(1_100)), {
    kind: "none",
    reason: "below threshold",
  });
  assert.deepEqual(durationCueOf(measuredMs(0), measuredMs(2_000)), {
    kind: "tint",
    direction: "slower",
    strength: "light",
  });
});

test("added, removed, gap and partial take no cue with a reason", () => {
  assert.deepEqual(countCueOf({ kind: "absent" }, measuredCount(1)), {
    kind: "none",
    reason: "added",
  });
  assert.deepEqual(countCueOf(measuredCount(1), { kind: "absent" }), {
    kind: "none",
    reason: "removed",
  });
  assert.deepEqual(
    durationCueOf(
      {
        kind: "partial",
        label: "Part 1 missing",
        explanation: "Partial: part 1 of 2 missing",
      },
      measuredMs(1_000),
    ),
    { kind: "none", reason: "partial" },
  );
  assert.deepEqual(
    durationCueOf(
      { kind: "status", text: "Build is still running." },
      measuredMs(1_000),
    ),
    { kind: "none", reason: "Build is still running." },
  );
  assert.deepEqual(
    scopeComparisonCuesOf(
      { kind: "absent" },
      { kind: "absent" },
      { kind: "absent" },
      { kind: "absent" },
    ),
    {
      count: { kind: "none", reason: "not in the compared builds" },
      duration: { kind: "none", reason: "not in the compared builds" },
    },
  );
});

test("overall cues and active after side follow Branch when Landed is unused", () => {
  assert.equal(comparisonAfterSideOf("Landed"), "landed");
  assert.equal(comparisonAfterSideOf("Branch"), "branch");
  assert.equal(comparisonAfterSideOf("Provisional"), "branch");
  assert.deepEqual(
    overallCountCueOf([
      { before: 12, after: 10 },
      { before: 492, after: 492 },
    ]),
    { kind: "border", direction: "fewer", strength: "light" },
  );
  assert.deepEqual(overallDurationCueOf(180_000, 240_000), {
    kind: "tint",
    direction: "slower",
    strength: "light",
  });
});
