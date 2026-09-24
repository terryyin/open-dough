// Completing Taken work through the real backlog command releases its agent's
// profile, and the next real startup Take does not reuse that name.
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { exec, git } from "./publication-test-fixtures.mjs";
import {
  createQueuedTrunk,
  identityA,
  identityB,
  remoteBacklog,
  startCliResult,
  storyB,
} from "./workspace-publication-fixtures.mjs";
import {
  remoteProfiles,
  startProcess,
} from "./workspace-publication-startup-test-fixtures.mjs";
import { renderAgentProfile } from "../../dough-product-backlog/scripts/product-backlog-agent-profile.mjs";

const backlogCli = fileURLToPath(
  new URL(
    "../../dough-product-backlog/scripts/product-backlog.mjs",
    import.meta.url,
  ),
);

// Another agent holds Yui-chan for work outside this backlog.
async function holdYui(trunk) {
  const path = ".planning/agents/yui-chan.json";
  mkdirSync(join(trunk.integration, ".planning/agents"), { recursive: true });
  writeFileSync(
    join(trunk.integration, path),
    renderAgentProfile({
      name: "Yui",
      identity: "SEED-C#c",
      mode: "trunk",
      branch: "origin/main",
    }),
  );
  await git(trunk.integration, "add", path);
  await git(trunk.integration, "commit", "--quiet", "-m", "hold Yui");
  await git(trunk.integration, "push", "--quiet", "origin", "HEAD:main");
}

test("a story completed through the backlog command releases Akiho-chan and the next Take follows it", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  await holdYui(trunk);
  const first = await startCliResult(trunk, "trunk");
  assert.equal(first.receipt.ok, true, JSON.stringify(first.receipt));
  assert.equal(first.receipt.agent, "Akiho-chan");

  // Akiho-chan closes its story from its own workspace and publishes it.
  const { workspace } = first;
  await exec(
    process.execPath,
    [backlogCli, "complete", "--identity", identityA],
    { cwd: workspace },
  );
  await git(workspace, "add", "--all", ".planning");
  await git(workspace, "commit", "--quiet", "-m", "close story A");
  await git(workspace, "push", "--quiet", "origin", "HEAD:main");
  assert.deepEqual(
    (await git(workspace, "show", "--name-status", "--format=", "HEAD")).stdout
      .trim()
      .split("\n"),
    ["M\t.planning/PRODUCT-BACKLOG.md", "D\t.planning/agents/akiho-chan.json"],
  );

  const next = startProcess(trunk, "b", identityB);
  t.after(() => next.child.kill());
  const result = await next.result;
  assert.equal(result.receipt.ok, true, JSON.stringify(result));
  assert.equal(result.receipt.agent, "Yuma-chan");
  assert.deepEqual(await remoteProfiles(result.workspace), [
    ".planning/agents/yui-chan.json",
    ".planning/agents/yuma-chan.json",
  ]);
  assert.match(
    await remoteBacklog(result.workspace),
    new RegExp(`## Taken\\n\\n${storyB.replace(/[[\]().]/g, "\\$&")}`),
  );
});
