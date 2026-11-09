// Units CI proof results are counted in (ci-proof-evidence.mjs, "Units"):
// converters say what a report establishes or its publisher declares, and
// the collector keeps one location's test cases and test files apart, each
// with its own outcomes, time and parts, never relabelling or adding them.
// Declarations: ci-proof-unit-declarations.test.mjs; legacy results:
// ci-proof-legacy-results.test.mjs; command line: ci-proof-units-cli.test.mjs.
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
} from "./ci-proof-test-fixtures.mjs";

const cwd = "/runner/project";

test("a Playwright spec's five cases and a Node file's one aggregate outcome for the same path stay five test cases and one test file, never six results (example 36)", () => {
  const spec = `${cwd}/tests/check.test.mjs`;
  const [cases] = fragmentFromPlaywrightRecord(
    locatedRecord(cwd, [
      [spec, "expected", [10]],
      [spec, "expected", [20]],
      [spec, "expected", [30]],
      [spec, "expected", [40]],
      [spec, "expected", [50]],
    ]),
    partIdentity(["tests"]),
    byFile,
  );
  const [file] = fragmentsFromOutcomes(
    "passed\ttests/check.test.mjs\n",
    partIdentity(["tests"]),
    "0.4\ttests/check.test.mjs\n",
    { ...byFile, unit: "file" },
  );
  assert.deepEqual([cases.unit, file.unit], ["case", "file"]);
  const { summary, notes } = summarize({
    fragments: read(cases, file),
    expect: [
      { entry: "tests", parts: 1, unit: "case" },
      { entry: "tests", parts: 1, unit: "file" },
    ],
    run,
  });
  assert.deepEqual(notes, []);
  assert.deepEqual(summaryProblems(summary), []);
  const [entry] = summary.entries;
  assert.equal(summary.entries.length, 1);
  // No figure stands for the location as a whole.
  assert.deepEqual(Object.keys(entry), ["path", "evidence"]);
  assert.deepEqual(
    entry.evidence.map(
      ({ unit, passed, failed, other, durationMs, files }) => ({
        unit,
        counted: passed + failed + other,
        durationMs,
        files,
      }),
    ),
    [
      {
        unit: "case",
        counted: 5,
        durationMs: 150,
        files: [
          {
            path: "tests/check.test.mjs",
            passed: 5,
            failed: 0,
            other: 0,
            durationMs: 150,
          },
        ],
      },
      {
        unit: "file",
        counted: 1,
        durationMs: 400,
        files: [
          {
            path: "tests/check.test.mjs",
            passed: 1,
            failed: 0,
            other: 0,
            durationMs: 400,
          },
        ],
      },
    ],
  );
});

test("a failed file without case results stays a failed test file; each unit keeps its own outcomes, time, untimed results, missing and ambiguous parts (examples 37, 40)", () => {
  const spec = `${cwd}/tests/folder/a.spec.ts`;
  const caseRecord = (durations) =>
    locatedRecord(
      cwd,
      durations.map((duration) => [spec, "expected", duration]),
    );
  const firstCases = fragmentFromPlaywrightRecord(
    caseRecord([[100], [200], [300], [400], []]),
    partIdentity(["tests"], 1, 2),
    byFile,
  );
  // Part 2 of the cases reported twice: ambiguous, counted by neither.
  const repeated = [[[5]], [[6]]].map(
    (durations) =>
      fragmentFromPlaywrightRecord(
        caseRecord(durations),
        partIdentity(["tests"], 2, 2),
        byFile,
      )[0],
  );
  // The failed file's own outcome, with its time; it reported no cases.
  const [failedFile] = fragmentsFromOutcomes(
    "failed\ttests/folder/b.test.mjs\n",
    partIdentity(["tests"], 1, 2),
    "0.3\ttests/folder/b.test.mjs\n",
    { ...byFile, unit: "file" },
  );
  const { summary, notes } = summarize({
    fragments: read(...firstCases, ...repeated, failedFile),
    expect: [
      { entry: "tests", parts: 2, unit: "case" },
      { entry: "tests", parts: 2, unit: "file" },
    ],
    run,
  });
  assert.deepEqual(notes, []);
  assert.deepEqual(summaryProblems(summary), []);
  const [cases, files] = summary.entries[0].evidence;
  assert.deepEqual(
    {
      unit: cases.unit,
      counts: [cases.passed, cases.failed, cases.other],
      durationMs: cases.durationMs,
      untimed: cases.untimed,
      parts: statuses(cases),
      paths: cases.files.map((file) => file.path),
    },
    {
      unit: "case",
      counts: [5, 0, 0],
      durationMs: 1000,
      untimed: 1,
      parts: ["present", "ambiguous"],
      paths: ["tests/folder/a.spec.ts"],
    },
  );
  assert.deepEqual(
    {
      unit: files.unit,
      counts: [files.passed, files.failed, files.other],
      durationMs: files.durationMs,
      untimed: files.untimed,
      parts: statuses(files),
      paths: files.files.map((file) => file.path),
    },
    {
      unit: "file",
      counts: [0, 1, 0],
      durationMs: 300,
      untimed: 0,
      // No file fragment arrived for part 2: missing in test files alone.
      parts: ["present", "missing"],
      paths: ["tests/folder/b.test.mjs"],
    },
  );
  assert.deepEqual(describeSummary(summary), [
    "tests: 5 passed, 0 failed, 0 other test cases; part 2 of 2 ambiguous",
    "tests: 0 passed, 1 failed, 0 other test files; part 2 of 2 missing",
  ]);
});
