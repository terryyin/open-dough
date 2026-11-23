// Overall counts of Intent's story CI comparison
// (../../../dashboard/src/storyCiComparisonCountsWords.ts): per-unit totals of
// the two compared builds, test cases and test files kept apart, matched
// entry by entry as compared scopes match their units: a unit only one build
// reports for an entry leaves a gap. Mismatched declared units keep their
// totals. Count cells:
// ./intent-scope-comparison-wording.test.mjs. Browser journeys:
// ../../../e2e/intent/intent-ci-comparison.spec.ts and
// intent-ci-comparison-units.spec.ts.
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  overallCountsCue,
  overallCountsWords,
} from "../../../dashboard/src/storyCiComparisonCountsWords.ts";
import { makeMe } from "./makeMe.mjs";

// A proof summary of ENTRIES.
const summary = (...entries) => ({ kind: "summary", entries });
const entry = (path, passed, unit) =>
  makeMe.aCiProofEntry.at(path).counting(passed, unit).please();

test("overall counts keep test cases and test files apart and say partial when a side is missing", () => {
  const baseline = summary(
    entry("dashboard/tests", 1098, "case"),
    entry("tests", 982, "case"),
    entry("scripts", 492, "file"),
  );
  const landed = summary(
    entry("dashboard/tests", 1100, "case"),
    entry("tests", 982, "case"),
    entry("scripts", 492, "file"),
  );
  assert.equal(
    overallCountsWords(baseline, landed),
    "2,080 → 2,082 test cases (+2); 492 test files (no change)",
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

test("the overall count compares only declared units both builds report: a unit one build lacks remains a gap", () => {
  const casesOnly = summary(entry("dashboard/tests", 5, "case"));
  const both = summary(
    entry("dashboard/tests", 7, "case"),
    entry("tests", 1, "file"),
  );
  assert.equal(
    overallCountsWords(casesOnly, both),
    "5 → 7 test cases (+2); — → 1 test file",
  );
  assert.deepEqual(overallCountsCue(casesOnly, both), {
    kind: "border",
    direction: "more",
    strength: "light",
  });
});

// An entry at PATH holding EVIDENCE.
const holding = (path, ...evidence) =>
  makeMe.aCiProofEntry
    .at(path)
    .holding(...evidence)
    .please();
const counted = (unit, passed) =>
  makeMe.aCiProofEvidence.inUnit(unit).counting(passed).please();
test("Baseline's five test cases and one test file against seven test cases and one test file overall show +2 test cases and no change in test files (example 39)", () => {
  const landed = summary(
    holding("dashboard/tests", counted("case", 7), counted("file", 1)),
  );
  const baseline = summary(
    holding("dashboard/tests", counted("case", 5), counted("file", 1)),
  );
  assert.equal(
    overallCountsWords(baseline, landed),
    "5 → 7 test cases (+2); 1 test file (no change)",
  );
  assert.deepEqual(overallCountsCue(baseline, landed), {
    kind: "border",
    direction: "more",
    strength: "light",
  });
});

test("the overall difference adds only results both builds report for an entry in one declared unit, or of an entry only one build declares; an entry's other units are totalled apart, never as a zero", () => {
  const baseline = summary(
    holding("a", counted("case", 5)),
    holding("b", counted("file", 3)),
    holding("c", counted("case", 4)),
  );
  const landed = summary(
    // a gains two test cases; b switched publishers; c starts reporting its
    // test file beside its test cases; d is a new entry.
    holding("a", counted("case", 7)),
    holding("b", counted("case", 3)),
    holding("c", counted("case", 4), counted("file", 1)),
    holding("d", counted("file", 2)),
  );
  assert.equal(
    overallCountsWords(baseline, landed),
    "9 → 11 test cases (+2); — → 2 test files; 3 test files → 3 test cases and 1 test file (different units)",
  );
  const filesStart = summary(holding("c", counted("case", 4)));
  const filesNow = summary(
    holding("c", counted("case", 4), counted("file", 1)),
  );
  assert.equal(
    overallCountsWords(filesStart, filesNow),
    "4 test cases (no change); — → 1 test file",
  );
});

test("a location that switches wholly from files to cases gives both totals without a difference or cue", () => {
  const before = summary(entry("tests", 5, "file"));
  const after = summary(entry("tests", 9, "case"));
  assert.equal(
    overallCountsWords(before, after),
    "5 test files → 9 test cases (different units)",
  );
  assert.deepEqual(overallCountsCue(before, after), {
    kind: "none",
    reason: "no overall count",
  });
});
