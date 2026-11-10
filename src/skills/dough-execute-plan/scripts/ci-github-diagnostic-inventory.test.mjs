// The diagnostic CLI's failed-test inventory: every failed job's whole log is
// scanned for failure lines in known formats, and each gap that keeps the
// inventory from being complete is named instead of passing as complete.
import assert from "node:assert/strict";
import { test } from "node:test";
import { diagnoseFailedAttempt } from "./ci-github-diagnostic.mjs";
import {
  completedJob as job,
  completedJobs,
  instrumentedGithubFixture,
  observedCompletedJob,
  startInstalledScript,
} from "./ci-github-test-fixtures.mjs";
const run = (github) =>
  startInstalledScript(github, "ci-github-diagnostic.mjs", [
    "failure",
    "owner/repo",
    "42",
    "2",
  ]);
const stamped = (line) => `2026-09-05T10:00:00.0000000Z ${line}`;

// A quiet reporter prints each failure as it happens, long before the exit
// marker GitHub excerpts around.
const reporterLog = (early, later) =>
  [
    stamped("> npm run test"),
    stamped(`FAIL: ${early} (failed)`),
    stamped("  Error: expect(received).toBe(expected)"),
    ...Array.from(Array(120).keys(), (index) => stamped(`detail ${index}`)),
    stamped("FAIL: tests/node-check.test.mjs"),
    stamped("not ok: suite > keeps its promise"),
    stamped("  at tests/node-check.test.mjs:12:3"),
    stamped("    AssertionError [ERR_ASSERTION]: Expected values to be equal"),
    stamped(`\u001B[31m✘\u001B[0m  ${later}`),
    stamped("##[error]Process completed with exit code 1."),
  ].join("\n");

test("the inventory names an early failure, a later one and every job's beyond the excerpted ten", async (t) => {
  const failed = Array.from(Array(12).keys());
  const answers = Object.fromEntries(
    failed.map((index) => [
      `jobs/${1000 + index}/logs`,
      {
        head: "HTTP/2.0 200 OK",
        body: reporterLog(
          `dashboard/tests/early-${index}.spec.ts:7 › opens`,
          `[chromium] › dashboard/tests/later-${index}.spec.ts:9:3 › closes`,
        ),
      },
    ]),
  );
  const github = instrumentedGithubFixture(t, {
    jobs: completedJobs(failed),
    answers,
  });
  const diagnostic = run(github);
  assert.equal(await diagnostic.exited, 0, diagnostic.stderr());
  const answer = JSON.parse(diagnostic.stdout());

  assert.deepEqual(answer.inventory, {
    complete: true,
    failedJobs: 12,
    gaps: [],
  });
  assert.equal(answer.failedJobs.length, 12);
  for (const [index, job] of answer.failedJobs.entries())
    assert.deepEqual(job.failures, [
      {
        kind: "test",
        line: `FAIL: dashboard/tests/early-${index}.spec.ts:7 › opens (failed)`,
      },
      { kind: "test", line: "FAIL: tests/node-check.test.mjs" },
      {
        kind: "test",
        line: "not ok: suite > keeps its promise at tests/node-check.test.mjs:12:3",
      },
      {
        kind: "test",
        line: `✘  [chromium] › dashboard/tests/later-${index}.spec.ts:9:3 › closes`,
      },
    ]);
  // The excerpt stays bounded around the exit marker: the early failure is
  // only in the inventory, and the jobs past ten carry no excerpt.
  const [first] = answer.failedJobs;
  assert.ok(first.log.lines.length <= 24);
  assert.equal(
    first.log.lines.some((line) => line.includes("early-0")),
    false,
  );
  assert.deepEqual(
    answer.failedJobs.map(({ excerptOmitted }) => excerptOmitted === true),
    [...Array(10).fill(false), true, true],
  );
  assert.ok(diagnostic.stdout().length < 60_000);
});

const npmSetupLog = [
  "npm error code ETIMEDOUT",
  "npm error network request to https://registry.npmjs.org/x failed",
  "##[error]Process completed with exit code 1.",
].join("\n");
const assertionLog = [
  "FAIL: tests/sibling.test.mjs",
  "not ok: sibling > asserts its result",
  "  at tests/sibling.test.mjs:4:1",
  "##[error]Process completed with exit code 1.",
].join("\n");
const running = (index) => ({
  ...job(index),
  status: "in_progress",
  conclusion: null,
});

test("an npm setup failure beside a later sibling's assertion is not an infrastructure-only inventory, even while the sibling still runs", async (t) => {
  const github = instrumentedGithubFixture(t, {
    jobs: [job(0), running(1)],
    answers: {
      "jobs/1000/logs": { head: "HTTP/2.0 200 OK", body: npmSetupLog },
      "jobs/1001/logs": { head: "HTTP/2.0 200 OK", body: assertionLog },
    },
  });

  // The setup job failed first; its sibling has not finished.
  const early = run(github);
  assert.equal(await early.exited, 0, early.stderr());
  const changing = JSON.parse(early.stdout());
  assert.deepEqual(
    changing.failedJobs.map(({ jobId, failures }) => [jobId, failures]),
    [
      [
        1000,
        [
          { kind: "npm", line: "npm error code ETIMEDOUT" },
          {
            kind: "npm",
            line: "npm error network request to https://registry.npmjs.org/x failed",
          },
        ],
      ],
    ],
  );
  assert.deepEqual(changing.inventory, {
    complete: false,
    failedJobs: 1,
    gaps: [
      { jobId: 1000, name: "job 0", reason: "no-test-identity" },
      {
        reason: "attempt-unfinished",
        jobs: [{ jobId: 1001, name: "job 1", status: "in_progress" }],
      },
    ],
  });

  // Once the sibling fails, its assertion is in the inventory.
  github.set({
    jobs: [job(0), job(1)],
    answers: {
      "jobs/1000/logs": { head: "HTTP/2.0 200 OK", body: npmSetupLog },
      "jobs/1001/logs": { head: "HTTP/2.0 200 OK", body: assertionLog },
    },
  });
  const settled = run(github);
  assert.equal(await settled.exited, 0, settled.stderr());
  const answer = JSON.parse(settled.stdout());
  assert.deepEqual(answer.failedJobs[1].failures, [
    { kind: "test", line: "FAIL: tests/sibling.test.mjs" },
    {
      kind: "test",
      line: "not ok: sibling > asserts its result at tests/sibling.test.mjs:4:1",
    },
  ]);
  assert.deepEqual(answer.inventory, {
    complete: false,
    failedJobs: 2,
    gaps: [{ jobId: 1000, name: "job 0", reason: "no-test-identity" }],
  });
});

test("failure lines past each job's bound are counted, not dropped silently", async () => {
  const many = Array.from(
    Array(60).keys(),
    (index) => `not ok: case ${index}`,
  ).join("\n");
  const diagnostic = await diagnoseFailedAttempt({
    repo: "owner/repo",
    runId: 42,
    attempt: 2,
    github: {
      attemptJobs: async () => [observedCompletedJob(0)],
      jobLog: async () => many,
    },
  });
  const [only] = diagnostic.failedJobs;
  assert.equal(only.failures.length, 40);
  assert.equal(only.failures[0].line, "not ok: case 0");
  assert.equal(only.failuresOmitted, 20);
  assert.deepEqual(diagnostic.inventory.gaps, [
    { jobId: 1000, name: "job 0", reason: "failures-omitted" },
  ]);
});
