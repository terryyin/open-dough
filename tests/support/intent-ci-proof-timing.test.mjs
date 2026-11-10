// The one timing classification for Intent CI cells
// (../../dashboard/src/ciProofTiming.ts): measured (a measured zero
// included), partial with short gap labels, or not recorded, each gap label
// paired with its full explanation, and never a number for absence or a
// lower bound for partial timing, each gap naming the unit of the results it
// leaves untimed; a measured time in execution time words
// (../../dashboard/src/ciProofTimeWords.ts). CI status Proof, Summary rows
// and story comparison endpoints all read it. Browser journeys:
// ../../dashboard/tests/intent/intent-ci-status-execution-time.spec.ts and
// ../../dashboard/tests/intent/intent-summary-ci-proof-gaps.spec.ts.
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  entryTimingOf,
  scopeTimingOf,
  timingCellOf,
} from "../../dashboard/src/ciProofTiming.ts";
import { ciScopeCellsOf } from "../../dashboard/src/ciProofWording.ts";
import { executionTimeWords } from "../../dashboard/src/ciProofTimeWords.ts";
import { scopeFiguresOf } from "../../dashboard/src/ciScopeProof.ts";
import { entryEvidenceOf } from "../../dashboard/src/ciProofUnits.ts";
import { makeMe } from "./makeMe.mjs";

const entryCell = (evidence) =>
  timingCellOf(entryTimingOf(evidence), executionTimeWords);

test("complete timing is measured, and every part timed at zero reads 0 ms", () => {
  assert.deepEqual(
    entryCell(
      makeMe.aCiProofEvidence
        .inUnit("case")
        .timed(1200)
        .withUnbrokenPart({ passed: 1, durationMs: 340 })
        .please(),
    ),
    { text: "1.5 s", ms: 1540 },
  );
  assert.deepEqual(
    entryCell(
      makeMe.aCiProofEvidence
        .inUnit("case")
        .timed(0)
        .withUnbrokenPart({ passed: 1, durationMs: 0 })
        .please(),
    ),
    { text: "0 ms", ms: 0 },
  );
});

test("partial timing shows short gap labels with the full explanation and no figure", () => {
  assert.deepEqual(
    entryCell(
      makeMe.aCiProofEvidence
        .inUnit("case")
        .timed(900)
        .withUnbrokenPart({ passed: 1, untimed: 0 })
        .withUnbrokenPart({ passed: 1, durationMs: 100 })
        .please(),
    ),
    {
      text: "Part 2 untimed",
      explanation: "Partial: part 2 of 3 has no duration",
    },
  );
  assert.deepEqual(
    entryCell(
      makeMe.aCiProofEvidence
        .inUnit("case")
        .timed(900)
        .inParts(3, { missing: [3] })
        .withPresentPart(2, { passed: 1, durationMs: 100 })
        .please(),
    ),
    { text: "Part 3 missing", explanation: "Partial: part 3 of 3 missing" },
  );
  assert.deepEqual(
    entryCell(
      makeMe.aCiProofEvidence.inUnit("case").timed(900).withUntimed(4).please(),
    ),
    {
      text: "4 test cases untimed",
      explanation: "Partial: 4 test cases without a duration",
    },
  );
  // Another unit's untimed results are named by their unit.
  assert.deepEqual(
    timingCellOf(
      entryTimingOf(
        makeMe.aCiProofEvidence
          .inUnit("file")
          .timed(900)
          .withUntimed(1)
          .please(),
      ),
      executionTimeWords,
    ),
    {
      text: "1 test file untimed",
      explanation: "Partial: 1 test file without a duration",
    },
  );
  // Several gaps join compactly; the explanation names each.
  assert.deepEqual(
    entryCell(
      makeMe.aCiProofEvidence
        .inUnit("case")
        .timed(900)
        .withUntimed(1)
        .inParts(3, { ambiguous: [3] })
        .withPresentPart(2, { passed: 1, untimed: 0 })
        .please(),
    ),
    {
      text: "Part 3 ambiguous, Part 2 untimed, 1 test case untimed",
      explanation:
        "Partial: part 3 of 3 ambiguous, part 2 of 3 has no duration and 1 test case without a duration",
    },
  );
});

test("a summary without durations reads No timings, distinct from zero and partial", () => {
  const timing = entryTimingOf(
    makeMe.aCiProofEvidence
      .inUnit("case")
      .inParts(2)
      .withPresentPart(2, { passed: 1, untimed: 0 })
      .please(),
  );
  assert.equal(timing.kind, "not-recorded");
  assert.deepEqual(timingCellOf(timing, executionTimeWords), {
    text: "No timings",
    explanation: "Not recorded: this summary has no test execution durations",
  });
});

test("a scope's timing names untimed results, missing parts and parts without a file breakdown", () => {
  const [entry] = entryEvidenceOf(
    makeMe.aCiProofEntry
      .at("tests")
      .holding(
        makeMe.aCiProofEvidence
          .inUnit("case")
          .inParts(2, { missing: [2] })
          .withFile("tests/a.sh", { passed: 1, durationMs: 700 })
          .withFile("tests/b.sh", { passed: 1 })
          .withUnbrokenPart({ passed: 1, untimed: 0 })
          .please(),
      )
      .please(),
  );
  const cellOf = (scope) =>
    timingCellOf(
      scopeTimingOf(entry, scopeFiguresOf(entry, scope)),
      executionTimeWords,
    );
  assert.deepEqual(cellOf("tests/a.sh"), {
    text: "Part 2 missing, Part 3 no breakdown",
    explanation:
      "Partial: part 2 of 3 missing and part 3 of 3 has no file breakdown",
  });
  assert.deepEqual(cellOf("tests"), {
    text: "Part 2 missing, Part 3 no breakdown, 1 test case untimed",
    explanation:
      "Partial: part 2 of 3 missing, part 3 of 3 has no file breakdown and 1 test case without a duration",
  });
  // A scope without any CI result stays its own word, never a timing.
  assert.deepEqual(
    ciScopeCellsOf(entry, scopeFiguresOf(entry, "tests/none.sh")).executionTime,
    { text: "no CI result" },
  );
});

test("a scope whose results all lack a duration reads Not recorded while its partly timed entry reads Partial", () => {
  const [entry] = entryEvidenceOf(
    makeMe.aCiProofEntry
      .at("tests")
      .holding(
        makeMe.aCiProofEvidence
          .inUnit("case")
          .inParts(2)
          .withFile("tests/a.sh", { passed: 1, durationMs: 700 })
          .withFile("tests/b.sh", { passed: 1 })
          .please(),
      )
      .please(),
  );
  assert.deepEqual(
    timingCellOf(
      scopeTimingOf(entry, scopeFiguresOf(entry, "tests/b.sh")),
      executionTimeWords,
    ),
    {
      text: "1 test case untimed",
      explanation: "Not recorded: 1 test case without a duration",
    },
  );
  assert.deepEqual(entryCell(entry), {
    text: "1 test case untimed",
    explanation: "Partial: 1 test case without a duration",
  });
});

test("execution time tells sub-minute scopes apart and keeps whole minutes whole", () => {
  assert.deepEqual(
    [
      0, 340, 999.6, 1000, 12_540, 59_940, 59_960, 240_000, 245_000, 3_723_000,
    ].map(executionTimeWords),
    [
      "0 ms",
      "340 ms",
      "1.0 s",
      "1.0 s",
      "12.5 s",
      "59.9 s",
      "1 min",
      "4 min",
      "4 min 5 s",
      "1 h 2 min",
    ],
  );
});
