import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { test } from "node:test";
import { createManagedFixture } from "./execution-increment-managed-delivery-test-fixtures.mjs";
import {
  advanceOriginFromAnotherWriter,
  lsRemoteSha,
} from "./publication-test-fixtures.mjs";
import {
  awaitSignalWhileRunning,
  settledProbe,
} from "./process-lifetime-test-fixtures.mjs";
import { deliverThroughCli } from "./execution-increment-managed-delivery-cli-test-fixtures.mjs";
import {
  installReuseProvider,
  completeTarget,
  ignoreInstalledSkills,
} from "./ci-reuse-journey-test-fixtures.mjs";
import {
  branchSha,
  commitFinalClosure,
  createTrunkClosureFixture,
  deliverBeforeCleanupThroughCli,
  finishThroughCli,
  recordPushes,
} from "../../dough-story-wrap-up/scripts/trunk-closure-test-fixtures.mjs";

import { main, deliver, waitTarget } from "./ci-reuse-trunk-test-fixtures.mjs";
import "./ci-reuse-trunk-retention-cases.mjs";

test("Trunk exact-A source success reuses once through managed publication and its own target completion", async (t) => {
  const fixture = await createManagedFixture();
  t.after(fixture.cleanup);
  const provider = await installReuseProvider(fixture);
  const source = await provider.direct(fixture.candidateSha);
  const delivered = await deliver(fixture, fixture.trunkSha);
  assert.equal(delivered.publication, "accepted");
  assert.equal(delivered.receipt.sha, fixture.candidateSha);
  assert.equal(await lsRemoteSha(fixture.origin, main), fixture.candidateSha);
  assert.equal(await lsRemoteSha(fixture.origin, "refs/heads/exec/story"), "");
  const target = await provider.target(delivered.receipt.sha);
  assert.equal(target.decision.reuse, true);
  assert.equal(target.decision.source.runId, source.id);
  assert.equal(
    provider.count(fixture.candidateSha),
    1,
    "reuse must prevent duplicate covered execution",
  );
  const completion = await completeTarget(
    fixture,
    delivered.observation.directory,
    target,
  );
  assert.equal(completion.verdict, "success");
  assert.equal(completion.shutdown.status, "confirmed");
});

test("ordinary direct Trunk increment, repair and final closure run fresh without a branch push, then CLI finish retires", async (t) => {
  const fixture = await createTrunkClosureFixture(t);
  const provider = await installReuseProvider(fixture);
  const recording = recordPushes(fixture);
  fixture.env = recording.env;
  const before = await deliverBeforeCleanupThroughCli(fixture, {
    env: recording.env,
  });
  const initial = await provider.target(before.receipt.sha);
  assert.equal(initial.decision.reuse, false);
  await waitTarget(before.observation.directory, initial);
  const repair = await commitFinalClosure(fixture, "repair.txt");
  const { delivered: repaired } = await deliverThroughCli(fixture, {
    base: before.receipt.sha,
    env: recording.env,
  });
  assert.equal(repaired.receipt.sha, repair);
  assert.equal(repaired.observation.directory, before.observation.directory);
  const repairTarget = await provider.target(repair);
  await waitTarget(before.observation.directory, repairTarget);
  const final = await commitFinalClosure(fixture);
  const finishing = finishThroughCli(fixture, {
    beforeCleanup: repair,
    final,
    env: recording.env,
    extra: ["--created-for-work", "--default-checkout", fixture.integration],
  });
  await awaitSignalWhileRunning(
    () => lsRemoteSha(fixture.origin, main).then((sha) => sha === final),
    settledProbe(finishing),
    () => "finish ended before final publication",
  );
  const finalTarget = await provider.target(final);
  const { result, code, stderr } = await finishing;
  assert.equal(code, 0, JSON.stringify({ result, stderr }));
  assert.equal(result.acceptedSha, final);
  assert.equal(result.completion.requestedSha, final);
  assert.deepEqual(result.completion.effectiveEvidence.revision.checkedBy, {
    runId: finalTarget.attempt.runId,
    attemptId: finalTarget.attempt.attemptId,
  });
  assert.equal(result.completion.shutdown.status, "confirmed");
  assert.equal(result.observation.directory, before.observation.directory);
  assert.equal(result.cleanup.worktree, "removed");
  assert.equal(result.cleanup.branch, "removed");
  assert.equal(existsSync(fixture.execution), false);
  assert.equal(await branchSha(fixture), "");
  assert.equal(await lsRemoteSha(fixture.origin, "refs/heads/exec/story"), "");
  assert.equal(recording.pushes().length, 3);
  assert.equal(
    recording.pushes().every((push) => push.includes(":refs/heads/main")),
    true,
  );
  for (const sha of [before.receipt.sha, repair, final]) {
    assert.equal(provider.count(sha), 1);
    assert.equal(provider.count(sha, "target-only"), 1);
  }
});

test("Trunk rebase A to accepted B uses fresh B and preserves exact target evidence", async (t) => {
  const fixture = await createManagedFixture();
  t.after(fixture.cleanup);
  await ignoreInstalledSkills(fixture);
  const provider = await installReuseProvider(fixture);
  await provider.direct(fixture.candidateSha);
  await advanceOriginFromAnotherWriter(fixture.origin);
  const first = await deliver(fixture, fixture.trunkSha);
  assert.equal(first.status, "needs-validation");
  const delivered = await deliver(fixture, first.remoteTip, {
    validatedCandidate: first.candidate,
  });
  const sha = delivered.receipt.sha;
  assert.notEqual(sha, fixture.candidateSha);
  assert.equal(sha, first.candidate);
  assert.equal(await lsRemoteSha(fixture.origin, main), sha);
  assert.equal(await lsRemoteSha(fixture.origin, "refs/heads/exec/story"), "");
  const target = await provider.target(sha);
  assert.equal(target.decision.reuse, false);
  assert.equal(provider.count(fixture.candidateSha), 1);
  assert.equal(provider.count(sha), 1);
  assert.equal(
    (await completeTarget(fixture, delivered.observation.directory, target))
      .verdict,
    "success",
  );
});
