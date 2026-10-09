// One-shot execution results landed from the default checkout, through the
// actual start command and the installed managed `deliver` against a real
// bare origin. With `--auto-land`, the dirty checkout's combined content (an
// unpublished local commit plus staged, unstaged, untracked and deleted
// changes) lands with the result, reconciled onto a trunk another writer
// advanced, under the trunk observer. A review-default queued result there
// lands later on request from the merge base with its ownership guard and
// closure. Either way the default checkout stays in place.
import assert from "node:assert/strict";
import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { runRetirementCommand } from "../../dough-story-refinement/scripts/dough-land-test-fixtures.mjs";
import {
  commitAllAndAssertRetained,
  occupyDefaultCheckout,
  snapshot,
  startExecutionThere,
  worktreePaths,
} from "./default-checkout-test-fixtures.mjs";
import {
  assertTrunkObserved,
  fetchedMergeBase,
  commitQueuedResult,
  deliverQueued,
  queuedDelivery,
  createSiblingTrunk,
  identityB,
  identityB2,
  remoteCommitsSince,
  remoteLists,
  trunkTarget,
} from "./one-shot-queued-test-fixtures.mjs";
import {
  advanceOriginFromAnotherWriter,
  git,
  lsRemoteSha,
  remoteHeads,
  revParse,
} from "./publication-test-fixtures.mjs";
import { createQueuedTrunk } from "./workspace-publication-fixtures.mjs";

// The file contents trunk holds at `rev` for the occupied checkout's paths.
async function landedContent(origin, rev) {
  const read = async (path) =>
    (await git(origin, "show", `${rev}:${path}`).catch(() => null))?.stdout ??
    null;
  const paths = ["kept", "staged", "added", "edited", "untracked", "deleted"];
  const entries = await Promise.all(
    paths.map(async (name) => [name, await read(`${name}.txt`)]),
  );
  return Object.fromEntries(entries);
}

const occupiedContent = {
  kept: "kept committed\n",
  staged: "staged edit\n",
  added: "staged addition\n",
  edited: "unstaged edit\n",
  untracked: "untracked\n",
  deleted: null,
};

test("an auto-landed default-checkout result lands all checkout content, reconciled onto an advanced trunk, and the checkout stays", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  const checkout = trunk.integration;
  await occupyDefaultCheckout(checkout);
  const advanced = await advanceOriginFromAnotherWriter(trunk.origin);
  const before = await snapshot(checkout, trunk.origin);

  const started = await startExecutionThere(trunk, [
    "--default-main",
    "--auto-land",
  ]);
  assert.equal(started.code, 0, started.stdout);
  assert.equal(started.receipt.role, "default-checkout");
  assert.equal(started.receipt.landing, "auto-land");
  writeFileSync(join(checkout, "feature.txt"), "one-shot result\n");
  await commitAllAndAssertRetained(
    checkout,
    trunk.origin,
    before,
    "one-shot result",
  );

  const fixture = await queuedDelivery(trunk, checkout, {
    excludeInstallation: true,
  });
  const base = await fetchedMergeBase(checkout);
  assert.equal(base, trunk.trunkSha);
  const reconciled = await deliverQueued(fixture, base, [], {
    session: fixture.session,
    branch: "main",
    identity: null,
  });
  assert.equal(
    reconciled.delivered?.status,
    "needs-validation",
    reconciled.stderr,
  );
  assert.equal(await lsRemoteSha(trunk.origin, trunkTarget), advanced);
  // The rebased candidate is rechecked, then delivered as held proof.
  const { delivered, stderr } = await deliverQueued(
    fixture,
    advanced,
    ["--validated-candidate", reconciled.delivered.candidate],
    {
      session: fixture.session,
      branch: "main",
      identity: null,
    },
  );
  assert.equal(delivered?.ok, true, stderr);
  const accepted = delivered.receipt.sha;
  assert.equal(delivered.suffixBase, advanced);
  assert.deepEqual(
    (
      await git(checkout, "diff", "--name-only", delivered.suffixBase, accepted)
    ).stdout
      .trim()
      .split("\n"),
    [
      "added.txt",
      "edited.txt",
      "feature.txt",
      "kept.txt",
      "staged.txt",
      "untracked.txt",
    ],
  );
  assert.equal(await lsRemoteSha(trunk.origin, trunkTarget), accepted);
  const landed = await remoteCommitsSince(trunk.origin, advanced);
  assert.equal(landed.length, 2, "the local commit and the result");
  assert.equal(landed.at(-1), accepted);
  assert.deepEqual(
    await landedContent(trunk.origin, accepted),
    occupiedContent,
  );
  assert.equal(
    (await git(trunk.origin, "show", `${accepted}:feature.txt`)).stdout,
    "one-shot result\n",
  );
  assertTrunkObserved(delivered);

  // The default checkout is the landing checkout: it holds the accepted SHA,
  // stays in place on trunk, and is never retired.
  assert.equal(await revParse(checkout, "HEAD"), accepted);
  assert.equal((await git(checkout, "status", "--porcelain")).stdout, "");
  assert.deepEqual(await worktreePaths(checkout), before.worktrees);
  const retirement = await runRetirementCommand({
    repository: checkout,
    worktree: checkout,
    branch: "main",
  });
  assert.equal(retirement.code, 1, JSON.stringify(retirement.result));
  assert.equal(retirement.result.worktree, "preserved");
  assert.match(retirement.result.reason, /not created for this work/);
  assert.equal(existsSync(join(checkout, "feature.txt")), true);
  assert.equal(await revParse(checkout, "HEAD"), accepted);
});

test("a review-default queued result retained in the default checkout lands on request from the merge base under its ownership guard", async (t) => {
  const trunk = await createSiblingTrunk();
  t.after(trunk.cleanup);
  const checkout = trunk.integration;
  await occupyDefaultCheckout(checkout);
  const localCommit = await revParse(checkout, "HEAD");
  const headsBefore = await remoteHeads(trunk.origin);

  const started = await startExecutionThere(trunk, ["--default-main"], {
    identity: identityB,
    pushAuthorized: false,
  });
  assert.equal(started.code, 0, started.stdout);
  assert.equal(started.receipt.landing, undefined);
  assert.equal(started.receipt.startingRevision, localCommit);
  const result = await commitQueuedResult(checkout, { stageAll: true });
  assert.equal((await git(checkout, "status", "--porcelain")).stdout, "");
  // Retained for review: nothing reached the remote.
  assert.equal(await remoteHeads(trunk.origin), headsBefore);

  // Later, the developer asks to land it.
  const fixture = await queuedDelivery(trunk, checkout, {
    excludeInstallation: true,
  });
  const base = await fetchedMergeBase(checkout);
  assert.equal(base, trunk.trunkSha);
  const { delivered, stderr } = await deliverQueued(fixture, base, [], {
    session: fixture.session,
    branch: "main",
  });
  assert.equal(delivered?.ok, true, stderr);
  assert.equal(delivered.receipt.sha, result);
  assert.deepEqual(await remoteCommitsSince(trunk.origin, trunk.trunkSha), [
    localCommit,
    result,
  ]);
  assert.deepEqual(await landedContent(trunk.origin, result), occupiedContent);
  assert.deepEqual(await remoteLists(trunk), {
    taken: [],
    queued: ["SEED-A#a", identityB2],
  });
  assertTrunkObserved(delivered);
  assert.equal(await revParse(checkout, "HEAD"), result);
  assert.equal(existsSync(checkout), true);
});
