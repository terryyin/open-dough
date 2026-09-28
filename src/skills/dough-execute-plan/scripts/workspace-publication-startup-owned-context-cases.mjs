// Startup with no default checkout: an owned worktree of a repository that
// has no default working tree, or that repository's Git directory, supplies
// Git access, the claim is published and the work continues in the owned
// workspace (reused or created), and local refresh is not applicable.
// Refusals are covered with the owned-context refusal cases, and admission
// without one with the other admission cases.
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import {
  advanceOriginFromAnotherWriter,
  captureCheckout,
  git,
  lsRemoteSha,
  revParse,
} from "./publication-test-fixtures.mjs";
import {
  createQueuedTrunk,
  identityA,
  readyContributing,
  remoteBacklog,
  startCliResult,
} from "./workspace-publication-fixtures.mjs";
import {
  ownedWorktreeOnly,
  startOwned,
  worktreePaths,
} from "./default-checkout-test-fixtures.mjs";
import { resumeArgs } from "./workspace-publication-startup-test-fixtures.mjs";
import { deliverFirstIncrement } from "./workspace-publication-startup-delivery-test-fixtures.mjs";
import { takenIdentities } from "./workspace-publication-ownership.mjs";

const notApplicable = { result: "not applicable" };

test("an owned worktree without a default checkout takes queued work, resumes it, sets up, and delivers its first increment", async (t) => {
  const trunk = await createQueuedTrunk({ contributing: readyContributing });
  t.after(trunk.cleanup);
  const owned = await ownedWorktreeOnly(trunk, "owned-a", "exec/owned-a");
  assert.equal(existsSync(trunk.integration), false);

  const started = await startOwned(trunk, owned, "trunk");
  const { receipt } = started;
  assert.equal(receipt.ok, true, started.stdout);
  assert.equal(receipt.status, "published");
  assert.equal(receipt.created, false);
  assert.equal(receipt.startingRevision, trunk.trunkSha);
  assert.deepEqual(receipt.maintenance, notApplicable);
  assert.equal("earlierMaintenance" in receipt, false);
  assert.equal(
    await lsRemoteSha(trunk.origin, "refs/heads/main"),
    receipt.publishedSha,
  );
  assert.equal(
    await revParse(trunk.origin, `${receipt.publishedSha}^`),
    trunk.trunkSha,
  );
  assert.match(
    (await git(trunk.origin, "log", "-1", "--format=%B", receipt.publishedSha))
      .stdout,
    /Claim-Publisher: publisher-trunk/,
  );
  assert.equal(
    takenIdentities(await remoteBacklog(owned.workspace)).includes(identityA),
    true,
  );
  assert.equal(await revParse(owned.workspace, "HEAD"), receipt.publishedSha);
  // The owned worktree was reused; no other checkout was created.
  assert.deepEqual(await worktreePaths(owned.repository), [
    owned.repository,
    owned.workspace,
  ]);

  // A mismatched resume stops; the matching one confirms the same claim.
  const mismatched = await startOwned(
    trunk,
    owned,
    "trunk",
    resumeArgs(receipt),
    {
      branch: "exec/other",
    },
  );
  assert.equal(mismatched.code, 1, mismatched.stdout);
  assert.equal(mismatched.receipt.status, "setup-failed");
  const resumed = await startOwned(trunk, owned, "trunk", resumeArgs(receipt));
  assert.equal(resumed.receipt.status, "resumed", resumed.stdout);
  assert.equal(resumed.receipt.publishedSha, receipt.publishedSha);
  assert.deepEqual(resumed.receipt.maintenance, notApplicable);
  assert.equal(
    await lsRemoteSha(trunk.origin, "refs/heads/main"),
    receipt.publishedSha,
  );

  await deliverFirstIncrement(trunk, {
    workspace: owned.workspace,
    branch: owned.branch,
    publishedSha: receipt.publishedSha,
  });
});

for (const context of ["workspace", "repository"])
  test(`the owned ${context === "workspace" ? "worktree" : "Git directory"} alone creates a new owned workspace at fetched trunk, which sets up and delivers its first increment`, async (t) => {
    const trunk = await createQueuedTrunk({ contributing: readyContributing });
    t.after(trunk.cleanup);
    const owned = await ownedWorktreeOnly(trunk, "owned-kept", "exec/kept");
    const fetched = await advanceOriginFromAnotherWriter(trunk.origin);
    const retained = await captureCheckout(owned.workspace);
    const workspace = join(trunk.fixture, "start-fresh");

    const started = await startCliResult(
      trunk,
      "trunk",
      ["--repository", owned[context]],
      { integration: null, workspace, branch: "exec/fresh" },
    );
    const { receipt } = started;
    assert.equal(receipt.ok, true, started.stdout);
    assert.equal(receipt.status, "published");
    assert.equal(receipt.created, true);
    assert.equal(receipt.startingRevision, fetched);
    assert.deepEqual(receipt.maintenance, notApplicable);
    assert.equal(
      await lsRemoteSha(trunk.origin, "refs/heads/main"),
      receipt.publishedSha,
    );
    assert.equal(
      await revParse(trunk.origin, `${receipt.publishedSha}^`),
      fetched,
    );
    assert.equal(await revParse(workspace, "HEAD"), receipt.publishedSha);
    assert.equal(
      (await git(workspace, "branch", "--show-current")).stdout.trim(),
      "exec/fresh",
    );
    assert.deepEqual(await captureCheckout(owned.workspace), retained);
    assert.deepEqual(await worktreePaths(owned.repository), [
      owned.repository,
      owned.workspace,
      workspace,
    ]);

    await deliverFirstIncrement(trunk, {
      workspace,
      branch: "exec/fresh",
      publishedSha: receipt.publishedSha,
    });
    assert.deepEqual(await captureCheckout(owned.workspace), retained);
  });

test("one-shot work starts in an owned worktree without a default checkout and publishes nothing", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  const owned = await ownedWorktreeOnly(trunk, "owned-once", "exec/owned-once");
  const { receipt, stdout } = await startOwned(
    trunk,
    owned,
    "trunk",
    ["--one-shot"],
    {
      identity: null,
    },
  );
  assert.equal(receipt.ok, true, stdout);
  assert.equal(receipt.status, "prepared");
  assert.equal(receipt.created, false);
  assert.equal(receipt.startingRevision, trunk.trunkSha);
  assert.deepEqual(receipt.maintenance, notApplicable);
  assert.equal(
    await lsRemoteSha(trunk.origin, "refs/heads/main"),
    trunk.trunkSha,
  );
});
