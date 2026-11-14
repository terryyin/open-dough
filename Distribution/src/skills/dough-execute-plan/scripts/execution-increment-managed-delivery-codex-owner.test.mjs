// Codex managed delivery keeps its observer owner among coordinators whose
// yielded streams observe one repository and target: the installed stream,
// `deliver`, `acknowledge`, and `complete-revision`, the documented yielded
// cell, real workers, and a controlled CI provider. Streams are starting
// conditions only; every registration, notification, and completion below is
// a product outcome.
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { readDeliveryProgress, readWorkerIdentity } from "./ci-mailbox.mjs";
import { checkMailboxWorkerLiveness } from "./ci-mailbox-worker-process.mjs";
import {
  createManagedFixture,
  git,
  installManagedDelivery,
  waitForFailureEvent,
} from "./execution-increment-managed-delivery-test-fixtures.mjs";
import {
  completeThroughCli,
  deliverThroughCli,
} from "./execution-increment-managed-delivery-cli-test-fixtures.mjs";
import {
  armDocumentedStream,
  armStream,
  isLiveStream,
  retained,
} from "./execution-increment-managed-delivery-codex-test-fixtures.mjs";
import {
  commitIncrement,
  coverage,
  ownerClaim,
  revisions,
  trunkTarget,
} from "./execution-increment-managed-delivery-owner-test-fixtures.mjs";
import {
  advanceOriginFromAnotherWriter,
  lsRemoteSha,
} from "./publication-test-fixtures.mjs";

test("a Codex coordinator's deliveries register only on the stream it armed and retained while a sibling's stream observes the same target", async (t) => {
  const fixture = await createManagedFixture();
  t.after(fixture.cleanup);
  // The sibling's directory sorts first.
  const [sibling, publisher] = [
    await armDocumentedStream(fixture, "coordinator-a"),
    await armDocumentedStream(fixture, "coordinator-b"),
  ].sort((a, b) => (a.directory < b.directory ? -1 : 1));
  assert.notEqual(
    ownerClaim(publisher.directory),
    ownerClaim(sibling.directory),
  );
  const deliver = (base, extra = []) =>
    deliverThroughCli(fixture, {
      host: "codex",
      base,
      extra: [
        ...retained(publisher.coordinator, publisher.directory),
        ...extra,
      ],
    });

  const { delivered: first } = await deliver(fixture.trunkSha);
  assert.equal(first.publication, "accepted");
  assert.equal(first.observation.state, "reused", first.observation.reason);
  assert.equal(first.observation.directory, publisher.directory);
  assert.equal(first.startReceipt, null);
  assert.equal(
    await lsRemoteSha(fixture.origin, trunkTarget),
    first.receipt.sha,
  );
  assert.deepEqual(coverage(publisher.directory), revisions(first.receipt.sha));
  assert.deepEqual(coverage(sibling.directory), []);

  // The provider fails the delivered revision. An unregistered stream
  // discovers branch runs independently, so the sibling records it too; each
  // cell notifies and acknowledges only its own mailbox.
  fixture.releaseFailure(first.receipt.sha);
  await waitForFailureEvent(publisher.directory);
  await waitForFailureEvent(sibling.directory);
  const siblingProgress = readDeliveryProgress(sibling.directory);
  publisher.resume();
  await publisher.acknowledged(1);
  assert.deepEqual(
    publisher.notifications.map(({ type, sha }) => ({ type, sha })),
    [{ type: "CI_FAILURE", sha: first.receipt.sha }],
  );
  assert.deepEqual(publisher.host.commands, [
    ["acknowledge", publisher.directory, "1"],
  ]);
  assert.deepEqual(readDeliveryProgress(sibling.directory), siblingProgress);
  assert.deepEqual(sibling.notifications, []);
  sibling.resume();
  await sibling.acknowledged(1);
  assert.deepEqual(
    sibling.notifications.map(({ type }) => type),
    ["CI_FAILURE"],
  );
  assert.deepEqual(sibling.host.commands, [
    ["acknowledge", sibling.directory, "1"],
  ]);

  // The repair meets a target another writer advanced; its accepted
  // post-reconciliation revision goes on the same stream.
  const advanced = await advanceOriginFromAnotherWriter(fixture.origin);
  await commitIncrement(fixture, "repair");
  const preRebase = (
    await git(fixture.execution, "rev-parse", "HEAD")
  ).stdout.trim();
  const { delivered: reconciled } = await deliver(first.receipt.sha);
  assert.equal(reconciled.status, "needs-validation");
  assert.equal(reconciled.observation.directory, publisher.directory);
  assert.equal(await lsRemoteSha(fixture.origin, trunkTarget), advanced);
  // The provider will pass this candidate once it is published.
  fixture.releaseSuccess(reconciled.candidate);
  const { delivered: repair } = await deliver(reconciled.remoteTip, [
    "--validated-candidate",
    reconciled.candidate,
  ]);
  assert.equal(repair.publication, "accepted");
  assert.equal(repair.observation.state, "reused");
  assert.equal(repair.observation.directory, publisher.directory);
  assert.equal(repair.receipt.sha, reconciled.candidate);
  assert.notEqual(repair.receipt.sha, preRebase);
  assert.equal(
    await lsRemoteSha(fixture.origin, trunkTarget),
    repair.receipt.sha,
  );
  assert.deepEqual(
    coverage(publisher.directory),
    revisions(first.receipt.sha, repair.receipt.sha),
  );
  assert.deepEqual(coverage(sibling.directory), []);

  // Completion evaluates the repair on the publisher's stream and ends only
  // that stream; its cell records the terminal result it read.
  const completion = await completeThroughCli(
    fixture,
    publisher.directory,
    repair.receipt.sha,
  );
  assert.equal(completion.verdict, "success");
  assert.equal(completion.effectiveEvidence.source, "exact");
  assert.equal(
    completion.effectiveEvidence.revision.sha,
    repair.receipt.sha.toLowerCase(),
  );
  assert.equal(completion.shutdown.status, "confirmed");
  assert.deepEqual(await publisher.binding, { completed: true });
  assert.equal(publisher.stores.at(-1)[1].directory, publisher.directory);
  assert.notEqual(publisher.stores.at(-1)[1].status, "lost");
  assert.equal(
    checkMailboxWorkerLiveness(
      readWorkerIdentity(publisher.directory),
      publisher.directory,
    ),
    "dead",
  );
  assert.equal(isLiveStream(fixture, sibling.directory), true);
  assert.equal(readWorkerIdentity(sibling.directory).pid, sibling.pid);
  assert.equal(existsSync(join(sibling.directory, "stop")), false);
  assert.deepEqual(coverage(sibling.directory), []);
  assert.deepEqual(sibling.stores, []);
});

test("a Codex coordinator's retained stream stays usable from another worktree of the repository, and another coordinator there cannot acquire it", async (t) => {
  const fixture = await createManagedFixture();
  t.after(fixture.cleanup);
  // The stream is armed from the default checkout's own installed runtime.
  const elsewhere = await installManagedDelivery(
    fixture.teardown,
    fixture.fixture,
    fixture.integration,
  );
  const stream = await armStream(fixture, {
    coordinator: "publisher",
    skill: elsewhere.skill,
  });
  const deliver = (base, coordinator) =>
    deliverThroughCli(fixture, {
      host: "codex",
      base,
      extra: retained(coordinator, stream.directory),
    });

  const { delivered: foreign } = await deliver(fixture.trunkSha, "another");
  assert.equal(foreign.publication, "accepted");
  assert.equal(foreign.observation.state, "unobserved");
  assert.equal(foreign.observation.ownership, "foreign");
  assert.equal(foreign.observation.directory, undefined);
  assert.deepEqual(coverage(stream.directory), []);

  await commitIncrement(fixture, "owned");
  const { delivered: owned } = await deliver(foreign.receipt.sha, "publisher");
  assert.equal(owned.publication, "accepted");
  assert.equal(owned.observation.state, "reused", owned.observation.reason);
  assert.equal(owned.observation.directory, stream.directory);
  assert.deepEqual(coverage(stream.directory), revisions(owned.receipt.sha));
  assert.equal(isLiveStream(fixture, stream.directory), true);
});
