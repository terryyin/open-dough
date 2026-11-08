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
import { watchCiExecution } from "./watch-ci-execution.mjs";
import { run } from "./watch-ci-test-fixtures.mjs";
import {
  deferWorkerStop,
  fixtureTeardown,
} from "./fixture-teardown-test-fixtures.mjs";
import { controllableSleep } from "./ci-observer-poll-sleep-test-fixtures.mjs";
import { makeMe } from "../../../../tests/support/makeMe.mjs";
import { materializeRepository } from "../../../../tests/support/repository-fixture.mjs";
import {
  acceptedWorkflow,
  workflowPath,
} from "./ci-path-applicability-test-fixtures.mjs";
import { crossBranchHistoryGithub } from "./ci-revision-coverage-not-required-cross-branch-test-fixtures.mjs";

test("ignored-only story branch inherits a successful trunk ancestor run as not_required and awaitRevision returns success", async (t) => {
  const storage = mkdtempSync(join(tmpdir(), "ci-cross-branch-success-"));
  const storyBranch = "feature/cross-branch-success";
  // The story branch's checkout holds the ignored-only tip B of non-ignored
  // ancestor A on main.
  const {
    execution: repo,
    fixture,
    revisions: { a: shaA, b: shaB },
  } = await materializeRepository(
    makeMe.aRepository
      .withRevision("a", {
        backlog: null,
        files: {
          "src/app.js": "console.log('A');\n",
          [workflowPath]: acceptedWorkflow,
        },
      })
      .withWorkspace(storyBranch, { from: "a" })
      .withUnpublishedRevision("b", {
        files: { ".planning/note.md": "note\n" },
      })
      .please(),
  );
  const teardown = fixtureTeardown(storage, fixture);
  t.after(teardown.cleanup);

  const directory = createMailbox(
    {
      mode: "execution",
      repo: "owner/project",
      branch: storyBranch,
      maxDurationMs: 60_000,
    },
    { root: repo, storage },
  );
  registerPushedRevision(directory, shaB);

  const polls = controllableSleep();
  const github = crossBranchHistoryGithub({
    storyBranch,
    storyBranchHistory: [],
    allBranchHistory: [
      run({
        headSha: shaA,
        headBranch: "main",
        databaseId: 421,
        workflowName: "CI",
        event: "push",
        status: "completed",
        conclusion: "success",
        url: "https://github.com/owner/project/actions/runs/421",
      }),
    ],
  });
  const worker = runMailboxWorker(directory, {
    root: repo,
    storage,
    observe: (request) =>
      watchCiExecution({ ...request, gh: github.gh, sleep: polls.sleep }),
  });
  deferWorkerStop(teardown, worker, () =>
    requestMailboxStop(directory, { root: repo, storage }),
  );

  const poll = polls.of(worker, () => readMailboxEvents(directory));
  await poll.reached();

  const coverage = readRevisionCoverage(directory).find(
    (revision) => revision.sha === shaB,
  );
  assert.deepEqual(coverage, {
    sha: shaB,
    state: "not_required",
    basis: { sha: shaA, state: "success" },
    registeredAt: coverage.registeredAt,
  });
  assert.equal(github.storyHistoryCallCount(), 1);
  assert.equal(github.allBranchHistoryCallCount(), 1);

  const verdict = await awaitRevision(directory, shaB, {
    root: repo,
    storage,
    workerLiveness: () => "alive",
  });
  assert.equal(verdict.verdict, "success");
  assert.equal(verdict.effectiveEvidence.source, "not_required_basis");
  assert.deepEqual(verdict.effectiveEvidence.basis, {
    sha: shaA,
    state: "success",
  });

  requestMailboxStop(directory, { root: repo, storage });
  await worker;
});

test("a nearer own-branch ancestor run wins over a main ancestor in the all-branch listing", async (t) => {
  const storage = mkdtempSync(join(tmpdir(), "ci-cross-branch-nearer-"));
  const storyBranch = "feature/cross-branch-nearer";
  // Older trunk ancestor A, then nearer own-branch ancestor M and the
  // ignored-only story tip B on the story branch's checkout.
  const {
    execution: repo,
    fixture,
    revisions: { a: shaA, m: shaM, b: shaB },
  } = await materializeRepository(
    makeMe.aRepository
      .withRevision("a", {
        backlog: null,
        files: {
          "src/app.js": "console.log('A');\n",
          [workflowPath]: acceptedWorkflow,
        },
      })
      .withWorkspace(storyBranch, { from: "a" })
      .withUnpublishedRevision("m", {
        files: { "src/app.js": "console.log('M');\n" },
      })
      .withUnpublishedRevision("b", {
        files: { ".planning/note.md": "note\n" },
      })
      .please(),
  );
  const teardown = fixtureTeardown(storage, fixture);
  t.after(teardown.cleanup);

  const directory = createMailbox(
    {
      mode: "execution",
      repo: "owner/project",
      branch: storyBranch,
      maxDurationMs: 60_000,
    },
    { root: repo, storage },
  );
  registerPushedRevision(directory, shaB);

  const polls = controllableSleep();
  const github = crossBranchHistoryGithub({
    storyBranch,
    storyBranchHistory: [
      run({
        headSha: shaM,
        headBranch: storyBranch,
        databaseId: 702,
        workflowName: "CI",
        event: "push",
        status: "completed",
        conclusion: "success",
        url: "https://github.com/owner/project/actions/runs/702",
      }),
    ],
    allBranchHistory: [
      run({
        headSha: shaA,
        headBranch: "main",
        databaseId: 701,
        workflowName: "CI",
        event: "push",
        status: "completed",
        conclusion: "success",
        url: "https://github.com/owner/project/actions/runs/701",
      }),
    ],
  });
  const worker = runMailboxWorker(directory, {
    root: repo,
    storage,
    observe: (request) =>
      watchCiExecution({ ...request, gh: github.gh, sleep: polls.sleep }),
  });
  deferWorkerStop(teardown, worker, () =>
    requestMailboxStop(directory, { root: repo, storage }),
  );

  const poll = polls.of(worker, () => readMailboxEvents(directory));
  await poll.reached();
  const coverage = readRevisionCoverage(directory).find(
    (revision) => revision.sha === shaB,
  );
  assert.deepEqual(coverage.basis, { sha: shaM, state: "success" });
  assert.notEqual(coverage.basis.sha, shaA);
  assert.equal(github.storyHistoryCallCount(), 1);
  assert.equal(github.allBranchHistoryCallCount(), 1);

  requestMailboxStop(directory, { root: repo, storage });
  await worker;
});
