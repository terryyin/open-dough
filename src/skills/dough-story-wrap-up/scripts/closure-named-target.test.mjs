// Git mechanics (not guidance-following), not proof an agent follows guidance.
// Wrap-up closure follows the project's authorized remote and target branch
// rather than origin/main: Trunk Mode publication, refresh, resume, and
// cleanup, and Story Branch integration plus remote execution-branch cleanup,
// all act on a named non-default remote and branch and leave origin unchanged.
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { publishHistoryPreservingCandidate } from "../../dough-execute-plan/scripts/history-preserving-publication.mjs";
import { remoteHeads } from "../../dough-execute-plan/scripts/publication-test-fixtures.mjs";
import { assertRetiredFrom } from "../../dough-story-refinement/scripts/dough-land-test-fixtures.mjs";
import {
  publishTrunkClosureRevision,
  removeExecutionResources,
  resumeTrunkClosure,
} from "./closure-publication.mjs";
import {
  advanceOriginFromAnotherWriter,
  ancestorOf,
  commitFile,
  createCleanTrunkFixture,
  createClosureObserver,
  executionBranch,
  git,
  lsRemoteSha,
  messageCount,
  revParse,
} from "./closure-publication-fixtures.mjs";

const namedTarget = "refs/heads/trunk";

// A second authorized remote `upstream` whose `trunk` starts at the fixture's
// trunk; the default checkout follows `trunk` there. Origin stays untouched.
async function upstreamTrunkFixture(t) {
  const fixture = await createCleanTrunkFixture();
  t.after(fixture.cleanup);
  const upstream = join(fixture.fixture, "upstream.git");
  await git(fixture.fixture, "init", "-q", "--bare", "-b", "trunk", upstream);
  await git(fixture.integration, "remote", "add", "upstream", upstream);
  await git(
    fixture.integration,
    "push",
    "-q",
    "upstream",
    `${fixture.trunkSha}:${namedTarget}`,
  );
  await git(fixture.integration, "fetch", "-q", "upstream");
  await git(
    fixture.integration,
    "switch",
    "-q",
    "-c",
    "trunk",
    "upstream/trunk",
  );
  return {
    ...fixture,
    upstream,
    originHeads: await remoteHeads(fixture.origin),
  };
}

test("Trunk Mode closure publishes, refreshes, resumes, and retires against a named non-default remote and branch", async (t) => {
  const fixture = await upstreamTrunkFixture(t);
  const { origin, upstream, integration, execution, trunkSha } = fixture;
  const siblingSha = await advanceOriginFromAnotherWriter(upstream, {
    file: "sibling.txt",
    branch: "trunk",
  });
  const observer = createClosureObserver(execution);
  const publish = (previouslyPublishedBase) =>
    publishTrunkClosureRevision({
      workspace: execution,
      branch: executionBranch,
      previouslyPublishedBase,
      observer,
      defaultCheckout: integration,
      validate: async () => ({ ok: true }),
      remote: "upstream",
      targetRef: namedTarget,
    });

  await commitFile(
    execution,
    "before-cleanup.txt",
    "before cleanup\n",
    "before-cleanup closure",
  );
  const before = await publish(trunkSha);
  assert.equal(before.ok, true, JSON.stringify(before));
  assert.equal(before.receipt.target, namedTarget);
  assert.equal(await lsRemoteSha(upstream, namedTarget), before.receipt.sha);
  await git(
    upstream,
    "merge-base",
    "--is-ancestor",
    siblingSha,
    before.receipt.sha,
  );
  assert.equal(before.maintenance.result, "advanced");
  assert.equal(await revParse(integration, "HEAD"), before.receipt.sha);

  await commitFile(
    execution,
    "final-closure.txt",
    "final closure\n",
    "final-closure",
  );
  const final = await publish(before.receipt.sha);
  assert.equal(final.ok, true, JSON.stringify(final));
  assert.equal(await lsRemoteSha(upstream, namedTarget), final.receipt.sha);
  assert.equal(final.maintenance.result, "advanced");
  assert.equal(await revParse(integration, "HEAD"), final.receipt.sha);
  assert.deepEqual(await remoteHeads(origin), fixture.originHeads);

  const fields = {
    ownedWorkspace: execution,
    branch: executionBranch,
    createdForWork: true,
    supersededShas: [],
    publishedRevisions: [before.receipt.sha, final.receipt.sha],
    observer,
    defaultCheckout: integration,
    previouslyPublishedBase: trunkSha,
    beforeCleanupSha: before.receipt.sha,
    finalClosureSha: final.receipt.sha,
    validate: async () => ({ ok: true }),
    remote: "upstream",
    targetRef: namedTarget,
  };
  const stopped = await resumeTrunkClosure(fields);
  assert.equal(stopped.completedObligation, "stop-observer");
  assert.equal(stopped.pushCount, 0);
  const cleaned = await resumeTrunkClosure(fields);
  assert.equal(cleaned.completedObligation, "remove-resources");
  assert.equal(cleaned.cleanup.worktree, "removed");
  assert.equal(cleaned.cleanup.branch, "removed");
  assert.equal(existsSync(execution), false);
  await assertRetiredFrom(
    integration,
    executionBranch,
    final.receipt.sha,
    "upstream/trunk",
  );
  const retry = await resumeTrunkClosure({
    ...fields,
    repository: cleaned.repository,
  });
  assert.equal(retry.pushCount, 0);
  assert.equal(retry.cleanup.worktree, "already-absent");
  assert.equal(await messageCount(upstream, namedTarget, "final-closure"), 1);
  assert.deepEqual(await remoteHeads(origin), fixture.originHeads);
});

test("Story Branch integration and remote execution-branch cleanup use a named non-default remote and branch", async (t) => {
  const fixture = await upstreamTrunkFixture(t);
  const { origin, upstream, execution } = fixture;
  const closureSha = await commitFile(
    execution,
    "closure.txt",
    "story closure\n",
    "story closure",
  );
  await git(
    execution,
    "push",
    "-q",
    "upstream",
    `HEAD:refs/heads/${executionBranch}`,
  );
  const siblingSha = await advanceOriginFromAnotherWriter(upstream, {
    file: "sibling.txt",
    branch: "trunk",
  });
  const observer = createClosureObserver(execution);

  const published = await publishHistoryPreservingCandidate({
    ownedWorkspace: execution,
    publishedTip: closureSha,
    branch: executionBranch,
    remote: "upstream",
    targetRef: namedTarget,
    register: (receipt) => observer.register(receipt.sha, receipt.target),
  });
  assert.equal(published.classification, "published");
  assert.equal(published.pushCount, 1);
  assert.equal(published.receipt.target, namedTarget);
  assert.equal(await lsRemoteSha(upstream, namedTarget), published.receipt.sha);
  assert.equal(await ancestorOf(execution, closureSha, "upstream/trunk"), true);
  assert.equal(await ancestorOf(execution, siblingSha, "upstream/trunk"), true);
  assert.deepEqual(await remoteHeads(origin), fixture.originHeads);

  const resources = {
    execution,
    branch: executionBranch,
    observer,
    createdForWork: true,
    closureShas: [published.receipt.sha],
    remoteBranch: executionBranch,
    remote: "upstream",
    targetRef: namedTarget,
  };
  const active = await removeExecutionResources(resources);
  assert.equal(active.reason, "active checkout-bound observer");
  assert.equal(
    await lsRemoteSha(upstream, `refs/heads/${executionBranch}`),
    closureSha,
  );

  observer.stop();
  const removed = await removeExecutionResources(resources);
  assert.equal(removed.removed, true, JSON.stringify(removed));
  assert.equal(removed.worktree, "removed");
  assert.equal(removed.branch, "removed");
  assert.equal(existsSync(execution), false);
  assert.equal(
    await lsRemoteSha(upstream, `refs/heads/${executionBranch}`),
    "",
  );
  assert.equal(await lsRemoteSha(upstream, namedTarget), published.receipt.sha);
  assert.deepEqual(await remoteHeads(origin), fixture.originHeads);

  const retry = await removeExecutionResources({
    ...resources,
    repository: removed.repository,
  });
  assert.equal(retry.removed, true);
  assert.equal(retry.worktree, "already-absent");
  assert.equal(retry.branch, "already-absent");
  assert.equal(await lsRemoteSha(upstream, namedTarget), published.receipt.sha);
});
