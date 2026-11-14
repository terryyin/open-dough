// Classification of Intent CI comparison count borders and duration tints
// (../../../dashboard/src/ciScopeComparisonCues.ts) on the seed's key examples,
// only between figures of one declared unit, and the cue several unit rows
// or units agree on (../../../dashboard/src/ciScopeComparisonAgreedCues.ts).
// Browser journeys: ../../../e2e/intent/intent-ci-comparison.spec.ts,
// intent-summary-story-comparison*.spec.ts, intent-ci-comparison-units.spec.ts.
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  combinedCuesOf,
  overallCountCueOf,
} from "../../../dashboard/src/ciScopeComparisonAgreedCues.ts";
import {
  comparisonAfterSideOf,
  countCueOf,
  durationCueOf,
  overallDurationCueOf,
  scopeComparisonCuesOf,
} from "../../../dashboard/src/ciScopeComparisonCues.ts";

const measuredCount = (total, unit = "case") => ({
  kind: "measured",
  total,
  failed: 0,
  unit,
});
const measuredMs = (ms, unit = "case") => ({ kind: "measured", ms, unit });

test("a cue compares only figures of one declared unit: never test cases with test files, legacy results, or several units", () => {
  const notComparable = { kind: "none", reason: "units not comparable" };
  const several = { kind: "none", reason: "several units" };
  assert.deepEqual(
    countCueOf(measuredCount(5, "case"), measuredCount(1, "file")),
    notComparable,
  );
  assert.deepEqual(
    countCueOf(measuredCount(5, "legacy"), measuredCount(9, "legacy")),
    notComparable,
  );
  assert.deepEqual(
    countCueOf(measuredCount(5), {
      kind: "units",
      counts: [measuredCount(5), measuredCount(1, "file")],
    }),
    several,
  );
  assert.deepEqual(
    durationCueOf(measuredMs(8_000, "legacy"), measuredMs(12_000, "legacy")),
    notComparable,
  );
  assert.deepEqual(
    durationCueOf(measuredMs(8_000), {
      kind: "units",
      timings: [measuredMs(8_000), measuredMs(4_000, "file")],
    }),
    several,
  );
  // A unit an endpoint does not report takes no cue, as it is no zero.
  const notReported = { kind: "none", reason: "unit not reported" };
  assert.deepEqual(
    countCueOf({ kind: "unreported" }, measuredCount(1, "file")),
    notReported,
  );
  assert.deepEqual(
    durationCueOf(measuredMs(300, "file"), { kind: "unreported" }),
    notReported,
  );
});

test("one control for several unit rows takes the direction its cued rows agree on, strong when any is, and no cue when they disagree", () => {
  const cues = (count, duration) => ({ count, duration });
  const more = { kind: "border", direction: "more", strength: "light" };
  const fewer = { kind: "border", direction: "fewer", strength: "strong" };
  const slower = { kind: "tint", direction: "slower", strength: "strong" };
  const unchanged = { kind: "none", reason: "unchanged" };
  // Test cases +2 and slower; test files unchanged.
  assert.deepEqual(
    combinedCuesOf([cues(more, slower), cues(unchanged, unchanged)]),
    cues(more, slower),
  );
  assert.deepEqual(
    combinedCuesOf([cues(more, unchanged), cues(fewer, unchanged)]),
    cues({ kind: "none", reason: "mixed directions" }, unchanged),
  );
  assert.deepEqual(
    combinedCuesOf([
      cues(more, unchanged),
      cues({ ...more, strength: "strong" }, unchanged),
    ]).count,
    { kind: "border", direction: "more", strength: "strong" },
  );
  assert.deepEqual(
    combinedCuesOf([
      cues(unchanged, unchanged),
      cues(
        { kind: "none", reason: "unit not reported" },
        { kind: "none", reason: "unit not reported" },
      ),
    ]),
    cues(
      { kind: "none", reason: "several units" },
      { kind: "none", reason: "several units" },
    ),
  );
});

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
