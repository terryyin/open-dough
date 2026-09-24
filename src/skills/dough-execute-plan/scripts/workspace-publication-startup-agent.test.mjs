// The agent profile a real startup Take publishes, and how a race keeps
// agent names distinct.
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
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
  remoteProfiles,
  startProcess,
} from "./workspace-publication-startup-test-fixtures.mjs";
import { renderAgentProfile } from "../../dough-product-backlog/scripts/product-backlog-agent-profile.mjs";

async function remoteShow(trunk, ...args) {
  return (await git(trunk.origin, ...args)).stdout;
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
  assert.equal(receipt.agent, "agent-Yui");
  assert.equal(
    await remoteShow(trunk, "show", "--name-status", "--format=", "main"),
    "M\t.planning/PRODUCT-BACKLOG.md\nA\t.planning/agents/agent-yui.json\n",
  );
  assert.deepEqual(
    JSON.parse(
      await remoteShow(trunk, "show", "main:.planning/agents/agent-yui.json"),
    ),
    {
      schemaVersion: 1,
      agent: "agent-Yui",
      email: "agent-yui@example.org",
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
    `agent-Yui <agent-yui@example.org>|${human}`,
  );
  writeFileSync(join(workspace, "slice.txt"), "slice\n");
  await git(workspace, "add", "slice.txt");
  await git(workspace, "commit", "-m", "slice work");
  assert.equal(
    (await git(workspace, "log", "-1", people)).stdout.trim(),
    `agent-Yui <agent-yui@example.org>|${human}`,
  );
  await git(trunk.integration, "commit", "--allow-empty", "-m", "integration");
  assert.equal(
    (await git(trunk.integration, "log", "-1", people)).stdout.trim(),
    `${human}|${human}`,
  );
});

test("Story Branch Mode profile records its origin branch and leaves unreported host and model unrecorded", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  const { receipt } = await startCliResult(trunk, "story-branch");
  assert.equal(receipt.ok, true, JSON.stringify(receipt));
  assert.equal(receipt.agent, "agent-Yui");
  assert.deepEqual(
    JSON.parse(
      await remoteShow(trunk, "show", "main:.planning/agents/agent-yui.json"),
    ),
    {
      schemaVersion: 1,
      agent: "agent-Yui",
      email: "agent-yui@example.org",
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
  // A rival started from another base, where agent-Yui was held, published
  // agent-Akiho's profile first.
  mkdirSync(join(trunk.integration, ".planning/agents"), { recursive: true });
  writeFileSync(
    join(trunk.integration, ".planning/agents/agent-akiho.json"),
    renderAgentProfile({
      name: "Akiho",
      identity: identityB,
      mode: "trunk",
      branch: "origin/main",
    }),
  );
  await git(trunk.integration, "add", ".planning/agents/agent-akiho.json");
  await git(trunk.integration, "commit", "-m", "rival profile");
  await git(trunk.integration, "push", "origin", "HEAD:refs/heads/main");
  barrier.release();
  const result = await a.result;
  assert.equal(result.receipt.ok, true, JSON.stringify(result));
  assert.equal(result.receipt.agent, "agent-Yui");
  assert.equal(
    result.receipt.publishedSha,
    await lsRemoteSha(trunk.origin, "refs/heads/main"),
  );
  assert.deepEqual(await remoteProfiles(result.workspace), [
    ".planning/agents/agent-akiho.json",
    ".planning/agents/agent-yui.json",
  ]);
  await assertPublishedAgent(result.workspace, "agent-Yui", identityA);
  assert.match(
    (await git(result.workspace, "log", "-1", "--format=%B", "origin/main"))
      .stdout,
    /Claim-Publisher: publisher-a/,
  );
});
