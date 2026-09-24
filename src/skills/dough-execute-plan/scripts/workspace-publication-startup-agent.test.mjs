// The agent profile a real startup Take publishes, and how a race keeps
// agent names distinct.
import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { git, lsRemoteSha } from "./publication-test-fixtures.mjs";
import {
  createQueuedTrunk,
  identityA,
  identityB,
  startCliResult,
} from "./workspace-publication-fixtures.mjs";
import {
  assertPublishedAgent,
  awaitFile,
  holdFirstPush,
  profilePath,
  publishProfiles,
  remoteProfiles,
  startProcess,
} from "./workspace-publication-startup-test-fixtures.mjs";
import { agentNames } from "../../dough-product-backlog/scripts/product-backlog-agent-profile.mjs";

async function remoteShow(trunk, ...args) {
  return (await git(trunk.origin, ...args)).stdout;
}

async function releaseProfile(trunk, name) {
  await git(trunk.integration, "rm", "--quiet", profilePath(name));
  await git(trunk.integration, "commit", "--quiet", "-m", `release ${name}`);
  await git(trunk.integration, "push", "--quiet", "origin", "HEAD:main");
}

test("Take publishes the agent's profile and makes the agent the workspace author", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  const { receipt, workspace } = await startCliResult(trunk, "trunk", [
    "--host",
    "claude",
    "--model",
    "claude-opus-5-5",
  ]);
  assert.equal(receipt.ok, true, JSON.stringify(receipt));
  assert.equal(receipt.agent, "Yui-chan");
  assert.equal(receipt.workspaceAuthorship, "configured");
  assert.equal(
    await remoteShow(trunk, "show", "--name-status", "--format=", "main"),
    "M\t.planning/PRODUCT-BACKLOG.md\nA\t.planning/agents/yui-chan.json\n",
  );
  assert.deepEqual(
    JSON.parse(
      await remoteShow(trunk, "show", "main:.planning/agents/yui-chan.json"),
    ),
    {
      schemaVersion: 1,
      agent: "Yui-chan",
      email: "yui-chan@example.org",
      identity: identityA,
      mode: "trunk",
      branch: "origin/main",
      host: "claude",
      model: "claude-opus-5-5",
    },
  );
  const people = "--format=%an <%ae>|%cn <%ce>";
  const human = "Integration Checkout <integration@example.test>";
  assert.equal(
    (await remoteShow(trunk, "log", "-1", people, "main")).trim(),
    `Yui-chan <yui-chan@example.org>|${human}`,
  );
  writeFileSync(join(workspace, "slice.txt"), "slice\n");
  await git(workspace, "add", "slice.txt");
  await git(workspace, "commit", "-m", "slice work");
  assert.equal(
    (await git(workspace, "log", "-1", people)).stdout.trim(),
    `Yui-chan <yui-chan@example.org>|${human}`,
  );
  await git(trunk.integration, "commit", "--allow-empty", "-m", "integration");
  assert.equal(
    (await git(trunk.integration, "log", "-1", people)).stdout.trim(),
    `${human}|${human}`,
  );
});

test("Take from a bare repository's linked worktree authors only the Take commit and leaves every checkout working", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  // The developer keeps a bare clone and works in its linked worktrees, so
  // the shared config sets core.bare=true.
  const bare = join(trunk.fixture, "bare.git");
  const checkout = join(trunk.fixture, "bare-main");
  await git(trunk.fixture, "clone", "--quiet", "--bare", trunk.origin, bare);
  await git(
    bare,
    "config",
    "remote.origin.fetch",
    "+refs/heads/*:refs/remotes/origin/*",
  );
  await git(bare, "config", "user.name", "Integration Checkout");
  await git(bare, "config", "user.email", "integration@example.test");
  await git(bare, "worktree", "add", "--quiet", checkout, "main");
  const { receipt, workspace } = await startCliResult(
    { ...trunk, integration: checkout },
    "trunk",
  );
  assert.equal(receipt.ok, true, JSON.stringify(receipt));
  assert.equal(receipt.agent, "Yui-chan");
  assert.equal(receipt.workspaceAuthorship, "not-configured");
  assert.equal(
    (
      await remoteShow(trunk, "log", "-1", "--format=%an <%ae>|%cn", "main")
    ).trim(),
    "Yui-chan <yui-chan@example.org>|Integration Checkout",
  );
  await git(workspace, "status");
  await git(checkout, "status");
  await assert.rejects(git(bare, "config", "extensions.worktreeConfig"));
});

test("Story Branch Mode profile records its origin branch and leaves unreported host and model unrecorded", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  const { receipt } = await startCliResult(trunk, "story-branch");
  assert.equal(receipt.ok, true, JSON.stringify(receipt));
  assert.equal(receipt.agent, "Yui-chan");
  assert.deepEqual(
    JSON.parse(
      await remoteShow(trunk, "show", "main:.planning/agents/yui-chan.json"),
    ),
    {
      schemaVersion: 1,
      agent: "Yui-chan",
      email: "yui-chan@example.org",
      identity: identityA,
      mode: "story-branch",
      branch: "exec/story-branch",
    },
  );
});

test("a rival holding a different agent name leaves the replayed claim its original name", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  const barrier = await holdFirstPush(trunk);
  const a = startProcess(trunk, "a", identityA);
  t.after(() => {
    barrier.release();
    a.child.kill();
  });
  await awaitFile(barrier.arrived);
  // A rival started from another base, where Yui-chan was held, published
  // Akiho-chan's profile first.
  await publishProfiles(trunk, ["Akiho"], identityB);
  barrier.release();
  const result = await a.result;
  assert.equal(result.receipt.ok, true, JSON.stringify(result));
  assert.equal(result.receipt.agent, "Yui-chan");
  assert.equal(
    result.receipt.publishedSha,
    await lsRemoteSha(trunk.origin, "refs/heads/main"),
  );
  assert.deepEqual(await remoteProfiles(result.workspace), [
    ".planning/agents/akiho-chan.json",
    ".planning/agents/yui-chan.json",
  ]);
  await assertPublishedAgent(result.workspace, "Yui", identityA);
  assert.match(
    (await git(result.workspace, "log", "-1", "--format=%B", "origin/main"))
      .stdout,
    /Claim-Publisher: publisher-a/,
  );
});

test("Take follows the most recently added profile and skips held names", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  // Akiho is held from an earlier add; Yui's profile was added most recently.
  await publishProfiles(trunk, ["Akiho", "Yui"], identityB);
  const { receipt } = await startCliResult(trunk, "trunk");
  assert.equal(receipt.ok, true, JSON.stringify(receipt));
  assert.equal(receipt.agent, "Yuma-chan");
  assert.equal(
    await remoteShow(trunk, "show", "--name-status", "--format=", "main"),
    "M\t.planning/PRODUCT-BACKLOG.md\nA\t.planning/agents/yuma-chan.json\n",
  );
});

test("Take skips a held successor of the most recent profile rather than taking the first free name", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  // Yui is free, but rotation continues after Akiho and Yuma is held.
  await publishProfiles(trunk, ["Yuma", "Akiho"], identityB);
  const { receipt } = await startCliResult(trunk, "trunk");
  assert.equal(receipt.ok, true, JSON.stringify(receipt));
  assert.equal(receipt.agent, "Sola-chan");
});

test("a released most recent name is not reused by the next Take", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  await publishProfiles(trunk, ["Yui"], identityB);
  await releaseProfile(trunk, "Yui");
  const { receipt } = await startCliResult(trunk, "trunk");
  assert.equal(receipt.ok, true, JSON.stringify(receipt));
  assert.equal(receipt.agent, "Akiho-chan");
});

test("Take is refused and publishes nothing when every agent name is held", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  await publishProfiles(trunk, agentNames, identityB);
  const before = await lsRemoteSha(trunk.origin, "refs/heads/main");
  const backlog = await remoteShow(
    trunk,
    "show",
    "main:.planning/PRODUCT-BACKLOG.md",
  );
  const { receipt } = await startCliResult(trunk, "trunk");
  assert.equal(receipt.ok, false, JSON.stringify(receipt));
  assert.equal(receipt.status, "agent-unavailable");
  assert.match(receipt.error, /every agent name is held on remote trunk/);
  assert.equal(await lsRemoteSha(trunk.origin, "refs/heads/main"), before);
  assert.equal(
    await remoteShow(trunk, "show", "main:.planning/PRODUCT-BACKLOG.md"),
    backlog,
  );
});
