// Preparation `start` and `release` stops through the production command:
// each publishes nothing, claims no other developer's assignment, and leaves
// the workspace as found.
import assert from "node:assert/strict";
import { chmodSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import {
  createPreparationTrunk,
  createWorkspace,
  git,
  identityC,
  lsRemoteSha,
  profileOf,
  publishAssignment,
  read,
  refineStoryC,
  releasePreparation,
  remoteFile,
  remoteProfileNames,
  revParse,
  seedC,
  startPreparation,
} from "./preparation-assignment-test-fixtures.mjs";

test("a rejected announcement reports no assignment, publishes nothing, and leaves the workspace as found", async (t) => {
  const trunk = await createPreparationTrunk();
  t.after(trunk.cleanup);
  const { workspace } = await createWorkspace(trunk, "c");
  const hook = join(trunk.origin, "hooks/pre-receive");
  writeFileSync(hook, "#!/bin/sh\necho 'trunk is frozen' >&2\nexit 1\n");
  chmodSync(hook, 0o755);
  const head = await revParse(workspace, "HEAD");

  const { code, receipt } = await startPreparation(trunk, workspace, identityC);
  assert.equal(code, 1);
  assert.equal(receipt.ok, false);
  assert.equal(receipt.status, "unpublished");
  assert.equal("agent" in receipt, false);
  assert.equal(
    await lsRemoteSha(trunk.origin, "refs/heads/main"),
    trunk.trunkSha,
  );
  assert.deepEqual(await remoteProfileNames(trunk), []);
  assert.equal(await revParse(workspace, "HEAD"), head);
  assert.equal((await git(workspace, "status", "--porcelain")).stdout, "");
  // Nothing was assigned, so nothing can be continued or released.
  const release = await releasePreparation(workspace, identityC);
  assert.equal(release.receipt.status, "no-assignment");
});

test("a workspace already holding draft edits is not announced from, and the draft stays unpublished", async (t) => {
  const trunk = await createPreparationTrunk();
  t.after(trunk.cleanup);
  const { workspace } = await createWorkspace(trunk, "c");
  refineStoryC(workspace);
  const draft = read(workspace, seedC);

  const { code, receipt } = await startPreparation(trunk, workspace, identityC);
  assert.equal(code, 1);
  assert.equal(receipt.status, "workspace-not-isolated");
  assert.equal(
    await lsRemoteSha(trunk.origin, "refs/heads/main"),
    trunk.trunkSha,
  );
  assert.equal(read(workspace, seedC), draft);
});

test("only a queued story is announced", async (t) => {
  const trunk = await createPreparationTrunk();
  t.after(trunk.cleanup);
  const { workspace } = await createWorkspace(trunk, "x");
  const { receipt } = await startPreparation(trunk, workspace, "SEED-X#x");
  assert.equal(receipt.status, "not-queued");
  assert.equal(
    await lsRemoteSha(trunk.origin, "refs/heads/main"),
    trunk.trunkSha,
  );
});

test("another developer's assignment for the same story is neither continued nor released from this workspace", async (t) => {
  const trunk = await createPreparationTrunk();
  t.after(trunk.cleanup);
  await publishAssignment(trunk, "Yui", {
    identity: identityC,
    activity: "preparation",
  });
  const rival = await remoteFile(trunk, "main", profileOf("Yui"));
  // This workspace starts exactly at Yui's announcement.
  const { workspace } = await createWorkspace(trunk, "c");

  const release = await releasePreparation(workspace, identityC, [
    "--agent",
    "Akiho-chan",
  ]);
  assert.equal(release.receipt.status, "no-assignment");
  const { receipt } = await startPreparation(trunk, workspace, identityC);
  assert.equal(receipt.status, "announced", JSON.stringify(receipt));
  assert.equal(receipt.agent, "Akiho-chan");
  assert.equal(await remoteFile(trunk, "main", profileOf("Yui")), rival);
  assert.equal((await git(workspace, "status", "--porcelain")).stdout, "");
});
