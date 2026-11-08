// Module tests of Intent comparison's requested-revision CI status
// (`../../dashboard/server/requestedRevisionCiStatus.ts`): Skipped via the
// shared path classifier, Cancelled from the provider conclusion, and each
// No-build reason the dashboard surfaces when a skip cannot be confirmed.
import assert from "node:assert/strict";
import { tmpdir } from "node:os";
import test from "node:test";
import {
  classifyPathChangesViaRunGit,
  noBuildReasonPhrase,
  requestedRevisionCiStatus,
  workflowFilePath,
} from "../../dashboard/server/requestedRevisionCiStatus.ts";
import { defaultGitOutputLimit } from "../../dashboard/server/gitRunner.ts";
import { makeMe } from "./makeMe.mjs";
import { materializeLocalCheckout } from "./repository-fixture.mjs";

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

function callOf(repo) {
  return { cwd: repo, maxBuffer: defaultGitOutputLimit };
}

// A base revision holding `app.js`, and the workflow when one is stated.
const base = (workflow) => ({
  backlog: undefined,
  files: {
    ...(workflow && { ".github/workflows/ci.yml": workflow }),
    "app.js": "base\n",
  },
});
const planningOnly = { files: { ".planning/note.md": "plan\n" } };
const codeChange = { files: { "app.js": "changed\n" } };

// One local checkout on main holding the described revisions.
async function repositoryOf(t, description) {
  const { integration, revisions } = await materializeLocalCheckout(
    t,
    description,
  );
  return { revisions, call: callOf(integration) };
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
  const {
    revisions: { base: basis, requested },
    call,
  } = await repositoryOf(
    t,
    makeMe.aRepository
      .withRevision("base", base(ignoredWorkflow))
      .withRevision("requested", planningOnly)
      .please(),
  );
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
  const {
    revisions: { base: basis, requested },
    call,
  } = await repositoryOf(
    t,
    makeMe.aRepository
      .withRevision("base", base(ignoredWorkflow))
      .withRevision("requested", codeChange)
      .please(),
  );
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
  const {
    revisions: { base: basis, requested },
    call,
  } = await repositoryOf(
    t,
    makeMe.aRepository
      .withRevision("base", base(ignoredWorkflow))
      .withRevision("requested", planningOnly)
      .please(),
  );
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
  const {
    revisions: { base: basis, requested },
    call,
  } = await repositoryOf(
    t,
    makeMe.aRepository
      .withRevision("base", base(ignoredWorkflow))
      .withRevision("requested", codeChange)
      .please(),
  );
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
  const {
    revisions: { base: basis, requested },
    call,
  } = await repositoryOf(
    t,
    makeMe.aRepository
      .withRevision("base", base())
      .withRevision("requested", codeChange)
      .please(),
  );
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
