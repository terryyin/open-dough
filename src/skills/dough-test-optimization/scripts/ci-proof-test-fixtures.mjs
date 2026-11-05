// Shared construction for the CI proof collector's tests: a GitHub Actions
// run attempt, a CI adapter's attempt, a valid fragment of the run attempt,
// a dashboard proof record with chosen outcomes, and one whose tests name
// their files.

export const revision = "a5b0489dd0000000000000000000000000000000";
export const run = {
  repository: "owner/repo",
  runId: 41776408979,
  attempt: 2,
  revision,
};

export const attemptId = "9f1c2d3e-0000-4000-8000-000000000001";
export const adapterRun = { repository: "O/P", attemptId, revision };

export function fragment(entry, part, of, counts, overrides = {}) {
  return {
    schemaVersion: 1,
    entry,
    part,
    of,
    attempt: run.attempt,
    revision,
    unit: entry === "dashboard/tests" ? "tests" : "checks",
    passed: 0,
    failed: 0,
    other: 0,
    ...counts,
    ...overrides,
  };
}

// OUTCOMES are per-test Playwright outcomes. Optional DURATIONS are parallel
// per-test attempt durationMs values: a number for one finished attempt, or an
// array of numbers when retries are included.
export function playwrightRecord(
  outcomes,
  phase = "completed",
  durations = [],
) {
  return {
    schemaVersion: 1,
    phase,
    selectedCount: outcomes.length,
    tests: outcomes.map((outcome, index) => {
      const duration = durations[index];
      const attemptDurations = Array.isArray(duration)
        ? duration
        : duration === undefined
          ? []
          : [duration];
      return {
        titlePath: [`test ${index}`],
        executions:
          outcome === undefined
            ? [{ testId: `t${index}` }]
            : [{ testId: `t${index}`, outcome }],
        attempts: attemptDurations.map((durationMs, retry) => ({
          testId: `t${index}`,
          retry,
          durationMs,
        })),
      };
    }),
  };
}

// One part of the run attempt proving ENTRIES.
export const partIdentity = (entries, part = 1, of = 1) => ({
  entries,
  part,
  of,
  attempt: run.attempt,
  revision,
});
// The converters' option to break fragments down by file.
export const byFile = { byFile: true };

// A completed dashboard proof record run from CWD whose tests name their
// files; each test is [file, outcome, durations].
export const locatedRecord = (cwd, tests) => ({
  schemaVersion: 1,
  phase: "completed",
  run: { cwd, rootDir: `${cwd}/dashboard/tests` },
  tests: tests.map(([file, outcome, durations = []], index) => ({
    ...(file === undefined ? {} : { location: { file, line: 1, column: 1 } }),
    titlePath: [`test ${index}`],
    executions: [{ testId: `t${index}`, outcome }],
    attempts: durations.map((durationMs, retry) => ({
      testId: `t${index}`,
      retry,
      ...(durationMs === undefined ? {} : { durationMs }),
    })),
  })),
});
