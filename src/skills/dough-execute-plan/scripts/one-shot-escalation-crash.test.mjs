// An escalation killed inside its carry step loses no edit: a park killed
// after its ref was written, before or during the workspace reset, keeps the
// ref as written, and a restore killed before deleting the ref leaves the
// edits restored. Rerunning the same start finishes admission and restores
// the edits exactly once. Driven through the real startup CLI.
import assert from "node:assert/strict";
import { test } from "node:test";
import { lsRemoteSha, revParse } from "./publication-test-fixtures.mjs";
import { createQueuedTrunk } from "./workspace-publication-fixtures.mjs";
import {
  assertOneClaim,
  attemptOverClaim,
  carriedSha,
  draftUnlistedStory,
  escalate,
  growAttempt,
  killOnce,
  startUnlistedOneShot,
  unlisted,
  workspaceBytes,
} from "./one-shot-escalation-test-fixtures.mjs";

// Each moment, the Git command the kill matches, and what the kill left.
for (const [moment, pattern, options, left] of [
  [
    "after its carried ref was written",
    '"update-ref refs/dough/"*',
    {},
    ({ bytes, attempt }) => assert.deepEqual(bytes, attempt),
  ],
  [
    "after resetting tracked files, before removing untracked ones",
    '"reset "*',
    {},
    ({ bytes, attempt }) => {
      assert.equal(bytes["trunk.txt"], "base\n");
      assert.equal(bytes["feature/new.txt"], attempt["feature/new.txt"]);
    },
  ],
  [
    "before deleting its carried ref",
    '"update-ref -d "*',
    { before: true },
    ({ tip, trunk }) => assert.notEqual(tip, trunk.trunkSha),
  ],
]) {
  test(`an escalation killed ${moment} keeps the edits and finishes once when rerun`, async (t) => {
    const trunk = await createQueuedTrunk();
    t.after(trunk.cleanup);
    const { workspace } = await startUnlistedOneShot(trunk);
    growAttempt(workspace);
    const attempt = workspaceBytes(workspace);
    draftUnlistedStory(trunk);

    const killed = await escalate(trunk, "trunk", "grow", unlisted, {
      env: killOnce(trunk, pattern, options),
    });
    assert.equal(killed.receipt, null);
    const parked = await carriedSha(workspace, "grow");
    assert.ok(parked, "the carried ref survives the kill");
    left({
      trunk,
      attempt,
      bytes: workspaceBytes(workspace),
      tip: await lsRemoteSha(trunk.origin, "refs/heads/main"),
    });
    assert.equal(await revParse(workspace, `${parked}^`), trunk.trunkSha);

    const { receipt } = await escalate(trunk, "trunk", "grow", unlisted);
    assert.equal(receipt.ok, true, JSON.stringify(receipt));
    assert.deepEqual(receipt.carried, { restored: true });
    const sha = receipt.publishedSha;
    assert.equal(await lsRemoteSha(trunk.origin, "refs/heads/main"), sha);
    await assertOneClaim(trunk, sha, trunk.trunkSha, unlisted.identity);
    assert.equal(await revParse(workspace, "HEAD"), sha);
    const restored = await attemptOverClaim(trunk, attempt, sha);
    assert.deepEqual(workspaceBytes(workspace), restored);
    assert.equal(await carriedSha(workspace, "grow"), undefined);
  });
}
