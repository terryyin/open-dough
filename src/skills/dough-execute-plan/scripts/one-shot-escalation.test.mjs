// A one-shot attempt that grows escalates through `start --admit --carry` in
// its own workspace: its edits are parked, the ordinary admission claim is
// published from clean fetched trunk carrying only the story, Taken entry and
// agent profile, and the edits come back over the claim uncommitted. Driven
// through the real startup CLI against a local bare remote.
import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { git, lsRemoteSha, revParse } from "./publication-test-fixtures.mjs";
import {
  createQueuedTrunk,
  startCliResult,
} from "./workspace-publication-fixtures.mjs";
import {
  admitArgs,
  changedPaths,
  publishPlannedPreparation,
  remoteText,
} from "./workspace-publication-admission-fixtures.mjs";
import {
  assertCleanAt,
  assertOneClaim,
  attemptOverClaim,
  carriedSha,
  draftUnlistedStory,
  escalate,
  growAttempt,
  startUnlistedOneShot,
  unlisted,
  workspaceBytes,
} from "./one-shot-escalation-test-fixtures.mjs";

test("a grown unlisted attempt is admitted from its own workspace and its edits restored over the claim", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  const started = await startUnlistedOneShot(trunk);
  assert.equal(started.receipt.status, "prepared", started.stdout);
  const { workspace } = started;
  growAttempt(workspace);
  const attempt = workspaceBytes(workspace);
  const seed = draftUnlistedStory(trunk);

  const { receipt } = await escalate(trunk, "trunk", "grow", unlisted);
  assert.equal(receipt.status, "published", JSON.stringify(receipt));
  assert.deepEqual(receipt.carried, { restored: true });
  assert.deepEqual(receipt.admitted, [unlisted.seedPath]);
  const sha = receipt.publishedSha;
  assert.equal(await lsRemoteSha(trunk.origin, "refs/heads/main"), sha);
  assert.equal(await revParse(trunk.origin, `${sha}^`), trunk.trunkSha);
  // The claim carries only the story, its Taken entry and one agent profile.
  assert.deepEqual(await changedPaths(trunk, sha), [
    "A\t.planning/agents/yui-chan.json",
    "A\t.planning/seeds/N.md",
    "M\t.planning/PRODUCT-BACKLOG.md",
  ]);
  assert.equal(await remoteText(trunk, sha, unlisted.seedPath), seed);
  await assertOneClaim(trunk, sha, trunk.trunkSha, unlisted.identity);

  // The workspace is the claim with the attempt's bytes back, uncommitted.
  assert.equal(await revParse(workspace, "HEAD"), sha);
  const restored = await attemptOverClaim(trunk, attempt, sha);
  assert.deepEqual(workspaceBytes(workspace), restored);
  assert.deepEqual(
    (await git(workspace, "status", "--porcelain")).stdout.split("\n").sort(),
    ["", " D .planning/slice-plans/A/PLAN.md", " M trunk.txt", "?? feature/"],
  );
  assert.equal(await carriedSha(workspace, "grow"), undefined);

  // Ordinary planning then continues the same claim, writing nothing.
  const ready = await publishPlannedPreparation(trunk, unlisted, {
    plan: "# Plan N\n\n### 1. Finish it\n",
    ready: true,
  });
  const continued = await startCliResult(trunk, "trunk", ["--host", "claude"], {
    identity: unlisted.identity,
    name: "grow",
  });
  assert.equal(continued.receipt.status, "existing", continued.stdout);
  assert.equal(continued.receipt.publishedSha, sha);
  assert.equal(await lsRemoteSha(trunk.origin, "refs/heads/main"), ready);
  assert.deepEqual(workspaceBytes(workspace), restored);
});

test("ordinary admission still refuses a workspace with edits unless they are carried", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  const { workspace } = await startUnlistedOneShot(trunk);
  growAttempt(workspace);
  const attempt = workspaceBytes(workspace);
  draftUnlistedStory(trunk);
  const { identity, link, title } = unlisted;

  const admitted = await startCliResult(
    trunk,
    "trunk",
    admitArgs(identity, link, title),
    { identity: null, name: "grow" },
  );
  assert.equal(admitted.receipt.status, "setup-failed", admitted.stdout);
  assert.match(
    admitted.receipt.recovery.error,
    /cannot continue on fetched trunk as .*: pending-edit/,
  );
  const unpaired = await startCliResult(
    trunk,
    "trunk",
    ["--carry", "--host", "claude"],
    { identity, name: "grow" },
  );
  assert.equal(unpaired.receipt.status, "invalid-request", unpaired.stdout);

  assert.equal(
    await lsRemoteSha(trunk.origin, "refs/heads/main"),
    trunk.trunkSha,
  );
  assert.deepEqual(workspaceBytes(workspace), attempt);
  assert.equal(await carriedSha(workspace, "grow"), undefined);
});

test("carried edits that conflict with the claim stay parked for a human decision", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  const { workspace } = await startUnlistedOneShot(trunk);
  growAttempt(workspace);
  // The attempt had also begun the story in its own workspace, differently.
  writeFileSync(join(workspace, unlisted.seedPath), "# Seed N, attempt copy\n");
  // It also edited the backlog lines the claim changes.
  const backlog = join(workspace, ".planning/PRODUCT-BACKLOG.md");
  const listing = readFileSync(backlog, "utf8");
  writeFileSync(backlog, listing.replace("## Taken\n", "## Taken (noted)\n"));
  const attempt = workspaceBytes(workspace);
  draftUnlistedStory(trunk);

  const { receipt } = await escalate(trunk, "trunk", "grow", unlisted);
  assert.equal(receipt.status, "carry-conflict", JSON.stringify(receipt));
  assert.deepEqual(receipt.paths, [
    ".planning/PRODUCT-BACKLOG.md",
    unlisted.seedPath,
  ]);
  const ref = "refs/dough/carried/exec/grow";
  assert.deepEqual(receipt.carried, { ref, restored: false });
  // The claim was accepted; the workspace stays exactly on it.
  const sha = receipt.publishedSha;
  assert.equal(await lsRemoteSha(trunk.origin, "refs/heads/main"), sha);
  await assertCleanAt(workspace, sha);
  // The parked commit keeps every attempt edit over the one-shot start.
  const parked = await carriedSha(workspace, "grow");
  assert.equal(await revParse(workspace, `${parked}^`), trunk.trunkSha);
  const diff = await git(
    workspace,
    "diff",
    "--name-status",
    `${parked}^`,
    parked,
  );
  assert.deepEqual(
    diff.stdout.trim().split("\n").sort(),
    [
      "M\t.planning/PRODUCT-BACKLOG.md",
      "D\t.planning/slice-plans/A/PLAN.md",
      "A\tfeature/new.txt",
      "A\t.planning/seeds/N.md",
      "M\ttrunk.txt",
    ].sort(),
  );
  for (const [path, bytes] of Object.entries(attempt))
    assert.equal(
      (await git(workspace, "show", `${parked}:${path}`)).stdout,
      bytes,
    );
});
