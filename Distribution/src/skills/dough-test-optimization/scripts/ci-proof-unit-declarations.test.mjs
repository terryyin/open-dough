// Declarations of CI proof units (ci-proof-collect.mjs): a declaration with
// a unit takes only that unit's fragments; one without takes its entry's
// fragments in the one unit they report, as before units were declared, and
// counts none when they report two. A fragment no declaration takes is
// excluded with a note, never relabelled, and each entry and unit is
// declared once. Explicit units kept apart: ci-proof-units.test.mjs.
import { makeMe } from "../../../../tests/support/makeMe.mjs";
import assert from "node:assert/strict";
import test from "node:test";
import { describeSummary, summarize } from "./ci-proof-collect.mjs";
import { summaryProblems } from "./ci-proof-contract.mjs";
import {
  fragmentFromPlaywrightRecord,
  fragmentsFromOutcomes,
} from "./ci-proof-fragments.mjs";
import {
  byFile,
  fragmentsRead as read,
  locatedRecord,
  partIdentity,
  partStatuses as statuses,
  run,
  revision,
} from "./ci-proof-test-fixtures.mjs";

const cwd = "/runner/project";

test("a declaration without a unit takes its entry's fragments in the one unit they report, as before units were declared: Playwright test cases, legacy outcomes keeping their checks label, and no unit when none arrived", () => {
  const playwright = fragmentFromPlaywrightRecord(
    locatedRecord(cwd, [[`${cwd}/dashboard/tests/a.spec.ts`, "expected", [9]]]),
    partIdentity(["dashboard/tests"]),
    byFile,
  );
  // An outcomes report under a path a Playwright run would use, without a
  // declared unit: legacy, never read as test cases from its path.
  const outcomes = fragmentsFromOutcomes(
    "passed\tdashboard/backend-tests/a.spec.ts\nfailed\ttests/a.sh\n",
    partIdentity(["dashboard/backend-tests", "tests"]),
    undefined,
    byFile,
  );
  const { summary, notes } = summarize({
    fragments: read(...playwright, ...outcomes),
    expect: [
      { entry: "dashboard/tests", parts: 1 },
      { entry: "dashboard/backend-tests", parts: 1 },
      { entry: "tests", parts: 1 },
      { entry: "Distribution/src/skills", parts: 1 },
    ],
    run,
  });
  assert.deepEqual(notes, []);
  assert.deepEqual(summaryProblems(summary), []);
  assert.deepEqual(
    summary.entries.map(({ path, evidence: [only] }) => [
      path,
      only.unit,
      only.label,
      only.passed + only.failed + only.other,
    ]),
    [
      ["dashboard/tests", "case", undefined, 1],
      ["dashboard/backend-tests", "legacy", "checks", 1],
      ["tests", "legacy", "checks", 1],
      ["Distribution/src/skills", "legacy", null, 0],
    ],
  );
  assert.deepEqual(describeSummary(summary), [
    "dashboard/tests: 1 passed, 0 failed, 0 other test cases",
    "dashboard/backend-tests: 1 passed, 0 failed, 0 other legacy test results (checks)",
    "tests: 0 passed, 1 failed, 0 other legacy test results (checks)",
    "Distribution/src/skills: 0 passed, 0 failed, 0 other legacy test results; part 1 of 1 missing",
  ]);
});

test("a fragment no declaration of its unit takes is excluded with a note, never relabelled, and a declaration without a unit whose fragments report two units counts neither", () => {
  const legacy = makeMe.aCiProofFragment
    .at("tests")
    .part(1, 1)
    .ofAttempt(run.attempt, revision)
    .legacy("checks")
    .counting(4);
  const { summary, notes } = summarize({
    fragments: read(
      legacy.please(),
      makeMe.aCiProofFragment
        .at("tests")
        .part(1, 1)
        .ofAttempt(run.attempt, revision)
        .inUnit("case")
        .counting(3)
        .please(),
      makeMe.aCiProofFragment
        .at("tests")
        .part(1, 2)
        .ofAttempt(run.attempt, revision)
        .inUnit("file")
        .counting(2)
        .please(),
      makeMe.aCiProofFragment
        .at("Distribution/src/skills")
        .part(1, 2)
        .ofAttempt(run.attempt, revision)
        .inUnit("case")
        .counting(7)
        .please(),
      makeMe.aCiProofFragment
        .at("Distribution/src/skills")
        .part(2, 2)
        .ofAttempt(run.attempt, revision)
        .legacy("checks")
        .counting(1)
        .please(),
    ),
    expect: [
      { entry: "tests", parts: 3, unit: "file" },
      { entry: "Distribution/src/skills", parts: 2 },
    ],
    run,
  });
  assert.deepEqual(notes, [
    "excluded fragment-0.json: entry tests declares no parts for legacy test results (checks)",
    "excluded fragment-1.json: entry tests declares no parts for test cases",
    "excluded fragment-2.json: of 2, but tests declares 3 parts for test files",
    "entry Distribution/src/skills declares its 2 parts without a unit, but its fragments report test cases and legacy test results (checks), so none is counted",
  ]);
  assert.deepEqual(summaryProblems(summary), []);
  const [[tests], [skills]] = summary.entries.map(({ evidence }) => evidence);
  assert.deepEqual(
    [tests.unit, tests.passed, statuses(tests)],
    ["file", 0, ["missing", "missing", "missing"]],
  );
  assert.deepEqual(
    [skills.unit, skills.label, skills.passed, statuses(skills)],
    ["legacy", null, 0, ["ambiguous", "ambiguous"]],
  );
});

test("each entry and unit is declared once", () => {
  assert.throws(
    () =>
      summarize({
        fragments: [],
        expect: [
          { entry: "tests", parts: 1, unit: "file" },
          { entry: "tests", parts: 2, unit: "file" },
        ],
        run,
      }),
    /^Error: entry tests is declared twice for test files$/,
  );
  assert.throws(
    () =>
      summarize({
        fragments: [],
        expect: [
          { entry: "tests", parts: 1 },
          { entry: "tests", parts: 1 },
        ],
        run,
      }),
    /^Error: entry tests is declared twice$/,
  );
});
