// Pausing, resuming and abandoning preparation through the production
// `start`, `release` and `abandon` commands: what remote trunk and the
// workspace hold afterwards, including when the remote refuses, races, or
// loses the response to the abandonment push.
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { test } from "node:test";
import {
  abandonPreparation,
  backlogFile,
  createPreparationTrunk,
  createWorkspace,
  git,
  identityC,
  lsRemoteSha,
  planC,
  planStoryC,
  profileOf,
  refineStoryC,
  releasePreparation,
  remoteChanges,
  remoteFile,
  remoteProfileNames,
  revParse,
  seedC,
  startPreparation,
} from "./preparation-assignment-test-fixtures.mjs";
import {
  loseNextResponse,
  raceNextPush,
  refusePushes,
  remoteSubjects,
  snapshot,
} from "./preparation-assignment-recovery-fixtures.mjs";

const endSubject = `End preparation: ${identityC}`;
const endings = async (trunk) =>
  (await remoteSubjects(trunk)).filter((subject) => subject === endSubject);

// An announced preparation paused with a committed plan draft and an
// uncommitted seed edit in its workspace.
async function pausedPreparation(t) {
  const trunk = await createPreparationTrunk();
  t.after(trunk.cleanup);
  const { workspace } = await createWorkspace(trunk, "c");
  const { receipt: announced } = await startPreparation(
    trunk,
    workspace,
    identityC,
    ["--host", "claude", "--model", "claude-opus-5-5"],
  );
  assert.equal(announced.status, "announced", JSON.stringify(announced));
  planStoryC(workspace);
  await git(workspace, "add", planC);
  await git(workspace, "commit", "--quiet", "-m", "draft plan for C");
  refineStoryC(workspace);
  const queue = await remoteFile(trunk, "main", backlogFile);
  return { trunk, workspace, announced, queue };
}

test("resuming a paused preparation continues its assignment; abandoning publishes only its end, keeps the draft, and repeating it publishes nothing", async (t) => {
  const { trunk, workspace, announced, queue } = await pausedPreparation(t);
  const draft = await snapshot(workspace, [seedC, planC]);

  // A later session resumes: nothing new is published.
  const resumed = await startPreparation(trunk, workspace, identityC);
  assert.equal(resumed.receipt.status, "continued");
  assert.equal(resumed.receipt.allocation, announced.allocation);
  assert.equal(
    await lsRemoteSha(trunk.origin, "refs/heads/main"),
    announced.publishedSha,
  );

  const { code, receipt } = await abandonPreparation(
    trunk,
    workspace,
    identityC,
  );
  assert.equal(code, 0, JSON.stringify(receipt));
  assert.equal(receipt.status, "abandoned");
  assert.equal(receipt.agent, "Yui-chan");
  assert.equal(receipt.allocation, announced.allocation);
  const ended = await lsRemoteSha(trunk.origin, "refs/heads/main");
  assert.equal(receipt.publishedSha, ended);
  assert.equal(await revParse(trunk.origin, `${ended}^`), announced.allocation);
  assert.deepEqual(await remoteChanges(trunk, ended), [
    `D\t${profileOf("Yui")}`,
  ]);
  assert.equal(await remoteFile(trunk, ended, backlogFile), queue);
  assert.doesNotMatch(await remoteFile(trunk, ended, seedC), /C is useful/);
  assert.equal(await remoteFile(trunk, ended, planC), null);
  assert.deepEqual(await snapshot(workspace, [seedC, planC]), draft);
  assert.equal(receipt.refresh.result, "advanced");

  // Repeating the abandonment, or releasing afterwards, ends nothing more.
  const again = await abandonPreparation(trunk, workspace, identityC);
  assert.equal(again.code, 0, JSON.stringify(again.receipt));
  assert.equal(again.receipt.status, "already-released");
  assert.equal(again.receipt.endedBy, ended);
  const release = await releasePreparation(workspace, identityC);
  assert.equal(release.receipt.status, "already-released");
  assert.equal(await lsRemoteSha(trunk.origin, "refs/heads/main"), ended);
  assert.deepEqual(await endings(trunk), [endSubject]);
  assert.deepEqual(await snapshot(workspace, [seedC, planC]), draft);
  assert.equal(existsSync(workspace), true);
});

test("an abandonment whose accepted push loses its response is settled from the remote and never published twice", async (t) => {
  const { trunk, workspace, announced, queue } = await pausedPreparation(t);
  const draft = await snapshot(workspace, [seedC, planC]);
  const lost = loseNextResponse(trunk);

  const { receipt } = await abandonPreparation(trunk, workspace, identityC);
  assert.equal(lost(), true);
  assert.equal(receipt.status, "abandoned", JSON.stringify(receipt));
  const ended = await lsRemoteSha(trunk.origin, "refs/heads/main");
  assert.equal(receipt.publishedSha, ended);
  assert.equal(await revParse(trunk.origin, `${ended}^`), announced.allocation);
  assert.deepEqual(await endings(trunk), [endSubject]);
  assert.equal(await remoteFile(trunk, ended, backlogFile), queue);
  assert.deepEqual(await snapshot(workspace, [seedC, planC]), draft);

  const rerun = await abandonPreparation(trunk, workspace, identityC);
  assert.equal(rerun.receipt.status, "already-released");
  assert.deepEqual(await endings(trunk), [endSubject]);
});

test("a refused abandonment reports the assignment still published, and a rerun once the remote accepts ends it once", async (t) => {
  const { trunk, workspace, announced } = await pausedPreparation(t);
  const draft = await snapshot(workspace, [seedC, planC]);
  const lift = refusePushes(trunk);

  const refused = await abandonPreparation(trunk, workspace, identityC);
  assert.equal(refused.code, 1);
  assert.equal(refused.receipt.status, "unpublished");
  assert.equal(refused.receipt.allocation, announced.allocation);
  assert.match(refused.receipt.error, /still published/);
  assert.equal(
    await lsRemoteSha(trunk.origin, "refs/heads/main"),
    announced.allocation,
  );
  assert.notEqual(await remoteFile(trunk, "main", profileOf("Yui")), null);
  assert.deepEqual(await snapshot(workspace, [seedC, planC]), draft);
  const resumed = await startPreparation(trunk, workspace, identityC);
  assert.equal(resumed.receipt.status, "continued");

  lift();
  const { receipt } = await abandonPreparation(trunk, workspace, identityC);
  assert.equal(receipt.status, "abandoned", JSON.stringify(receipt));
  assert.deepEqual(await endings(trunk), [endSubject]);
  assert.deepEqual(await remoteProfileNames(trunk), []);
});

test("when another writer advances trunk during the abandonment push, its end is rebuilt on the new trunk and removes only its own profile", async (t) => {
  const { trunk, workspace, announced } = await pausedPreparation(t);
  const draft = await snapshot(workspace, [seedC, planC]);
  const rivalProfile = JSON.stringify({ unrecognized: true });
  await raceNextPush(trunk, trunk.integration, {
    "rival.txt": "rival work\n",
    ".planning/agents/notes.json": rivalProfile,
  });

  const { receipt } = await abandonPreparation(trunk, workspace, identityC);
  assert.equal(receipt.status, "abandoned", JSON.stringify(receipt));
  const ended = await lsRemoteSha(trunk.origin, "refs/heads/main");
  assert.equal(receipt.publishedSha, ended);
  assert.deepEqual(await remoteChanges(trunk, ended), [
    `D\t${profileOf("Yui")}`,
  ]);
  const rival = await revParse(trunk.origin, `${ended}^`);
  assert.equal(await revParse(trunk.origin, `${rival}^`), announced.allocation);
  assert.equal(await remoteFile(trunk, ended, "rival.txt"), "rival work\n");
  assert.equal(
    await remoteFile(trunk, ended, ".planning/agents/notes.json"),
    rivalProfile,
  );
  assert.deepEqual(await endings(trunk), [endSubject]);
  assert.deepEqual(await snapshot(workspace, [seedC, planC]), draft);
});
