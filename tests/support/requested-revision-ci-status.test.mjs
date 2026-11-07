// Module tests of Intent comparison's requested-revision CI status
// (`../../dashboard/server/requestedRevisionCiStatus.ts`): Skipped via the
// shared path classifier, Cancelled from the provider conclusion, and each
// No-build reason the dashboard surfaces when a skip cannot be confirmed.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  classifyPathChangesViaRunGit,
  noBuildReasonPhrase,
  requestedRevisionCiStatus,
  workflowFilePath,
} from "../../dashboard/server/requestedRevisionCiStatus.ts";
import { defaultGitOutputLimit } from "../../dashboard/server/gitRunner.ts";

const ignoredWorkflow = [
  "name: CI",
  "",
  "on:",
  "  push:",
  "    paths-ignore:",
  "      - '.planning/**'",
  "      - 'docs/**'",
  "  pull_request:",
  "    paths-ignore:",
  "      - '.planning/**'",
  "      - 'docs/**'",
  "  workflow_dispatch:",
  "",
  "jobs:",
  "  check:",
  "    runs-on: ubuntu-24.04",
  "",
].join("\n");

const phraseCases = [
  ["required", "changes CI does not ignore"],
  ["unreadable-revision", "the workflow at that revision could not be read"],
  [
    "numeric-workflow",
    "the configured workflow is a numeric ID, so a skip cannot be confirmed",
  ],
  ["mixed-paths", "changes mix ignored and non-ignored paths"],
  ["non-ignored-delete", "a delete touches a path CI does not ignore"],
  ["non-ignored-rename", "a rename touches a path CI does not ignore"],
  ["no-ancestor-basis", "no ancestor build was found to compare against"],
  [
    "unsupported-workflow-policy",
    "the workflow's path rule could not be confirmed",
  ],
  ["unreadable-diff", "the diff from the nearest build could not be read"],
];

function git(cwd, ...args) {
  return execFileSync("git", args, { cwd, encoding: "utf8" }).trim();
}

function initRepo() {
  const repo = mkdtempSync(join(tmpdir(), "requested-revision-ci-"));
  git(repo, "init", "-q", "-b", "main");
  git(repo, "config", "user.name", "Status Fixture");
  git(repo, "config", "user.email", "status@example.test");
  git(repo, "config", "user.useConfigOnly", "false");
  return repo;
}

function commitAll(repo, message) {
  git(repo, "add", "-A");
  git(repo, "commit", "-m", message);
  return git(repo, "rev-parse", "HEAD");
}

function callOf(repo) {
  return { cwd: repo, maxBuffer: defaultGitOutputLimit };
}

function writeWorkflow(repo) {
  mkdirSync(join(repo, ".github", "workflows"), { recursive: true });
  writeFileSync(join(repo, ".github", "workflows", "ci.yml"), ignoredWorkflow);
}

function commitBasis(repo) {
  writeFileSync(join(repo, "app.js"), "base\n");
  return commitAll(repo, "base");
}

function commitPlanningOnly(repo) {
  mkdirSync(join(repo, ".planning"), { recursive: true });
  writeFileSync(join(repo, ".planning", "note.md"), "plan\n");
  return commitAll(repo, "planning only");
}

function commitCodeChange(repo) {
  writeFileSync(join(repo, "app.js"), "changed\n");
  return commitAll(repo, "code");
}

function withWorkflowRepo(t) {
  const repo = initRepo();
  t.after(() => rmSync(repo, { recursive: true, force: true }));
  writeWorkflow(repo);
  const basis = commitBasis(repo);
  return { repo, basis, call: callOf(repo) };
}

test("workflowFilePath rejects a numeric workflow ID", () => {
  assert.equal(workflowFilePath("ci.yml"), ".github/workflows/ci.yml");
  assert.equal(workflowFilePath("7001"), undefined);
});

test("noBuildReasonPhrase names each classifier and dashboard reason", () => {
  for (const [reason, phrase] of phraseCases) {
    assert.equal(noBuildReasonPhrase(reason), phrase);
  }
});

test("classifyPathChangesViaRunGit: ignored-only is not_required", async (t) => {
  const { repo, basis, call } = withWorkflowRepo(t);
  const requested = commitPlanningOnly(repo);
  assert.deepEqual(
    await classifyPathChangesViaRunGit(
      call,
      requested,
      basis,
      ".github/workflows/ci.yml",
    ),
    { verdict: "not_required" },
  );
});

test("classifyPathChangesViaRunGit: code change is required", async (t) => {
  const { repo, basis, call } = withWorkflowRepo(t);
  const requested = commitCodeChange(repo);
  assert.deepEqual(
    await classifyPathChangesViaRunGit(
      call,
      requested,
      basis,
      ".github/workflows/ci.yml",
    ),
    { verdict: "required" },
  );
});

test("requestedRevisionCiStatus: provider skipped conclusion", async () => {
  const sha = "a".repeat(40);
  const status = await requestedRevisionCiStatus(
    sha,
    [{ headSha: sha, status: "completed", conclusion: "skipped" }],
    undefined,
    callOf(tmpdir()),
    "ci.yml",
  );
  assert.equal(status.kind, "skipped");
  assert.match(status.explanation, /^Skipped at aaaaaaa /);
  assert.match(status.explanation, /reported the run as skipped/);
});

test("requestedRevisionCiStatus: cancelled conclusion", async () => {
  const sha = "b".repeat(40);
  const status = await requestedRevisionCiStatus(
    sha,
    [{ headSha: sha, status: "completed", conclusion: "cancelled" }],
    "c".repeat(40),
    callOf(tmpdir()),
    "ci.yml",
  );
  assert.deepEqual(status, {
    kind: "cancelled",
    explanation: "Cancelled at bbbbbbb.",
  });
});

test("requestedRevisionCiStatus: path-confirmed skip names the basis", async (t) => {
  const { repo, basis, call } = withWorkflowRepo(t);
  const requested = commitPlanningOnly(repo);
  const status = await requestedRevisionCiStatus(
    requested,
    [],
    basis,
    call,
    "ci.yml",
  );
  assert.equal(status.kind, "skipped");
  assert.equal(
    status.explanation,
    `Skipped at ${requested.slice(0, 7)} because CI ignores every change since its nearest built ancestor ${basis.slice(0, 7)}.`,
  );
});

test("requestedRevisionCiStatus: code absence is No build with required reason", async (t) => {
  const { repo, basis, call } = withWorkflowRepo(t);
  const requested = commitCodeChange(repo);
  const status = await requestedRevisionCiStatus(
    requested,
    [],
    basis,
    call,
    "ci.yml",
  );
  assert.equal(status.kind, "no-build");
  assert.equal(
    status.explanation,
    `No build at ${requested.slice(0, 7)}: changes CI does not ignore.`,
  );
});

test("requestedRevisionCiStatus: missing workflow is unreadable-revision", async (t) => {
  const repo = initRepo();
  t.after(() => rmSync(repo, { recursive: true, force: true }));
  const basis = commitBasis(repo);
  const requested = commitCodeChange(repo);
  const status = await requestedRevisionCiStatus(
    requested,
    [],
    basis,
    callOf(repo),
    "ci.yml",
  );
  assert.equal(status.kind, "no-build");
  assert.equal(
    status.explanation,
    `No build at ${requested.slice(0, 7)}: the workflow at that revision could not be read.`,
  );
});

test("requestedRevisionCiStatus: numeric workflow cannot confirm a skip", async () => {
  const sha = "d".repeat(40);
  const status = await requestedRevisionCiStatus(
    sha,
    [],
    "e".repeat(40),
    callOf(tmpdir()),
    "7001",
  );
  assert.equal(status.kind, "no-build");
  assert.match(status.explanation, /numeric ID/);
});
