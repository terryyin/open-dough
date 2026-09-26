// Preparation from announcement to landing through the production `start` and
// `release` commands and the real preparation recorder. Landing itself uses
// the Dough Land Git model; it neither adds nor removes an assignment.
import assert from "node:assert/strict";
import { test } from "node:test";
import { landWorktree } from "./dough-land-test-fixtures.mjs";
import {
  backlogFile,
  createPreparationTrunk,
  createWorkspace,
  identityC,
  lsRemoteSha,
  profileOf,
  publishAssignment,
  read,
  recorder,
  refineStoryC,
  releasePreparation,
  remoteChanges,
  remoteFile,
  remoteProfileNames,
  seedC,
  startPreparation,
} from "./preparation-assignment-test-fixtures.mjs";

const link = "seeds/C.md#c";

test("landing a refinement releases only its own assignment in the same snapshot and keeps the story queued with recorded facts", async (t) => {
  const trunk = await createPreparationTrunk();
  t.after(trunk.cleanup);
  // Yui executes other work; Akiho prepares the same story elsewhere.
  await publishAssignment(trunk, "Yui", {
    identity: "SEED-X#x",
    mode: "trunk",
    branch: "origin/main",
  });
  await publishAssignment(trunk, "Akiho", {
    identity: identityC,
    activity: "preparation",
  });
  const queue = await remoteFile(trunk, "main", backlogFile);
  const others = {
    Yui: await remoteFile(trunk, "main", profileOf("Yui")),
    Akiho: await remoteFile(trunk, "main", profileOf("Akiho")),
  };
  const { workspace, branch } = await createWorkspace(trunk, "c");
  const { receipt: announced } = await startPreparation(
    trunk,
    workspace,
    identityC,
  );
  assert.equal(announced.status, "announced", JSON.stringify(announced));
  assert.equal(announced.agent, "Yuma-chan");

  refineStoryC(workspace);
  await recorder(
    workspace,
    "record-state",
    "--identity",
    identityC,
    "--link",
    link,
    "--refinement",
    "refined",
    "--approach",
    "unselected",
  );
  const recorded = read(workspace, seedC);
  const recordedState = JSON.parse(
    await recorder(workspace, "read-state", "--link", link),
  );

  const release = await releasePreparation(workspace, identityC);
  assert.equal(release.code, 0, JSON.stringify(release.receipt));
  assert.equal(release.receipt.status, "release-staged");
  assert.equal(release.receipt.allocation, announced.allocation);
  // Until the keep lands, remote trunk still shows the assignment.
  assert.notEqual(await remoteFile(trunk, "main", profileOf("Yuma")), null);

  const landing = await landWorktree({
    worktree: workspace,
    branch,
    defaultCheckout: trunk.integration,
    message: "Keep story C preparation",
  });
  assert.equal(landing.stopped, null, JSON.stringify(landing));
  const landed = await lsRemoteSha(trunk.origin, "refs/heads/main");
  assert.deepEqual((await remoteChanges(trunk, landed)).sort(), [
    `D\t${profileOf("Yuma")}`,
    `M\t${seedC}`,
  ]);
  assert.equal(await remoteFile(trunk, landed, backlogFile), queue);
  assert.equal(await remoteFile(trunk, landed, seedC), recorded);
  assert.deepEqual(await remoteProfileNames(trunk, landed), [
    ".planning/agents/akiho-chan.json",
    ".planning/agents/yui-chan.json",
  ]);
  for (const [name, text] of Object.entries(others))
    assert.equal(await remoteFile(trunk, landed, profileOf(name)), text);

  // The published facts are the recorder's, read back from landed trunk.
  const published = JSON.parse(
    await recorder(trunk.integration, "read-state", "--link", link),
  );
  assert.equal(landing.refresh.result, "advanced");
  assert.deepEqual(published, recordedState);
  assert.deepEqual(
    {
      refinement: published.refinement,
      approach: published.approach,
      assessment: published.assessment.status,
    },
    {
      refinement: "refined",
      approach: { kind: "unselected" },
      assessment: "absent",
    },
  );
});
