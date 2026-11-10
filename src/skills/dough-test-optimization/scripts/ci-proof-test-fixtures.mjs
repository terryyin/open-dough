// CI proof test harness facts and input projections. Domain construction
// delegates to the shared MakeMe builders; collector reads retain source names.
import { makeMe } from "../../../../tests/support/makeMe.mjs";

export const revision = "a5b0489dd0000000000000000000000000000000";
export const run = {
  repository: "owner/repo",
  runId: 41776408979,
  attempt: 2,
  revision,
};

export const attemptId = "9f1c2d3e-0000-4000-8000-000000000001";
export const adapterRun = { repository: "O/P", attemptId, revision };

// The fragments VALUES as the collector reads them, named fragment-0.json
// onward.
export const fragmentsRead = (...values) =>
  values.map((value, index) => ({ source: `fragment-${index}.json`, value }));

// The status of each of EVIDENCE's parts, in order.
export const partStatuses = (evidence) =>
  evidence.parts.map((part) => part.status);

// OUTCOMES are per-test Playwright outcomes. Optional DURATIONS are parallel
// per-test attempt durationMs values: a number for one finished attempt, or an
// array of numbers when retries are included.
export function playwrightRecord(
  outcomes,
  phase = "completed",
  durations = [],
) {
  const record = makeMe.aDashboardProofRecord.inPhase(phase);
  outcomes.forEach((outcome, index) => {
    const duration = durations[index];
    record.withTest(
      undefined,
      outcome,
      Array.isArray(duration)
        ? duration
        : duration === undefined
          ? []
          : [duration],
    );
  });
  return record.please();
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
export const locatedRecord = (cwd, tests) => {
  const record = makeMe.aDashboardProofRecord.from(cwd);
  for (const [file, outcome, durations] of tests)
    record.withTest(file, outcome, durations);
  return record.please();
};
