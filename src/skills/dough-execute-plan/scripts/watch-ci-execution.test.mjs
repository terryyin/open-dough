import assert from "node:assert/strict";
import { test } from "node:test";
import {
  githubApi,
  scriptedGithub,
} from "./github-actions-api-test-fixtures.mjs";
import { run } from "./watch-ci-test-fixtures.mjs";
import { watchCiExecution } from "./watch-ci.mjs";

test("execution observation emits only new main push CI failures", async () => {
  const controller = new AbortController();
  const calls = [];
  const events = [];
  const responses = [
    new Error("temporary GitHub outage"),
    // Other workflows are excluded by the resolved workflow's own listing
    // (see ci-client-configuration.test.mjs); it never returns them.
    [
      run({ databaseId: 2, headBranch: "feature", conclusion: "failure" }),
      run({ databaseId: 3, event: "workflow_dispatch", conclusion: "failure" }),
      run({ databaseId: 4, status: "queued", conclusion: null }),
      run({ databaseId: 5 }),
      run({ databaseId: 6, conclusion: "failure" }),
    ],
    { jobs: [{ name: "Backend", conclusion: "failure" }] },
    [
      run({ databaseId: 6, conclusion: "failure" }),
      run({ databaseId: 7, conclusion: "timed_out" }),
    ],
    { status: "completed", conclusion: "success" },
    { jobs: [{ name: "Frontend", conclusion: "timed_out" }] },
  ];
  const sleeps = [];

  await watchCiExecution({
    repo: "example/example",
    branch: "main",
    signal: controller.signal,
    emit: (event) => events.push(event),
    sleep: async (milliseconds) => {
      sleeps.push(milliseconds);
      if (sleeps.length === 3) controller.abort();
    },
    gh: scriptedGithub(responses, calls),
  });

  assert.deepEqual(
    events.map(({ runId, conclusion, failedJobs }) => ({
      runId,
      conclusion,
      failedJobs,
    })),
    [
      {
        runId: 6,
        conclusion: "failure",
        failedJobs: [{ name: "Backend", conclusion: "failure" }],
      },
      {
        runId: 7,
        conclusion: "timed_out",
        failedJobs: [{ name: "Frontend", conclusion: "timed_out" }],
      },
    ],
  );
  assert.deepEqual(sleeps, [30_000, 30_000, 30_000]);
  assert.deepEqual(
    calls.map(({ kind }) => kind),
    ["workflow", "runs", "runs", "jobs", "runs", "run", "jobs"],
  );
  assert.deepEqual(calls[0], {
    kind: "workflow",
    repo: "example/example",
    workflow: "ci.yml",
  });
  assert.ok(
    calls
      .filter(({ kind }) => kind === "runs")
      .every(
        ({ commit, branch, event, page }) =>
          commit === undefined &&
          branch === "main" &&
          event === "push" &&
          page === 1,
      ),
  );
  assert.equal(responses.length, 0);
});

test("execution observation has one finite budget across all polls", async () => {
  let elapsed = 0;
  let polls = 0;

  await watchCiExecution({
    repo: "example/example",
    branch: "main",
    maxDurationMs: 60_000,
    now: () => elapsed,
    sleep: async (milliseconds) => {
      elapsed += milliseconds;
    },
    gh: githubApi(({ kind }) => {
      if (kind === "jobs") return { jobs: [] };
      if (kind !== "runs")
        return { status: "completed", conclusion: "success" };
      polls += 1;
      return [run({ databaseId: polls, status: "queued", conclusion: null })];
    }),
  });

  assert.equal(polls, 2);
});

test("retains unfinished runs discovered beyond the newest page", async () => {
  const controller = new AbortController();
  const calls = [];
  const events = [];
  const oldRun = run({
    databaseId: 21,
    headSha: "b".repeat(40),
    status: "in_progress",
    conclusion: null,
  });
  const externalRun = run({
    databaseId: 22,
    headSha: "c".repeat(40),
    status: "in_progress",
    conclusion: null,
  });
  const responses = [
    [
      // eslint-disable-next-line no-unused-vars -- Array.from supplies the value before the index.
      ...Array.from({ length: 20 }, (_, index) =>
        run({ databaseId: index + 1 }),
      ),
      oldRun,
    ],
    { jobs: [] },
    [],
    oldRun,
    { jobs: [] },
    [externalRun],
    oldRun,
    { jobs: [] },
    { jobs: [] },
    [{ ...externalRun, status: "completed", conclusion: "failure" }],
    oldRun,
    { jobs: [{ name: "External push", conclusion: "failure" }] },
    [],
    { ...oldRun, status: "completed", conclusion: "failure" },
    { jobs: [{ name: "Retained run", conclusion: "failure" }] },
  ];
  let elapsed = 0;

  await watchCiExecution({
    repo: "example/example",
    branch: "main",
    signal: controller.signal,
    maxDurationMs: 200_000,
    now: () => elapsed,
    emit: (event) => events.push(event),
    sleep: async (milliseconds) => {
      elapsed += milliseconds;
      if (events.length === 2) controller.abort();
    },
    gh: scriptedGithub(responses, calls),
  });

  assert.deepEqual(
    events.map(({ runId, sha }) => ({ runId, sha })),
    [
      { runId: 22, sha: "c".repeat(40) },
      { runId: 21, sha: "b".repeat(40) },
    ],
  );
  assert.equal(new Set(events.map(({ runId }) => runId)).size, 2);
  const listings = calls.filter(({ kind }) => kind === "runs");
  assert.equal(listings[0].created, "<=1970-01-01T00:00:00.000Z");
  assert.equal(listings[0].limit, 100);
  assert.ok(
    listings
      .slice(1)
      .every(({ created, limit }) => created === undefined && limit === 20),
  );
  assert.ok(calls.some(({ kind, runId }) => kind === "run" && runId === 21));
  assert.equal(elapsed, 150_000);
});
