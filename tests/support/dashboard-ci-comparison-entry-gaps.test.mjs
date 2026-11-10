// Endpoint gaps in Intent's story CI comparison entries
// (`../../dashboard/src/storyCiComparisonEntries.ts`): an expired proof
// keeps an explained empty comparison, and a summary without durations, or
// with a part without one, keeps its gap words and never becomes zero.
// Matching and signed changes: ./dashboard-ci-comparison-entries.test.mjs.
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
    makeMe.aCiProof.unavailableBecause("expired").please(),
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
  const partial = makeMe.aCiProofEntry
    .at("tests")
    .holding(
      makeMe.aCiProofEvidence
        .inUnit("case")
        .timed(0)
        .withPresentPart(2, { passed: 1, untimed: 0 })
        .please(),
    )
    .please();
  const measured = makeMe.aCiProofEntry
    .at("tests")
    .holding(
      makeMe.aCiProofEvidence
        .inUnit("case")
        .timed(0)
        .withPresentPart(2, { passed: 1, durationMs: 0 })
        .please(),
    )
    .please();
  const result = comparisonEntriesOf(
    summary(partial),
    summary(measured),
    summary(measured),
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
