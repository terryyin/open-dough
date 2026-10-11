// A wait GitHub directed suspends the observer's acquisition: reported once,
// outside the three-error loss path, and inside the observation budget.
import assert from "node:assert/strict";
import { test } from "node:test";
import { GitHubAcquisitionHeld } from "./ci-github-actions.mjs";
import { githubApi } from "./github-actions-api-test-fixtures.mjs";
import { run } from "./watch-ci-test-fixtures.mjs";
import { watchCiExecution } from "./watch-ci-execution.mjs";

const failedJob = { databaseId: 101, name: "Backend", conclusion: "failure" };

test("waits GitHub directed are not observation errors and are reported once per suspension", async () => {
  const controller = new AbortController();
  const events = [];
  const pauses = [];
  const listings = [
    new Error("provider outage"),
    new Error("provider outage"),
    new GitHubAcquisitionHeld(40),
    new GitHubAcquisitionHeld(7),
    new GitHubAcquisitionHeld(7),
    [],
    new GitHubAcquisitionHeld(5),
    [],
  ];

  await watchCiExecution({
    repo: "example/example",
    branch: "main",
    signal: controller.signal,
    now: () => Date.parse("2026-09-05T12:00:00Z"),
    emit: (event) => events.push(event),
    // Every poll has a registration waiting: it cannot shorten a suspension.
    armRegistrationWake: () => AbortSignal.abort(),
    sleep: async (milliseconds, ...[, { signal }]) => {
      pauses.push({ milliseconds, aborted: signal.aborted });
      if (!listings.length) controller.abort();
    },
    gh: githubApi(({ kind }) => {
      assert.equal(kind, "runs");
      const listing = listings.shift();
      if (listing instanceof Error) throw listing;
      return listing;
    }),
  });

  assert.deepEqual(events, [
    {
      type: "CI_MONITOR_THROTTLED",
      repo: "example/example",
      branch: "main",
      workflow: "ci.yml",
      waitSeconds: 40,
      resumesAt: "2026-09-05T12:00:40.000Z",
    },
    {
      type: "CI_MONITOR_THROTTLED",
      repo: "example/example",
      branch: "main",
      workflow: "ci.yml",
      waitSeconds: 5,
      resumesAt: "2026-09-05T12:00:05.000Z",
    },
  ]);
  assert.deepEqual(pauses, [
    { milliseconds: 30_000, aborted: false },
    { milliseconds: 30_000, aborted: false },
    { milliseconds: 40_000, aborted: false },
    { milliseconds: 7_000, aborted: false },
    { milliseconds: 7_000, aborted: false },
    // A completed poll's pause is the one a registration ends at once.
    { milliseconds: 30_000, aborted: true },
    { milliseconds: 5_000, aborted: false },
    { milliseconds: 30_000, aborted: true },
  ]);
});

test("a wait met while inspecting a failure delivers that failure once, with its jobs, after the wait", async () => {
  const controller = new AbortController();
  const events = [];
  const pauses = [];
  let jobInspections = 0;

  await watchCiExecution({
    repo: "example/example",
    branch: "main",
    signal: controller.signal,
    emit: (event) => events.push(event),
    sleep: async (milliseconds) => {
      pauses.push(milliseconds);
      if (pauses.length === 3) controller.abort();
    },
    gh: githubApi(({ kind }) => {
      if (kind === "runs") return [run({ conclusion: "failure" })];
      jobInspections += 1;
      if (jobInspections === 1) throw new GitHubAcquisitionHeld(12);
      return { jobs: [failedJob] };
    }),
  });

  assert.deepEqual(
    events.map(({ type, detailsUnavailable, failedJobs }) => ({
      type,
      detailsUnavailable,
      failedJobs,
    })),
    [
      {
        type: "CI_MONITOR_THROTTLED",
        detailsUnavailable: undefined,
        failedJobs: undefined,
      },
      {
        type: "CI_FAILURE",
        detailsUnavailable: undefined,
        failedJobs: [{ jobId: 101, name: "Backend", conclusion: "failure" }],
      },
    ],
  );
  assert.deepEqual(pauses, [12_000, 30_000, 30_000]);
  assert.equal(jobInspections, 2);
});

test("a wait longer than the observation budget ends at the budget, whose expiry stays visible", async () => {
  const events = [];
  const pauses = [];
  let elapsed = 0;

  await watchCiExecution({
    repo: "example/example",
    branch: "main",
    maxDurationMs: 60_000,
    now: () => elapsed,
    emit: (event) => events.push(event),
    sleep: async (milliseconds) => {
      pauses.push(milliseconds);
      elapsed += milliseconds;
    },
    gh: githubApi(() => {
      elapsed += 1_000;
      throw new GitHubAcquisitionHeld(3600);
    }),
  });

  assert.deepEqual(pauses, [59_000]);
  assert.deepEqual(
    events.map(({ type, waitSeconds, reason }) => ({
      type,
      waitSeconds,
      reason,
    })),
    [
      { type: "CI_MONITOR_THROTTLED", waitSeconds: 3600, reason: undefined },
      {
        type: "CI_MONITOR_UNAVAILABLE",
        waitSeconds: undefined,
        reason: "Execution observation budget expired after 60000 ms.",
      },
    ],
  );
});
