// Startup with no default checkout: an owned worktree of a repository that
// has no default working tree supplies Git access, the claim is published and
// the work continues there, and local refresh is not applicable. Admission
// without one is covered with the other admission cases.
import assert from "node:assert/strict";
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { git, lsRemoteSha, revParse } from "./publication-test-fixtures.mjs";
import {
  createQueuedTrunk,
  identityA,
  readyContributing,
  remoteBacklog,
  startCliResult,
} from "./workspace-publication-fixtures.mjs";
import { ownedWorktreeOnly } from "./default-checkout-test-fixtures.mjs";
import { resumeArgs } from "./workspace-publication-startup-test-fixtures.mjs";
import { startExecution } from "./execution-start.mjs";
import { deliverFirstIncrement } from "./workspace-publication-startup-delivery-test-fixtures.mjs";
import { takenIdentities } from "./workspace-publication-ownership.mjs";

const notApplicable = { result: "not applicable" };

// Starts in `owned` with no --integration.
const startOwned = (trunk, owned, mode, extra = [], options = {}) =>
  startCliResult(trunk, mode, extra, {
    integration: null,
    workspace: owned.workspace,
    branch: owned.branch,
    ...options,
  });

// The checkouts the repository has: its own Git directory and each worktree.
async function worktreePaths(repository) {
  const { stdout } = await git(repository, "worktree", "list", "--porcelain");
  return stdout
    .split("\n")
    .filter((line) => line.startsWith("worktree "))
    .map((line) => line.slice("worktree ".length));
}

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

test("without a default checkout, an unusable repository, remote, workspace, or authority starts nothing", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  const owned = await ownedWorktreeOnly(trunk, "owned-r", "exec/owned-r");
  const unchanged = async (label) => {
    assert.equal(
      await lsRemoteSha(trunk.origin, "refs/heads/main"),
      trunk.trunkSha,
      label,
    );
    assert.equal(
      await revParse(owned.workspace, "HEAD"),
      trunk.trunkSha,
      label,
    );
    assert.deepEqual(
      await worktreePaths(owned.repository),
      [owned.repository, owned.workspace],
      label,
    );
  };

  const absent = join(trunk.fixture, "absent");
  const missing = await startOwned(trunk, owned, "trunk", [], {
    workspace: absent,
  });
  assert.equal(missing.receipt.status, "invalid-request", missing.stdout);
  assert.match(missing.receipt.error, /--integration/);
  assert.equal(existsSync(absent), false);
  await unchanged("missing workspace");

  const plain = join(trunk.fixture, "not-a-repository");
  mkdirSync(plain);
  const notRepository = await startOwned(trunk, owned, "trunk", [], {
    workspace: plain,
  });
  assert.equal(notRepository.code, 1, notRepository.stdout);
  assert.equal(notRepository.receipt.status, "source-refused");
  await unchanged("not a repository");

  const wrongRemote = await startOwned(trunk, owned, "trunk", [
    "--remote",
    "upstream",
  ]);
  assert.equal(wrongRemote.code, 1, wrongRemote.stdout);
  assert.equal(wrongRemote.receipt.status, "source-refused");
  await unchanged("wrong remote");

  const unauthorized = await startExecution({
    workspace: owned.workspace,
    branch: owned.branch,
    identity: identityA,
    publisherId: "publisher-trunk",
    mode: "trunk",
    remote: "origin",
    target: "main",
    workspaceAuthorized: true,
  });
  assert.equal(unauthorized.status, "authority-required");
  await unchanged("missing authority");
});
