// Git mechanics (not guidance-following), not proof an agent follows guidance.
// An already-published closure is not pushed again.
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { test } from "node:test";
import {
  publishTrunkClosureRevision,
  resumeTrunkClosure,
} from "./closure-publication.mjs";
import {
  commitFile,
  createCleanTrunkFixture,
  createClosureObserver,
  executionBranch,
  git,
  lsRemoteSha,
  messageCount,
  publishArgs,
  publishCompletedIncrement,
  remoteCommitCount,
  resumeArgs,
  revParse,
  trunkTarget,
} from "./closure-publication-fixtures.mjs";

test("an already-published closure is not pushed again and partial cleanup accepts an absent worktree", async (t) => {
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
  const remoteExecutionBranch = increment.receipt.sha;
  const publishObserver = createClosureObserver(execution);
  const beforeCleanupSha = await commitFile(
    execution,
    "before-cleanup.txt",
    "before cleanup\n",
    "before-cleanup closure",
  );
  const beforePublished = await publishTrunkClosureRevision(
    publishArgs(fixture, publishObserver, increment.receipt.sha),
  );
  assert.equal(beforePublished.receipt.sha, beforeCleanupSha);
  const finalClosureSha = await commitFile(
    execution,
    "final-closure.txt",
    "final closure\n",
    "final-closure",
  );
  const finalPublished = await publishTrunkClosureRevision(
    publishArgs(fixture, publishObserver, beforePublished.receipt.sha),
  );
  assert.equal(finalPublished.receipt.sha, finalClosureSha);
  const publishedCount = await remoteCommitCount(origin);

  await git(integration, "worktree", "remove", execution);
  assert.equal(existsSync(execution), false);
  assert.equal(
    await revParse(integration, `refs/heads/${executionBranch}`),
    finalClosureSha,
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
  const obligations = [];
  let step = await resumeTrunkClosure(resumeArgs(fixture, fields));
  while (step.completedObligation !== "remove-resources") {
    obligations.push(step.completedObligation);
    assert.equal(step.pushCount, 0);
    assert.equal(step.cleanup, "not-performed");
    assert.equal(await remoteCommitCount(origin), publishedCount);
    assert.equal(
      await revParse(integration, `refs/heads/${executionBranch}`),
      finalClosureSha,
    );
    step = await resumeTrunkClosure(resumeArgs(fixture, fields));
  }
  assert.deepEqual(obligations, [
    "record-published-identity",
    "register",
    "record-published-identity",
    "register",
    "stop-observer",
  ]);
  assert.equal(step.pushCount, 0);
  assert.equal(step.cleanup.worktree, "already-absent");
  assert.equal(step.cleanup.branch, "removed");
  await assert.rejects(
    git(integration, "show-ref", "--verify", `refs/heads/${executionBranch}`),
  );
  assert.equal(await remoteCommitCount(origin), publishedCount);
  assert.equal(await lsRemoteSha(origin, trunkTarget), finalClosureSha);
  assert.equal(
    await lsRemoteSha(origin, `refs/heads/${executionBranch}`),
    remoteExecutionBranch,
  );
  assert.deepEqual(observer.receipts, [
    { sha: beforeCleanupSha, target: trunkTarget },
    { sha: finalClosureSha, target: trunkTarget },
  ]);

  const retry = await resumeTrunkClosure(resumeArgs(fixture, fields));
  assert.equal(retry.pushCount, 0);
  assert.equal(retry.cleanup.worktree, "already-absent");
  assert.equal(retry.cleanup.branch, "already-absent");
  assert.equal(await remoteCommitCount(origin), publishedCount);
  assert.equal(
    await messageCount(origin, trunkTarget, "before-cleanup closure"),
    1,
  );
  assert.equal(await messageCount(origin, trunkTarget, "final-closure"), 1);
});
