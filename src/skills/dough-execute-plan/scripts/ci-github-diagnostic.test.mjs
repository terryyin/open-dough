// The installed diagnostic entry against an instrumented `gh` on PATH that
// counts upstream requests per route: it reads one failed attempt's failed
// jobs with bounded log excerpts, and the selected workflow as GitHub names
// it, each through the one request source.
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { chmodSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import {
  ownerSecret,
  refusingOwner,
} from "./github-request-owner-refusal-test-fixtures.mjs";
import { ownerlessRequestRoot } from "./github-request-owner-test-fixtures.mjs";
import {
  apiCall,
  completedJobs,
  instrumentedGithubFixture,
  startInstalledScript,
  until,
} from "./ci-github-test-fixtures.mjs";

const exec = promisify(execFile);

test("the diagnostic CLI reads the native selector from the project's settings", async (t) => {
  const workflow = {
    id: 912,
    name: "Project tests",
    path: ".github/workflows/checks.yaml",
    state: "active",
  };
  const github = instrumentedGithubFixture(t, {
    answers: {
      "workflows/checks.yaml": {
        head: "HTTP/2.0 200 OK",
        body: JSON.stringify(workflow),
      },
    },
  });
  const root = github.env.CI_GH_FIXTURE;
  mkdirSync(join(root, ".planning"));
  writeFileSync(
    join(root, ".planning/open-dough.json"),
    '{"ciWorkflow":"checks.yaml"}',
  );
  delete github.env.DOUGH_CI_WORKFLOW;
  const entry = fileURLToPath(
    new URL("./ci-github-diagnostic.mjs", import.meta.url),
  );
  const { stdout } = await exec(
    process.execPath,
    [entry, "workflow", "owner/repo"],
    { cwd: root, env: github.env },
  );
  assert.deepEqual(JSON.parse(stdout), {
    type: "CI_WORKFLOW",
    repo: "owner/repo",
    selector: "checks.yaml",
    ...workflow,
  });
  assert.deepEqual(github.asked(), [apiCall("workflows/checks.yaml")]);
});

for (const [fault, message] of [
  ["privacy", "endpoint is open to other users"],
  ["path", "endpoint path is too long"],
  ["incompatible", "explicitly refused the protocol"],
  ["unauthenticated", "explicitly refused this caller"],
  ["unknown", "gave no usable answer"],
]) {
  test(`the diagnostic entry reports observed owner ${fault} without login advice or upstream requests`, async (t) => {
    const github = instrumentedGithubFixture(t, {});
    const root = github.env.DOUGH_GITHUB_REQUEST_OWNER_ROOT;
    if (fault === "privacy") chmodSync(root, 0o755);
    else if (fault === "path")
      github.env.DOUGH_GITHUB_REQUEST_OWNER_ROOT = ownerlessRequestRoot(root);
    else
      await refusingOwner(github, {
        refused: fault === "unknown" ? ownerSecret : fault,
      });
    const diagnostic = startInstalledScript(
      github,
      "ci-github-diagnostic.mjs",
      ["workflow", "owner/repo"],
    );
    assert.equal(await diagnostic.exited, 1);
    assert.ok(diagnostic.stderr().includes(message), diagnostic.stderr());
    assert.match(
      diagnostic.stderr(),
      /Check the local request-owner endpoint configuration/,
    );
    for (const secret of [root, ownerSecret, "gh auth", "gh failed"])
      assert.equal(
        diagnostic.stderr().includes(secret),
        false,
        diagnostic.stderr(),
      );
    assert.deepEqual(github.asked(), []);
  });
}

const stamped = (line) => `2026-09-05T10:00:00.0000000Z ${line}`;
const failedLog = [
  ...Array.from(Array(400).keys(), (index) => stamped(`build line ${index}`)),
  stamped(`\u001B[31mexpected\u001B[0m ${"x".repeat(500)}`),
  stamped("##[error]Process completed with exit code 1."),
  ...Array.from(Array(100).keys(), (index) => stamped(`cleanup ${index}`)),
].join("\n");

test("the diagnostic entry reads failed jobs and bounded log excerpts with at most eight requests under way", async (t) => {
  const failed = [3, 7, 20, 41, 60, 99, 100, 120, 130, 140, 149];
  const github = instrumentedGithubFixture(t, {
    jobs: completedJobs(failed),
    log: failedLog,
    holdLogs: true,
  });
  const diagnostic = startInstalledScript(github, "ci-github-diagnostic.mjs", [
    "failure",
    "owner/repo",
    "42",
    "2",
  ]);
  const logsAsked = () =>
    github.asked().filter((asked) => asked.endsWith("/logs"));

  // Ten logs are wanted at once; the ninth waits for a turn.
  await until(() => logsAsked().length === 8, "eight log requests under way");
  await new Promise((resolve) => setTimeout(resolve, 300));
  assert.equal(logsAsked().length, 8);
  assert.equal(github.mostUnderWay(), 8);
  github.releaseLogs();
  assert.equal(await diagnostic.exited, 0, diagnostic.stderr());

  const answer = JSON.parse(diagnostic.stdout());
  assert.deepEqual(
    { ...answer, failedJobs: answer.failedJobs.length },
    {
      type: "CI_FAILURE_DIAGNOSTIC",
      repo: "owner/repo",
      runId: 42,
      attempt: 2,
      failedJobs: 10,
      omittedFailedJobs: 1,
    },
  );
  const [first] = answer.failedJobs;
  assert.deepEqual(
    { ...first, log: undefined },
    {
      jobId: 1003,
      name: "job 3",
      conclusion: "failure",
      url: "https://github.test/owner/repo/actions/runs/42/job/1003",
      failedSteps: [{ number: 2, name: "Run tests", conclusion: "failure" }],
      log: undefined,
    },
  );
  // Twenty lines before the marked error, the error and three after it, with
  // timestamps and terminal controls removed and a long line cut.
  assert.equal(first.log.lines.length, 24);
  assert.equal(first.log.omittedLines, 502 - 24);
  assert.equal(first.log.lines[0], "build line 381");
  assert.equal(first.log.lines[19], `expected ${"x".repeat(291)}…`);
  assert.equal(
    first.log.lines[20],
    "##[error]Process completed with exit code 1.",
  );
  assert.equal(first.log.lines[23], "cleanup 2");
  assert.ok(diagnostic.stdout().length < 40_000);

  assert.deepEqual(github.asked().sort(), [
    ...failed.slice(0, 10).map((index) => apiCall(`jobs/${1000 + index}/logs`)),
    apiCall("runs/42/attempts/2/jobs?per_page=100&page=1"),
    apiCall("runs/42/attempts/2/jobs?per_page=100&page=2"),
  ]);
  assert.equal(github.mostUnderWay(), 8);
});

test("the diagnostic entry names the selected workflow with one request and refuses anything else", async (t) => {
  const github = instrumentedGithubFixture(t, {});
  const entry = fileURLToPath(
    new URL("./ci-github-diagnostic.mjs", import.meta.url),
  );

  const { stdout } = await exec(
    process.execPath,
    [entry, "workflow", "owner/repo"],
    { env: github.env },
  );
  assert.deepEqual(JSON.parse(stdout), {
    type: "CI_WORKFLOW",
    repo: "owner/repo",
    selector: "ci.yml",
    id: 7001,
    name: "CI",
    path: ".github/workflows/ci.yml",
    state: "active",
  });
  assert.deepEqual(github.asked(), [apiCall("workflows/ci.yml")]);

  for (const refused of [
    ["failure", "owner/repo", "42/../../x", "1"],
    ["failure", "owner/repo/extra", "42", "1"],
    ["logs", "owner/repo", "42", "1"],
  ])
    await assert.rejects(
      exec(process.execPath, [entry, ...refused], { env: github.env }),
      ({ code, stderr }) => code === 1 && /Usage:/.test(stderr),
    );
  assert.equal(github.asked().length, 1);
});
