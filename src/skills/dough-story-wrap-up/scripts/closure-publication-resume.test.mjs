// Git mechanics (not guidance-following), not proof an agent follows guidance.
// Resume continues the first unfinished Trunk Mode closure obligation.
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { test } from "node:test";
import { resumeTrunkClosure } from "./closure-publication.mjs";
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
  publishCompletedIncrement,
  remoteCommitCount,
  resumeArgs,
  revParse,
  trunkTarget,
} from "./closure-publication-fixtures.mjs";

test("interruption resumes the first unfinished closure obligation and does not clean up early", async (t) => {
  const fixture = await createCleanTrunkFixture();
  t.after(fixture.cleanup);
  const { origin, integration, execution } = fixture;
  const increment = await publishCompletedIncrement(fixture);
  await plantHumanEdit(integration);
  const integrationBefore = await captureCheckout(integration);
  const beforeCleanupSha = await commitFile(
    execution,
    "before-cleanup.txt",
    "before cleanup\n",
    "before-cleanup closure",
  );
  const finalClosureSha = await commitFile(
    execution,
    "final-closure.txt",
    "final closure\n",
    "final-closure",
  );
  const publishedRevisions = [];
  const observer = createClosureObserver(execution);
  const fields = {
    previouslyPublishedBase: increment.receipt.sha,
    beforeCleanupSha,
    finalClosureSha,
    publishedRevisions,
    observer,
  };

  const publishedBefore = await resumeTrunkClosure(resumeArgs(fixture, fields));
  assert.equal(publishedBefore.completedObligation, "publish");
  assert.equal(publishedBefore.pushCount, 1);
  assert.equal(publishedBefore.acceptedSha, beforeCleanupSha);
  assert.equal(publishedBefore.cleanup, "not-performed");
  assert.equal(publishedBefore.refresh.result, "deferred");
  assert.equal(publishedBefore.refresh.reason, "pending-edit");
  assert.equal(await lsRemoteSha(origin, trunkTarget), beforeCleanupSha);
  assert.equal(await messageCount(origin, trunkTarget, "final-closure"), 0);
  assert.equal(existsSync(execution), true);
  assert.equal(await revParse(execution, executionBranch), finalClosureSha);
  assertCheckoutUnchanged(
    integrationBefore,
    await captureCheckout(integration),
  );

  const publishedFinal = await resumeTrunkClosure(resumeArgs(fixture, fields));
  assert.equal(publishedFinal.completedObligation, "publish");
  assert.equal(publishedFinal.pushCount, 1);
  assert.equal(publishedFinal.acceptedSha, finalClosureSha);
  assert.equal(publishedFinal.cleanup, "not-performed");
  assert.equal(await lsRemoteSha(origin, trunkTarget), finalClosureSha);
  assert.equal(
    await messageCount(origin, trunkTarget, "before-cleanup closure"),
    1,
  );
  assert.equal(await messageCount(origin, trunkTarget, "final-closure"), 1);
  assert.equal(existsSync(execution), true);
  assert.equal(observer.stopped, false);

  const countAfterPublish = await remoteCommitCount(origin);
  const stopped = await resumeTrunkClosure(resumeArgs(fixture, fields));
  assert.equal(stopped.completedObligation, "stop-observer");
  assert.equal(stopped.pushCount, 0);
  assert.equal(stopped.cleanup, "not-performed");
  assert.equal(observer.stopped, true);
  assert.equal(existsSync(execution), true);
  assert.equal(await revParse(execution, executionBranch), finalClosureSha);
  assert.equal(await remoteCommitCount(origin), countAfterPublish);

  const cleaned = await resumeTrunkClosure(resumeArgs(fixture, fields));
  assert.equal(cleaned.completedObligation, "remove-resources");
  assert.equal(cleaned.pushCount, 0);
  assert.equal(cleaned.cleanup.worktree, "removed");
  assert.equal(cleaned.cleanup.branch, "removed");
  assert.equal(existsSync(execution), false);
  assert.equal(await remoteCommitCount(origin), countAfterPublish);
  assert.equal(await lsRemoteSha(origin, trunkTarget), finalClosureSha);
  assert.equal(await lsRemoteSha(origin, `refs/heads/${executionBranch}`), "");
  assertCheckoutUnchanged(
    integrationBefore,
    await captureCheckout(integration),
  );

  const retry = await resumeTrunkClosure(resumeArgs(fixture, fields));
  assert.equal(retry.completedObligation, "remove-resources");
  assert.equal(retry.pushCount, 0);
  assert.equal(retry.cleanup.worktree, "already-absent");
  assert.equal(retry.cleanup.branch, "already-absent");
  assert.equal(await remoteCommitCount(origin), countAfterPublish);
  assert.equal(
    await messageCount(origin, trunkTarget, "before-cleanup closure"),
    1,
  );
  assert.equal(await messageCount(origin, trunkTarget, "final-closure"), 1);
});

test("resume rebases an unpublished closure tip and leaves the worktree in place", async (t) => {
  const fixture = await createCleanTrunkFixture();
  t.after(fixture.cleanup);
  const { origin, integration, execution } = fixture;
  const increment = await publishCompletedIncrement(fixture);
  await plantHumanEdit(integration);
  const integrationBefore = await captureCheckout(integration);
  const preRebase = await commitFile(
    execution,
    "before-cleanup.txt",
    "before cleanup\n",
    "before-cleanup closure",
  );
  const disjointSha = await advanceOriginFromAnotherWriter(origin);
  const publishedRevisions = [];
  const observer = createClosureObserver(execution);

  const resumed = await resumeTrunkClosure(
    resumeArgs(fixture, {
      previouslyPublishedBase: increment.receipt.sha,
      beforeCleanupSha: preRebase,
      finalClosureSha: null,
      publishedRevisions,
      observer,
    }),
  );
  assert.equal(resumed.completedObligation, "publish");
  assert.equal(resumed.pushCount, 1);
  assert.equal(resumed.preRebaseSha, preRebase);
  assert.notEqual(resumed.acceptedSha, preRebase);
  assert.equal(resumed.receipt.target, trunkTarget);
  assert.equal(resumed.cleanup, "not-performed");
  assert.equal(resumed.refresh.result, "deferred");
  assert.equal(await lsRemoteSha(origin, trunkTarget), resumed.acceptedSha);
  assert.equal(await ancestorOf(execution, preRebase, "origin/main"), false);
  assert.equal(
    (
      await git(execution, "log", "--format=%P", "-1", resumed.acceptedSha)
    ).stdout.trim(),
    disjointSha,
  );
  assert.equal(existsSync(execution), true);
  assert.equal(await revParse(execution, executionBranch), resumed.acceptedSha);
  assert.equal(await lsRemoteSha(origin, `refs/heads/${executionBranch}`), "");
  assert.deepEqual(observer.receipts, [resumed.receipt]);
  assertCheckoutUnchanged(
    integrationBefore,
    await captureCheckout(integration),
  );

  const again = await resumeTrunkClosure(
    resumeArgs(fixture, {
      previouslyPublishedBase: increment.receipt.sha,
      beforeCleanupSha: resumed.acceptedSha,
      finalClosureSha: null,
      supersededShas: [preRebase],
      publishedRevisions,
      observer,
    }),
  );
  assert.equal(again.completedObligation, "final-closure-not-committed");
  assert.equal(again.pushCount, 0);
  assert.equal(again.cleanup, "not-performed");
  assert.equal(existsSync(execution), true);
  assert.equal(await lsRemoteSha(origin, trunkTarget), resumed.acceptedSha);
  assert.equal(
    await messageCount(origin, trunkTarget, "before-cleanup closure"),
    1,
  );
});
