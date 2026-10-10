// Managed delivery over a stalled Git transport: a fetch that outlasts the
// bound stops with a recoverable `transport-timeout` result naming the
// stage, the workspace is left as it was, and the same `deliver` run again on
// a responsive transport continues the ordinary sequence.
import assert from "node:assert/strict";
import { test } from "node:test";
import { deliverThroughCli } from "./execution-increment-managed-delivery-cli-test-fixtures.mjs";
import {
  assertCoveredOnce,
  assertNoTransportTimeout,
  assertTransportStop,
  boundMs,
  receivePacks,
  stalledDeliveryFixture,
  timed,
  trunkTarget,
  workspaceState,
} from "./execution-increment-managed-delivery-transport-test-fixtures.mjs";
import { git } from "./execution-increment-managed-delivery-test-fixtures.mjs";
import { transportBoundSetting } from "./publication-git.mjs";
import {
  advanceOriginFromAnotherWriter,
  lsRemoteSha,
} from "./publication-test-fixtures.mjs";

test("a stalled fetch stops before any push and the same deliver then publishes once", async (t) => {
  const { fixture, stall, deliver } = await stalledDeliveryFixture(t);
  stall.stall({ service: "upload-pack" });
  const before = await workspaceState(fixture.execution);

  const { result: stoppedRun, elapsed } = await timed(() => deliver());

  assertTransportStop(stoppedRun, elapsed, {
    stage: "fetch",
    pushIssued: false,
    candidate: fixture.candidateSha,
    preRebaseSha: fixture.candidateSha,
    previouslyPublishedBase: fixture.trunkSha,
    suffixBase: fixture.trunkSha,
    remoteTip: null,
    reconciliations: 0,
  });
  assert.equal(stoppedRun.observation.state, "attached");
  assert.equal(
    await lsRemoteSha(fixture.origin, trunkTarget),
    fixture.trunkSha,
  );
  assert.deepEqual(
    stall.calls().map(({ service }) => service),
    ["upload-pack"],
  );
  assert.deepEqual(await workspaceState(fixture.execution), before);

  stall.pass();
  const retried = await deliver();

  assert.equal(retried.ok, true);
  assert.equal(retried.publication, "accepted");
  assert.equal(retried.receipt.sha, fixture.candidateSha);
  assert.equal(retried.reconciliations, 0);
  assert.equal(retried.observation.directory, stoppedRun.observation.directory);
  assert.equal(
    await lsRemoteSha(fixture.origin, trunkTarget),
    fixture.candidateSha,
  );
  assert.equal(receivePacks(stall), 1);
  assertCoveredOnce(retried, fixture.candidateSha);
});

test("the deliver command prints a stalled fetch's stop as JSON and exits 1", async (t) => {
  const { fixture, stall } = await stalledDeliveryFixture(t);
  stall.stall({ service: "upload-pack" });
  const env = {
    ...fixture.env,
    [transportBoundSetting]: String(boundMs),
    CLAUDE_CODE_SESSION_ID: "transport-coordinator",
  };
  const before = await workspaceState(fixture.execution);

  const started = Date.now();
  const { delivered, code } = await deliverThroughCli(fixture, {
    base: fixture.trunkSha,
    env,
  });

  assert.equal(code, 1);
  assertTransportStop(delivered, Date.now() - started, {
    stage: "fetch",
    pushIssued: false,
    candidate: fixture.candidateSha,
    preRebaseSha: fixture.candidateSha,
    remoteTip: null,
  });
  assert.equal(
    await lsRemoteSha(fixture.origin, trunkTarget),
    fixture.trunkSha,
  );
  assert.deepEqual(await workspaceState(fixture.execution), before);

  stall.pass();
  const retried = await deliverThroughCli(fixture, {
    base: fixture.trunkSha,
    env,
  });

  assert.equal(retried.code, 0);
  assert.equal(retried.delivered.publication, "accepted");
  assert.equal(retried.delivered.receipt.sha, fixture.candidateSha);
  assert.equal(
    await lsRemoteSha(fixture.origin, trunkTarget),
    fixture.candidateSha,
  );
});

test("a fetch stalled after a rejected push stops with the rejected candidate and the retry reconciles", async (t) => {
  const { fixture, stall, deliver } = await stalledDeliveryFixture(t);
  // The second upload-pack is the fetch after the rejected push.
  stall.stall({ service: "upload-pack", call: 2 });
  let advancedTip;
  const validated = [];
  const validate = async (candidate) => {
    validated.push(candidate);
    return { ok: true };
  };
  const before = await workspaceState(fixture.execution);

  const { result: stoppedRun, elapsed } = await timed(() =>
    deliver({
      validate,
      // Another writer advances the target, by the bare path, between the
      // first fetch and the push, so the push is rejected.
      beforePush: async () => {
        advancedTip = await advanceOriginFromAnotherWriter(fixture.origin);
      },
    }),
  );

  assertTransportStop(stoppedRun, elapsed, {
    stage: "fetch-after-rejection",
    pushIssued: true,
    candidate: fixture.candidateSha,
    preRebaseSha: fixture.candidateSha,
    previouslyPublishedBase: fixture.trunkSha,
    suffixBase: fixture.trunkSha,
    remoteTip: fixture.trunkSha,
    reconciliations: 0,
  });
  assert.deepEqual(validated, []);
  assert.equal(await lsRemoteSha(fixture.origin, trunkTarget), advancedTip);
  assert.deepEqual(await workspaceState(fixture.execution), before);

  stall.pass();
  const retried = await deliver({ validate });

  assert.equal(retried.ok, true);
  assert.equal(retried.publication, "accepted");
  assert.equal(retried.reconciliations, 1);
  assert.notEqual(retried.receipt.sha, fixture.candidateSha);
  assert.deepEqual(validated, [retried.receipt.sha]);
  assert.equal(
    (
      await git(
        fixture.execution,
        "log",
        "--format=%P",
        "-1",
        retried.receipt.sha,
      )
    ).stdout.trim(),
    advancedTip,
  );
  assert.equal(
    await lsRemoteSha(fixture.origin, trunkTarget),
    retried.receipt.sha,
  );
  assertCoveredOnce(retried, retried.receipt.sha);
});

test("a slow but responsive transport delivers as before", async (t) => {
  const { fixture, stall, deliver } = await stalledDeliveryFixture(t);
  stall.pass({ delayMs: boundMs / 4 });

  const delivered = await deliver();

  assert.equal(delivered.ok, true);
  assert.equal(delivered.publication, "accepted");
  assert.equal(delivered.receipt.sha, fixture.candidateSha);
  assertNoTransportTimeout(delivered);
  assert.ok(stall.calls().length >= 2);
  assert.ok(stall.calls().every(({ stalled }) => !stalled));
  assert.equal(
    await lsRemoteSha(fixture.origin, trunkTarget),
    fixture.candidateSha,
  );
  assertCoveredOnce(delivered, fixture.candidateSha);
});
