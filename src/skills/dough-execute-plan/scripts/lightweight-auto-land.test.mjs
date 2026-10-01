// One-shot execution with `--auto-land` in an owned workspace, through the
// actual start command and the installed managed `deliver`/resume against a
// real bare origin: the start demands publication authority up front and
// records the selection; the verified result and its queued closure land as
// one commit without a review stop, the trunk observer covers that SHA while
// refresh and CI stay separate results, and only then is the created
// workspace retired. A holder that appears after the start stops the landing
// with nothing pushed, and a lost push response resumes the same candidate.
// The default checkout is in lightweight-auto-land-default-checkout.test.mjs.
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { test } from "node:test";
import { runRetirementCommand } from "../../dough-story-refinement/scripts/dough-land-test-fixtures.mjs";
import { refreshDefaultCheckout } from "./maintain-default-checkout.mjs";
import {
  assertTrunkObserved,
  commitQueuedResult,
  deliverQueued,
  queuedDelivery,
  startQueuedOneShot,
  createSiblingTrunk,
  identityB,
  identityB2,
  remoteCommitsSince,
  remoteLists,
  remoteText,
  rivalTake,
  seedB,
  trunkTarget,
} from "./one-shot-queued-test-fixtures.mjs";
import {
  git,
  lsRemoteSha,
  messageCount,
  remoteHeads,
  revParse,
} from "./publication-test-fixtures.mjs";
import { lostPushResponse } from "./workspace-publication-startup-test-fixtures.mjs";

// Starts B with automatic landing and commits its verified result with B's
// closure; nothing reaches the remote before delivery.
async function startAndCommit(trunk) {
  const headsBefore = await remoteHeads(trunk.origin);
  const started = await startQueuedOneShot(trunk, { extra: ["--auto-land"] });
  assert.equal(started.code, 0, started.stdout);
  assert.equal(started.receipt.status, "prepared");
  assert.equal(started.receipt.landing, "auto-land");
  assert.equal(started.receipt.created, true);
  const result = await commitQueuedResult(started.workspace);
  assert.equal(await remoteHeads(trunk.origin), headsBefore);
  const fixture = await queuedDelivery(trunk, started.workspace, {
    excludeInstallation: true,
  });
  return { started, result, fixture, base: started.receipt.startingRevision };
}

test("an auto-landed queued result and its closure land as one observed trunk commit, siblings intact, and its created workspace is retired", async (t) => {
  const trunk = await createSiblingTrunk();
  t.after(trunk.cleanup);
  const { started, result, fixture, base } = await startAndCommit(trunk);

  const { delivered, stderr } = await deliverQueued(fixture, base, [], {
    session: fixture.session,
  });
  assert.equal(delivered?.ok, true, stderr);
  assert.equal(delivered.receipt.sha, result);
  assert.equal(delivered.receipt.target, trunkTarget);
  assert.equal(await lsRemoteSha(trunk.origin, trunkTarget), result);
  assert.deepEqual(await remoteCommitsSince(trunk.origin, trunk.trunkSha), [
    result,
  ]);
  assert.deepEqual(await remoteLists(trunk), {
    taken: [],
    queued: ["SEED-A#a", identityB2],
  });
  assert.match(
    await remoteText(trunk, "main", seedB),
    /### Story B2\n\n\*\*Identity:\*\* SEED-B#b2/,
  );
  // Acceptance is reported apart from CI and refresh: the observer watches
  // the accepted SHA and the default checkout has not moved.
  assertTrunkObserved(delivered);
  assert.equal(await revParse(trunk.integration, "HEAD"), trunk.trunkSha);
  const refreshed = await refreshDefaultCheckout({
    checkout: trunk.integration,
  });
  assert.equal(refreshed.result, "advanced", JSON.stringify(refreshed));
  assert.equal(await revParse(trunk.integration, "HEAD"), result);

  fixture.stopObserver(delivered.observation.directory);
  const retired = await runRetirementCommand({
    repository: trunk.integration,
    worktree: started.workspace,
    branch: started.branch,
    identity: identityB,
  });
  assert.equal(retired.code, 0, JSON.stringify(retired.result));
  assert.equal(existsSync(started.workspace), false);
  assert.equal(
    (await git(trunk.integration, "branch", "--list", started.branch)).stdout,
    "",
  );
});

test("a Take published between the auto-land start and its landing stops delivery with nothing pushed and the holder intact", async (t) => {
  const trunk = await createSiblingTrunk();
  t.after(trunk.cleanup);
  const { started, result, fixture, base } = await startAndCommit(trunk);
  const take = await rivalTake(trunk);

  const { delivered, code } = await deliverQueued(fixture, base, [], {
    session: fixture.session,
  });
  assert.equal(code, 1);
  assert.equal(delivered.status, "ownership-changed");
  assert.equal(delivered.ownership.identity, identityB);
  assert.match(delivered.error, /already Taken/);
  assert.equal(delivered.receipt, null);
  assert.equal(await lsRemoteSha(trunk.origin, trunkTarget), take);
  assert.deepEqual((await remoteLists(trunk)).taken, [identityB]);
  // The verified result stays retained, unchanged, in its workspace.
  assert.equal(await revParse(started.workspace, "HEAD"), result);
  assert.equal(existsSync(started.workspace), true);
  assert.equal((await git(started.workspace, "status", "--short")).stdout, "");
});

test("a lost push response of an auto-landed result resumes the retained candidate without a second commit", async (t) => {
  const trunk = await createSiblingTrunk();
  t.after(trunk.cleanup);
  const { started, result, fixture, base } = await startAndCommit(trunk);

  const lost = await deliverQueued(fixture, base, [], {
    session: fixture.session,
    env: { ...fixture.env, PATH: lostPushResponse(trunk).PATH },
  });
  assert.notEqual(lost.code, 0, lost.stdout);
  assert.match(lost.stderr, /connection closed after acceptance/);
  assert.equal(await lsRemoteSha(trunk.origin, trunkTarget), result);

  const resumed = await fixture.resumeManagedExecutionIncrement({
    ...fixture.requestBase,
    workspace: started.workspace,
    candidateSha: result,
    targetRef: trunkTarget,
    repo: "owner/project",
    publishedRevisions: [],
    defaultCheckout: trunk.integration,
    oneShotIdentity: identityB,
  });
  assert.equal(resumed.ok, true, JSON.stringify(resumed));
  assert.equal(resumed.pushCount, 0);
  assert.equal(resumed.receipt.sha, result);
  assert.deepEqual(await remoteCommitsSince(trunk.origin, trunk.trunkSha), [
    result,
  ]);
  assert.equal(
    await messageCount(
      trunk.origin,
      "main",
      "Complete story B as one-shot work",
    ),
    1,
  );
});
