// How a real startup Take keeps its agent name distinct when a rival publishes
// a profile while the Take is under way.
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
  holdFirstPush,
  profileDirectory,
  profilePath,
  publishProfiles,
  remoteProfiles,
  startProcess,
} from "./workspace-publication-startup-test-fixtures.mjs";
import { renderAgentProfile } from "../../dough-product-backlog/scripts/product-backlog-agent-profile.mjs";

async function remoteShow(trunk, ...args) {
  return (await git(trunk.origin, ...args)).stdout;
}

test("a rival holding a different agent name leaves the replayed claim its original name", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  const barrier = await holdFirstPush(trunk);
  const a = startProcess(trunk, "a", identityA);
  t.after(() => {
    barrier.release();
    a.child.kill();
  });
  await barrier.awaitArrival(a);
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

test("a name published between startup's fetches is reselected on the workspace's base trunk", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  // A rival clone advances trunk so startup's source fetch moves origin/main,
  // then holds a Yui-chan profile commit ready to publish.
  const rival = join(trunk.fixture, "rival");
  await git(trunk.fixture, "clone", "--quiet", trunk.origin, rival);
  await git(rival, "config", "user.name", "Rival");
  await git(rival, "config", "user.email", "rival@example.test");
  await git(rival, "commit", "--quiet", "--allow-empty", "-m", "bump");
  await git(rival, "push", "--quiet", "origin", "HEAD:main");
  mkdirSync(join(rival, profileDirectory), { recursive: true });
  writeFileSync(
    join(rival, profilePath("Yui")),
    renderAgentProfile({
      name: "Yui",
      identity: identityB,
      mode: "trunk",
      branch: "origin/main",
    }),
  );
  await git(rival, "add", profilePath("Yui"));
  await git(rival, "commit", "--quiet", "-m", "hold Yui");
  // The rival publishes once, right after the first fetch updates origin/main
  // in the integration checkout, so only the second fetch sees it.
  const marker = join(trunk.fixture, "rival-published");
  writeFileSync(
    join(trunk.integration, ".git/hooks/reference-transaction"),
    `#!/bin/sh
[ "$1" = committed ] || exit 0
grep -q ' refs/remotes/origin/main$' || exit 0
[ -e '${marker}' ] && exit 0
touch '${marker}'
unset GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE GIT_COMMON_DIR
git -C '${rival}' push --quiet origin HEAD:main >/dev/null 2>&1
`,
    { mode: 0o755 },
  );
  const { receipt, workspace } = await startCliResult(trunk, "trunk");
  assert.equal(receipt.ok, true, JSON.stringify(receipt));
  assert.equal(receipt.agent, "Akiho-chan");
  assert.equal(
    receipt.publishedSha,
    await lsRemoteSha(trunk.origin, "refs/heads/main"),
  );
  assert.deepEqual(await remoteProfiles(workspace), [
    ".planning/agents/akiho-chan.json",
    ".planning/agents/yui-chan.json",
  ]);
  await assertPublishedAgent(workspace, "Akiho", identityA);
  assert.equal(
    JSON.parse(await remoteShow(trunk, "show", `main:${profilePath("Yui")}`))
      .identity,
    identityB,
  );
});
