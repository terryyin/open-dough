// An ignored-only accepted B whose applicable ancestor A failed. When A is
// another writer's revision and B's same-target descendant C ran green, the
// integrated state is validated at C and B completes. A failure on one of this
// execution's own registered revisions stays a failure even then, and without
// such a C the other writer's failure still stands.
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { createMailbox } from "../../../src/skills/dough-execute-plan/scripts/ci-mailbox-location.mjs";
import { observeRevisionCoverage } from "../../../src/skills/dough-execute-plan/scripts/ci-mailbox-revision-coverage.mjs";
import {
  readRevisionCoverage,
  registerPushedRevision,
} from "../../../src/skills/dough-execute-plan/scripts/ci-mailbox-revision-records.mjs";
import { awaitRevision } from "../../../src/skills/dough-execute-plan/scripts/ci-mailbox-await.mjs";
import { makeMe } from "../../support/makeMe.mjs";
import {
  acceptedWorkflow,
  describedRepository,
  workflowPath,
} from "./ci-path-applicability-test-fixtures.mjs";

const request = (root) => ({
  mode: "execution",
  repo: "owner/repo",
  branch: "main",
  maxDurationMs: 60_000,
  root,
});

const run = (headSha, databaseId, conclusion) =>
  makeMe.aCiRun
    .with({
      headSha,
      headBranch: "main",
      databaseId,
      attempt: 1,
      status: "completed",
      conclusion,
      event: "push",
    })
    .please();

const readCurrentAttempt = async (listed) => ({
  ...listed,
  ...makeMe.anIntegratedStatePolicy
    .with({ check: "ci.yml", context: "push" })
    .please(),
});

async function failedBasisHistory(t) {
  const { repo, revisions } = await describedRepository(
    t,
    makeMe.aRepository
      .withRevision("a", {
        backlog: null,
        files: { [workflowPath]: acceptedWorkflow, "app.js": "a\n" },
      })
      .withRevision("b", { files: { "docs/b.md": "b\n" } })
      .withRevision("c", { files: { "app.js": "c\n" } })
      .please(),
  );
  return { repo, ...revisions };
}

// Completes B after one poll over `runs`, with `registered` this execution's
// own pushed revisions besides B.
async function complete(t, repo, b, runs, registered = []) {
  const storage = mkdtempSync(join(tmpdir(), "ci-failed-basis-"));
  t.after(() => rmSync(storage, { recursive: true, force: true }));
  const directory = createMailbox(request(repo), { root: repo, storage });
  for (const sha of registered) registerPushedRevision(directory, sha);
  registerPushedRevision(directory, b);
  await observeRevisionCoverage(directory, runs, request(repo), Date.now(), {
    integratedPolicy: { check: "ci.yml", context: "push" },
    readCurrentAttempt,
  });
  const record = readRevisionCoverage(directory).find(({ sha }) => sha === b);
  assert.equal(record.state, "not_required");
  let now = 0;
  return awaitRevision(directory, b, {
    root: repo,
    storage,
    deadlineMs: 20,
    now: () => now,
    sleep: async (ms) => {
      now += ms;
    },
    workerLiveness: () => "alive",
  });
}

test("docs-only B on another writer's failed ancestor completes once a descendant validates the integrated state", async (t) => {
  const { repo, a, b, c } = await failedBasisHistory(t);
  const completion = await complete(t, repo, b, [
    run(c, 3, "success"),
    run(a, 1, "failure"),
  ]);
  assert.equal(completion.verdict, "success");
  assert.equal(completion.effectiveEvidence.source, "integrated_state");
  assert.deepEqual(completion.effectiveEvidence.accepted.basis, {
    sha: a,
    state: "failure",
  });
  assert.equal(completion.effectiveEvidence.validated.sha, c);
});

test("docs-only B on another writer's failed ancestor stays a failure while no descendant validates it", async (t) => {
  const { repo, a, b } = await failedBasisHistory(t);
  const completion = await complete(t, repo, b, [run(a, 1, "failure")]);
  assert.equal(completion.verdict, "failure");
  assert.equal(completion.effectiveEvidence.source, "not_required_basis");
});

test("docs-only B on this execution's own failed revision stays a failure despite a green descendant", async (t) => {
  const { repo, a, b, c } = await failedBasisHistory(t);
  const completion = await complete(
    t,
    repo,
    b,
    [run(c, 3, "success"), run(a, 1, "failure")],
    [a],
  );
  assert.equal(completion.verdict, "failure");
  assert.equal(completion.effectiveEvidence.source, "not_required_basis");
  assert.deepEqual(completion.effectiveEvidence.basis, {
    sha: a,
    state: "failure",
  });
});
