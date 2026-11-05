// Shared construction for the CI proof collector's tests: a GitHub Actions
// run attempt, a CI adapter's attempt, a valid fragment of the run attempt,
// and a dashboard proof record with chosen outcomes.

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

export function playwrightRecord(outcomes, phase = "completed") {
  return {
    schemaVersion: 1,
    phase,
    selectedCount: outcomes.length,
    tests: outcomes.map((outcome, index) => ({
      titlePath: [`test ${index}`],
      executions:
        outcome === undefined
          ? [{ testId: `t${index}` }]
          : [{ testId: `t${index}`, outcome }],
      attempts: [],
    })),
  };
}
