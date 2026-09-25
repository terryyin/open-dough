// A kept preparation whose landing push is refused, or accepted with its
// response lost: rerunning the production `release` command reports what
// trunk actually shows, the assignment is never ended before the result is
// published, and an accepted landing is never published again. Landing uses
// the Dough Land Git model; the refresh result stays a separate outcome.
import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { landWorktree } from "./dough-land-test-fixtures.mjs";
import {
  backlogFile,
  createPreparationTrunk,
  createWorkspace,
  git,
  identityC,
  lsRemoteSha,
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
  refusePushes,
  remoteSubjects,
} from "./preparation-assignment-recovery-fixtures.mjs";

const message = "Keep story C preparation";
const landings = async (trunk) =>
  (await remoteSubjects(trunk)).filter((subject) => subject === message);

// A refined story C with its assignment's release staged, ready to land.
async function readyToLand(t) {
  const trunk = await createPreparationTrunk();
  t.after(trunk.cleanup);
  const { workspace, branch } = await createWorkspace(trunk, "c");
  const { receipt: announced } = await startPreparation(
    trunk,
    workspace,
    identityC,
  );
  assert.equal(announced.status, "announced", JSON.stringify(announced));
  refineStoryC(workspace);
  const staged = await releasePreparation(workspace, identityC);
  assert.equal(staged.receipt.staged, "staged");
  const queue = await remoteFile(trunk, "main", backlogFile);
  const land = (options = {}) =>
    landWorktree({
      worktree: workspace,
      branch,
      defaultCheckout: trunk.integration,
      message,
      ...options,
    });
  return { trunk, workspace, announced, queue, land };
}

test("a refused landing keeps the assignment published; the rerun reports the committed release and lands result and release once", async (t) => {
  const { trunk, workspace, announced, queue, land } = await readyToLand(t);
  // A pending human edit in the default checkout defers its refresh.
  writeFileSync(join(trunk.integration, "trunk.txt"), "human edit\n");
  const lift = refusePushes(trunk);

  const refused = await land();
  assert.equal(refused.stopped, "publish", JSON.stringify(refused));
  assert.equal(
    await lsRemoteSha(trunk.origin, "refs/heads/main"),
    announced.allocation,
  );
  assert.notEqual(await remoteFile(trunk, "main", profileOf("Yui")), null);
  assert.doesNotMatch(await remoteFile(trunk, "main", seedC), /C is useful/);

  // The release is committed with the result, not yet published.
  const rerun = await releasePreparation(workspace, identityC);
  assert.equal(rerun.receipt.status, "release-staged");
  assert.equal(rerun.receipt.staged, "already-committed");
  assert.equal(rerun.receipt.allocation, announced.allocation);

  lift();
  const landing = await land();
  assert.equal(landing.stopped, null, JSON.stringify(landing));
  assert.equal(landing.commit, "nothing-to-commit");
  assert.equal(landing.refresh.result, "deferred");
  assert.equal(landing.refresh.reason, "pending-edit");
  const landed = await lsRemoteSha(trunk.origin, "refs/heads/main");
  assert.equal(
    await revParse(trunk.origin, `${landed}^`),
    announced.allocation,
  );
  assert.deepEqual((await remoteChanges(trunk, landed)).sort(), [
    `D\t${profileOf("Yui")}`,
    `M\t${seedC}`,
  ]);
  assert.equal(await remoteFile(trunk, landed, backlogFile), queue);
  assert.deepEqual(await remoteProfileNames(trunk), []);
  assert.deepEqual(await landings(trunk), [message]);
  assert.equal(
    (await git(trunk.integration, "status", "--porcelain")).stdout,
    " M trunk.txt\n",
  );
});

test("a landing accepted with its response lost is recognized on rerun: the release reports already released and nothing is published again", async (t) => {
  const { trunk, workspace, announced, queue, land } = await readyToLand(t);
  const lost = loseNextResponse(trunk);

  // The workspace is retained, so the rerun happens in it. The push reports
  // a dropped connection, not an acceptance.
  await assert.rejects(land({ sessionCreated: false }), /hung up/);
  assert.equal(lost(), true);
  const landed = await lsRemoteSha(trunk.origin, "refs/heads/main");
  assert.equal(
    await revParse(trunk.origin, `${landed}^`),
    announced.allocation,
  );
  assert.deepEqual((await remoteChanges(trunk, landed)).sort(), [
    `D\t${profileOf("Yui")}`,
    `M\t${seedC}`,
  ]);

  const release = await releasePreparation(workspace, identityC);
  assert.equal(release.code, 0, JSON.stringify(release.receipt));
  assert.equal(release.receipt.status, "already-released");
  assert.equal(release.receipt.endedBy, landed);
  assert.equal("successor" in release.receipt, false);

  const rerun = await land({ sessionCreated: false });
  assert.equal(rerun.stopped, null, JSON.stringify(rerun));
  assert.equal(rerun.commit, "nothing-to-commit");
  assert.equal(rerun.publication.publication, "already-accepted");
  assert.equal(rerun.publication.pushed, false);
  assert.equal(rerun.refresh.result, "advanced");
  assert.equal(await lsRemoteSha(trunk.origin, "refs/heads/main"), landed);
  assert.deepEqual(await landings(trunk), [message]);
  assert.equal(await remoteFile(trunk, landed, backlogFile), queue);
  assert.deepEqual(await remoteProfileNames(trunk), []);
});
