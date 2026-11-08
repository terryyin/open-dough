import { selectAdapterComparisonEndpoint } from "../../../tests/support/dashboardCiAdapterComparisonEndpoint.mjs";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { expect, test } from "../../tests/support/pageTest.ts";
import {
  timeWithoutAdapterRunnerWaits,
  timeWithoutRunnerWaits,
} from "../../server/ciTimeWithoutRunnerWaits.ts";
import { asComparisonSlot } from "../../server/intentCiComparisonSlots.ts";
import { comparisonWorkflow } from "../../tests/support/storyCiComparisonFixture.ts";
import {
  observedBaselineJobs,
  observedBranchJobs,
  observedRerunJobs,
} from "../../tests/support/storyCiObservedJobs.ts";

test("the adapter graph counts the longest chain regardless of job order", () => {
  const jobs = [
    makeMe.aCiTimingJob
      .withTiming({ id: "test-a", durationMs: 40_000, needs: ["build"] })
      .please(),
    makeMe.aCiTimingJob
      .withTiming({ id: "test-b", durationMs: 60_000, needs: ["build"] })
      .please(),
    makeMe.aCiTimingJob
      .withTiming({ id: "build", durationMs: 30_000 })
      .please(),
  ];

  expect(timeWithoutAdapterRunnerWaits(jobs)).toEqual({ milliseconds: 90_000 });
});

const testJob = makeMe.aCiTimingJob
  .withTiming({ id: "test", durationMs: 40_000 })
  .please();
const buildJob = makeMe.aCiTimingJob
  .withTiming({ id: "build", durationMs: 30_000 })
  .please();

for (const { name, jobs, reason } of [
  { name: "no jobs", jobs: [], reason: "The CI adapter reported no jobs." },
  {
    name: "a malformed job",
    jobs: [null],
    reason: "The CI adapter reported a job that is not an object.",
  },
  {
    name: "an empty ID",
    jobs: [{ ...testJob, id: "" }],
    reason: "The CI adapter reported a job without a nonempty ID.",
  },
  {
    name: "a duplicate ID",
    jobs: [testJob, testJob],
    reason: "The CI adapter reported duplicate job ID “test”.",
  },
  {
    name: "a missing duration",
    jobs: [{ id: testJob.id, needs: testJob.needs }],
    reason: "The CI adapter's job “test” has no numeric durationMs.",
  },
  {
    name: "a negative duration",
    jobs: [{ ...testJob, durationMs: -1 }],
    reason: "The CI adapter's job “test” has a negative durationMs.",
  },
  {
    name: "a non-finite duration",
    jobs: [{ ...testJob, durationMs: Infinity }],
    reason: "The CI adapter's job “test” has a non-finite durationMs.",
  },
  {
    name: "an invalid needs list",
    jobs: [{ ...testJob, needs: [3] }],
    reason: "The CI adapter's job “test” has an invalid needs list.",
  },
  {
    name: "an unknown dependency",
    jobs: [
      makeMe.aCiTimingJob
        .withTiming({ id: "test", durationMs: 40_000, needs: ["lint"] })
        .please(),
    ],
    reason: "The CI adapter's job “test” needs unknown job “lint”.",
  },
  {
    name: "a cycle",
    jobs: [
      makeMe.aCiTimingJob.withTiming({ ...testJob, needs: ["build"] }).please(),
      makeMe.aCiTimingJob.withTiming({ ...buildJob, needs: ["test"] }).please(),
    ],
    reason: "The CI adapter's job graph contains a dependency cycle.",
  },
  {
    name: "an overflowing chain duration",
    jobs: [
      makeMe.aCiTimingJob
        .withTiming({ id: "build", durationMs: Number.MAX_VALUE })
        .please(),
      makeMe.aCiTimingJob
        .withTiming({
          id: "test",
          durationMs: Number.MAX_VALUE,
          needs: ["build"],
        })
        .please(),
    ],
    reason: "The CI adapter's job chain duration exceeds the numeric limit.",
  },
]) {
  test(`an adapter graph with ${name} explains why timing is unavailable`, () => {
    expect(timeWithoutAdapterRunnerWaits(jobs)).toEqual({ reason });
  });
}

test("the comparison deadline during a job graph read keeps the selected build and its proof identity", async () => {
  const sha = "a".repeat(40);
  const attempt = makeMe.aCiAdapterAttempt
    .passed({
      sha,
      runId: "selected",
      attemptId: "retry",
      branch: "main",
      startedAt: "2026-11-05T09:00:00Z",
      completedAt: "2026-11-05T09:04:00Z",
    })
    .please();
  const controller = new AbortController();
  const { slot, lookup } = await selectAdapterComparisonEndpoint(
    attempt,
    "hold",
    controller.signal,
  );

  const pending = asComparisonSlot(slot, lookup);
  controller.abort(new DOMException("comparison deadline", "TimeoutError"));

  await expect(pending).resolves.toMatchObject({
    kind: "build",
    revision: sha,
    startedAt: "2026-11-05T09:00:00Z",
    completedAt: "2026-11-05T09:04:00Z",
    runBranch: "main",
    adapterAttempt: { runId: "selected", attemptId: "retry" },
    timeWithoutRunnerWaits: {
      reason:
        "The CI adapter did not answer the job graph read before the comparison deadline.",
    },
  });
});

test("the observed builds count the longest dependency chain despite different runner waits", () => {
  expect(
    timeWithoutRunnerWaits(comparisonWorkflow, observedBaselineJobs, false),
  ).toEqual({
    milliseconds: 295_000,
  });
  expect(
    timeWithoutRunnerWaits(comparisonWorkflow, observedBranchJobs, false),
  ).toEqual({
    milliseconds: 287_000,
  });
});

test("a re-run retains the durations of carried-over jobs even when they started before their reported creation", () => {
  expect(
    timeWithoutRunnerWaits(comparisonWorkflow, observedRerunJobs, false),
  ).toEqual({
    milliseconds: 312_000,
  });
  // Make a carried-over shard longer than the re-run shard. It finished
  // before the second attempt was created but can still own the longest chain.
  const withLongerCarryover = observedRerunJobs.map((job) =>
    job.name === "dashboard (3/12)"
      ? { ...job, completed_at: "2026-11-06T09:47:07Z" }
      : job,
  );
  expect(
    timeWithoutRunnerWaits(comparisonWorkflow, withLongerCarryover, false),
  ).toEqual({
    milliseconds: 337_000,
  });
});

const reportedJob = {
  name: "Build",
  started_at: "2026-11-07T07:00:00Z",
  completed_at: "2026-11-07T07:01:00Z",
};
const buildWorkflow = "jobs:\n  build:\n    name: Build\n";

test("a job with missing timing bounds leaves the estimate unavailable", () => {
  expect(
    timeWithoutRunnerWaits(
      buildWorkflow,
      [{ ...reportedJob, completed_at: null }],
      false,
    ),
  ).toEqual({ reason: "Job “Build” has no valid start and completion times." });
});

test("a reported job must match exactly one workflow definition", () => {
  expect(
    timeWithoutRunnerWaits(
      buildWorkflow,
      [{ ...reportedJob, name: "Unknown" }],
      false,
    ),
  ).toEqual({
    reason: "Job “Unknown” does not match a workflow job definition.",
  });
  expect(
    timeWithoutRunnerWaits(
      `${buildWorkflow}  another:\n    name: Build\n`,
      [reportedJob],
      false,
    ),
  ).toEqual({ reason: "Job “Build” has an ambiguous workflow job match." });
});
