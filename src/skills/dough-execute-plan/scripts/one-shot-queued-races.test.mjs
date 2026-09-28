// Queued one-shot delivery racing another owner: a Take or a preparation
// announcement published after the start, or a Take that lands only before
// the retry push, stops publication with that holder intact on remote trunk
// and the local candidate preserved.
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { join } from "node:path";
import { test } from "node:test";
import { promisify } from "node:util";
import { rebaseInProgress } from "../../dough-product-backlog/scripts/product-backlog-git-operation-state.mjs";
import {
  commitQueuedResult,
  createSiblingTrunk,
  deliverQueued,
  identityB,
  queuedDelivery,
  remoteLists,
  rivalPreparation,
  rivalTake,
  startQueuedOneShot,
  trunkTarget,
} from "./one-shot-queued-test-fixtures.mjs";
import { git, lsRemoteSha, revParse } from "./publication-test-fixtures.mjs";

const repo = "owner/project";

async function startAndCommit(trunk) {
  const started = await startQueuedOneShot(trunk);
  assert.equal(started.receipt.ok, true, started.stdout);
  const result = await commitQueuedResult(started.workspace);
  const fixture = await queuedDelivery(trunk, started.workspace);
  return { started, fixture, result };
}

// The stop names the holder; the remote keeps the holder's tip; the
// workspace keeps the result commit as the unpushed candidate, with no
// rebase in progress.
async function assertHeld(trunk, fixture, stopped, holderTip) {
  assert.equal(stopped.ok, false, JSON.stringify(stopped));
  assert.equal(stopped.publication, "stopped");
  assert.equal(stopped.status, "ownership-changed");
  assert.equal(stopped.ownership.identity, identityB);
  assert.equal(await lsRemoteSha(trunk.origin, trunkTarget), holderTip);
  assert.equal(await revParse(fixture.execution, "HEAD"), stopped.candidate);
  assert.equal(
    (
      await git(fixture.execution, "log", "-1", "--format=%s", "HEAD")
    ).stdout.trim(),
    "Complete story B as one-shot work",
  );
  const { stdout } = await git(
    fixture.execution,
    "show",
    `${stopped.candidate}:feature.txt`,
  );
  assert.equal(stdout, "B's result\n");
  assert.equal((await git(fixture.execution, "ls-files", "-u")).stdout, "");
  assert.equal(rebaseInProgress(fixture.execution), undefined);
}

test("a Take published after the start stops the guarded delivery", async (t) => {
  const trunk = await createSiblingTrunk();
  t.after(trunk.cleanup);
  const { started, fixture } = await startAndCommit(trunk);
  const take = await rivalTake(trunk);

  const { delivered, code } = await deliverQueued(
    fixture,
    started.receipt.startingRevision,
  );
  assert.equal(code, 1);
  assert.match(delivered.error, /already Taken/);
  await assertHeld(trunk, fixture, delivered, take);
  assert.deepEqual((await remoteLists(trunk)).taken, [identityB]);
});

test("a preparation announcement published after the start stops the guarded delivery", async (t) => {
  const trunk = await createSiblingTrunk();
  t.after(trunk.cleanup);
  const { started, fixture } = await startAndCommit(trunk);
  const announced = await rivalPreparation(trunk);

  const delivered = await fixture.deliverManagedExecutionIncrement({
    ...fixture.requestBase,
    workspace: fixture.execution,
    branch: "exec/story",
    previouslyPublishedBase: started.receipt.startingRevision,
    targetRef: trunkTarget,
    repo,
    validate: async () => ({ ok: true }),
    oneShotIdentity: identityB,
  });
  assert.match(delivered.error, /held on fetched trunk by .* for preparation/);
  await assertHeld(trunk, fixture, delivered, announced);
  assert.deepEqual((await remoteLists(trunk)).queued, [
    "SEED-A#a",
    identityB,
    "SEED-B#b2",
  ]);
});

// Delivers B's result while `race` publishes a rival holder just before the
// first push, so that push is rejected and the target fetched again.
async function deliverRacingFirstPush(trunk, race) {
  const { started, fixture, result } = await startAndCommit(trunk);
  const attempts = [];
  let holderTip;
  const delivered = await fixture.deliverManagedExecutionIncrement({
    ...fixture.requestBase,
    workspace: fixture.execution,
    branch: "exec/story",
    previouslyPublishedBase: started.receipt.startingRevision,
    targetRef: trunkTarget,
    repo,
    validate: async () => ({ ok: true }),
    oneShotIdentity: identityB,
    beforePush: async ({ attempt }) => {
      attempts.push(attempt);
      if (attempt === 0) holderTip = await race(trunk);
    },
  });
  // The guard stopped on the re-fetched tip: nothing was rebased, and
  // neither the caller's hook nor a second push ran.
  assert.deepEqual(attempts, [0]);
  assert.equal(delivered.reconciliations, 0);
  assert.equal(delivered.candidate, result);
  await assertHeld(trunk, fixture, delivered, holderTip);
}

test("a preparation announcement landing only before the retry push stops before it", async (t) => {
  const trunk = await createSiblingTrunk();
  t.after(trunk.cleanup);
  await deliverRacingFirstPush(trunk, rivalPreparation);
});

test("a Take landing only before the retry push stops before it", async (t) => {
  const trunk = await createSiblingTrunk();
  t.after(trunk.cleanup);
  await deliverRacingFirstPush(trunk, rivalTake);
  assert.deepEqual((await remoteLists(trunk)).taken, [identityB]);
});

test("a Take landing after the retry's reconciliation is refused by the remote", async (t) => {
  const trunk = await createSiblingTrunk();
  t.after(trunk.cleanup);
  const { started, fixture } = await startAndCommit(trunk);
  let take;

  const delivered = await fixture.deliverManagedExecutionIncrement({
    ...fixture.requestBase,
    workspace: fixture.execution,
    branch: "exec/story",
    previouslyPublishedBase: started.receipt.startingRevision,
    targetRef: trunkTarget,
    repo,
    validate: async () => ({ ok: true }),
    oneShotIdentity: identityB,
    beforePush: async ({ attempt }) => {
      if (attempt === 0)
        await git(
          trunk.integration,
          "commit",
          "-q",
          "--allow-empty",
          "-m",
          "unrelated",
        ).then(() => git(trunk.integration, "push", "-q", "origin", "main"));
    },
    beforeRetryPush: async () => {
      take = await rivalTake(trunk);
    },
  });
  assert.equal(delivered.status, "persistent-contention");
  assert.equal(await lsRemoteSha(trunk.origin, trunkTarget), take);
  assert.deepEqual((await remoteLists(trunk)).taken, [identityB]);
});

test("resuming a guarded delivery refuses to push over a holder its candidate was reconciled onto", async (t) => {
  const trunk = await createSiblingTrunk();
  t.after(trunk.cleanup);
  const { fixture } = await startAndCommit(trunk);
  const announced = await rivalPreparation(trunk);
  // Delivery was interrupted after reconciling onto the announcement.
  await git(fixture.execution, "fetch", "-q", "origin");
  await git(fixture.execution, "rebase", "-q", "origin/main");
  const candidate = await revParse(fixture.execution, "HEAD");

  const { stdout, code } = await promisify(execFile)(
    process.execPath,
    [
      join(fixture.skill, "scripts/execution-increment-resume.mjs"),
      "resume",
      ...["--workspace", fixture.execution, "--candidate-sha", candidate],
      ...["--target-ref", trunkTarget, "--repo", repo],
      ...["--one-shot-identity", identityB],
    ],
    { cwd: fixture.execution, env: fixture.env },
  ).catch((error) => error);
  assert.equal(code, 1, stdout);
  const resumed = JSON.parse(stdout.trim().split("\n").at(-1));
  fixture.stopAtTeardown(resumed.observation?.directory);
  assert.equal(resumed.pushCount, 0);
  await assertHeld(trunk, fixture, resumed, announced);
});
