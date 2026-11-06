import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
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

test("a non-ignored story-branch revision stays undiscovered until its own exact run appears", async (t) => {
  const repo = await initRepo();
  const storage = mkdtempSync(join(tmpdir(), "ci-cross-branch-required-"));
  const teardown = fixtureTeardown(storage, repo);
  t.after(teardown.cleanup);

  await exec("mkdir", ["-p", join(repo, "src")]);
  writeFileSync(join(repo, "src", "app.js"), "console.log('A');\n");
  writeWorkflow(repo, acceptedWorkflow);
  const shaA = await commitAll(repo, "non-ignored ancestor on main");
  const storyBranch = "feature/cross-branch-required";
  await git(repo, "checkout", "-q", "-b", storyBranch);
  writeFileSync(join(repo, "src", "app.js"), "console.log('B');\n");
  const shaB = await commitAll(repo, "non-ignored story tip");

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

  const exactRun = { current: undefined };
  const polls = controllableSleep();
  const github = crossBranchHistoryGithub({
    storyBranch,
    storyBranchHistory: [],
    allBranchHistory: [
      run({
        headSha: shaA,
        headBranch: "main",
        databaseId: 601,
        workflowName: "CI",
        event: "push",
        status: "completed",
        conclusion: "success",
        url: "https://github.com/owner/project/actions/runs/601",
      }),
    ],
    regularRuns: () => (exactRun.current ? [exactRun.current] : []),
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
  const coverageOf = (sha) =>
    readRevisionCoverage(directory).find((revision) => revision.sha === sha);
  assert.equal(coverageOf(shaB).state, "undiscovered");
  assert.equal(coverageOf(shaB).basis, undefined);

  exactRun.current = run({
    headSha: shaB,
    headBranch: storyBranch,
    databaseId: 602,
    workflowName: "CI",
    event: "push",
    status: "completed",
    conclusion: "success",
    url: "https://github.com/owner/project/actions/runs/602",
  });
  await poll.advance();
  assert.equal(coverageOf(shaB).state, "success");
  assert.deepEqual(coverageOf(shaB).checkedBy, {
    runId: 602,
    attemptId: 1,
  });

  requestMailboxStop(directory, { root: repo, storage });
  await worker;
});
