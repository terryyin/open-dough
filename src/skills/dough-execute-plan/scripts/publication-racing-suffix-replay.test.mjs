// Git mechanics (not guidance-following): after an owned suffix was already
// rewritten, a later rejection replays only that suffix onto the newer trunk.
// The cutoff is the trunk the suffix was just replayed onto, not the older
// published revision and not the rejected tip. Lost-response classification
// is not this file.
import assert from "node:assert/strict";
import { test } from "node:test";
import { backlogOf } from "../../../../tests/support/product-backlog-fixture.mjs";
import {
  advanceOriginBacklog,
  assertAffectedCombination,
  createBacklogSuffixFixture,
  itemA,
  itemB,
  itemC,
  itemD,
  ownedD,
  pushRejected,
  rebaseInProgress,
  rebaseOwnedSuffix,
  siblingB,
} from "./publication-racing-suffix-fixtures.mjs";
import {
  advanceOriginFromAnotherWriter,
  assertCheckoutUnchanged,
  assertRemoteCandidate,
  captureCheckout,
  git,
  lsRemoteSha,
  pushCandidate,
  revParse,
} from "./publication-test-fixtures.mjs";

test("a rejection after the suffix was already rewritten replays only that suffix onto the newer trunk", async (t) => {
  const ownedBacklog = backlogOf([], [itemA, itemB, itemC, ownedD]);
  const { origin, integration, execution, trunkSha, cleanup } =
    await createBacklogSuffixFixture(ownedBacklog);
  t.after(cleanup);

  const before = await captureCheckout(integration);
  const firstWriter = await advanceOriginBacklog(
    origin,
    backlogOf([], [itemA, siblingB, itemC, itemD]),
    "sibling backlog change",
  );
  await git(execution, "fetch", "origin");
  const firstReplay = await rebaseOwnedSuffix({
    cwd: execution,
    onto: firstWriter,
    upstream: trunkSha,
    branch: "exec/story",
  });
  assert.equal(firstReplay.code, 0, firstReplay.stdout + firstReplay.stderr);
  const rewritten = await revParse(execution, "exec/story");
  await assertAffectedCombination(execution, rewritten);
  const suffixBase = (
    await git(execution, "rev-parse", `${rewritten}^`)
  ).stdout.trim();
  assert.equal(suffixBase, firstWriter);

  const secondWriter = await advanceOriginFromAnotherWriter(origin);
  assert.equal(await pushRejected(execution, rewritten), true);
  assert.equal(await lsRemoteSha(origin, "refs/heads/main"), secondWriter);

  await git(execution, "fetch", "origin");
  const retry = await rebaseOwnedSuffix({
    cwd: execution,
    onto: secondWriter,
    upstream: suffixBase,
    branch: "exec/story",
  });
  assert.equal(retry.code, 0, retry.stdout + retry.stderr);
  const candidate = await revParse(execution, "exec/story");
  await assertAffectedCombination(execution, candidate);
  assert.equal(
    (await git(execution, "rev-parse", `${candidate}^`)).stdout.trim(),
    secondWriter,
  );
  assert.equal(
    (
      await git(
        execution,
        "log",
        "--format=%s",
        `${secondWriter}..${candidate}`,
      )
    ).stdout,
    "verified increment\n",
  );
  assert.equal(
    (
      await git(execution, "ls-tree", "-r", "--name-only", candidate)
    ).stdout.includes("other-writer.txt"),
    true,
  );
  await pushCandidate(execution, candidate);
  await git(execution, "fetch", "origin");
  await assertRemoteCandidate(origin, candidate);
  assertCheckoutUnchanged(before, await captureCheckout(integration));
  assert.equal(await rebaseInProgress(execution), false);
});
