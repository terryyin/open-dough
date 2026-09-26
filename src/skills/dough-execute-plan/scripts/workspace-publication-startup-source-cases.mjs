// Selected source, authority, and fetch refusals preserve queued work.
import assert from "node:assert/strict";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { git, lsRemoteSha, revParse } from "./publication-test-fixtures.mjs";
import {
  createQueuedTrunk,
  identityA,
  startCliResult,
} from "./workspace-publication-fixtures.mjs";
import { startExecution } from "./execution-start.mjs";

test("startup preserves unrelated staged, tracked, untracked, and sibling source edits", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  const seed = join(trunk.integration, ".planning/seeds/A.md");
  writeFileSync(
    seed,
    `${readFileSync(seed, "utf8")}\n<a id="b"></a>\n\n### Story B\n\nSibling edit.\n`,
  );
  writeFileSync(join(trunk.integration, "staged.txt"), "index\n");
  await git(trunk.integration, "add", "staged.txt");
  writeFileSync(join(trunk.integration, "untracked.txt"), "working\n");
  const before = {
    staged: (await git(trunk.integration, "diff", "--cached")).stdout,
    seed: readFileSync(seed, "utf8"),
    untracked: readFileSync(join(trunk.integration, "untracked.txt"), "utf8"),
  };
  const { receipt } = await startCliResult(trunk, "trunk", [
    "--declared-owner",
    "owner",
    "--requester",
    "owner",
  ]);
  assert.equal(receipt.ok, true, JSON.stringify(receipt));
  assert.deepEqual(receipt.maintenance, {
    result: "deferred",
    reason: "pending-edit",
  });
  assert.equal("earlierMaintenance" in receipt, false);
  assert.equal(
    (await git(trunk.integration, "diff", "--cached")).stdout,
    before.staged,
  );
  assert.equal(readFileSync(seed, "utf8"), before.seed);
  assert.equal(
    readFileSync(join(trunk.integration, "untracked.txt"), "utf8"),
    before.untracked,
  );
  assert.equal(await revParse(trunk.integration, "HEAD"), trunk.trunkSha);
});

test("selected unstaged, staged, and committed source changes stop before claim", async (t) => {
  for (const layer of ["worktree", "index", "commit"]) {
    const trunk = await createQueuedTrunk();
    t.after(trunk.cleanup);
    const seed = join(trunk.integration, ".planning/seeds/A.md");
    writeFileSync(
      seed,
      readFileSync(seed, "utf8").replace(
        "Execute A.",
        "Edited selected promise.",
      ),
    );
    if (layer !== "worktree")
      await git(trunk.integration, "add", ".planning/seeds/A.md");
    if (layer === "commit")
      await git(trunk.integration, "commit", "-m", "local selected change");
    const before = readFileSync(seed, "utf8");
    const { receipt, workspace } = await startCliResult(trunk, "trunk");
    assert.equal(
      receipt.status,
      "source-refused",
      `${layer}: ${JSON.stringify(receipt)}`,
    );
    assert.equal(
      await lsRemoteSha(trunk.origin, "refs/heads/main"),
      trunk.trunkSha,
    );
    assert.equal(readFileSync(seed, "utf8"), before);
    assert.equal(existsSync(workspace), false);
  }
});

test("stale published readiness stops without a Taken claim", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  const seed = join(trunk.integration, ".planning/seeds/A.md");
  writeFileSync(
    seed,
    readFileSync(seed, "utf8").replace(
      "Execute A.",
      "Changed after assessment.",
    ),
  );
  await git(trunk.integration, "add", ".planning/seeds/A.md");
  await git(trunk.integration, "commit", "-m", "stale assessment");
  await git(trunk.integration, "push", "origin", "main");
  const tip = await revParse(trunk.integration, "HEAD");
  const { receipt, code, workspace } = await startCliResult(trunk, "trunk");
  assert.equal(code, 1);
  assert.equal(receipt.ok, false);
  assert.equal(receipt.status, "source-refused");
  assert.match(receipt.error, /needs-reassessment/);
  assert.equal("publishedSha" in receipt, false);
  assert.equal(await lsRemoteSha(trunk.origin, "refs/heads/main"), tip);
  assert.equal(existsSync(workspace), false);
});

test("selected plan changes at every local Git layer stop without a claim", async (t) => {
  for (const layer of ["worktree", "index", "commit"]) {
    const trunk = await createQueuedTrunk();
    t.after(trunk.cleanup);
    const plan = join(trunk.integration, ".planning/slice-plans/A/PLAN.md");
    writeFileSync(plan, `${readFileSync(plan, "utf8")}Changed local plan.\n`);
    if (layer !== "worktree")
      await git(trunk.integration, "add", ".planning/slice-plans/A/PLAN.md");
    if (layer === "commit")
      await git(trunk.integration, "commit", "-m", "local plan change");
    const before = readFileSync(plan, "utf8");
    const { receipt, workspace } = await startCliResult(trunk, "trunk");
    assert.equal(
      receipt.status,
      "source-refused",
      `${layer}: ${JSON.stringify(receipt)}`,
    );
    assert.equal(
      await lsRemoteSha(trunk.origin, "refs/heads/main"),
      trunk.trunkSha,
    );
    assert.equal(readFileSync(plan, "utf8"), before);
    assert.equal(existsSync(workspace), false);
  }
});

test("a failed fetch creates no workspace or claim", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  await git(
    trunk.integration,
    "remote",
    "set-url",
    "origin",
    join(trunk.fixture, "unreachable.git"),
  );
  const unavailable = await startCliResult(trunk, "trunk");
  assert.equal(unavailable.receipt.status, "source-refused");
  assert.equal(existsSync(unavailable.workspace), false);
  assert.equal(
    await lsRemoteSha(trunk.origin, "refs/heads/main"),
    trunk.trunkSha,
  );
});

test("missing publication authority refuses before fetch or workspace selection", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  const workspace = join(trunk.fixture, "unauthorized");
  const receipt = await startExecution({
    integration: trunk.integration,
    workspace,
    branch: "exec/unauthorized",
    identity: identityA,
    publisherId: "unauthorized",
    mode: "trunk",
    remote: "origin",
    target: "main",
    workspaceAuthorized: true,
  });
  assert.equal(receipt.status, "authority-required");
  assert.equal(existsSync(workspace), false);
  assert.equal(
    await lsRemoteSha(trunk.origin, "refs/heads/main"),
    trunk.trunkSha,
  );
});
