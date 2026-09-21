// Git mechanics (not guidance-following): resume classifies a retained
// execution candidate from fetched remote ancestry. Interruption before
// acceptance publishes that SHA once. A lost success after a rewritten
// push, followed by another writer's advance, stays published. An observer
// stub records receipt attribution only. Native agent recovery is not this
// file.
import assert from "node:assert/strict";
import { test } from "node:test";
import { resumeInterruptedPublication } from "./publication-resume.mjs";
import {
  advanceOriginFromAnotherWriter,
  assertCheckoutUnchanged,
  captureCheckout,
  createCleanTrunkFixture,
  git,
  messageCount,
  plantHumanEdit,
  pushCandidate,
  revParse,
  worktreeCount,
} from "./publication-test-fixtures.mjs";

function createObserverStub() {
  const receipts = [];
  return {
    bound: true,
    receipts,
    register(sha, target = "refs/heads/main") {
      receipts.push({ sha, target });
    },
  };
}

test("an interrupted publication before acceptance pushes the retained candidate once and does not commit again", async (t) => {
  const { origin, integration, execution, trunkSha, candidateSha, cleanup } =
    await createCleanTrunkFixture();
  t.after(cleanup);

  await plantHumanEdit(integration);
  const before = await captureCheckout(integration);
  const commitsBefore = Number(
    (await git(execution, "rev-list", "--count", "HEAD")).stdout.trim(),
  );
  const worktreesBefore = await worktreeCount(integration);
  const publishedRevisions = [];
  const observer = createObserverStub();

  const published = await resumeInterruptedPublication({
    ownedWorkspace: execution,
    defaultCheckout: integration,
    candidateSha,
    publishedRevisions,
    observer,
  });

  assert.equal(published.classification, "not-on-remote");
  assert.equal(published.completedObligation, "publish");
  assert.equal(published.pushCount, 1);
  assert.equal(published.acceptedSha, candidateSha);
  assert.equal(published.acceptedPublicationCount, 1);
  assert.deepEqual(publishedRevisions, [candidateSha]);
  assert.equal(published.registration.sha, candidateSha);
  assert.equal(published.registration.target, "refs/heads/main");
  assert.deepEqual(observer.receipts, [
    { sha: candidateSha, target: "refs/heads/main" },
  ]);
  assert.equal(published.maintenance, "deferred");
  assert.equal(published.remaining.maintenancePerformed, false);
  assert.equal(published.cleanup, "not-performed");
  assert.equal(await revParse(execution, "HEAD"), candidateSha);
  assert.equal(await revParse(execution, "exec/story"), candidateSha);
  assert.equal(
    Number((await git(execution, "rev-list", "--count", "HEAD")).stdout.trim()),
    commitsBefore,
  );
  assert.equal(
    await messageCount(origin, "refs/heads/main", "verified increment"),
    1,
  );
  assert.equal(
    (await git(origin, "rev-parse", `${candidateSha}^`)).stdout.trim(),
    trunkSha,
  );
  assert.equal(await worktreeCount(integration), worktreesBefore);
  assertCheckoutUnchanged(before, await captureCheckout(integration));

  const again = await resumeInterruptedPublication({
    ownedWorkspace: execution,
    defaultCheckout: integration,
    candidateSha,
    publishedRevisions,
    observer,
  });
  assert.equal(again.classification, "already-published");
  assert.equal(again.completedObligation, "none");
  assert.equal(again.pushCount, 0);
  assert.equal(again.acceptedPublicationCount, 1);
  assert.equal(again.registration.reason, "already-recorded");
  assert.equal(observer.receipts.length, 1);
  assert.equal(
    await messageCount(origin, "refs/heads/main", "verified increment"),
    1,
  );
  assert.equal(await revParse(execution, "HEAD"), candidateSha);
  assertCheckoutUnchanged(before, await captureCheckout(integration));
});

test("a lost success after a rewritten push stays published when another writer advances", async (t) => {
  const { origin, integration, execution, trunkSha, candidateSha, cleanup } =
    await createCleanTrunkFixture();
  t.after(cleanup);

  await plantHumanEdit(integration);
  const before = await captureCheckout(integration);
  const firstRemote = await advanceOriginFromAnotherWriter(origin);
  await git(execution, "fetch", "origin");
  await git(execution, "rebase", "--onto", firstRemote, trunkSha, "exec/story");
  const rewrittenSha = await revParse(execution, "exec/story");
  assert.notEqual(rewrittenSha, candidateSha);
  await pushCandidate(execution, rewrittenSha);
  const laterRemote = await advanceOriginFromAnotherWriter(origin, {
    file: "later-writer.txt",
    body: "later work\n",
    message: "later writer's increment",
  });
  const remoteCountBefore = Number(
    (await git(origin, "rev-list", "--count", "refs/heads/main")).stdout.trim(),
  );
  const commitsBefore = Number(
    (await git(execution, "rev-list", "--count", "HEAD")).stdout.trim(),
  );
  const worktreesBefore = await worktreeCount(integration);
  const publishedRevisions = [];
  const observer = createObserverStub();

  const resumed = await resumeInterruptedPublication({
    ownedWorkspace: execution,
    defaultCheckout: integration,
    candidateSha: rewrittenSha,
    supersededShas: [candidateSha],
    publishedRevisions,
    observer,
  });

  assert.equal(resumed.classification, "already-published");
  assert.equal(resumed.completedObligation, "record-published-identity");
  assert.equal(resumed.pushCount, 0);
  assert.equal(resumed.acceptedSha, rewrittenSha);
  assert.equal(resumed.acceptedPublicationCount, 1);
  assert.deepEqual(publishedRevisions, [rewrittenSha]);
  assert.equal(publishedRevisions.includes(candidateSha), false);
  assert.deepEqual(observer.receipts, []);
  assert.equal(resumed.registration.reason, "not-this-obligation");
  assert.equal(resumed.remaining.registration, "remaining");
  assert.equal(resumed.maintenance, "deferred");
  assert.equal(resumed.remaining.maintenancePerformed, false);
  assert.equal(resumed.cleanup, "not-performed");
  assert.equal(await revParse(origin, "refs/heads/main"), laterRemote);
  assert.equal(
    (await git(origin, "rev-parse", `${laterRemote}^`)).stdout.trim(),
    rewrittenSha,
  );
  assert.equal(
    (await git(origin, "rev-parse", `${rewrittenSha}^`)).stdout.trim(),
    firstRemote,
  );
  let preRebaseOnRemote = true;
  try {
    await git(
      execution,
      "merge-base",
      "--is-ancestor",
      candidateSha,
      "origin/main",
    );
  } catch (error) {
    preRebaseOnRemote = false;
    assert.equal(error.code, 1);
  }
  assert.equal(preRebaseOnRemote, false);
  assert.equal(
    await messageCount(origin, "refs/heads/main", "verified increment"),
    1,
  );
  assert.equal(
    Number(
      (
        await git(origin, "rev-list", "--count", "refs/heads/main")
      ).stdout.trim(),
    ),
    remoteCountBefore,
  );
  assert.equal(await revParse(execution, "HEAD"), rewrittenSha);
  assert.equal(
    Number((await git(execution, "rev-list", "--count", "HEAD")).stdout.trim()),
    commitsBefore,
  );
  assert.equal(await worktreeCount(integration), worktreesBefore);
  assertCheckoutUnchanged(before, await captureCheckout(integration));

  const registered = await resumeInterruptedPublication({
    ownedWorkspace: execution,
    defaultCheckout: integration,
    candidateSha: rewrittenSha,
    supersededShas: [candidateSha],
    publishedRevisions,
    observer,
  });
  assert.equal(registered.classification, "already-published");
  assert.equal(registered.completedObligation, "register");
  assert.equal(registered.pushCount, 0);
  assert.equal(registered.acceptedPublicationCount, 1);
  assert.deepEqual(observer.receipts, [
    { sha: rewrittenSha, target: "refs/heads/main" },
  ]);
  assert.equal(registered.remaining.registration, "satisfied");
  assert.equal(registered.remaining.maintenancePerformed, false);
  assert.equal(registered.cleanup, "not-performed");
  assert.equal(await revParse(origin, "refs/heads/main"), laterRemote);
  assertCheckoutUnchanged(before, await captureCheckout(integration));

  const again = await resumeInterruptedPublication({
    ownedWorkspace: execution,
    defaultCheckout: integration,
    candidateSha: rewrittenSha,
    supersededShas: [candidateSha],
    publishedRevisions,
    observer,
  });
  assert.equal(again.completedObligation, "none");
  assert.equal(again.pushCount, 0);
  assert.equal(again.acceptedPublicationCount, 1);
  assert.equal(observer.receipts.length, 1);
  assert.equal(await revParse(origin, "refs/heads/main"), laterRemote);
  assertCheckoutUnchanged(before, await captureCheckout(integration));
});
