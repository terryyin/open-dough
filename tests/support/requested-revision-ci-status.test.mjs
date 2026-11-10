import { comparisonHistory } from "../../dashboard/server/comparisonBuildSource.ts";
// Intent requested-revision status: provider Skipped/Cancelled, path-confirmed
// skips, and each surfaced No-build reason.
// Production boundary: ../../dashboard/server/requestedRevisionCiStatus.ts.
import assert from "node:assert/strict";
import { tmpdir } from "node:os";
import test from "node:test";
import {
  classifyComparisonPathChanges,
  noBuildReasonPhrase,
  requestedRevisionCiStatus,
  workflowFilePath,
} from "../../dashboard/server/requestedRevisionCiStatus.ts";
import { makeMe } from "./makeMe.mjs";
import {
  base,
  callOf,
  codeChange,
  ignoredWorkflow,
  phraseCases,
  planningOnly,
  repositoryOf,
} from "./requestedRevisionCiStatusFixtures.mjs";

test("workflowFilePath rejects a numeric workflow ID", () => {
  assert.equal(workflowFilePath("ci.yml"), ".github/workflows/ci.yml");
  assert.equal(workflowFilePath("7001"), undefined);
});

test("noBuildReasonPhrase names each classifier and dashboard reason", () => {
  for (const [reason, phrase] of phraseCases) {
    assert.equal(noBuildReasonPhrase(reason), phrase);
  }
});

test("classifyComparisonPathChanges: ignored-only is not_required", async (t) => {
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
    await classifyComparisonPathChanges(
      comparisonHistory(call),
      requested,
      basis,
      ".github/workflows/ci.yml",
    ),
    { verdict: "not_required" },
  );
});

test("classifyComparisonPathChanges: code change is required", async (t) => {
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
    await classifyComparisonPathChanges(
      comparisonHistory(call),
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
    [
      makeMe.aRevisionCiRun
        .with({ headSha: sha, status: "completed", conclusion: "skipped" })
        .please(),
    ],
    undefined,
    comparisonHistory(callOf(tmpdir())),
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
    [
      makeMe.aRevisionCiRun
        .with({ headSha: sha, status: "completed", conclusion: "cancelled" })
        .please(),
    ],
    "c".repeat(40),
    comparisonHistory(callOf(tmpdir())),
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
    comparisonHistory(call),
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
    comparisonHistory(call),
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
    comparisonHistory(call),
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
    comparisonHistory(callOf(tmpdir())),
    "7001",
  );
  assert.equal(status.kind, "no-build");
  assert.match(status.explanation, /numeric ID/);
});
