import assert from "node:assert/strict";
import { mkdtempSync, readFileSync } from "node:fs";
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
import { context, input, runHostHook } from "./ci-host-hook-test-fixtures.mjs";
import { controllableSleep } from "./ci-observer-poll-sleep-test-fixtures.mjs";
import { modeledGithubActions } from "./watch-ci-test-fixtures.mjs";
import {
  deferWorkerStop,
  fixtureTeardown,
} from "./fixture-teardown-test-fixtures.mjs";

test("a selected workflow with a non-default display name delivers a late failure to its owning coordinator and then records the registered repair's success, while unrelated runs, a sibling, and another owner stay isolated", async (t) => {
  const storage = mkdtempSync(join(tmpdir(), "ci-late-github-"));
  const teardown = fixtureTeardown(storage);
  t.after(teardown.cleanup);

  const shaA = "a".repeat(40);
  const shaSibling = "b".repeat(40);
  const shaOther = "c".repeat(40);
  const shaRepair = "d".repeat(40);
  const shaUnrelated = "e".repeat(40);
  const branch = "feature/late";
  const otherBranch = "feature/other";
  const failed = { status: "completed", conclusion: "failure" };
  const failedRun = (workflow, databaseId, headSha, headBranch) => ({
    workflow,
    databaseId,
    headSha,
    headBranch,
    ...failed,
  });

  // One modeled repository: the selected `ci.yml` declares a display name
  // other than `CI`, beside a deployment workflow. Every listing is answered
  // for the requested workflow, branch, commit and event only.
  const github = modeledGithubActions({
    workflows: { "ci.yml": "Project checks", "deploy.yml": "Deploy" },
    runs: [
      failedRun("deploy.yml", 300, shaA, branch),
      failedRun("ci.yml", 301, shaUnrelated, branch),
      failedRun("ci.yml", 302, shaRepair, "main"),
      failedRun("ci.yml", 900, shaOther, otherBranch),
    ],
    jobs: {
      300: [{ databaseId: 3000, name: "deploy", conclusion: "failure" }],
      301: [{ databaseId: 3010, name: "build", conclusion: "failure" }],
      302: [{ databaseId: 3020, name: "build", conclusion: "failure" }],
      900: [{ databaseId: 9000, name: "build", conclusion: "failure" }],
    },
  });

  const directory = createMailbox(
    { mode: "execution", repo: "owner/project", branch, maxDurationMs: 60_000 },
    { storage },
  );
  const otherDirectory = createMailbox(
    {
      mode: "execution",
      repo: "owner/project",
      branch: otherBranch,
      maxDurationMs: 60_000,
    },
    { storage },
  );
  registerPushedRevision(directory, shaA);
  registerPushedRevision(directory, shaSibling);
  registerPushedRevision(otherDirectory, shaOther);

  // Attach both mailboxes to distinct coordinators before any CI activity,
  // so later delivery proves ownership rather than incidental attach timing.
  await runHostHook("claude", input("claude", directory), { storage });
  await runHostHook(
    "claude",
    input("claude", otherDirectory, { session_id: "owner-two" }),
    { storage },
  );

  const startWorker = (mailbox, sleep) => {
    const worker = runMailboxWorker(mailbox, {
      storage,
      observe: (request) =>
        watchCiExecution({ ...request, gh: github.gh, sleep }),
    });
    deferWorkerStop(teardown, worker, () =>
      requestMailboxStop(mailbox, { storage }),
    );
    return worker;
  };
  const polls = controllableSleep();
  const worker = startWorker(directory, polls.sleep);
  const otherPolls = controllableSleep();
  const otherWorker = startWorker(otherDirectory, otherPolls.sleep);

  const poll = polls.of(worker, () => readMailboxEvents(directory));
  await poll.reached();
  assert.equal(github.listCallCount(branch), 1, "initial poll");
  let pollCount = 1;
  const advancePoll = async () => {
    pollCount += 1;
    await poll.advance();
    assert.equal(github.listCallCount(branch), pollCount, `poll ${pollCount}`);
  };
  // A selected run for this branch, still running when it first appears.
  const runningCiRun = (databaseId, headSha) => ({
    workflow: "ci.yml",
    databaseId,
    headSha,
    headBranch: branch,
    status: "in_progress",
    conclusion: null,
    url: `https://github.com/owner/project/actions/runs/${databaseId}`,
  });
  const coverage = () =>
    Object.fromEntries(
      readRevisionCoverage(directory).map(({ sha, state }) => [sha, state]),
    );
  await advancePoll();
  await advancePoll();

  // Many polls with no selected run for a registered revision: the deploy
  // failure for A, the unrelated revision's failure, and the repair SHA's
  // failure on another branch satisfy nothing and deliver nothing.
  assert.deepEqual(coverage(), {
    [shaA]: "undiscovered",
    [shaSibling]: "undiscovered",
  });
  assert.deepEqual(readMailboxEvents(directory), []);

  const runA = runningCiRun(501, shaA);
  github.runs.push(runA);
  await advancePoll(); // exposes the running attempt for A only
  assert.deepEqual(coverage(), {
    [shaA]: "pending",
    [shaSibling]: "undiscovered",
  });
  assert.deepEqual(readMailboxEvents(directory), []);

  Object.assign(runA, failed);
  github.jobs[501] = [
    { databaseId: 5010, name: "build", conclusion: "failure" },
  ];
  await advancePoll(); // A fails; the sibling never appears
  assert.deepEqual(coverage(), {
    [shaA]: "failure",
    [shaSibling]: "undiscovered",
  });
  const events = readMailboxEvents(directory).map(({ event }) => event);
  // CI_FAILURE for the late run is the first and only event for that revision.
  assert.deepEqual(
    events.map(({ type, sha, runId, workflow }) => [
      type,
      sha,
      runId,
      workflow,
    ]),
    [["CI_FAILURE", shaA, 501, "ci.yml"]],
  );

  await otherPolls
    .of(otherWorker, () => readMailboxEvents(otherDirectory))
    .reached();
  assert.ok(
    readMailboxEvents(otherDirectory).some(
      ({ event }) => event.type === "CI_FAILURE",
    ),
    "other coordinator's real failure",
  );

  const delivered = await runHostHook("claude", input("claude"), { storage });
  const deliveredText = context(delivered);
  assert.match(deliveredText, /"type":"CI_FAILURE"/);
  assert.match(deliveredText, new RegExp(`"sha":"${shaA}"`));
  assert.match(deliveredText, /"runId":501/);
  for (const foreign of [shaOther, shaUnrelated, shaRepair, shaSibling])
    assert.doesNotMatch(deliveredText, new RegExp(foreign));
  assert.doesNotMatch(deliveredText, /"runId":(300|301|302|900)\b/);

  const otherDelivered = await runHostHook(
    "claude",
    input("claude", undefined, { session_id: "owner-two" }),
    { storage },
  );
  const otherDeliveredText = context(otherDelivered);
  assert.match(otherDeliveredText, new RegExp(`"sha":"${shaOther}"`));
  assert.doesNotMatch(otherDeliveredText, new RegExp(shaA));
  assert.doesNotMatch(otherDeliveredText, new RegExp(shaSibling));

  // The owner pushes and registers a repair; its selected run then succeeds.
  registerPushedRevision(directory, shaRepair);
  const runRepair = runningCiRun(502, shaRepair);
  github.runs.push(runRepair);
  await advancePoll();
  assert.equal(coverage()[shaRepair], "pending");
  Object.assign(runRepair, { status: "completed", conclusion: "success" });
  await advancePoll();
  assert.deepEqual(coverage(), {
    [shaA]: "failure",
    [shaSibling]: "undiscovered",
    [shaRepair]: "success",
  });

  // Success is delivered through the existing revision verdict, without a new
  // failure notification and without erasing A's recorded failure.
  const repairVerdict = await awaitRevision(directory, shaRepair, { storage });
  assert.equal(repairVerdict.verdict, "success");
  assert.equal(repairVerdict.effectiveEvidence.revision.checkedBy.runId, 502);
  const failureVerdict = await awaitRevision(directory, shaA, { storage });
  assert.equal(failureVerdict.verdict, "failure");
  assert.equal(failureVerdict.effectiveEvidence.revision.checkedBy.runId, 501);
  const afterRepair = await runHostHook("claude", input("claude"), { storage });
  assert.doesNotMatch(context(afterRepair) ?? "", /CI_FAILURE/);

  requestMailboxStop(directory, { storage });
  requestMailboxStop(otherDirectory, { storage });
  await worker;
  await otherWorker;

  const terminal = JSON.parse(
    readFileSync(join(directory, "result.json"), "utf8"),
  );
  assert.deepEqual(terminal.coverage.unproved, [
    { sha: shaSibling, state: "undiscovered" },
  ]);
  assert.deepEqual(coverage(), {
    [shaA]: "failure",
    [shaSibling]: "undiscovered",
    [shaRepair]: "success",
  });
});
