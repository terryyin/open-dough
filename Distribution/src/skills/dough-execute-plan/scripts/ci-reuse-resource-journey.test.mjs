import assert from "node:assert/strict";
import { once } from "node:events";
import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { installReuseProvider } from "./ci-reuse-journey-test-fixtures.mjs";
import {
  stalledDeliveryFixture,
  timed,
  assertTransportStop,
  workspaceState,
} from "./execution-increment-managed-delivery-transport-test-fixtures.mjs";
import { lsRemoteSha } from "./publication-test-fixtures.mjs";
import {
  customPolicy,
  customProvider,
} from "./ci-integrated-state-custom-test-fixtures.mjs";
import { readRevisionCoverage } from "./ci-mailbox.mjs";
import { recordedVerdict } from "./ci-mailbox-await.mjs";
import { readWorkerIdentity } from "./ci-mailbox-store.mjs";
import { checkMailboxWorkerLiveness } from "./ci-mailbox-worker-process.mjs";
import {
  startStubWorker,
  publishThenExitSource,
} from "./ci-mailbox-stub-worker-test-fixtures.mjs";
import { awaitWorkerState } from "./watch-ci-test-fixtures.mjs";
import {
  branchSha,
  createTrunkClosureFixture,
  deliverBeforeCleanupThroughCli,
  finishThroughCli,
} from "../../dough-story-wrap-up/scripts/trunk-closure-test-fixtures.mjs";

test("source reuse and real target success cannot release an unconfirmed publication with its push answer lost", async (t) => {
  const { fixture, stall, deliver } = await stalledDeliveryFixture(t);
  const provider = await installReuseProvider(fixture);
  await provider.direct(fixture.candidateSha);
  const before = await workspaceState(fixture.execution);
  stall.stallAfterAcceptance();
  const { result, elapsed } = await timed(() => deliver());
  assertTransportStop(result, elapsed, {
    stage: "push",
    pushIssued: true,
    candidate: fixture.candidateSha,
  });
  assert.equal(result.receipt, null);
  assert.equal(
    await lsRemoteSha(fixture.origin, "refs/heads/main"),
    fixture.candidateSha,
  );
  const target = await provider.target(fixture.candidateSha);
  assert.equal(target.decision.reuse, true);
  assert.equal(target.attempt.outcome, "success");
  assert.equal(provider.count(fixture.candidateSha), 1);
  assert.deepEqual(await workspaceState(fixture.execution), before);
  assert.equal(existsSync(fixture.execution), true);
  assert.equal(
    checkMailboxWorkerLiveness(
      readWorkerIdentity(result.observation.directory),
      result.observation.directory,
    ),
    "alive",
  );
});

// Reproduce the existing completion exit-window fixture after real target
// acquisition: the observer publishes a stopped result but its process table
// identity remains uncertain. No CI success is supplied by this stub.
async function enterUnknownExitWindow(fixture, directory) {
  await fixture.stopObserver(directory);
  rmSync(join(directory, "stop"));
  rmSync(join(directory, "result.json"));
  return startStubWorker({
    root: fixture.fixture,
    directory,
    teardown: fixture.teardown,
    source: publishThenExitSource({
      exitingCommand: "[node]",
      exitDelayMs: null,
    }),
  });
}

test("real reused target success with unconfirmed shutdown keeps Trunk closure workspace, branch and uncertain observer", async (t) => {
  const fixture = await createTrunkClosureFixture(t);
  const provider = await installReuseProvider(fixture);
  await provider.direct(fixture.candidateSha);
  const before = await deliverBeforeCleanupThroughCli(fixture);
  const target = await provider.target(before.receipt.sha);
  assert.equal(target.decision.reuse, true);
  const directory = before.observation.directory;
  await awaitWorkerState(
    directory,
    () => readRevisionCoverage(directory)[0]?.state === "success",
    "real target success",
  );
  const checkedBy = readRevisionCoverage(directory)[0].checkedBy;
  assert.deepEqual(checkedBy, {
    runId: target.attempt.runId,
    attemptId: target.attempt.attemptId,
  });
  const child = await enterUnknownExitWindow(fixture, directory);
  const { result, code } = await finishThroughCli(fixture, {
    beforeCleanup: before.receipt.sha,
    final: before.receipt.sha,
    extra: ["--created-for-work"],
  });
  assert.equal(code, 1);
  assert.equal(result.step, "completion");
  assert.equal(result.completion.verdict, "success");
  assert.equal(result.completion.requestedSha, before.receipt.sha);
  assert.deepEqual(
    result.completion.effectiveEvidence.revision.checkedBy,
    checkedBy,
  );
  assert.equal(result.completion.shutdown.status, "unconfirmed");
  assert.equal(
    result.completion.shutdown.limitation,
    "observer_liveness_unknown",
  );
  assert.equal(result.cleanup, "not-performed");
  assert.equal(existsSync(fixture.execution), true);
  assert.equal(await branchSha(fixture), before.receipt.sha);
  assert.equal(child.exitCode, null);
  assert.equal(
    checkMailboxWorkerLiveness(readWorkerIdentity(directory), directory),
    "unknown",
  );
  assert.equal(provider.count(before.receipt.sha), 1);
  const exited = once(child, "exit");
  child.kill("SIGKILL");
  await exited;
});

test("an integrated-state success with unconfirmed shutdown keeps the Trunk closure workspace, branch and uncertain observer", async (t) => {
  const fixture = await createTrunkClosureFixture(t);
  const provider = (await customProvider()(t, fixture, customPolicy)).members;
  const before = await deliverBeforeCleanupThroughCli(fixture);
  const b = before.receipt.sha;
  const directory = before.observation.directory;
  const c = await provider.validateFromAnotherWriter("c.txt");
  // The observer itself fetches the other writer's snapshot to prove B to C.
  await awaitWorkerState(
    directory,
    () => {
      const integrated = readRevisionCoverage(directory)[0]?.integrated;
      return (
        integrated?.state === "success" && integrated.validated.sha === c.sha
      );
    },
    "C's validated integrated state",
  );
  const child = await enterUnknownExitWindow(fixture, directory);
  // Stopping observation withdraws no recorded evidence.
  assert.equal(recordedVerdict(directory, b), "success");
  const { result, code } = await finishThroughCli(fixture, {
    beforeCleanup: b,
    final: b,
    extra: ["--created-for-work"],
  });
  assert.equal(code, 1);
  assert.equal(result.step, "completion");
  assert.equal(result.acceptedSha, b);
  assert.equal(result.completion.verdict, "success");
  assert.equal(result.completion.effectiveEvidence.source, "integrated_state");
  assert.equal(result.completion.effectiveEvidence.accepted.sha, b);
  assert.equal(result.completion.effectiveEvidence.validated.sha, c.sha);
  assert.deepEqual(result.completion.shutdown, {
    status: "unconfirmed",
    limitation: "observer_liveness_unknown",
    terminal: result.completion.shutdown.terminal,
  });
  assert.equal(result.cleanup, "not-performed");
  assert.equal(existsSync(fixture.execution), true);
  assert.equal(await branchSha(fixture), b);
  assert.equal(
    checkMailboxWorkerLiveness(readWorkerIdentity(directory), directory),
    "unknown",
  );
  assert.deepEqual(
    [b, c.sha].map((sha) => provider.provider.count(sha)),
    [0, 1],
  );
  const exited = once(child, "exit");
  child.kill("SIGKILL");
  await exited;
});
