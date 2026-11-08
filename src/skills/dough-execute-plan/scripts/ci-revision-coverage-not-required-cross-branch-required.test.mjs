import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
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
import { makeMe } from "../../../../tests/support/makeMe.mjs";
import { materializeRepository } from "../../../../tests/support/repository-fixture.mjs";
import {
  acceptedWorkflow,
  workflowPath,
} from "./ci-path-applicability-test-fixtures.mjs";
import { crossBranchHistoryGithub } from "./ci-revision-coverage-not-required-cross-branch-test-fixtures.mjs";

test("a non-ignored story-branch revision stays undiscovered until its own exact run appears", async (t) => {
  const storage = mkdtempSync(join(tmpdir(), "ci-cross-branch-required-"));
  const storyBranch = "feature/cross-branch-required";
  // Non-ignored ancestor A on main and non-ignored story tip B on the story
  // branch's checkout.
  const {
    execution: repo,
    fixture,
    revisions: { a: shaA, b: shaB },
  } = await materializeRepository(
    makeMe.aRepository
      .withRevision("a", {
        backlog: undefined,
        files: {
          "src/app.js": "console.log('A');\n",
          [workflowPath]: acceptedWorkflow,
        },
      })
      .withWorkspace(storyBranch, { from: "a" })
      .withUnpublishedRevision("b", {
        files: { "src/app.js": "console.log('B');\n" },
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
