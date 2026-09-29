// Git mechanics (not guidance-following), not proof an agent follows guidance.
// Trunk Mode closure needs only the owned workspace and its repository's
// management context: without a default checkout, or with one whose refresh
// fails, both closure revisions are accepted on the remote, the completion
// receipt and shutdown still gate cleanup, cleanup retires the owned worktree,
// and a rerun from the retained Git directory publishes nothing.
import assert from "node:assert/strict";
import { existsSync, realpathSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { ownedWorktreeOnly } from "../../dough-execute-plan/scripts/default-checkout-test-fixtures.mjs";
import {
  exec,
  worktreeCount,
} from "../../dough-execute-plan/scripts/publication-test-fixtures.mjs";
import { assertRetiredFrom } from "../../dough-story-refinement/scripts/dough-land-test-fixtures.mjs";
import {
  removeExecutionResources,
  resumeTrunkClosure,
} from "./closure-publication.mjs";
import {
  assertCheckoutUnchanged,
  captureCheckout,
  commitFile,
  createCleanTrunkFixture,
  createClosureObserver,
  git,
  lsRemoteSha,
  messageCount,
  plantHumanEdit,
  publishCompletedIncrement,
  remoteCommitCount,
  trunkTarget,
} from "./closure-publication-fixtures.mjs";

async function commitClosures(workspace) {
  const beforeCleanupSha = await commitFile(
    workspace,
    "before-cleanup.txt",
    "before cleanup\n",
    "before-cleanup closure",
  );
  const finalClosureSha = await commitFile(
    workspace,
    "final-closure.txt",
    "final closure\n",
    "final-closure",
  );
  return { beforeCleanupSha, finalClosureSha };
}

// Resume input carrying no repository: the management context is recorded
// from the owned workspace while it exists.
function ownedOnlyArgs(ownedWorkspace, branch, fields) {
  return {
    ownedWorkspace,
    branch,
    createdForWork: true,
    supersededShas: [],
    validate: async () => ({ ok: true }),
    ...fields,
  };
}

test("without a default checkout, Trunk Mode closure publishes both revisions, gates cleanup on the completion receipt and shutdown, retires the repository's last worktree, and reruns from the retained Git directory", async (t) => {
  const fixture = await createCleanTrunkFixture();
  t.after(fixture.cleanup);
  const { origin } = fixture;
  const increment = await publishCompletedIncrement(fixture);
  const { repository, workspace, branch } = await ownedWorktreeOnly(
    fixture,
    "owned-closure",
    "exec/owned-closure",
  );
  assert.equal(existsSync(fixture.integration), false);
  const { beforeCleanupSha, finalClosureSha } = await commitClosures(workspace);
  const observer = createClosureObserver(workspace);
  const fields = {
    previouslyPublishedBase: increment.receipt.sha,
    beforeCleanupSha,
    finalClosureSha,
    publishedRevisions: [],
    observer,
  };
  const resume = (extra = {}) =>
    resumeTrunkClosure(
      ownedOnlyArgs(workspace, branch, { ...fields, ...extra }),
    );

  const before = await resume();
  assert.equal(before.completedObligation, "publish");
  assert.equal(before.pushCount, 1);
  assert.equal(before.acceptedSha, beforeCleanupSha);
  assert.deepEqual(before.refresh, { result: "not applicable" });
  assert.equal(before.cleanup, "not-performed");
  assert.equal(before.repository, realpathSync(repository));
  assert.equal(await lsRemoteSha(origin, trunkTarget), beforeCleanupSha);
  assert.equal(await messageCount(origin, trunkTarget, "final-closure"), 0);

  const final = await resume();
  assert.equal(final.completedObligation, "publish");
  assert.equal(final.pushCount, 1);
  assert.equal(final.acceptedSha, finalClosureSha);
  assert.deepEqual(final.refresh, { result: "not applicable" });
  assert.equal(await lsRemoteSha(origin, trunkTarget), finalClosureSha);
  assert.deepEqual(observer.receipts, [
    { sha: beforeCleanupSha, target: trunkTarget },
    { sha: finalClosureSha, target: trunkTarget },
  ]);

  // Accepted on the remote, but without the completion receipt for these
  // closure revisions and a confirmed shutdown, cleanup keeps everything.
  const unobserved = createClosureObserver(workspace);
  unobserved.stop();
  const withoutReceipt = await removeExecutionResources({
    execution: workspace,
    branch,
    observer: unobserved,
    createdForWork: true,
    closureShas: [beforeCleanupSha, finalClosureSha],
  });
  assert.equal(withoutReceipt.reason, "observer obligation unfinished");
  assert.equal(existsSync(workspace), true);

  const published = await remoteCommitCount(origin);
  const stopped = await resume();
  assert.equal(stopped.completedObligation, "stop-observer");
  assert.equal(stopped.pushCount, 0);
  assert.equal(stopped.cleanup, "not-performed");
  assert.equal(observer.stopped, true);
  assert.equal(existsSync(workspace), true);
  assert.equal(await worktreeCount(repository), 2);

  const cleaned = await resume();
  assert.equal(cleaned.completedObligation, "remove-resources");
  assert.equal(cleaned.pushCount, 0);
  assert.equal(cleaned.cleanup.worktree, "removed");
  assert.equal(cleaned.cleanup.branch, "removed");
  assert.equal(existsSync(workspace), false);
  assert.equal(await worktreeCount(repository), 1);
  await assertRetiredFrom(repository, branch, finalClosureSha, "origin/main");
  assert.equal(await remoteCommitCount(origin), published);

  const lost = await resume();
  assert.equal(lost.stopped, true);
  assert.equal(
    lost.reason,
    "execution worktree and management context are both absent",
  );
  assert.equal(lost.pushCount, 0);
  assert.equal(lost.cleanup, "not-performed");

  const retry = await resume({ repository: cleaned.repository });
  assert.equal(retry.completedObligation, "remove-resources");
  assert.equal(retry.pushCount, 0);
  assert.equal(retry.cleanup.worktree, "already-absent");
  assert.equal(retry.cleanup.branch, "already-absent");
  assert.equal(await remoteCommitCount(origin), published);
  assert.equal(await lsRemoteSha(origin, trunkTarget), finalClosureSha);
  assert.equal(
    await messageCount(origin, trunkTarget, "before-cleanup closure"),
    1,
  );
  assert.equal(await messageCount(origin, trunkTarget, "final-closure"), 1);
});

test("a failing default-checkout refresh is reported as deferred while closure is accepted on the remote and eligible cleanup still retires the owned worktree", async (t) => {
  const fixture = await createCleanTrunkFixture();
  t.after(fixture.cleanup);
  const { origin, integration, execution } = fixture;
  const increment = await publishCompletedIncrement(fixture);
  const defaultCheckout = join(fixture.fixture, "developer");
  await exec("git", ["clone", "-q", origin, defaultCheckout]);
  await git(
    defaultCheckout,
    "remote",
    "set-url",
    "origin",
    join(fixture.fixture, "unreachable.git"),
  );
  await plantHumanEdit(defaultCheckout);
  const developerBefore = await captureCheckout(defaultCheckout);
  const managementBefore = realpathSync(join(integration, ".git"));
  const { beforeCleanupSha, finalClosureSha } = await commitClosures(execution);
  const observer = createClosureObserver(execution);
  const fields = {
    previouslyPublishedBase: increment.receipt.sha,
    beforeCleanupSha,
    finalClosureSha,
    publishedRevisions: [],
    observer,
    defaultCheckout,
  };
  const resume = (extra = {}) =>
    resumeTrunkClosure(
      ownedOnlyArgs(execution, "exec/story", { ...fields, ...extra }),
    );

  const before = await resume();
  assert.equal(before.completedObligation, "publish");
  assert.equal(before.acceptedSha, beforeCleanupSha);
  assert.equal(before.refresh.result, "deferred");
  assert.equal(before.refresh.reason, "refresh-failed");
  assert.equal(await lsRemoteSha(origin, trunkTarget), beforeCleanupSha);

  const final = await resume();
  assert.equal(final.completedObligation, "publish");
  assert.equal(final.acceptedSha, finalClosureSha);
  assert.equal(final.refresh.reason, "refresh-failed");
  assert.equal(await lsRemoteSha(origin, trunkTarget), finalClosureSha);

  const stopped = await resume();
  assert.equal(stopped.completedObligation, "stop-observer");
  assert.equal(existsSync(execution), true);

  const published = await remoteCommitCount(origin);
  const cleaned = await resume();
  assert.equal(cleaned.completedObligation, "remove-resources");
  assert.equal(cleaned.cleanup.worktree, "removed");
  assert.equal(cleaned.cleanup.branch, "removed");
  assert.equal(cleaned.repository, managementBefore);
  assert.equal(existsSync(execution), false);
  await assertRetiredFrom(
    cleaned.repository,
    "exec/story",
    finalClosureSha,
    "origin/main",
  );
  assertCheckoutUnchanged(
    developerBefore,
    await captureCheckout(defaultCheckout),
  );

  const retry = await resume({ repository: cleaned.repository });
  assert.equal(retry.completedObligation, "remove-resources");
  assert.equal(retry.pushCount, 0);
  assert.equal(retry.cleanup.worktree, "already-absent");
  assert.equal(retry.cleanup.branch, "already-absent");
  assert.equal(await remoteCommitCount(origin), published);
  assertCheckoutUnchanged(
    developerBefore,
    await captureCheckout(defaultCheckout),
  );
});
