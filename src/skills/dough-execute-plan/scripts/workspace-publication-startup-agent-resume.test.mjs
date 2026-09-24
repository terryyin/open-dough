// A resumed start keeps the agent its claim named: no new name or profile,
// and the reused workspace keeps (or regains) that agent's authorship.
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { git, lsRemoteSha } from "./publication-test-fixtures.mjs";
import {
  createQueuedTrunk,
  identityA,
  identityB,
} from "./workspace-publication-fixtures.mjs";
import {
  assertPublishedAgent,
  profilePath,
  publishProfiles,
  remoteProfiles,
  startProcess,
} from "./workspace-publication-startup-test-fixtures.mjs";

const akiho = "Akiho-chan <akiho-chan@example.org>";

// Another agent already holds Yui-chan, so the claim under test is Akiho's.
async function holdYui(trunk) {
  await publishProfiles(trunk, ["Yui"], identityB);
  return lsRemoteSha(trunk.origin, "refs/heads/main");
}

// The first push attempt fails before reaching the remote; later ones pass.
async function interruptFirstPush(trunk) {
  const hooks = join(trunk.fixture, "hooks");
  const marker = join(trunk.fixture, "push-blocked");
  mkdirSync(hooks);
  writeFileSync(
    join(hooks, "pre-push"),
    `#!/bin/sh\nif [ ! -e '${marker}' ]; then touch '${marker}'; echo 'transport interrupted' >&2; exit 1; fi\n`,
    { mode: 0o755 },
  );
  await git(trunk.integration, "config", "core.hooksPath", hooks);
}

function resumeArgs({ startingRevision, candidateSha }) {
  return [
    "--starting-revision",
    startingRevision,
    "--candidate-sha",
    candidateSha,
  ];
}

async function workspaceCommitAuthor(workspace) {
  writeFileSync(join(workspace, "slice.txt"), "slice\n");
  await git(workspace, "add", "slice.txt");
  await git(workspace, "commit", "--quiet", "-m", "slice after resume");
  return (
    await git(workspace, "log", "-1", "--format=%an <%ae>")
  ).stdout.trim();
}

test("Akiho-chan is interrupted and resumes with its authorship restored", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  const base = await holdYui(trunk);
  await interruptFirstPush(trunk);
  const interrupted = await startProcess(trunk, "a", identityA).result;
  assert.equal(interrupted.receipt.status, "unpublished");
  assert.equal(await lsRemoteSha(trunk.origin, "refs/heads/main"), base);
  const { workspace } = interrupted;
  await git(workspace, "config", "--worktree", "--unset", "author.name");
  await git(workspace, "config", "--worktree", "--unset", "author.email");
  const resumed = await startProcess(
    trunk,
    "a",
    identityA,
    resumeArgs(interrupted.receipt.recovery),
  ).result;
  assert.equal(resumed.receipt.ok, true, JSON.stringify(resumed));
  assert.equal(resumed.receipt.agent, "Akiho-chan");
  await git(workspace, "fetch", "origin");
  assert.deepEqual(await remoteProfiles(workspace), [
    ".planning/agents/akiho-chan.json",
    ".planning/agents/yui-chan.json",
  ]);
  await assertPublishedAgent(workspace, "Akiho", identityA);
  assert.equal(await workspaceCommitAuthor(workspace), akiho);
});

test("an owned published claim resumes naming its agent and restores missing worktree config", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  await holdYui(trunk);
  const first = await startProcess(trunk, "a", identityA).result;
  assert.equal(first.receipt.agent, "Akiho-chan", JSON.stringify(first));
  const published = await lsRemoteSha(trunk.origin, "refs/heads/main");
  await git(
    trunk.integration,
    "config",
    "--unset",
    "extensions.worktreeConfig",
  );
  const resumed = await startProcess(
    trunk,
    "a",
    identityA,
    resumeArgs(first.receipt),
  ).result;
  assert.equal(resumed.receipt.ok, true, JSON.stringify(resumed));
  assert.equal(resumed.receipt.status, "resumed");
  assert.equal(resumed.receipt.agent, "Akiho-chan");
  assert.equal(await lsRemoteSha(trunk.origin, "refs/heads/main"), published);
  assert.equal(
    (
      await git(trunk.integration, "config", "extensions.worktreeConfig")
    ).stdout.trim(),
    "true",
  );
  assert.equal(await workspaceCommitAuthor(first.workspace), akiho);
});

test("a claim made without a profile resumes without naming an agent", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  await interruptFirstPush(trunk);
  const interrupted = await startProcess(trunk, "a", identityA).result;
  assert.equal(interrupted.receipt.status, "unpublished");
  const { workspace } = interrupted;
  // Rebuild the retained claim as one made before profiles existed.
  await git(workspace, "rm", "--quiet", profilePath("Yui"));
  await git(workspace, "commit", "--quiet", "--amend", "--no-edit");
  const legacy = (await git(workspace, "rev-parse", "HEAD")).stdout.trim();
  const resumed = await startProcess(
    trunk,
    "a",
    identityA,
    resumeArgs({ ...interrupted.receipt.recovery, candidateSha: legacy }),
  ).result;
  assert.equal(resumed.receipt.ok, true, JSON.stringify(resumed));
  assert.equal(resumed.receipt.publishedSha, legacy);
  assert.equal("agent" in resumed.receipt, false);
  await git(workspace, "fetch", "origin");
  assert.deepEqual(await remoteProfiles(workspace), [""]);
});
