// Managed delivery keeps its observer owner among coordinators that share a
// repository and target: installed `deliver`, the installed host hook's own
// owner claims, real workers, and a controlled CI provider. Observers are
// starting conditions only; every registration, notification, and completion
// below is a product outcome.
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { readDeliveryProgress, readWorkerIdentity } from "./ci-mailbox.mjs";
import { checkMailboxWorkerLiveness } from "./ci-mailbox-worker-process.mjs";
import {
  git,
  waitForFailureEvent,
} from "./execution-increment-managed-delivery-test-fixtures.mjs";
import { completeThroughCli } from "./execution-increment-managed-delivery-cli-test-fixtures.mjs";
import {
  commitIncrement,
  coverage,
  hosts,
  revisions,
  siblingCheckouts,
  startReceipt,
  trunkTarget,
} from "./execution-increment-managed-delivery-owner-test-fixtures.mjs";
import {
  advanceOriginFromAnotherWriter,
  lsRemoteSha,
} from "./publication-test-fixtures.mjs";

for (const host of Object.keys(hosts)) {
  test(`a ${host} coordinator's deliveries register only on its own observer while a sibling observes the same target`, async (t) => {
    const { fixture, startObserver, hook, deliver, isLive } =
      await siblingCheckouts(t, host);
    // The sibling's directory sorts first. Either checkout may have started
    // either observer: worktrees of one repository share mailbox access.
    const [sibling, publisher] = [
      await startObserver("publisher"),
      await startObserver("sibling"),
    ].sort();
    assert.match(
      await hook("publisher", "publisher-coordinator", startReceipt(publisher)),
      /CI observer attached to this coordinator/,
    );
    assert.match(
      await hook("sibling", "sibling-coordinator", startReceipt(sibling)),
      /CI observer attached to this coordinator/,
    );
    const siblingWorker = readWorkerIdentity(sibling).pid;

    const { delivered: first } = await deliver(
      fixture.trunkSha,
      "publisher-coordinator",
    );
    assert.equal(first.publication, "accepted");
    assert.equal(first.observation.state, "reused", first.observation.reason);
    assert.equal(first.observation.directory, publisher);
    assert.equal(
      await lsRemoteSha(fixture.origin, trunkTarget),
      first.receipt.sha,
    );
    assert.deepEqual(coverage(publisher), revisions(first.receipt.sha));
    assert.deepEqual(coverage(sibling), []);

    // The provider fails the delivered revision. An unregistered observer
    // discovers branch runs independently, so the sibling records it too;
    // each coordinator acknowledges only its own mailbox.
    fixture.releaseFailure(first.receipt.sha);
    await waitForFailureEvent(publisher);
    await waitForFailureEvent(sibling);
    const siblingProgress = readDeliveryProgress(sibling);
    const notified = await hook("publisher", "publisher-coordinator");
    assert.match(notified, /CI_FAILURE/);
    assert.match(notified, new RegExp(first.receipt.sha, "i"));
    assert.equal(readDeliveryProgress(publisher).deliveredThrough > 0, true);
    assert.deepEqual(readDeliveryProgress(sibling), siblingProgress);
    assert.equal(await hook("publisher", "publisher-coordinator"), "");
    assert.match(await hook("sibling", "sibling-coordinator"), /CI_FAILURE/);

    // The repair meets a target another writer advanced; its accepted
    // post-reconciliation revision goes on the same observer.
    const advanced = await advanceOriginFromAnotherWriter(fixture.origin);
    await commitIncrement(fixture, "repair");
    const preRebase = (
      await git(fixture.execution, "rev-parse", "HEAD")
    ).stdout.trim();
    const { delivered: reconciled } = await deliver(
      first.receipt.sha,
      "publisher-coordinator",
    );
    assert.equal(reconciled.status, "needs-validation");
    assert.equal(reconciled.observation.directory, publisher);
    assert.equal(await lsRemoteSha(fixture.origin, trunkTarget), advanced);
    // The provider will pass this candidate once it is published.
    fixture.releaseSuccess(reconciled.candidate);
    const { delivered: repair } = await deliver(
      reconciled.remoteTip,
      "publisher-coordinator",
      ["--validated-candidate", reconciled.candidate],
    );
    assert.equal(repair.publication, "accepted");
    assert.equal(repair.observation.state, "reused");
    assert.equal(repair.observation.directory, publisher);
    assert.equal(repair.receipt.sha, reconciled.candidate);
    assert.notEqual(repair.receipt.sha, preRebase);
    assert.equal(
      await lsRemoteSha(fixture.origin, trunkTarget),
      repair.receipt.sha,
    );
    assert.deepEqual(
      coverage(publisher),
      revisions(first.receipt.sha, repair.receipt.sha),
    );
    assert.deepEqual(coverage(sibling), []);

    // Completion evaluates the repair on the publisher's observer and ends
    // only that observer's worker.
    const completion = await completeThroughCli(
      fixture,
      publisher,
      repair.receipt.sha,
    );
    assert.equal(completion.verdict, "success");
    assert.equal(completion.effectiveEvidence.source, "exact");
    assert.equal(
      completion.effectiveEvidence.revision.sha,
      repair.receipt.sha.toLowerCase(),
    );
    assert.equal(completion.shutdown.status, "confirmed");
    assert.equal(
      checkMailboxWorkerLiveness(readWorkerIdentity(publisher), publisher),
      "dead",
    );
    assert.equal(isLive(sibling), true);
    assert.equal(readWorkerIdentity(sibling).pid, siblingWorker);
    assert.equal(existsSync(join(sibling, "stop")), false);
    assert.deepEqual(coverage(sibling), []);
  });
}
