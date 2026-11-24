// Adapter job graphs and comparison-slot deadline → time without runner waits.
import { expect, test } from "vitest";
import { answeredCommandAttempts } from "../../../Distribution/src/skills/dough-execute-plan/scripts/ci-command-attempts.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { adapterRevisionLookup } from "../../server/baseCiAdapterRevisionLookup.ts";
import { nearestRevisionBuild } from "../../server/baseCiRevisionNearest.ts";
import { timeWithoutAdapterRunnerWaits } from "../../server/ciTimeWithoutRunnerWaits.ts";
import { asComparisonSlot } from "../../server/intentCiComparisonSlots.ts";
import { asSlot } from "../../server/revisionBuildSlot.ts";
import { repoRoot } from "../../test-support/support/repositoryRoot.ts";

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
  const source = makeMe.aPublishedSource
    .with({
      id: "owner-repo",
      label: "Owner Repo",
      repository: "owner/repo",
      ref: attempt.branch,
    })
    .please();
  const controller = new AbortController();
  const { signal } = controller;
  const abortAsError = (reason: unknown) =>
    reason instanceof Error ? reason : new Error("aborted");
  const lookup = await adapterRevisionLookup(
    source,
    undefined,
    repoRoot,
    ["adapter"],
    { signal, maxBuffer: 1024 * 1024 },
    signal,
    {
      discover: ({ branch }: { branch: string }) =>
        Promise.resolve({
          attempts: answeredCommandAttempts([attempt], branch) as unknown[],
          queue: undefined,
        }),
      jobs: async (
        ...[, , , { signal: wait }]: [
          unknown,
          unknown,
          unknown,
          { readonly signal: AbortSignal },
        ]
      ) => {
        if (wait.aborted) throw abortAsError(wait.reason);
        await new Promise<void>((resolve) => {
          wait.addEventListener(
            "abort",
            () => {
              resolve();
            },
            { once: true },
          );
        });
        throw abortAsError(wait.reason);
      },
    },
  );
  const build = await nearestRevisionBuild([sha], lookup);
  const slot = asSlot(build, "No build");
  expect(slot.kind).toBe("build");

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
