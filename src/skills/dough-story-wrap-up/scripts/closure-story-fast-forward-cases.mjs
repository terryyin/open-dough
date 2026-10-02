// Existing fast-forward closure observations, kept with the integration entry.
import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { publishHistoryPreservingCandidate } from "../../dough-execute-plan/scripts/history-preserving-publication.mjs";
import { isAncestor } from "../../dough-execute-plan/scripts/workspace-publication-ownership.mjs";
import {
  assertCheckoutUnchanged,
  captureCheckout,
  createCleanTrunkFixture,
  executionBranch,
  git,
  lsRemoteSha,
  plantHumanEdit,
  remoteCommitCount,
  revParse,
  trunkTarget,
} from "./closure-git-fixtures.mjs";

test("a fast-forward story tip is the trunk receipt and a later retry does not publish", async (t) => {
  const fixture = await createCleanTrunkFixture();
  t.after(fixture.cleanup);
  const { origin, integration, execution } = fixture;
  const closureSha = await revParse(execution, "HEAD");
  await git(execution, "push", "origin", `HEAD:refs/heads/${executionBranch}`);
  writeFileSync(join(integration, "unrelated.txt"), "unrelated checkout\n");
  await git(integration, "add", "unrelated.txt");
  await git(integration, "commit", "-m", "unrelated integration commit");
  await plantHumanEdit(integration);
  const integrationBefore = await captureCheckout(integration);
  const commitsBefore = await remoteCommitCount(origin);

  const published = await publishHistoryPreservingCandidate({
    ownedWorkspace: execution,
    publishedTip: closureSha,
    branch: executionBranch,
  });
  assert.equal(published.classification, "published");
  assert.equal(published.mergeCount, 1);
  assert.equal(published.pushCount, 1);
  assert.equal(published.rejectedPushCount, 0);
  assert.deepEqual(published.adapterStatuses, []);
  assert.equal(published.supersededSha, null);
  assert.equal(published.receipt.sha, closureSha);
  assert.equal(published.receipt.target, trunkTarget);
  assert.equal(await lsRemoteSha(origin, trunkTarget), closureSha);
  assert.equal(await isAncestor(execution, closureSha, "origin/main"), true);
  const publishedTree = (
    await git(origin, "ls-tree", "-r", "--name-only", trunkTarget)
  ).stdout;
  assert.equal(publishedTree.includes("unrelated.txt"), false);
  assert.equal(publishedTree.includes("human-staged.txt"), false);
  assert.equal(publishedTree.includes("increment.txt"), true);
  assert.notEqual(await revParse(integration, "HEAD"), closureSha);
  assertCheckoutUnchanged(
    integrationBefore,
    await captureCheckout(integration),
  );

  const retry = await publishHistoryPreservingCandidate({
    ownedWorkspace: execution,
    publishedTip: closureSha,
    branch: executionBranch,
  });
  assert.equal(retry.classification, "already-accepted");
  assert.equal(retry.mergeCount, 0);
  assert.equal(retry.pushCount, 0);
  assert.equal(await remoteCommitCount(origin), commitsBefore + 1);
  assert.equal(await lsRemoteSha(origin, trunkTarget), closureSha);
});
