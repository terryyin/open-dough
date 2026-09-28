// Startup reusing an existing owned or host worktree that trunk has moved
// past: a clean one with no commits of its own is fast-forwarded to fetched
// trunk and the work continues there. Refresh eligibility owns the other
// refusal variations; startup proves that its own commits fail setup with
// nothing published, and that a stopped rebase on its detached HEAD reports
// the ongoing operation rather than the branch.
import assert from "node:assert/strict";
import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import {
  advanceOriginFromAnotherWriter,
  captureCheckout,
  exec,
  git,
  lsRemoteSha,
  revParse,
} from "./publication-test-fixtures.mjs";
import {
  createQueuedTrunk,
  readyContributing,
  startCliResult,
} from "./workspace-publication-fixtures.mjs";
import {
  ownedWorktreeOnly,
  startOwned,
} from "./default-checkout-test-fixtures.mjs";
import { deliverFirstIncrement } from "./workspace-publication-startup-delivery-test-fixtures.mjs";

// A behind reused workspace continued on the advanced tip: the claim is
// built on it, the workspace holds the claim, and the first increment follows.
async function assertContinuedOnAdvancedTip(trunk, started, advanced) {
  const { receipt } = started;
  assert.equal(receipt.ok, true, started.stdout);
  assert.equal(receipt.status, "published");
  assert.equal(receipt.created, false);
  assert.equal(receipt.startingRevision, advanced);
  assert.equal(
    await lsRemoteSha(trunk.origin, "refs/heads/main"),
    receipt.publishedSha,
  );
  assert.equal(
    await revParse(trunk.origin, `${receipt.publishedSha}^`),
    advanced,
  );
  assert.equal(await revParse(started.workspace, "HEAD"), receipt.publishedSha);
  await deliverFirstIncrement(trunk, {
    workspace: started.workspace,
    branch: started.branch,
    publishedSha: receipt.publishedSha,
  });
}

test("a clean owned worktree that trunk moved past, with no default checkout, is fast-forwarded and continues to its first increment", async (t) => {
  const trunk = await createQueuedTrunk({ contributing: readyContributing });
  t.after(trunk.cleanup);
  const owned = await ownedWorktreeOnly(trunk, "owned-behind", "exec/behind");
  const advanced = await advanceOriginFromAnotherWriter(trunk.origin);

  const started = await startOwned(trunk, owned, "trunk");
  assert.deepEqual(started.receipt.maintenance, { result: "not applicable" });
  await assertContinuedOnAdvancedTip(trunk, started, advanced);
});

test("a clean host worktree that trunk moved past is fast-forwarded beside a refreshed default checkout and continues to its first increment", async (t) => {
  const trunk = await createQueuedTrunk({ contributing: readyContributing });
  t.after(trunk.cleanup);
  const workspace = join(trunk.fixture, "host-behind");
  await git(
    trunk.integration,
    "worktree",
    "add",
    "-q",
    "-b",
    "exec/host",
    workspace,
    "origin/main",
  );
  const advanced = await advanceOriginFromAnotherWriter(trunk.origin);

  const started = await startCliResult(trunk, "trunk", [], {
    workspace,
    branch: "exec/host",
  });
  assert.equal(started.receipt.maintenance?.result, "advanced", started.stdout);
  await assertContinuedOnAdvancedTip(trunk, started, advanced);
});

// Where Git keeps `name` for this worktree.
const gitPath = async (workspace, name) =>
  (
    await git(
      workspace,
      "rev-parse",
      "--path-format=absolute",
      "--git-path",
      name,
    )
  ).stdout.trim();

// Each state is made in the owned worktree on real Git state; `advance` then
// moves trunk past it.
const refusals = [
  {
    name: "its own commit",
    advance: false,
    reason: "unpublished-commits",
    make: async (workspace) => {
      writeFileSync(join(workspace, "own.txt"), "own work\n");
      await git(workspace, "add", "own.txt");
      await git(workspace, "commit", "-q", "-m", "own unpublished work");
    },
  },
  {
    name: "a rebase stopped at a break",
    advance: true,
    reason: "ongoing-operation",
    make: (workspace) =>
      exec(
        "git",
        ["-c", "sequence.editor=echo break >", "rebase", "-q", "-i", "HEAD"],
        {
          cwd: workspace,
        },
      ),
    state: "rebase-merge",
    detached: true,
  },
];

const statePresent = async (workspace, state) =>
  existsSync(await gitPath(workspace, state));

for (const refusal of refusals)
  test(`a reused owned worktree with ${refusal.name} is refused and left unchanged`, async (t) => {
    const trunk = await createQueuedTrunk();
    t.after(trunk.cleanup);
    const owned = await ownedWorktreeOnly(trunk, "owned-kept", "exec/kept");
    await refusal.make(owned.workspace);
    const tip = refusal.advance
      ? await advanceOriginFromAnotherWriter(trunk.origin)
      : trunk.trunkSha;
    if (refusal.state)
      assert.equal(await statePresent(owned.workspace, refusal.state), true);
    if (refusal.detached)
      assert.equal(
        (await git(owned.workspace, "branch", "--show-current")).stdout.trim(),
        "",
      );
    const before = await captureCheckout(owned.workspace);

    const started = await startOwned(trunk, owned, "trunk");
    assert.equal(started.code, 1, started.stdout);
    assert.equal(started.receipt.status, "setup-failed");
    assert.match(
      started.receipt.recovery.error,
      new RegExp(
        `cannot continue on fetched trunk as exec/kept: ${refusal.reason}$`,
      ),
    );
    assert.deepEqual(await captureCheckout(owned.workspace), before);
    if (refusal.state)
      assert.equal(await statePresent(owned.workspace, refusal.state), true);
    assert.equal(await lsRemoteSha(trunk.origin, "refs/heads/main"), tip);
  });
