// Entry matching and wording for Intent's story CI comparison
// (`../../dashboard/src/storyCiComparisonEntries.ts`): signed differences,
// added/removed paths, expired and partial totals never invent zero.
import assert from "node:assert/strict";
import test from "node:test";
import {
  comparisonEntriesOf,
  comparisonProofOf,
} from "../../dashboard/src/storyCiComparisonEntries.ts";

const entry = (path, durationMs, extras = {}) => ({
  path,
  unit: "tests",
  passed: 1,
  failed: 0,
  other: 0,
  ...(durationMs === undefined ? {} : { durationMs }),
  parts: [
    {
      part: 1,
      status: "present",
      passed: 1,
      failed: 0,
      other: 0,
      ...(durationMs === undefined ? {} : { durationMs }),
      ...extras,
    },
  ],
});

const summary = (...entries) => ({ kind: "summary", entries });

test("comparable entries show signed whole-second differences and count diffs", () => {
  const result = comparisonEntriesOf(
    summary(
      { ...entry("dashboard/tests", 240_000), passed: 2090 },
      entry("tests", 120_000),
    ),
    summary(
      { ...entry("dashboard/tests", 270_000), passed: 2092 },
      entry("tests", 90_000),
    ),
    summary(
      { ...entry("dashboard/tests", 300_000), passed: 2092 },
      entry("tests", 60_000),
    ),
  );
  assert.equal(result.kind, "rows");
  assert.deepEqual(
    result.rows.map((row) => [
      row.path,
      row.cells.counts,
      row.cells.baseline,
      row.cells.branch,
      row.cells.landed,
      row.cells.completeness,
    ]),
    [
      [
        "dashboard/tests",
        "2,090 → 2,092 tests (+2)",
        "4 min",
        "4 min → 4 min 30 s (+30 s, +13%)",
        "4 min → 5 min (+1 min, +25%)",
        "1 of 1 part present",
      ],
      [
        "tests",
        "1 tests (no change)",
        "2 min",
        "2 min → 1 min 30 s (−30 s, −25%)",
        "2 min → 1 min (−1 min, −50%)",
        "1 of 1 part present",
      ],
    ],
  );
});

test("an added entry has no invented baseline difference", () => {
  const result = comparisonEntriesOf(
    summary(entry("tests", 60_000)),
    summary(entry("tests", 60_000), entry("src/skills", 30_000)),
    summary(entry("tests", 60_000), entry("src/skills", 30_000)),
  );
  assert.equal(result.kind, "rows");
  const added = result.rows.find((row) => row.path === "src/skills");
  assert.deepEqual(
    [
      added.cells.counts,
      added.cells.baseline,
      added.cells.branch,
      added.cells.landed,
    ],
    ["added → 1 tests", "added", "30 s", "30 s"],
  );
});

test("a removed entry is marked without inventing an after value", () => {
  const result = comparisonEntriesOf(
    summary(entry("old", 60_000), entry("tests", 60_000)),
    summary(entry("tests", 60_000)),
    summary(entry("tests", 60_000)),
  );
  assert.equal(result.kind, "rows");
  const gone = result.rows.find((row) => row.path === "old");
  assert.equal(gone.cells.counts, "1 → removed");
  assert.equal(gone.cells.baseline, "1 min");
  assert.equal(gone.cells.branch, "removed");
  assert.equal(gone.cells.landed, "removed");
});

test("expired proofs keep an explained empty comparison", () => {
  const expired = comparisonProofOf(
    {
      kind: "build",
      revision: "a".repeat(40),
      subject: "main",
      state: "pass",
      selection: "exact",
      laterWithoutResult: 0,
      runId: 1,
      runAttempt: 1,
    },
    { kind: "unavailable", reason: "expired" },
    false,
  );
  const result = comparisonEntriesOf(expired, expired, expired);
  assert.equal(result.kind, "empty");
  assert.match(result.explanation, /expired/);
});

test("a summary without durations never becomes zero", () => {
  const result = comparisonEntriesOf(
    summary(entry("tests")),
    summary(entry("tests", 60_000)),
    summary(entry("tests", 90_000)),
  );
  assert.equal(result.kind, "rows");
  assert.equal(
    result.rows[0].cells.baseline,
    "not recorded: this summary has no test execution durations",
  );
  assert.equal(result.rows[0].cells.branch, "1 min");
  assert.equal(result.rows[0].cells.landed, "1 min 30 s");
});
