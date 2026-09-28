// Git mechanics (not guidance-following): refresh defers while a Git
// operation is in progress in the checkout, recognizing a rebase by Git's
// rebase state directory rather than a leftover REBASE_HEAD, and stops on a
// detached HEAD. Native agent behavior is not this file.
import assert from "node:assert/strict";
import { existsSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { refreshDefaultCheckout } from "./maintain-default-checkout.mjs";
import {
  advanceOriginFromAnotherWriter,
  assertCheckoutUnchanged,
  captureCheckout,
  createCleanTrunkFixture,
  git,
  indexLockPath,
  revParse,
} from "./publication-test-fixtures.mjs";

function refresh(checkout) {
  return refreshDefaultCheckout({ checkout, integrationBranch: "main" });
}

test("refresh defers for an index lock and every in-progress merge, cherry-pick, or revert ref, even a dangling one, and stops on a detached HEAD", async (t) => {
  const { integration, trunkSha, cleanup } = await createCleanTrunkFixture();
  t.after(cleanup);

  // This fixture stores refs as files, so each in-progress ref is planted
  // where Git itself leaves it.
  const refFile = async (ref) =>
    (
      await git(
        integration,
        "rev-parse",
        "--path-format=absolute",
        "--git-path",
        ref,
      )
    ).stdout.trim();
  const lock = await indexLockPath(integration);
  writeFileSync(lock, "");
  const locked = await refresh(integration);
  unlinkSync(lock);
  assert.deepEqual(
    [locked.result, locked.reason, locked.head, locked.status],
    ["deferred", "ongoing-operation", trunkSha, null],
  );

  const planted = [
    ["MERGE_HEAD", trunkSha],
    ["CHERRY_PICK_HEAD", trunkSha],
    ["REVERT_HEAD", trunkSha],
    ["MERGE_HEAD", "1".repeat(trunkSha.length)],
  ];
  for (const [ref, value] of planted) {
    const file = await refFile(ref);
    writeFileSync(file, `${value}\n`);
    const result = await refresh(integration);
    unlinkSync(file);
    assert.deepEqual(
      [result.result, result.reason, result.head, result.status],
      ["deferred", "ongoing-operation", trunkSha, null],
      `${ref} ${value}`,
    );
  }

  await git(integration, "checkout", "--quiet", "--detach");
  const detached = await refresh(integration);
  assert.equal(detached.result, "stopped");
  assert.equal(detached.reason, "unexpected-branch");
  assert.equal(detached.head, trunkSha);
});

test("refresh defers during a real rebase and advances a clean, behind checkout that kept only a leftover REBASE_HEAD", async (t) => {
  const { origin, integration, trunkSha, cleanup } =
    await createCleanTrunkFixture();
  t.after(cleanup);

  // A conflicting rebase of the checkout's own history stops mid-way.
  await git(integration, "checkout", "--quiet", "-b", "onto");
  writeFileSync(join(integration, "trunk.txt"), "onto\n");
  await git(integration, "commit", "--quiet", "-am", "onto change");
  await git(integration, "checkout", "--quiet", "main");
  writeFileSync(join(integration, "trunk.txt"), "local\n");
  await git(integration, "commit", "--quiet", "-am", "local change");
  await assert.rejects(git(integration, "rebase", "onto"));
  const stateDirectory = (
    await git(
      integration,
      "rev-parse",
      "--path-format=absolute",
      "--git-path",
      "rebase-merge",
    )
  ).stdout.trim();
  assert.equal(existsSync(stateDirectory), true);

  const before = await captureCheckout(integration);
  const midRebase = await refresh(integration);
  assert.deepEqual(
    [midRebase.result, midRebase.reason, midRebase.head],
    ["deferred", "ongoing-operation", before.head],
  );
  assertCheckoutUnchanged(before, await captureCheckout(integration));
  assert.equal(existsSync(stateDirectory), true);

  // Completing the rebase removes its state directory, but Git can keep
  // REBASE_HEAD, even through a hard reset to an ancestor of trunk.
  writeFileSync(join(integration, "trunk.txt"), "resolved\n");
  await git(integration, "add", "trunk.txt");
  await git(integration, "-c", "core.editor=true", "rebase", "--continue");
  await git(integration, "reset", "--quiet", "--hard", trunkSha);
  const advancedSha = await advanceOriginFromAnotherWriter(origin);
  assert.equal(existsSync(stateDirectory), false);
  await git(integration, "rev-parse", "-q", "--verify", "REBASE_HEAD");

  const leftover = await refresh(integration);
  assert.deepEqual(
    [leftover.result, leftover.head, leftover.status],
    ["advanced", advancedSha, ""],
  );
  assert.equal(await revParse(integration, "HEAD"), advancedSha);
});
