import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
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
import {
  controllableSleep,
  waitFor,
} from "./ci-revision-coverage-late-github-failure-test-fixtures.mjs";
import { modeledGithubActions } from "./watch-ci-test-fixtures.mjs";

test("a selected workflow with a non-default display name delivers a late failure to its owning coordinator and then records the registered repair's success, while unrelated runs, a sibling, and another owner stay isolated", async (t) => {
  const storage = mkdtempSync(join(tmpdir(), "ci-late-github-"));
  // Declared with `let` (not const) so the cleanup below can stop whichever
  // mailboxes/workers were actually created if setup fails partway through.
  // eslint-disable-next-line prefer-const
  let worker, otherWorker, directory, otherDirectory;
  t.after(async () => {
    if (directory) requestMailboxStop(directory, { storage });
    if (otherDirectory) requestMailboxStop(otherDirectory, { storage });
    await Promise.allSettled([worker, otherWorker]);
    rmSync(storage, { recursive: true, force: true });
  });

  const shaA = "a".repeat(40);
  const shaSibling = "b".repeat(40);
  const shaOther = "c".repeat(40);
  const shaRepair = "d".repeat(40);
  const shaUnrelated = "e".repeat(40);
  const branch = "feature/late";
  const otherBranch = "feature/other";
  const failed = { status: "completed", conclusion: "failure" };

  // One modeled repository: the selected `ci.yml` declares a display name
  // other than `CI`, beside a deployment workflow. Every listing is answered
  // for the requested workflow, branch, commit and event only.
  const github = modeledGithubActions({
    workflows: { "ci.yml": "Project checks", "deploy.yml": "Deploy" },
    runs: [
      {
        workflow: "deploy.yml",
        databaseId: 300,
        headSha: shaA,
        headBranch: branch,
        ...failed,
      },
      {
        workflow: "ci.yml",
        databaseId: 301,
        headSha: shaUnrelated,
        headBranch: branch,
        ...failed,
      },
      {
        workflow: "ci.yml",
        databaseId: 302,
        headSha: shaRepair,
        headBranch: "main",
        ...failed,
      },
      {
        workflow: "ci.yml",
        databaseId: 900,
        headSha: shaOther,
        headBranch: otherBranch,
        ...failed,
      },
    ],
    jobs: {
      300: [{ databaseId: 3000, name: "deploy", conclusion: "failure" }],
      301: [{ databaseId: 3010, name: "build", conclusion: "failure" }],
      302: [{ databaseId: 3020, name: "build", conclusion: "failure" }],
      900: [{ databaseId: 9000, name: "build", conclusion: "failure" }],
    },
  });

  directory = createMailbox(
    { mode: "execution", repo: "owner/project", branch, maxDurationMs: 60_000 },
    { storage },
  );
  otherDirectory = createMailbox(
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

  const { sleep, sleeps } = controllableSleep();
  worker = runMailboxWorker(directory, {
    storage,
    observe: (request) =>
      watchCiExecution({ ...request, gh: github.gh, sleep }),
  });
  const { sleep: otherSleep } = controllableSleep();
  otherWorker = runMailboxWorker(otherDirectory, {
    storage,
    observe: (request) =>
      watchCiExecution({ ...request, gh: github.gh, sleep: otherSleep }),
  });

  await waitFor(
    () => sleeps.length > 0 && github.listCallCount(branch) === 1,
    "initial poll",
  );
  let polls = 1;
  const advancePoll = async () => {
    polls += 1;
    sleeps.shift().resolve();
    await waitFor(
      () => github.listCallCount(branch) === polls && sleeps.length > 0,
      `poll ${polls}`,
    );
  };
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

  const runA = {
    workflow: "ci.yml",
    databaseId: 501,
    headSha: shaA,
    headBranch: branch,
    status: "in_progress",
    conclusion: null,
    url: "https://github.com/owner/project/actions/runs/501",
  };
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

  await waitFor(
    () =>
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
  const runRepair = {
    workflow: "ci.yml",
    databaseId: 502,
    headSha: shaRepair,
    headBranch: branch,
    status: "in_progress",
    conclusion: null,
    url: "https://github.com/owner/project/actions/runs/502",
  };
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
