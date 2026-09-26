// Delayed cleanup after the same name is reused for the same story: through
// the production commands, a retried abandonment or release of the earlier
// assignment never ends the later one, even though both profiles hold
// identical bytes. A full rotation is reported, never reclaimed.
import assert from "node:assert/strict";
import { test } from "node:test";
import { agentNames } from "../../dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { landWorktree } from "./dough-land-test-fixtures.mjs";
import {
  abandonPreparation,
  createPreparationTrunk,
  createWorkspace,
  git,
  identityC,
  lsRemoteSha,
  profileOf,
  refineStoryC,
  releasePreparation,
  remoteFile,
  revParse,
  seedC,
  startPreparation,
} from "./preparation-assignment-test-fixtures.mjs";
import {
  occupyAllBut,
  refusePushes,
  snapshot,
} from "./preparation-assignment-recovery-fixtures.mjs";

const tool = ["--host", "claude", "--model", "claude-opus-5-5"];
const yui = profileOf("Yui");

// Assignment A of Yui for story C ends through `endA`; every other name is
// then held, so assignment B of the same story from a second workspace
// reuses Yui with the same tool and model.
async function reusedName(t, endA) {
  const trunk = await createPreparationTrunk();
  t.after(trunk.cleanup);
  const first = await createWorkspace(trunk, "c1");
  const { receipt: a } = await startPreparation(
    trunk,
    first.workspace,
    identityC,
    tool,
  );
  assert.equal(a.agent, "Yui-chan", JSON.stringify(a));
  const bytesA = await remoteFile(trunk, "main", yui);
  const ended = await endA(trunk, first);
  await occupyAllBut(trunk, "Yui");
  const second = await createWorkspace(trunk, "c2");
  const { receipt: b } = await startPreparation(
    trunk,
    second.workspace,
    identityC,
    tool,
  );
  assert.equal(b.status, "announced", JSON.stringify(b));
  assert.equal(b.agent, "Yui-chan");
  assert.notEqual(b.allocation, a.allocation);
  assert.equal(await remoteFile(trunk, "main", yui), bytesA);
  return { trunk, first, second, a, b, ended };
}

test("retrying abandonment or release of an ended assignment leaves the later same-story allocation of its name in place", async (t) => {
  const { trunk, first, second, a, b, ended } = await reusedName(
    t,
    async (trunk, { workspace }) => {
      const { receipt } = await abandonPreparation(trunk, workspace, identityC);
      assert.equal(receipt.status, "abandoned", JSON.stringify(receipt));
      return receipt.publishedSha;
    },
  );
  const tip = await lsRemoteSha(trunk.origin, "refs/heads/main");
  const bytesB = await remoteFile(trunk, "main", yui);
  const before = await snapshot(first.workspace, [yui]);

  const abandon = await abandonPreparation(trunk, first.workspace, identityC);
  assert.equal(abandon.receipt.status, "already-released");
  assert.equal(abandon.receipt.allocation, a.allocation);
  assert.equal(abandon.receipt.endedBy, ended);
  assert.equal(abandon.receipt.successor, b.allocation);
  const release = await releasePreparation(first.workspace, identityC);
  assert.equal(release.receipt.status, "already-released");
  assert.equal(release.receipt.successor, b.allocation);
  assert.deepEqual(await snapshot(first.workspace, [yui]), before);

  // Fast-forwarded past B, and still authoring as Yui-chan, the first
  // workspace does not take B for its own; with every name held it reports
  // the occupants and publishes nothing.
  await git(first.workspace, "merge", "--ff-only", "--quiet", "origin/main");
  const fastForwarded = await snapshot(first.workspace, [yui]);
  const start = await startPreparation(trunk, first.workspace, identityC);
  assert.equal(start.receipt.status, "agent-unavailable");
  assert.equal(start.receipt.occupied.length, agentNames.length);
  assert.deepEqual(
    start.receipt.occupied.find(({ path }) => path === yui),
    {
      path: yui,
      agent: "Yui-chan",
      identity: identityC,
      activity: "preparation",
      host: "claude",
      model: "claude-opus-5-5",
      allocation: b.allocation,
    },
  );
  assert.deepEqual(
    start.receipt.occupied.find(({ path }) => path === profileOf("Rina")),
    {
      path: profileOf("Rina"),
      agent: "Rina-chan",
      identity: "SEED-RINA#work",
      activity: "execution",
      mode: "trunk",
      branch: "origin/main",
      allocation: await revParse(trunk.origin, `${tip}^`),
    },
  );
  const releaseAgain = await releasePreparation(first.workspace, identityC);
  assert.equal(releaseAgain.receipt.status, "already-released");
  assert.deepEqual(await snapshot(first.workspace, [yui]), fastForwarded);

  assert.equal(await lsRemoteSha(trunk.origin, "refs/heads/main"), tip);
  assert.equal(await remoteFile(trunk, "main", yui), bytesB);
  const resumed = await startPreparation(trunk, second.workspace, identityC);
  assert.equal(resumed.receipt.status, "continued");
  assert.equal(resumed.receipt.allocation, b.allocation);
});

test("a landing whose committed release outlived its assignment is stopped before it can end the later allocation, and lands once restored", async (t) => {
  const { trunk, first, b } = await reusedName(
    t,
    async (trunk, { workspace, branch }) => {
      refineStoryC(workspace);
      const staged = await releasePreparation(workspace, identityC);
      assert.equal(staged.receipt.status, "release-staged");
      const lift = refusePushes(trunk);
      const landing = await landWorktree({
        worktree: workspace,
        branch,
        defaultCheckout: trunk.integration,
      });
      assert.equal(landing.stopped, "publish", JSON.stringify(landing));
      lift();
      // The developer then abandons the preparation instead.
      const { receipt } = await abandonPreparation(trunk, workspace, identityC);
      assert.equal(receipt.status, "abandoned", JSON.stringify(receipt));
      return receipt.publishedSha;
    },
  );
  const tip = await lsRemoteSha(trunk.origin, "refs/heads/main");

  const release = await releasePreparation(first.workspace, identityC);
  assert.equal(release.code, 1);
  assert.equal(release.receipt.status, "release-conflict");
  assert.equal(release.receipt.successor, b.allocation);
  assert.equal(await lsRemoteSha(trunk.origin, "refs/heads/main"), tip);

  // Following the stop, the developer takes the removal out of the
  // unpublished landing commit, keeping the refined seed, then keeps.
  const base = (
    await git(first.workspace, "merge-base", "HEAD", "origin/main")
  ).stdout.trim();
  await git(first.workspace, "reset", "--soft", "--quiet", base);
  await git(
    first.workspace,
    "restore",
    "--staged",
    "--worktree",
    "--source=HEAD",
    "--",
    yui,
  );
  const restored = await releasePreparation(first.workspace, identityC);
  assert.equal(restored.receipt.status, "already-released");
  const landing = await landWorktree({
    worktree: first.workspace,
    branch: first.branch,
    defaultCheckout: trunk.integration,
  });
  assert.equal(landing.stopped, null, JSON.stringify(landing));
  const landed = await lsRemoteSha(trunk.origin, "refs/heads/main");
  assert.match(await remoteFile(trunk, landed, seedC), /C is useful/);
  assert.equal(
    (
      await git(
        trunk.origin,
        "log",
        "-1",
        "--format=%H",
        "--diff-filter=A",
        landed,
        "--",
        yui,
      )
    ).stdout.trim(),
    b.allocation,
  );
  assert.equal(
    (await git(trunk.origin, "diff", "--name-status", tip, landed)).stdout,
    `M\t${seedC}\n`,
  );
});
