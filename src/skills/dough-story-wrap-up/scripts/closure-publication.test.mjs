// Git mechanics (not guidance-following), not proof an agent follows guidance.
import assert from "node:assert/strict";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import {
  publishTrunkClosureRevision,
  removeExecutionResources,
} from "./closure-publication.mjs";
import {
  advanceOriginFromAnotherWriter,
  ancestorOf,
  assertCheckoutUnchanged,
  captureCheckout,
  commitFile,
  createCleanTrunkFixture,
  createClosureObserver,
  executionBranch,
  git,
  lsRemoteSha,
  messageCount,
  plantHumanEdit,
  publishArgs,
  publishCompletedIncrement,
  remoteCommitCount,
  revParse,
  trunkTarget,
} from "./closure-publication-fixtures.mjs";

test("before-cleanup and final-closure land on remote trunk and eligible cleanup is local only", async (t) => {
  const fixture = await createCleanTrunkFixture();
  t.after(fixture.cleanup);
  const { origin, integration, execution } = fixture;

  const increment = await publishCompletedIncrement(fixture);
  await git(
    integration,
    "push",
    "origin",
    `${increment.receipt.sha}:refs/heads/${executionBranch}`,
  );
  const remoteExecutionBranch = await lsRemoteSha(
    origin,
    `refs/heads/${executionBranch}`,
  );
  assert.equal(remoteExecutionBranch, increment.receipt.sha);

  await plantHumanEdit(integration);
  const integrationBefore = await captureCheckout(integration);
  const observer = createClosureObserver(execution);
  const beforePreRebase = await commitFile(
    execution,
    "before-cleanup.txt",
    "before cleanup\n",
    "before-cleanup closure",
  );
  const firstRemote = await advanceOriginFromAnotherWriter(origin);

  const beforePublished = await publishTrunkClosureRevision(
    publishArgs(fixture, observer, increment.receipt.sha),
  );
  assert.equal(beforePublished.ok, true);
  assert.equal(beforePublished.receipt.target, trunkTarget);
  assert.equal(beforePublished.preRebaseSha, beforePreRebase);
  assert.notEqual(beforePublished.receipt.sha, beforePreRebase);
  assert.equal(
    await lsRemoteSha(origin, trunkTarget),
    beforePublished.receipt.sha,
  );
  assert.equal(
    await ancestorOf(execution, beforePreRebase, "origin/main"),
    false,
  );
  assert.equal(
    (
      await git(
        execution,
        "log",
        "--format=%P",
        "-1",
        beforePublished.receipt.sha,
      )
    ).stdout.trim(),
    firstRemote,
  );
  assert.equal(beforePublished.maintenance.result, "deferred");
  assert.equal(beforePublished.maintenance.reason, "pending-edit");
  assert.notEqual(
    beforePublished.maintenance.head,
    beforePublished.receipt.sha,
  );
  assertCheckoutUnchanged(
    integrationBefore,
    await captureCheckout(integration),
  );
  assert.equal(
    await lsRemoteSha(origin, `refs/heads/${executionBranch}`),
    remoteExecutionBranch,
  );

  const finalPreRebase = await commitFile(
    execution,
    "final-closure.txt",
    "final closure\n",
    "final-closure",
  );
  const laterRemote = await advanceOriginFromAnotherWriter(origin, {
    file: "later-writer.txt",
    body: "later work\n",
    message: "later writer's increment",
  });
  const finalPublished = await publishTrunkClosureRevision(
    publishArgs(fixture, observer, beforePublished.receipt.sha),
  );
  assert.equal(finalPublished.receipt.target, trunkTarget);
  assert.equal(finalPublished.preRebaseSha, finalPreRebase);
  assert.notEqual(finalPublished.receipt.sha, finalPreRebase);
  assert.equal(
    await lsRemoteSha(origin, trunkTarget),
    finalPublished.receipt.sha,
  );
  assert.equal(
    await ancestorOf(execution, beforePublished.receipt.sha, "origin/main"),
    true,
  );
  assert.equal(
    await ancestorOf(execution, finalPreRebase, "origin/main"),
    false,
  );
  assert.equal(
    (
      await git(
        execution,
        "log",
        "--format=%P",
        "-1",
        finalPublished.receipt.sha,
      )
    ).stdout.trim(),
    laterRemote,
  );
  assert.deepEqual(observer.receipts, [
    beforePublished.receipt,
    finalPublished.receipt,
  ]);
  assert.equal(
    observer.receipts.some((receipt) => receipt.sha === beforePreRebase),
    false,
  );
  assert.equal(
    observer.receipts.some((receipt) => receipt.sha === finalPreRebase),
    false,
  );
  assert.equal(finalPublished.maintenance.result, "deferred");
  assert.equal(finalPublished.maintenance.reason, "pending-edit");
  assertCheckoutUnchanged(
    integrationBefore,
    await captureCheckout(integration),
  );
  assert.equal(
    await messageCount(origin, trunkTarget, "before-cleanup closure"),
    1,
  );
  assert.equal(await messageCount(origin, trunkTarget, "final-closure"), 1);
  assert.equal(
    await lsRemoteSha(origin, `refs/heads/${executionBranch}`),
    remoteExecutionBranch,
  );

  const closureShas = [beforePublished.receipt.sha, finalPublished.receipt.sha];
  const blocked = await removeExecutionResources({
    integration,
    execution,
    branch: executionBranch,
    observer,
    sessionOwned: true,
    closureShas,
  });
  assert.equal(blocked.removed, false);
  assert.equal(blocked.reason, "active checkout-bound observer");
  assert.equal(await revParse(execution, "HEAD"), finalPublished.receipt.sha);
  assert.equal(existsSync(execution), true);

  observer.stop();
  const other = join(fixture.fixture, "other");
  await git(integration, "worktree", "add", "-b", "other/task", other, "HEAD");
  writeFileSync(join(other, "other.txt"), "other workspace\n");
  const publishedCount = await remoteCommitCount(origin);
  const removed = await removeExecutionResources({
    integration,
    execution,
    branch: executionBranch,
    observer,
    sessionOwned: true,
    closureShas,
  });
  assert.equal(removed.removed, true);
  assert.equal(removed.worktree, "removed");
  assert.equal(removed.branch, "removed");
  assert.equal(existsSync(execution), false);
  await assert.rejects(
    git(integration, "show-ref", "--verify", `refs/heads/${executionBranch}`),
  );
  assert.equal(
    readFileSync(join(other, "other.txt"), "utf8"),
    "other workspace\n",
  );
  assert.equal(
    (await git(other, "branch", "--show-current")).stdout.trim(),
    "other/task",
  );
  assert.equal(
    await revParse(integration, "refs/heads/other/task"),
    await revParse(other, "HEAD"),
  );
  assertCheckoutUnchanged(
    integrationBefore,
    await captureCheckout(integration),
  );
  assert.equal(await remoteCommitCount(origin), publishedCount);
  assert.equal(
    await lsRemoteSha(origin, trunkTarget),
    finalPublished.receipt.sha,
  );
  assert.equal(
    await lsRemoteSha(origin, `refs/heads/${executionBranch}`),
    remoteExecutionBranch,
  );

  const retry = await removeExecutionResources({
    integration,
    execution,
    branch: executionBranch,
    observer,
    sessionOwned: true,
    closureShas,
  });
  assert.equal(retry.removed, true);
  assert.equal(retry.worktree, "already-absent");
  assert.equal(retry.branch, "already-absent");
  assert.equal(await remoteCommitCount(origin), publishedCount);
  assert.equal(
    await lsRemoteSha(origin, trunkTarget),
    finalPublished.receipt.sha,
  );
  assert.equal(
    readFileSync(join(other, "other.txt"), "utf8"),
    "other workspace\n",
  );
});
