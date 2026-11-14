// Managed delivery over a stalled push: whether the remote accepted the
// candidate before the push stopped answering, the same `deliver` run again
// publishes it exactly once, pushing only when the remote does not hold it.
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  assertCoveredOnce,
  assertTransportStop,
  receivePacks,
  stalledDeliveryFixture,
  timed,
  trunkTarget,
  workspaceState,
} from "./execution-increment-managed-delivery-transport-test-fixtures.mjs";
import { lsRemoteSha } from "./publication-test-fixtures.mjs";

test("a push stalled before acceptance stops with the push issued and the retry pushes once", async (t) => {
  const { fixture, stall, deliver } = await stalledDeliveryFixture(t);
  stall.stallBeforeAcceptance();
  const before = await workspaceState(fixture.execution);

  const { result: stoppedRun, elapsed } = await timed(() => deliver());

  assertTransportStop(stoppedRun, elapsed, {
    stage: "push",
    pushIssued: true,
    candidate: fixture.candidateSha,
    preRebaseSha: fixture.candidateSha,
    previouslyPublishedBase: fixture.trunkSha,
    suffixBase: fixture.trunkSha,
    remoteTip: fixture.trunkSha,
    reconciliations: 0,
  });
  assert.equal(
    await lsRemoteSha(fixture.origin, trunkTarget),
    fixture.trunkSha,
  );
  assert.deepEqual(await workspaceState(fixture.execution), before);

  stall.removeHooks();
  const retried = await deliver();

  assert.equal(retried.ok, true);
  assert.equal(retried.publication, "accepted");
  assert.equal(retried.receipt.sha, fixture.candidateSha);
  assert.equal(retried.reconciliations, 0);
  assert.equal(
    await lsRemoteSha(fixture.origin, trunkTarget),
    fixture.candidateSha,
  );
  assert.equal(receivePacks(stall), 2);
  assertCoveredOnce(retried, fixture.candidateSha);
});

test("a push accepted with its answer lost stops and the retry reports acceptance without pushing", async (t) => {
  const { fixture, stall, deliver } = await stalledDeliveryFixture(t);
  stall.stallAfterAcceptance();
  const defaultCheckout = fixture.integration;
  const before = await workspaceState(fixture.execution);

  const { result: stoppedRun, elapsed } = await timed(() =>
    deliver({ defaultCheckout }),
  );

  assertTransportStop(stoppedRun, elapsed, {
    stage: "push",
    pushIssued: true,
    candidate: fixture.candidateSha,
    preRebaseSha: fixture.candidateSha,
    remoteTip: fixture.trunkSha,
    reconciliations: 0,
  });
  assert.equal(
    await lsRemoteSha(fixture.origin, trunkTarget),
    fixture.candidateSha,
  );
  assert.deepEqual(await workspaceState(fixture.execution), before);
  assert.equal(receivePacks(stall), 1);

  stall.removeHooks();
  const retried = await deliver({ defaultCheckout });

  assert.equal(retried.ok, true);
  assert.equal(retried.publication, "accepted");
  assert.equal(retried.classification, "already-published");
  assert.equal(retried.receipt.sha, fixture.candidateSha);
  assert.equal(retried.remoteTip, fixture.candidateSha);
  assert.equal(retried.reconciliations, 0);
  // The default checkout still sits on the old trunk tip, so its refresh is
  // inspected and deferred, as after a push.
  assert.equal(retried.maintenance, "deferred");
  assert.equal(receivePacks(stall), 1);
  assert.equal(
    await lsRemoteSha(fixture.origin, trunkTarget),
    fixture.candidateSha,
  );
  assert.deepEqual(await workspaceState(fixture.execution), before);
  assertCoveredOnce(retried, fixture.candidateSha);
});
