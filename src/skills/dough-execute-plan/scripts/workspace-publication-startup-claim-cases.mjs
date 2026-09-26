// Claim publication, workspace reuse, installation, and setup boundary.
import assert from "node:assert/strict";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { git, lsRemoteSha, revParse } from "./publication-test-fixtures.mjs";
import {
  createQueuedTrunk,
  failingContributing,
  identityA,
  remoteBacklog,
  startCliResult,
} from "./workspace-publication-fixtures.mjs";
import { takenIdentities } from "./workspace-publication-ownership.mjs";
import { exec } from "./publication-git.mjs";
import { runReadinessGate } from "./execution-worktree-preparation-readiness-gate.mjs";
import { agentModes } from "../../dough-product-backlog/scripts/product-backlog-agent-profile.mjs";

for (const mode of agentModes) {
  test(`installed startup publishes an isolated ${mode} claim to remote trunk`, async (t) => {
    const trunk = await createQueuedTrunk();
    t.after(trunk.cleanup);
    const { receipt, workspace } = await startCliResult(trunk, mode, [
      "--declared-owner",
      "owner",
      "--requester",
      "owner",
    ]);
    assert.equal(receipt.ok, true, JSON.stringify(receipt));
    assert.equal(receipt.plan, "slice-plans/A/PLAN.md");
    assert.equal(
      await lsRemoteSha(trunk.origin, "refs/heads/main"),
      receipt.publishedSha,
    );
    assert.equal(
      await revParse(trunk.integration, "HEAD"),
      receipt.publishedSha,
    );
    assert.deepEqual(receipt.maintenance, { result: "advanced" });
    assert.equal("earlierMaintenance" in receipt, false);
    const remote = await remoteBacklog(workspace);
    assert.equal(takenIdentities(remote).includes(identityA), true);
    assert.match(remote, /\(\[plan\]\(slice-plans\/A\/PLAN\.md\)\)/);
    assert.match(
      (await git(workspace, "log", "-1", "--format=%B")).stdout,
      new RegExp(`Claim-Publisher: publisher-${mode}`),
    );
    assert.equal((await git(workspace, "status", "--porcelain")).stdout, "");
  });
}

test("startup resolves a non-default remote and trunk branch", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  await git(trunk.integration, "branch", "-m", "trunk");
  await git(trunk.integration, "remote", "rename", "origin", "upstream");
  await git(trunk.integration, "push", "upstream", "HEAD:refs/heads/trunk");
  const { receipt } = await startCliResult(trunk, "story-branch", [
    "--remote",
    "upstream",
    "--target",
    "trunk",
  ]);
  assert.equal(receipt.ok, true, JSON.stringify(receipt));
  // Supplied remote and target are invocation context, not echoed back.
  assert.equal("remote" in receipt, false);
  assert.equal("target" in receipt, false);
  assert.equal(
    await lsRemoteSha(trunk.origin, "refs/heads/trunk"),
    receipt.publishedSha,
  );
  assert.equal(
    await lsRemoteSha(trunk.origin, "refs/heads/main"),
    trunk.trunkSha,
  );
});

test("matching clean host-selected workspace is reused without nesting or switching", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  const workspace = join(trunk.fixture, "start-trunk");
  await git(
    trunk.integration,
    "worktree",
    "add",
    "-b",
    "exec/trunk",
    workspace,
    trunk.trunkSha,
  );
  const { receipt } = await startCliResult(trunk, "trunk");
  assert.equal(receipt.ok, true, JSON.stringify(receipt));
  assert.equal(receipt.created, false);
  assert.equal(
    (await git(workspace, "branch", "--show-current")).stdout.trim(),
    "exec/trunk",
  );
  const list = (await git(trunk.integration, "worktree", "list", "--porcelain"))
    .stdout;
  assert.equal(list.match(/worktree /g).length, 2);
});

test("candidate installation runs the startup CLI without source-tree imports", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  const repository = resolve(
    fileURLToPath(new URL("../../../..", import.meta.url)),
  );
  await exec("bash", [
    join(repository, "install.sh"),
    "--target",
    trunk.integration,
    "--source",
    repository,
    "--platform",
    "codex",
  ]);
  const installed = join(
    trunk.integration,
    ".agents/skills/dough-execute-plan/scripts/execution-start.mjs",
  );
  assert.equal(existsSync(installed), true);
  const { receipt } = await startCliResult(trunk, "trunk", [], installed);
  assert.equal(receipt.ok, true, JSON.stringify(receipt));
  assert.equal(
    await lsRemoteSha(trunk.origin, "refs/heads/main"),
    receipt.publishedSha,
  );
});

test("failed project command after accepted startup leaves the claim and workspace intact", async (t) => {
  const trunk = await createQueuedTrunk({ contributing: failingContributing });
  t.after(trunk.cleanup);
  const { receipt, workspace } = await startCliResult(trunk, "trunk");
  assert.equal(receipt.ok, true, JSON.stringify(receipt));
  const readiness = await runReadinessGate(workspace, process.env);
  assert.equal(readiness.ok, false);
  assert.deepEqual(
    readiness.invocations.map(({ role }) => role),
    ["setup", "command"],
  );
  assert.match(readiness.report, new RegExp(workspace));
  assert.match(readiness.report, /node scripts\/fail.js/);
  assert.equal(existsSync(join(workspace, ".setup-ran")), true);
  assert.equal(
    takenIdentities(await remoteBacklog(workspace)).includes(identityA),
    true,
  );
  assert.equal(existsSync(join(workspace, "feature.txt")), false);
  assert.equal(
    await lsRemoteSha(trunk.origin, "refs/heads/main"),
    receipt.publishedSha,
  );
  assert.equal(existsSync(workspace), true);
});

test("workspace setup failure preserves recovery context and leaves trunk unpublished", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  const workspace = join(trunk.fixture, "start-trunk");
  writeFileSync(workspace, "not a directory\n");
  const { receipt } = await startCliResult(trunk, "trunk");
  assert.equal(receipt.status, "setup-failed", JSON.stringify(receipt));
  assert.equal(receipt.implemented, false);
  assert.equal(receipt.recovery.workspace, workspace);
  assert.match(receipt.recovery.error, /start-trunk|exists|Not a directory/i);
  assert.equal(readFileSync(workspace, "utf8"), "not a directory\n");
  assert.equal(
    await lsRemoteSha(trunk.origin, "refs/heads/main"),
    trunk.trunkSha,
  );
});
