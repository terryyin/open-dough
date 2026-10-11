// The diagnostic CLI's partial evidence contract against real subprocesses:
// missing logs retain safe causes and steps; held logs carry numeric waits.
import assert from "node:assert/strict";
import { test } from "node:test";
import { GitHubAcquisitionHeld } from "./ci-github-actions.mjs";
import { diagnoseFailedAttempt } from "./ci-github-diagnostic.mjs";
import {
  apiCall,
  completedJobs,
  instrumentedGithubFixture,
  startInstalledScript,
  until,
} from "./ci-github-test-fixtures.mjs";

const secret = "private-token-and-path-do-not-disclose";
const job = (index) => completedJobs([index])[index];
const run = (github) =>
  startInstalledScript(github, "ci-github-diagnostic.mjs", [
    "failure",
    "owner/repo",
    "42",
    "2",
  ]);
const steps = [{ number: 2, name: "Run tests", conclusion: "failure" }];
const excerpt = "##[error]expected true, got false";

for (const [cause, answer, message] of [
  [
    "expired 404",
    {
      head: "HTTP/2.0 404 Not Found",
      code: 1,
      body: secret,
      stderr: `gh: ${secret} (HTTP 404)`,
    },
    "HTTP 404",
  ],
  [
    "expired 410",
    {
      head: "HTTP/2.0 410 Gone",
      code: 1,
      body: secret,
      stderr: `gh: ${secret} (HTTP 410)`,
    },
    "HTTP 410",
  ],
  [
    "failed",
    {
      head: "",
      code: 1,
      body: secret,
      stderr: `${secret}: wait 999 seconds`,
    },
    "gh failed",
  ],
  [
    "oversized",
    {
      head: "HTTP/2.0 200 OK",
      body: secret + "x".repeat(17 * 1024 * 1024),
    },
    "gh output exceeded the request's size limit",
  ],
]) {
  test(
    `a ${cause} log retains steps and other excerpts without inventing a wait`,
    { timeout: 20_000 },
    async (t) => {
      const github = instrumentedGithubFixture(t, {
        jobs: [job(0), job(1)],
        log: excerpt,
        answers: { "jobs/1000/logs": answer },
      });
      const diagnostic = run(github);
      assert.equal(await diagnostic.exited, 0, diagnostic.stderr());
      const [missing, readable] = JSON.parse(diagnostic.stdout()).failedJobs;
      assert.equal(
        missing.logUnavailable,
        `GitHub request repos/owner/repo/actions/jobs/1000/logs failed: ${message}`,
      );
      assert.deepEqual(missing.failedSteps, steps);
      assert.equal(missing.log, undefined);
      assert.equal(Object.hasOwn(missing, "logWaitSeconds"), false);
      assert.deepEqual(readable.failedSteps, steps);
      assert.deepEqual(readable.log, { lines: [excerpt], omittedLines: 0 });
      assert.equal(readable.logUnavailable, undefined);
      assert.equal(diagnostic.stderr(), "");
      assert.equal(diagnostic.stdout().includes(secret), false);
      assert.ok(diagnostic.stdout().length < 2_000);
      assert.deepEqual(
        github.asked().sort(),
        [
          apiCall("runs/42/attempts/2/jobs?per_page=100&page=1"),
          apiCall("jobs/1000/logs"),
          apiCall("jobs/1001/logs"),
        ].sort(),
      );
    },
  );
}

test(
  "a held-only log exits 75 with its numeric wait and failed steps",
  { timeout: 20_000 },
  async (t) => {
    const github = instrumentedGithubFixture(t, { jobs: [job(0)] });
    github.limit(1, "/logs", 60);
    const diagnostic = run(github);
    assert.equal(await diagnostic.exited, 75, diagnostic.stderr());
    const [held] = JSON.parse(diagnostic.stdout()).failedJobs;
    assert.equal(held.logWaitSeconds, 60);
    assert.equal(
      held.logUnavailable,
      "GitHub directed a wait of 60 s before the next request",
    );
    assert.deepEqual(held.failedSteps, steps);
    assert.equal(held.log, undefined);
    assert.equal(diagnostic.stderr(), "");
    assert.equal(github.asked().length, 2);
  },
);

test(
  "mixed held, expired and readable logs exit 75 while preserving every job's evidence",
  { timeout: 20_000 },
  async (t) => {
    const github = instrumentedGithubFixture(t, {
      jobs: [job(0), job(1), job(2)],
      log: excerpt,
      answers: {
        "jobs/1000/logs": {
          head: "HTTP/2.0 429 Too Many Requests\r\nRetry-After: 60",
          code: 1,
          holdLogs: true,
          stderr: `gh: ${secret} (HTTP 429)`,
        },
        "jobs/1001/logs": {
          head: "HTTP/2.0 410 Gone",
          code: 1,
          stderr: `gh: ${secret} (HTTP 410)`,
        },
      },
    });
    const diagnostic = run(github);
    await until(
      () =>
        github.asked().filter((call) => call.endsWith("/logs")).length === 3,
      "all mixed log requests reached GitHub before its hold",
    );
    github.releaseLogs();
    assert.equal(await diagnostic.exited, 75, diagnostic.stderr());
    const [held, expired, readable] = JSON.parse(
      diagnostic.stdout(),
    ).failedJobs;
    assert.equal(held.logWaitSeconds, 60);
    assert.equal(
      held.logUnavailable,
      "GitHub directed a wait of 60 s before the next request",
    );
    assert.match(expired.logUnavailable, /HTTP 410$/);
    assert.equal(Object.hasOwn(expired, "logWaitSeconds"), false);
    assert.deepEqual(readable.log, { lines: [excerpt], omittedLines: 0 });
    for (const evidence of [held, expired, readable])
      assert.deepEqual(evidence.failedSteps, steps);
    assert.equal(diagnostic.stdout().includes(secret), false);
    assert.equal(diagnostic.stderr(), "");
    assert.equal(github.asked().length, 4);
  },
);

for (const held of [false, true]) {
  test(
    `jobs acquisition remains ${held ? "held at exit 75" : "fatal at exit 1"}`,
    { timeout: 20_000 },
    async (t) => {
      const github = instrumentedGithubFixture(t, {
        jobs: [job(0)],
        answers: {
          "runs/42/attempts/2/jobs": {
            head: "HTTP/2.0 503 Unavailable",
            code: 1,
            stderr: `gh: ${secret} (HTTP 503)`,
          },
        },
      });
      if (held) github.limit(1, "/jobs?", 60);
      const diagnostic = run(github);
      assert.equal(await diagnostic.exited, held ? 75 : 1);
      assert.equal(diagnostic.stdout(), "");
      assert.match(diagnostic.stderr(), held ? /wait of 60 s/ : /HTTP 503/);
      assert.equal(diagnostic.stderr().includes(secret), false);
      assert.equal(github.asked().length, 1);
    },
  );
}

test("an unknown per-log exception has a safe fallback, never a wait parsed from prose", async () => {
  const hold = new GitHubAcquisitionHeld(17);
  hold.message = "A wait whose seconds are carried separately";
  const diagnostic = await diagnoseFailedAttempt({
    repo: "owner/repo",
    runId: 42,
    attempt: 2,
    github: {
      attemptJobs: async () =>
        [job(0), job(1), job(2)].map(({ id, ...other }) => ({
          ...other,
          databaseId: id,
        })),
      jobLog: async (id) => {
        if (id === 1000) throw new Error(`${secret}: wait 999 seconds`);
        if (id === 1001) throw hold;
        return excerpt;
      },
    },
  });
  const [unknown, held, readable] = diagnostic.failedJobs;
  assert.equal(
    unknown.logUnavailable,
    "GitHub job log request failed without a usable cause",
  );
  assert.equal(Object.hasOwn(unknown, "logWaitSeconds"), false);
  assert.equal(held.logWaitSeconds, 17);
  assert.equal(held.logUnavailable, hold.message);
  assert.deepEqual(readable.log.lines, [excerpt]);
  assert.equal(JSON.stringify(diagnostic).includes(secret), false);
});
