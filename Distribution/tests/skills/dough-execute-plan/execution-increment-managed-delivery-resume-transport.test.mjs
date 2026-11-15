// Managed resume over a stalled transport: a fetch or push that outlasts the
// bound stops with the candidate preserved, nothing pushed or rewritten, and
// the same `resume` run again settles acceptance from the remote.
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

const resumeFor = (fixture, candidateSha) => () =>
  fixture.resumeManagedExecutionIncrement({
    ...fixture.requestBase,
    workspace: fixture.execution,
    candidateSha,
    targetRef: trunkTarget,
    repo: "owner/project",
    publishedRevisions: [],
    defaultCheckout: fixture.integration,
  });

test("a stalled fetch under resume stops with the candidate preserved and no push", async (t) => {
  const { fixture, stall, deliver } = await stalledDeliveryFixture(t);
  const delivered = await deliver();
  assert.equal(delivered.publication, "accepted");
  const accepted = delivered.receipt.sha;
  const resume = resumeFor(fixture, accepted);
  stall.stall({ service: "upload-pack" });
  const before = await workspaceState(fixture.execution);
  const pushesBefore = receivePacks(stall);

  const { result: stoppedRun, elapsed } = await timed(resume);

  assertTransportStop(stoppedRun, elapsed, {
    stage: "fetch",
    pushCount: 0,
    pushIssued: false,
    classification: null,
    candidate: accepted,
    remoteTip: null,
  });
  assert.equal(stoppedRun.observation.state, "recovered");
  assert.equal(
    stoppedRun.observation.directory,
    delivered.observation.directory,
  );
  assert.equal(receivePacks(stall), pushesBefore);
  assert.equal(await lsRemoteSha(fixture.origin, trunkTarget), accepted);
  assert.deepEqual(await workspaceState(fixture.execution), before);

  stall.pass();
  const retried = await resume();

  assert.equal(retried.ok, true);
  assert.equal(retried.publication, "accepted");
  assert.equal(retried.classification, "already-published");
  assert.equal(retried.pushCount, 0);
  assert.equal(receivePacks(stall), pushesBefore);
  assertCoveredOnce(retried, accepted);
});

test("a stalled push under resume stops with the push issued and the retry pushes once", async (t) => {
  const { fixture, stall, deliver } = await stalledDeliveryFixture(t);
  stall.stallBeforeAcceptance();
  const delivered = await deliver();
  assert.equal(delivered.status, "transport-timeout");
  const resume = resumeFor(fixture, fixture.candidateSha);
  const before = await workspaceState(fixture.execution);

  const { result: stoppedRun, elapsed } = await timed(resume);

  assertTransportStop(stoppedRun, elapsed, {
    stage: "push",
    pushCount: 0,
    pushIssued: true,
    classification: "not-on-remote",
    candidate: fixture.candidateSha,
    remoteTip: fixture.trunkSha,
  });
  assert.equal(receivePacks(stall), 2);
  assert.equal(
    await lsRemoteSha(fixture.origin, trunkTarget),
    fixture.trunkSha,
  );
  assert.deepEqual(await workspaceState(fixture.execution), before);

  stall.removeHooks();
  const retried = await resume();

  assert.equal(retried.ok, true);
  assert.equal(retried.publication, "accepted");
  assert.equal(retried.classification, "not-on-remote");
  assert.equal(retried.pushCount, 1);
  assert.equal(receivePacks(stall), 3);
  assert.equal(
    await lsRemoteSha(fixture.origin, trunkTarget),
    fixture.candidateSha,
  );
  assert.deepEqual(await workspaceState(fixture.execution), before);
});
