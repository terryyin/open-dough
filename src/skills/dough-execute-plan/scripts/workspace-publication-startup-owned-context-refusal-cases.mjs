// Startup with no default checkout refuses an unusable repository, repository
// context, remote, workspace, or authority before publishing or creating
// anything.
import assert from "node:assert/strict";
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { lsRemoteSha, revParse } from "./publication-test-fixtures.mjs";
import {
  createQueuedTrunk,
  identityA,
} from "./workspace-publication-fixtures.mjs";
import {
  ownedWorktreeOnly,
  startOwned,
  worktreePaths,
} from "./default-checkout-test-fixtures.mjs";
import { startExecution } from "./execution-start.mjs";

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
  assert.match(missing.receipt.error, /--repository/);
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
  const notContext = await startOwned(
    trunk,
    owned,
    "trunk",
    ["--repository", plain],
    { workspace: absent },
  );
  assert.equal(notContext.receipt.status, "source-refused", notContext.stdout);
  assert.equal(existsSync(absent), false);
  await unchanged("not a repository context");

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
