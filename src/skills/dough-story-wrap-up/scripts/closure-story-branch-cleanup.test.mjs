// Git mechanics (not guidance-following), not proof an agent follows guidance.
// Story Branch cleanup deletes the remote execution branch only after that tip
// is an ancestor of remote trunk. Trunk Mode callers omit remoteBranch.
import assert from "node:assert/strict";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { publishHistoryPreservingCandidate } from "../../dough-execute-plan/scripts/history-preserving-publication.mjs";
import {
  advanceOriginBacklog,
  backlogPath,
  itemA,
  itemB,
  itemC,
} from "../../dough-execute-plan/scripts/publication-racing-suffix-fixtures.mjs";
import { backlogOf } from "../../../../tests/support/product-backlog-fixture.mjs";
import { removeExecutionResources } from "./closure-publication.mjs";
import {
  ancestorOf,
  assertCheckoutUnchanged,
  captureCheckout,
  createCleanTrunkFixture,
  createClosureObserver,
  executionBranch,
  git,
  lsRemoteSha,
  plantHumanEdit,
  remoteCommitCount,
  revParse,
  trunkTarget,
} from "./closure-publication-fixtures.mjs";

const ancestorBacklog = backlogOf([itemA, itemB], [itemC]);
const storyBacklog = backlogOf([itemB], [itemC]);
const siblingBacklog = backlogOf([itemA], [itemC]);

async function writeBacklog(workspace, body) {
  mkdirSync(join(workspace, ".planning"), { recursive: true });
  writeFileSync(join(workspace, backlogPath), body);
}

test("eligible cleanup removes the remote execution branch after its tip is on trunk", async (t) => {
  const fixture = await createCleanTrunkFixture();
  t.after(fixture.cleanup);
  const { origin, integration, execution } = fixture;

  await writeBacklog(integration, ancestorBacklog);
  await git(integration, "add", backlogPath);
  await git(integration, "commit", "-m", "ancestor backlog");
  await git(integration, "push", "origin", "main");
  await git(execution, "rebase", "origin/main");
  await writeBacklog(execution, storyBacklog);
  writeFileSync(join(execution, "closure.txt"), "story closure\n");
  await git(execution, "add", backlogPath, "closure.txt");
  await git(execution, "commit", "-m", "story closure");
  const closureSha = await revParse(execution, "HEAD");
  await git(execution, "push", "origin", `HEAD:refs/heads/${executionBranch}`);

  await advanceOriginBacklog(origin, siblingBacklog, "sibling backlog");
  writeFileSync(join(integration, "unrelated.txt"), "unrelated checkout\n");
  await git(integration, "add", "unrelated.txt");
  await git(integration, "commit", "-m", "unrelated integration commit");
  await plantHumanEdit(integration);
  const integrationBefore = await captureCheckout(integration);
  const observer = createClosureObserver(execution);

  const published = await publishHistoryPreservingCandidate({
    ownedWorkspace: execution,
    publishedTip: closureSha,
    branch: executionBranch,
    register: (receipt) => observer.register(receipt.sha, receipt.target),
  });
  assert.equal(published.classification, "published");
  assert.equal(published.mergeCount, 1);
  assert.equal(published.pushCount, 1);
  assert.notEqual(published.receipt.sha, closureSha);
  assert.equal(published.receipt.sha, await lsRemoteSha(origin, trunkTarget));
  assert.equal(await ancestorOf(execution, closureSha, "origin/main"), true);
  assert.equal(
    await lsRemoteSha(origin, `refs/heads/${executionBranch}`),
    closureSha,
  );
  const commitsAfter = await remoteCommitCount(origin);
  assertCheckoutUnchanged(
    integrationBefore,
    await captureCheckout(integration),
  );

  const resources = {
    integration,
    execution,
    branch: executionBranch,
    observer,
    sessionOwned: true,
    closureShas: [published.receipt.sha],
    remoteBranch: executionBranch,
  };
  const active = await removeExecutionResources(resources);
  assert.equal(active.reason, "active checkout-bound observer");
  assert.equal(existsSync(execution), true);
  assert.equal(await revParse(execution, "HEAD"), closureSha);
  assert.equal(
    await lsRemoteSha(origin, `refs/heads/${executionBranch}`),
    closureSha,
  );

  observer.stop();
  const other = join(fixture.fixture, "other");
  await git(integration, "worktree", "add", "-b", "other/task", other, "HEAD");
  writeFileSync(join(other, "other.txt"), "other workspace\n");
  const another = await removeExecutionResources({
    ...resources,
    sessionOwned: false,
  });
  assert.equal(another.reason, "another workspace");
  assert.equal(existsSync(execution), true);
  assert.equal(
    readFileSync(join(other, "other.txt"), "utf8"),
    "other workspace\n",
  );
  assert.equal(
    await lsRemoteSha(origin, `refs/heads/${executionBranch}`),
    closureSha,
  );

  writeFileSync(join(execution, "dirty.txt"), "dirty checkout\n");
  const dirty = await removeExecutionResources(resources);
  assert.equal(dirty.reason, "dirty checkout");
  assert.equal(
    readFileSync(join(execution, "dirty.txt"), "utf8"),
    "dirty checkout\n",
  );
  assert.equal(existsSync(execution), true);
  assert.equal(
    await lsRemoteSha(origin, `refs/heads/${executionBranch}`),
    closureSha,
  );
  await git(execution, "clean", "-f");
  assert.equal(
    (await git(other, "branch", "--show-current")).stdout.trim(),
    "other/task",
  );

  const removed = await removeExecutionResources(resources);
  assert.equal(removed.removed, true);
  assert.equal(removed.worktree, "removed");
  assert.equal(removed.branch, "removed");
  assert.equal(existsSync(execution), false);
  await assert.rejects(
    git(integration, "show-ref", "--verify", `refs/heads/${executionBranch}`),
  );
  assert.equal(await lsRemoteSha(origin, `refs/heads/${executionBranch}`), "");
  assert.equal(await remoteCommitCount(origin), commitsAfter);
  assert.equal(await lsRemoteSha(origin, trunkTarget), published.receipt.sha);
  assert.equal(
    readFileSync(join(other, "other.txt"), "utf8"),
    "other workspace\n",
  );
  assertCheckoutUnchanged(
    integrationBefore,
    await captureCheckout(integration),
  );

  const cleanupRetry = await removeExecutionResources(resources);
  assert.equal(cleanupRetry.removed, true);
  assert.equal(cleanupRetry.worktree, "already-absent");
  assert.equal(cleanupRetry.branch, "already-absent");
  assert.equal(await lsRemoteSha(origin, `refs/heads/${executionBranch}`), "");
  assert.equal(await remoteCommitCount(origin), commitsAfter);
});

test("remote execution branch stays when its tip is not on remote trunk", async (t) => {
  const fixture = await createCleanTrunkFixture();
  t.after(fixture.cleanup);
  const { origin, integration, execution } = fixture;
  const storyTip = await revParse(execution, "HEAD");
  await git(execution, "push", "origin", `HEAD:refs/heads/${executionBranch}`);
  const observer = createClosureObserver(execution);
  observer.stop();
  const kept = await removeExecutionResources({
    integration,
    execution,
    branch: executionBranch,
    observer,
    sessionOwned: true,
    closureShas: [storyTip],
    remoteBranch: executionBranch,
  });
  assert.equal(kept.removed, false);
  assert.equal(kept.reason, "remote execution tip is not integrated");
  assert.equal(existsSync(execution), true);
  assert.equal(await revParse(execution, "HEAD"), storyTip);
  assert.equal(
    await lsRemoteSha(origin, `refs/heads/${executionBranch}`),
    storyTip,
  );
  assert.equal(await ancestorOf(execution, storyTip, "origin/main"), false);
  assert.equal((await git(execution, "status", "--porcelain")).stdout, "");
});
