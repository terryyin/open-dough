// Readable before → after (Δ) wording for Intent's story CI comparison
// (../../dashboard/src/ciScopeComparisonCounts.ts,
// ../../dashboard/src/ciProofTimeWords.ts,
// ../../dashboard/src/storyCiComparisonWording.ts): count cells, the
// percentage rule for measured non-zero baselines, and the overall sum with
// units kept apart. Browser journeys:
// ../../dashboard/tests/intent/intent-ci-comparison*.spec.ts.
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  durationChangeWords,
  durationPercentageWords,
  executionTimeDifferenceWords,
  executionTimeWords,
  wholeSecondDifferenceWords,
  wholeSecondWords,
} from "../../dashboard/src/ciProofTimeWords.ts";
import {
  countsCellText,
  measuredCountsChangeWords,
} from "../../dashboard/src/ciScopeComparisonCounts.ts";
import { overallCountsWords } from "../../dashboard/src/storyCiComparisonCountsWords.ts";

const measured = (total, unit = "tests") => ({
  kind: "measured",
  total,
  unit,
});

test("count cells read before → after with the difference in parentheses", () => {
  assert.equal(
    measuredCountsChangeWords(12, 10, "tests"),
    "12 → 10 tests (−2)",
  );
  assert.equal(measuredCountsChangeWords(6, 6, "tests"), "6 tests (no change)");
  assert.equal(
    countsCellText(measured(12), measured(10), measured(10), true, true),
    "12 → 10 tests (−2)",
  );
  assert.equal(
    countsCellText(
      measured(5, "checks"),
      measured(5, "checks"),
      measured(5, "checks"),
      true,
      true,
    ),
    "5 checks (no change)",
  );
  assert.equal(
    countsCellText({ kind: "absent" }, measured(1), measured(1), true, false),
    "added → 1 tests",
  );
});

test("a duration percentage appears only for a measured non-zero baseline", () => {
  assert.equal(durationPercentageWords(8_000, 4_000), "+50%");
  assert.equal(durationPercentageWords(4_000, -1_000), "−25%");
  assert.equal(durationPercentageWords(0, 2_000), undefined);
  assert.equal(
    durationChangeWords(
      8_000,
      12_000,
      executionTimeWords,
      executionTimeDifferenceWords,
    ),
    "8.0 s → 12.0 s (+4.0 s, +50%)",
  );
  assert.equal(
    durationChangeWords(0, 2_000, wholeSecondWords, wholeSecondDifferenceWords),
    "0 s → 2 s (+2 s)",
  );
  assert.equal(
    durationChangeWords(
      4_000,
      3_000,
      executionTimeWords,
      executionTimeDifferenceWords,
    ),
    "4.0 s → 3.0 s (−1.0 s, −25%)",
  );
  assert.equal(
    durationChangeWords(
      299_000,
      330_000,
      wholeSecondWords,
      wholeSecondDifferenceWords,
    ),
    "4 min 59 s → 5 min 30 s (+31 s, +10%)",
  );
});

test("overall counts keep tests and checks apart and say partial when a side is missing", () => {
  const baseline = {
    kind: "summary",
    entries: [
      {
        path: "dashboard/tests",
        unit: "tests",
        passed: 1098,
        failed: 0,
        other: 0,
        parts: [],
      },
      {
        path: "tests",
        unit: "tests",
        passed: 982,
        failed: 0,
        other: 0,
        parts: [],
      },
      {
        path: "scripts",
        unit: "checks",
        passed: 492,
        failed: 0,
        other: 0,
        parts: [],
      },
    ],
  };
  const landed = {
    kind: "summary",
    entries: [
      {
        path: "dashboard/tests",
        unit: "tests",
        passed: 1100,
        failed: 0,
        other: 0,
        parts: [],
      },
      {
        path: "tests",
        unit: "tests",
        passed: 982,
        failed: 0,
        other: 0,
        parts: [],
      },
      {
        path: "scripts",
        unit: "checks",
        passed: 492,
        failed: 0,
        other: 0,
        parts: [],
      },
    ],
  };
  assert.equal(
    overallCountsWords(baseline, landed),
    "2,080 → 2,082 tests (+2); 492 checks (no change)",
  );
  assert.equal(
    overallCountsWords(baseline, {
      kind: "unavailable",
      line: "This run's CI proof summary has expired.",
    }),
    "Overall count partial: This run's CI proof summary has expired.",
  );
  assert.equal(
    overallCountsWords(
      { kind: "no-build", explanation: "Build is still running." },
      landed,
    ),
    "Overall count partial: Build is still running.",
  );
  assert.equal(
    overallCountsWords(
      { kind: "summary", entries: [] },
      { kind: "summary", entries: [] },
    ),
    "No overall count: neither compared build has a usable total.",
  );
});
