import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { awaitRevision } from "./ci-mailbox-await.mjs";
import {
  createMailbox,
  readMailboxEvents,
  readRevisionCoverage,
  registerPushedRevision,
  requestMailboxStop,
  runMailboxWorker,
} from "./ci-mailbox.mjs";
import { makeMe } from "../../../../tests/support/makeMe.mjs";
import { materializeRepository } from "../../../../tests/support/repository-fixture.mjs";
import {
  acceptedWorkflow,
  workflowPath,
} from "./ci-path-applicability-test-fixtures.mjs";
import { controllableSleep } from "./ci-observer-poll-sleep-test-fixtures.mjs";
import { watchCiExecution } from "./watch-ci-execution.mjs";
import {
  deferWorkerStop,
  fixtureTeardown,
} from "./fixture-teardown-test-fixtures.mjs";
import { githubApi } from "./github-actions-api-test-fixtures.mjs";
import { run } from "./watch-ci-test-fixtures.mjs";

test("ignored-only coverage follows successful and failed unregistered ancestors, until an exact attempt supersedes it", async (t) => {
  const storage = mkdtempSync(join(tmpdir(), "ci-await-inherited-"));
  const {
    integration: repo,
    fixture,
    revisions: {
      successfulAncestor,
      ignoredSuccess,
      failedAncestor,
      ignoredFailure,
    },
  } = await materializeRepository(
    makeMe.aRepository
      .withRevision("successfulAncestor", {
        backlog: null,
        files: {
          "application.js": "console.log('A');\n",
          [workflowPath]: acceptedWorkflow,
        },
      })
      .withRevision("ignoredSuccess", {
        files: { ".planning/ignored-success.md": "B1\n" },
      })
      .withRevision("failedAncestor", {
        files: { "application.js": "console.log('A2');\n" },
      })
      .withRevision("ignoredFailure", {
        files: { ".planning/ignored-failure.md": "B2\n" },
      })
      .please(),
  );
  const teardown = fixtureTeardown(storage, fixture);
  t.after(teardown.cleanup);
  const unrelated = "f".repeat(40);
  const directory = createMailbox(
    {
      mode: "execution",
      repo: "owner/project",
      branch: "feature/await",
      maxDurationMs: 60_000,
    },
    { root: repo, storage },
  );
  registerPushedRevision(directory, ignoredSuccess);
  registerPushedRevision(directory, ignoredFailure);
  registerPushedRevision(directory, unrelated);
  const attempts = new Map([
    [
      successfulAncestor,
      { status: "in_progress", conclusion: null, databaseId: 71 },
    ],
    [
      failedAncestor,
      { status: "in_progress", conclusion: null, databaseId: 72 },
    ],
    [unrelated, { status: "completed", conclusion: "success", databaseId: 73 }],
  ]);
  const gh = githubApi((request) => {
    if (request.kind === "runs")
      return [...attempts].map(([headSha, attempt]) =>
        run({
          headSha,
          headBranch: "feature/await",
          workflowName: "CI",
          event: "push",
          attempt: 1,
          ...attempt,
        }),
      );
    if (request.kind === "jobs") return { jobs: [] };
    throw new Error(`Unexpected gh call: ${JSON.stringify(request)}`);
  });
  const polls = controllableSleep();
  const worker = runMailboxWorker(directory, {
    root: repo,
    storage,
    observe: (request) =>
      watchCiExecution({ ...request, gh, sleep: polls.sleep }),
  });
  deferWorkerStop(teardown, worker, () =>
    requestMailboxStop(directory, { root: repo, storage }),
  );
  const poll = polls.of(worker, () => readMailboxEvents(directory));
  await poll.reached();
  assert.deepEqual(
    readRevisionCoverage(directory).find(({ sha }) => sha === ignoredSuccess)
      .basis,
    { sha: successfulAncestor, state: "pending" },
  );
  assert.deepEqual(
    readRevisionCoverage(directory).find(({ sha }) => sha === ignoredFailure)
      .basis,
    { sha: failedAncestor, state: "pending" },
  );
  const inheritedSuccessWait = awaitRevision(directory, ignoredSuccess, {
    root: repo,
    storage,
    workerLiveness: () => "alive",
  });
  const inheritedFailureWait = awaitRevision(directory, ignoredFailure, {
    root: repo,
    storage,
    workerLiveness: () => "alive",
  });
  attempts.set(successfulAncestor, {
    status: "completed",
    conclusion: "success",
    databaseId: 71,
  });
  attempts.set(failedAncestor, {
    status: "completed",
    conclusion: "failure",
    databaseId: 72,
  });
  poll.release();
  assert.equal((await inheritedSuccessWait).verdict, "success");
  assert.equal((await inheritedFailureWait).verdict, "failure");

  attempts.set(ignoredSuccess, {
    status: "completed",
    conclusion: "failure",
    databaseId: 74,
  });
  await poll.reached();
  await poll.advance();
  assert.equal(
    readRevisionCoverage(directory).find(({ sha }) => sha === ignoredSuccess)
      ?.state,
    "failure",
    "exact ignored revision attempt",
  );
  const exact = await awaitRevision(directory, ignoredSuccess, {
    root: repo,
    storage,
    workerLiveness: () => "alive",
  });
  assert.equal(exact.verdict, "failure");
  assert.equal(exact.effectiveEvidence.source, "exact");
  assert.equal(
    readRevisionCoverage(directory).find(({ sha }) => sha === unrelated).state,
    "success",
  );
});
