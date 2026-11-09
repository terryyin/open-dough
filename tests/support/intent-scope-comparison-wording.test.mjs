// Counts and signed timing words for Intent's shared CI comparison
// (../../dashboard/src/ciScopeComparisonCounts.ts,
// ../../dashboard/src/ciProofTimeWords.ts,
// ../../dashboard/src/storyCiComparisonWording.ts): count cells, the
// percentage rule for measured non-zero baselines, and the overall sum with
// units kept apart. Browser journeys:
// ../../dashboard/tests/intent/intent-ci-comparison*.spec.ts.
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  countsCellText,
  measuredCountsChangeWords,
} from "../../dashboard/src/ciScopeComparisonCounts.ts";
import { overallCountsWords } from "../../dashboard/src/storyCiComparisonCountsWords.ts";
import { scopeComparisonCellsOf } from "../../dashboard/src/ciScopeComparison.ts";
import { makeMe } from "./makeMe.mjs";

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

test("overall counts keep tests and checks apart and say partial when a side is missing", () => {
  const baseline = {
    kind: "summary",
    entries: [
      makeMe.aCiProofEntry.at("dashboard/tests").counting(1098).please(),
      makeMe.aCiProofEntry.at("tests").counting(982).please(),
      makeMe.aCiProofEntry.at("scripts").counting(492, "checks").please(),
    ],
  };
  const landed = {
    kind: "summary",
    entries: [
      makeMe.aCiProofEntry.at("dashboard/tests").counting(1100).please(),
      makeMe.aCiProofEntry.at("tests").counting(982).please(),
      makeMe.aCiProofEntry.at("scripts").counting(492, "checks").please(),
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

test("every compared scope carries precise signed timing and its comparable values, while added and gaps keep their meaning", () => {
  const summary = (...entries) => ({ kind: "summary", entries });
  const timed = (path, ms) => makeMe.aCiProofEntry.at(path).timed(ms).please();
  const before = summary(timed("s/file", 340), timed("s/zero", 0));
  const after = summary(
    timed("s/file", 410),
    timed("s/zero", 70),
    timed("s/added", 410),
  );
  const cells = (path, precision = "precise") =>
    scopeComparisonCellsOf(path, before, after, after, precision);
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
    scopeComparisonCellsOf(
      "s/file",
      before,
      { kind: "unavailable", line: "Proof expired" },
      { kind: "no-build", explanation: "Build is still running." },
      "precise",
    ).branch,
    { text: "Proof expired" },
  );
  const absent = cells("s/absent");
  assert.deepEqual(absent.branch, { text: "not in the compared builds" });
});
