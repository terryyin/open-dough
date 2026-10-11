// The installed CI engine's GitHub default against an instrumented `gh` on
// PATH that counts upstream requests per route and page: the observer asks
// GitHub only `gh api` requests through the one request source, a rate limit
// suspends acquisition, and a pending request asked twice costs once.
// `./ci-github-diagnostic.test.mjs` covers the diagnostic entry.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  createGitHubActions,
  GitHubAcquisitionHeld,
  readGitHubActions,
} from "./ci-github-actions.mjs";
import {
  apiCall,
  completedJobs,
  instrumentedGithubFixture,
  startInstalledScript,
  until,
} from "./ci-github-test-fixtures.mjs";

const sha = "a".repeat(40);

const failedRun = (overrides = {}) => ({
  id: 42,
  run_attempt: 1,
  head_sha: sha,
  head_branch: "main",
  event: "push",
  status: "completed",
  conclusion: "failure",
  html_url: "https://github.test/owner/repo/actions/runs/42",
  created_at: "2026-09-05T10:00:00Z",
  ...overrides,
});

test("the observer asks GitHub one admitted API request per route and page", async (t) => {
  const github = instrumentedGithubFixture(t, {
    runs: [failedRun({ run_attempt: 2 })],
    attempts: { "42/1": { status: "completed", conclusion: "success" } },
    jobs: completedJobs([120]),
  });
  const observer = startInstalledScript(github, "watch-ci.mjs", [
    "--execution",
    "owner/repo",
    "main",
    "60000",
  ]);

  const failure = await observer.event("CI_FAILURE");

  assert.deepEqual(
    {
      runId: failure.runId,
      attempt: failure.attempt,
      sha: failure.sha,
      branch: failure.branch,
      conclusion: failure.conclusion,
      url: failure.url,
      failedJobs: failure.failedJobs,
    },
    {
      runId: 42,
      attempt: 2,
      sha,
      branch: "main",
      conclusion: "failure",
      url: "https://github.test/owner/repo/actions/runs/42",
      failedJobs: [{ jobId: 1120, name: "job 120", conclusion: "failure" }],
    },
  );
  assert.deepEqual(
    github
      .asked()
      .map((asked) => asked.replace(/created=[^&]+/, "created=STARTUP")),
    [
      apiCall("workflows/ci.yml"),
      apiCall(
        "workflows/7001/runs?branch=main&event=push&created=STARTUP&per_page=100&page=1",
      ),
      apiCall("runs/42/attempts/1"),
      apiCall("runs/42/attempts/2/jobs?per_page=100&page=1"),
      apiCall("runs/42/attempts/2/jobs?per_page=100&page=2"),
    ],
  );
  assert.equal(github.mostUnderWay(), 1);
});

test("a rate limit suspends the observer until the directed time without losing coverage", async (t) => {
  const github = instrumentedGithubFixture(t, {
    runs: [failedRun()],
    attempts: {},
    jobs: [completedJobs([0])[0]],
  });
  // Three limits in a row: as observation errors they would end coverage.
  github.limit(3, "/runs?");
  const observer = startInstalledScript(github, "watch-ci.mjs", [
    "--execution",
    "owner/repo",
    "main",
    "60000",
  ]);

  await observer.event("CI_FAILURE");

  const [throttled, ...others] = observer.events();
  assert.deepEqual(
    { ...throttled, resumesAt: typeof throttled.resumesAt },
    {
      type: "CI_MONITOR_THROTTLED",
      repo: "owner/repo",
      branch: "main",
      workflow: "ci.yml",
      waitSeconds: 1,
      resumesAt: "string",
    },
  );
  assert.deepEqual(
    others.map(({ type }) => type),
    ["CI_FAILURE"],
  );
  // The workflow is resolved once; each wait is followed by one listing and
  // nothing else is asked while a wait stands.
  const calls = github.calls().filter(({ phase }) => phase === "asked");
  assert.deepEqual(
    calls.map(({ args }) => args[2].replace(/\?.*/, "").split("/actions/")[1]),
    [
      "workflows/ci.yml",
      "workflows/7001/runs",
      "workflows/7001/runs",
      "workflows/7001/runs",
      "workflows/7001/runs",
      "runs/42/attempts/1/jobs",
    ],
  );
  for (const at of [2, 3, 4])
    assert.ok(
      calls[at].at - calls[at - 1].at >= 1000,
      `listing ${at} asked ${calls[at].at - calls[at - 1].at} ms after a limit`,
    );
});

test("the same pending request asked twice reaches GitHub once", async (t) => {
  const github = instrumentedGithubFixture(t, {
    attempts: {},
    jobs: completedJobs([120]),
  });
  github.enter();
  github.holdRequests();
  const signal = new AbortController().signal;
  const observers = [
    createGitHubActions({ repo: "owner/repo" }),
    createGitHubActions({ repo: "owner/repo" }),
  ];

  const reading = Promise.all(
    observers.map((observer) => observer.attemptJobs(42, 2, signal)),
  );
  await until(() => github.asked().length === 1, "the first page asked");
  await new Promise((resolve) => setTimeout(resolve, 200));
  assert.equal(github.asked().length, 1);
  github.releaseRequests();
  const [first, second] = await reading;

  assert.equal(first.length, 150);
  assert.deepEqual(second, first);
  assert.deepEqual(github.asked(), [
    apiCall("runs/42/attempts/2/jobs?per_page=100&page=1"),
    apiCall("runs/42/attempts/2/jobs?per_page=100&page=2"),
  ]);
});

test("no installed file asks gh outside the one request source or names a gh run command", () => {
  const installer = readFileSync(
    new URL("../../../../install.sh", import.meta.url),
    "utf8",
  );
  const installed = [...installer.matchAll(/^ {2}(dough-[\w./-]+)$/gm)].map(
    ([, file]) => file,
  );
  assert.ok(
    installed.includes("dough-execute-plan/scripts/ci-github-diagnostic.mjs"),
  );
  assert.ok(installed.includes("dough-execute-plan/references/ci-monitor.md"));
  const matching = (pattern) =>
    installed.filter((file) =>
      pattern.test(
        readFileSync(new URL(`../../${file}`, import.meta.url), "utf8"),
      ),
    );

  // The command a script runs is a quoted name; prose quotes it in backticks.
  assert.deepEqual(matching(/["']gh["']/), [
    "dough-execute-plan/scripts/github-requests.mjs",
  ]);
  assert.deepEqual(
    matching(
      /\bgh run\b|--log-failed|["'`]run["'`],\s*["'`](?:list|view)["'`]/,
    ),
    [],
  );
});

// Last in this file: it leaves this process's requests held back.
test("nothing is asked while a wait stands, and one request goes first once it ends", async (t) => {
  const github = instrumentedGithubFixture(t, {
    attempts: {
      "42/1": { status: "completed", conclusion: "success" },
      "42/2": { status: "completed", conclusion: "failure" },
      "42/3": { status: "completed", conclusion: "failure" },
    },
  });
  github.enter();
  const signal = new AbortController().signal;
  const attempt = (number) =>
    readGitHubActions(
      ["api", `repos/owner/repo/actions/runs/42/attempts/${number}`],
      signal,
    );
  const held = (error) =>
    error instanceof GitHubAcquisitionHeld && error.waitSeconds === 1;

  github.limit(1, "/attempts/1");
  await assert.rejects(attempt(1), held);
  await assert.rejects(attempt(2), held);
  await assert.rejects(attempt(3), held);
  assert.deepEqual(github.asked(), [apiCall("runs/42/attempts/1")]);

  // Once the wait is over one request goes first; the limit it meets holds
  // the others back unasked.
  await new Promise((resolve) => setTimeout(resolve, 1100));
  github.limit(1, "/attempts/1");
  const probed = await Promise.allSettled([attempt(1), attempt(2), attempt(3)]);
  assert.ok(probed.every(({ reason }) => held(reason)));
  assert.deepEqual(github.asked(), [
    apiCall("runs/42/attempts/1"),
    apiCall("runs/42/attempts/1"),
  ]);

  await new Promise((resolve) => setTimeout(resolve, 1100));
  assert.deepEqual(await attempt(2), {
    status: "completed",
    conclusion: "failure",
  });
  assert.equal(github.asked().length, 3);
});
