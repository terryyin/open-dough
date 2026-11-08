// Entry matching and wording for Intent's story CI comparison
// (`../../dashboard/src/storyCiComparisonEntries.ts`): measured Baseline time
// and one signed change in Branch and Landed, relative to a positive
// Baseline, added/removed paths, expired
// and partial totals never invent zero.
import assert from "node:assert/strict";
import test from "node:test";
import {
  comparisonEntriesOf,
  comparisonProofOf,
} from "../../dashboard/src/storyCiComparisonEntries.ts";
import { makeMe } from "./makeMe.mjs";

// An entry at PATH whose one part ran in DURATIONMS, or without a duration.
const entry = (path, durationMs) => {
  const built = makeMe.aCiProofEntry.at(path);
  return (durationMs === undefined ? built : built.timed(durationMs)).please();
};

const summary = (...entries) => ({ kind: "summary", entries });

test("comparable entries show Baseline time and one signed whole-second change per endpoint", () => {
  const result = comparisonEntriesOf(
    summary(
      makeMe.aCiProofEntry
        .at("dashboard/tests")
        .counting(2090)
        .timed(240_000)
        .please(),
      entry("tests", 120_000),
    ),
    summary(
      makeMe.aCiProofEntry
        .at("dashboard/tests")
        .counting(2092)
        .timed(270_000)
        .please(),
      entry("tests", 90_000),
    ),
    summary(
      makeMe.aCiProofEntry
        .at("dashboard/tests")
        .counting(2092)
        .timed(300_000)
        .please(),
      entry("tests", 60_000),
    ),
  );
  assert.equal(result.kind, "rows");
  assert.deepEqual(
    result.rows.map((row) => [
      row.path,
      row.cells.counts,
      row.cells.baseline.text,
      row.cells.branch.text,
      row.cells.landed.text,
      row.cells.completeness,
    ]),
    [
      [
        "dashboard/tests",
        "2,090 → 2,092 tests (+2)",
        "4 min",
        "+30 s",
        "+1 min",
        "1 of 1 part present",
      ],
      [
        "tests",
        "1 tests (no change)",
        "2 min",
        "−30 s",
        "−1 min",
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
      added.cells.baseline.text,
      added.cells.branch.text,
      added.cells.landed.text,
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
  assert.equal(gone.cells.baseline.text, "1 min");
  assert.equal(gone.cells.branch.text, "removed");
  assert.equal(gone.cells.landed.text, "removed");
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
  assert.deepEqual(result.rows[0].cells.baseline, {
    text: "No timings",
    explanation: "Not recorded: this summary has no test execution durations",
  });
  assert.deepEqual(result.rows[0].cells.branch, { text: "1 min", ms: 60_000 });
  assert.deepEqual(result.rows[0].cells.landed, {
    text: "1 min 30 s",
    ms: 90_000,
  });
});

test("a partial endpoint shows its gap labels and keeps measured zero distinct", () => {
  const parts = (second) => ({
    path: "tests",
    unit: "tests",
    passed: 2,
    failed: 0,
    other: 0,
    parts: [
      {
        part: 1,
        status: "present",
        passed: 1,
        failed: 0,
        other: 0,
        durationMs: 0,
      },
      { part: 2, status: "present", passed: 1, failed: 0, other: 0, ...second },
    ],
  });
  const result = comparisonEntriesOf(
    summary(parts({})),
    summary(parts({ durationMs: 0 })),
    summary(parts({ durationMs: 0 })),
  );
  assert.equal(result.kind, "rows");
  const [row] = result.rows;
  assert.deepEqual(row.cells.baseline, {
    text: "Part 2 untimed",
    explanation: "Partial: part 2 of 2 has no duration",
  });
  assert.deepEqual(row.cells.landed, { text: "0 s", ms: 0 });
  assert.equal(row.cells.cues.duration.reason, "partial");
});

test("a measured zero baseline still gives a signed change, and an unchanged time reads 0 s", () => {
  const result = comparisonEntriesOf(
    summary(entry("e/zero", 0), entry("e/same", 45_000)),
    summary(entry("e/zero", 30_000), entry("e/same", 45_000)),
    summary(entry("e/zero", 0), entry("e/same", 45_000)),
  );
  assert.equal(result.kind, "rows");
  const [zero, same] = result.rows;
  assert.deepEqual(zero.cells.baseline, { text: "0 s", ms: 0 });
  assert.deepEqual(zero.cells.branch, {
    text: "+30 s",
    ms: 30_000,
    changeMs: 30_000,
  });
  assert.deepEqual(zero.cells.landed, { text: "0 s", ms: 0, changeMs: 0 });
  assert.deepEqual(same.cells.landed, {
    text: "0 s",
    ms: 45_000,
    changeMs: 0,
    relative: 0,
  });
});

test("a change is relative to a positive Baseline only", () => {
  const result = comparisonEntriesOf(
    summary(entry("e/slower", 240_000), entry("e/zero", 0)),
    summary(entry("e/slower", 270_000), entry("e/zero", 30_000)),
    summary(
      entry("e/slower", 120_000),
      entry("e/zero", 30_000),
      entry("e/added", 30_000),
    ),
  );
  assert.equal(result.kind, "rows");
  const [slower, zero, added] = result.rows;
  assert.equal(slower.cells.branch.relative, 0.125);
  assert.equal(slower.cells.landed.relative, -0.5);
  assert.equal(zero.cells.branch.relative, undefined);
  assert.equal(added.cells.landed.relative, undefined);
  assert.equal(added.cells.landed.text, "30 s");
});
