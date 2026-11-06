import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
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
import {
  acceptedWorkflow,
  commitAll,
  exec,
  git,
  initRepo,
  writeWorkflow,
} from "./ci-path-applicability-test-fixtures.mjs";
import { crossBranchHistoryGithub } from "./ci-revision-coverage-not-required-cross-branch-test-fixtures.mjs";

test("ignored-only story branch inherits a successful trunk ancestor run as not_required and awaitRevision returns success", async (t) => {
  const repo = await initRepo();
  const storage = mkdtempSync(join(tmpdir(), "ci-cross-branch-success-"));
  const teardown = fixtureTeardown(storage, repo);
  t.after(teardown.cleanup);

  await exec("mkdir", ["-p", join(repo, "src")]);
  writeFileSync(join(repo, "src", "app.js"), "console.log('A');\n");
  writeWorkflow(repo, acceptedWorkflow);
  const shaA = await commitAll(repo, "non-ignored ancestor on main");
  const storyBranch = "feature/cross-branch-success";
  await git(repo, "checkout", "-q", "-b", storyBranch);
  await exec("mkdir", ["-p", join(repo, ".planning")]);
  writeFileSync(join(repo, ".planning", "note.md"), "note\n");
  const shaB = await commitAll(repo, "ignored-only story tip");

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
  const repo = await initRepo();
  const storage = mkdtempSync(join(tmpdir(), "ci-cross-branch-nearer-"));
  const teardown = fixtureTeardown(storage, repo);
  t.after(teardown.cleanup);

  await exec("mkdir", ["-p", join(repo, "src")]);
  writeFileSync(join(repo, "src", "app.js"), "console.log('A');\n");
  writeWorkflow(repo, acceptedWorkflow);
  const shaA = await commitAll(repo, "older trunk ancestor");
  const storyBranch = "feature/cross-branch-nearer";
  await git(repo, "checkout", "-q", "-b", storyBranch);
  writeFileSync(join(repo, "src", "app.js"), "console.log('M');\n");
  const shaM = await commitAll(repo, "nearer own-branch ancestor");
  await exec("mkdir", ["-p", join(repo, ".planning")]);
  writeFileSync(join(repo, ".planning", "note.md"), "note\n");
  const shaB = await commitAll(repo, "ignored-only story tip");

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
