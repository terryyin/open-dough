import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { awaitRevision } from "./ci-mailbox-await.mjs";
import { whileObserving } from "./ci-mailbox-await-test-fixtures.mjs";
import {
  createMailbox,
  readRevisionCoverage,
  registerPushedRevision,
  requestMailboxStop,
  runMailboxWorker,
} from "./ci-mailbox.mjs";
import {
  acceptedWorkflow,
  commitAll,
  initRepo,
  writeWorkflow,
} from "./ci-path-applicability-test-fixtures.mjs";
import { controllableSleep } from "./ci-revision-coverage-late-github-failure-test-fixtures.mjs";
import { watchCiExecution } from "./watch-ci-execution.mjs";
import {
  deferWorkerStop,
  fixtureTeardown,
} from "./fixture-teardown-test-fixtures.mjs";
import { run } from "./watch-ci-test-fixtures.mjs";

test("ignored-only coverage follows successful and failed unregistered ancestors, until an exact attempt supersedes it", async (t) => {
  const repo = await initRepo();
  const storage = mkdtempSync(join(tmpdir(), "ci-await-inherited-"));
  const teardown = fixtureTeardown(storage, repo);
  t.after(teardown.cleanup);
  writeFileSync(join(repo, "application.js"), "console.log('A');\n");
  writeWorkflow(repo, acceptedWorkflow);
  const successfulAncestor = await commitAll(repo, "applicable success A1");
  mkdirSync(join(repo, ".planning"), { recursive: true });
  writeFileSync(join(repo, ".planning", "ignored-success.md"), "B1\n");
  const ignoredSuccess = await commitAll(repo, "ignored-only B1");
  writeFileSync(join(repo, "application.js"), "console.log('A2');\n");
  const failedAncestor = await commitAll(repo, "applicable failure A2");
  writeFileSync(join(repo, ".planning", "ignored-failure.md"), "B2\n");
  const ignoredFailure = await commitAll(repo, "ignored-only B2");
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
  const gh = async (args) => {
    if (args[0] === "run" && args[1] === "list")
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
    if (args[0] === "run" && args[1] === "view") return { jobs: [] };
    throw new Error(`Unexpected gh call: ${JSON.stringify(args)}`);
  };
  const { sleep, sleeps } = controllableSleep();
  const worker = runMailboxWorker(directory, {
    root: repo,
    storage,
    observe: (request) => watchCiExecution({ ...request, gh, sleep }),
  });
  deferWorkerStop(teardown, worker, () =>
    requestMailboxStop(directory, { root: repo, storage }),
  );
  const awaitObserved = whileObserving(worker);
  await awaitObserved(() => sleeps.length > 0, "initial inherited poll");
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
  sleeps.shift().resolve();
  assert.equal((await inheritedSuccessWait).verdict, "success");
  assert.equal((await inheritedFailureWait).verdict, "failure");

  attempts.set(ignoredSuccess, {
    status: "completed",
    conclusion: "failure",
    databaseId: 74,
  });
  await awaitObserved(() => sleeps.length > 0, "next inherited poll");
  sleeps.shift().resolve();
  await awaitObserved(
    () =>
      readRevisionCoverage(directory).find(({ sha }) => sha === ignoredSuccess)
        ?.state === "failure",
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
