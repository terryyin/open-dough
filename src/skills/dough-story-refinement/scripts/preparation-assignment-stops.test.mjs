// Preparation `start` and `release` stops through the production command:
// each publishes nothing, claims no other developer's assignment, and leaves
// the workspace as found. An announcement whose response is lost is settled
// from the remote rather than stopped or repeated.
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
import {
  loseNextResponse,
  occupyAllBut,
  raceNextPush,
  remoteSubjects,
  snapshot,
} from "./preparation-assignment-recovery-fixtures.mjs";

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

  const release = await releasePreparation(workspace, identityC);
  assert.equal(release.receipt.status, "no-assignment");
  const { receipt } = await startPreparation(trunk, workspace, identityC);
  assert.equal(receipt.status, "announced", JSON.stringify(receipt));
  assert.equal(receipt.agent, "Akiho-chan");
  assert.equal(await remoteFile(trunk, "main", profileOf("Yui")), rival);
  assert.equal((await git(workspace, "status", "--porcelain")).stdout, "");
});

test("when a rival claims the last free name during the push, the full rotation is reported with its occupants and the rival is kept", async (t) => {
  const trunk = await createPreparationTrunk();
  t.after(trunk.cleanup);
  await occupyAllBut(trunk, "Yui");
  const { workspace } = await createWorkspace(trunk, "c");
  const before = await snapshot(workspace, [seedC]);
  const rival = '{"rival": "Yui is mine"}\n';
  await raceNextPush(trunk, trunk.integration, { [profileOf("Yui")]: rival });

  const { code, receipt } = await startPreparation(trunk, workspace, identityC);
  assert.equal(code, 1);
  assert.equal(receipt.status, "agent-unavailable", JSON.stringify(receipt));
  assert.equal("agent" in receipt, false);
  assert.deepEqual(
    receipt.occupied.find(({ path }) => path === profileOf("Yui")),
    {
      path: profileOf("Yui"),
      allocation: await revParse(trunk.origin, "main"),
      unrecognized: "profile schemaVersion must be 1",
    },
  );
  assert.equal(await remoteFile(trunk, "main", profileOf("Yui")), rival);
  assert.equal((await remoteSubjects(trunk))[0], "rival writer");
  assert.deepEqual(await snapshot(workspace, [seedC]), before);
  const release = await releasePreparation(workspace, identityC);
  assert.equal(release.receipt.status, "no-assignment");
});

test("an announcement whose accepted push loses its response is confirmed from the remote, and a rerun continues it", async (t) => {
  const trunk = await createPreparationTrunk();
  t.after(trunk.cleanup);
  const { workspace } = await createWorkspace(trunk, "c");
  const lost = loseNextResponse(trunk);

  const { receipt } = await startPreparation(trunk, workspace, identityC);
  assert.equal(lost(), true);
  assert.equal(receipt.status, "announced", JSON.stringify(receipt));
  const tip = await lsRemoteSha(trunk.origin, "refs/heads/main");
  assert.equal(receipt.publishedSha, tip);
  const again = await startPreparation(trunk, workspace, identityC);
  assert.equal(again.receipt.status, "continued");
  assert.equal(again.receipt.allocation, tip);
  assert.equal(await lsRemoteSha(trunk.origin, "refs/heads/main"), tip);
  assert.deepEqual(await remoteProfileNames(trunk), [profileOf("Yui")]);
});

test("a workspace still holding one story's assignment announces no other story until that one ends", async (t) => {
  const trunk = await createPreparationTrunk();
  t.after(trunk.cleanup);
  const { workspace } = await createWorkspace(trunk, "c");
  const { receipt: c } = await startPreparation(trunk, workspace, identityC);
  assert.equal(c.status, "announced", JSON.stringify(c));

  const { code, receipt } = await startPreparation(
    trunk,
    workspace,
    "SEED-B#b",
  );
  assert.equal(code, 1);
  assert.equal(receipt.status, "workspace-assigned-elsewhere");
  assert.equal(receipt.identity, identityC);
  assert.equal(receipt.allocation, c.allocation);
  assert.equal(
    await lsRemoteSha(trunk.origin, "refs/heads/main"),
    c.publishedSha,
  );
  const again = await startPreparation(trunk, workspace, identityC);
  assert.equal(again.receipt.status, "continued");
});
