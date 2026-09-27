// A Take's developer credit is read from Git configuration at commit time;
// an unusable developer refuses the Take before anything is published. The
// credited Take itself is proved in workspace-publication-startup-agent.test.mjs.
import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { git, lsRemoteSha } from "./publication-test-fixtures.mjs";
import {
  createQueuedTrunk,
  startCliResult,
} from "./workspace-publication-fixtures.mjs";
import {
  coAuthors,
  configureDeveloper,
  developer,
} from "./workspace-publication-startup-test-fixtures.mjs";

// Git in `checkout` has no committer identity of its own or from the
// environment: the user's global and system configuration are hidden.
async function withoutDeveloper(trunk) {
  await git(trunk.integration, "config", "--unset", "user.name");
  await git(trunk.integration, "config", "--unset", "user.email");
  const env = {
    ...process.env,
    GIT_CONFIG_GLOBAL: join(trunk.fixture, "none"),
  };
  for (const name of [
    "GIT_COMMITTER_NAME",
    "GIT_COMMITTER_EMAIL",
    "GIT_AUTHOR_NAME",
    "GIT_AUTHOR_EMAIL",
    "EMAIL",
  ])
    delete env[name];
  return { ...env, GIT_CONFIG_NOSYSTEM: "1" };
}

async function assertRefusedTake(trunk, start, reason) {
  const before = await lsRemoteSha(trunk.origin, "refs/heads/main");
  const { receipt, workspace } = await start();
  assert.equal(receipt.ok, false, JSON.stringify(receipt));
  assert.equal(receipt.status, "developer-identity-refused");
  assert.match(receipt.error, reason);
  assert.equal(await lsRemoteSha(trunk.origin, "refs/heads/main"), before);
  // Nothing was committed or left pending in the owned workspace.
  assert.equal((await git(workspace, "status", "--porcelain")).stdout, "");
  assert.equal(
    (await git(workspace, "rev-parse", "HEAD")).stdout.trim(),
    before,
  );
}

test("Take is refused before publication when Git has no configured developer, and succeeds once one is configured", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  const env = await withoutDeveloper(trunk);
  await assertRefusedTake(
    trunk,
    () => startCliResult(trunk, "trunk", [], { env }),
    /no usable committer identity/,
  );
  await configureDeveloper(trunk.integration);
  const { receipt } = await startCliResult(trunk, "trunk", [], { env });
  assert.equal(receipt.ok, true, JSON.stringify(receipt));
  assert.equal(await coAuthors(trunk.origin, "main"), developer);
});

test("Take is refused before publication when the developer's email is malformed", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  await git(trunk.integration, "config", "user.email", "dana-at-example");
  await assertRefusedTake(
    trunk,
    () => startCliResult(trunk, "trunk"),
    /malformed.*dana-at-example/,
  );
});

test("Take is refused before publication when the committer is the agent itself", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  await git(trunk.integration, "config", "user.name", "Yui-chan");
  await git(trunk.integration, "config", "user.email", "yui-chan@example.org");
  await assertRefusedTake(
    trunk,
    () => startCliResult(trunk, "trunk"),
    /agent's own/,
  );
});
