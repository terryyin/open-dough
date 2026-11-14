// Shared starting condition for interrupted-registration proofs: an increment
// the bare remote already accepted beside another coordinator's live observer
// of the same target, and, on Cursor and Claude Code, two coordinators' bound
// observers with the installed `resume` as the publishing coordinator invokes
// it.
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { readWorkerIdentity } from "./ci-mailbox.mjs";
import { resumeThroughCli } from "./execution-increment-managed-delivery-cli-test-fixtures.mjs";
import { watchCount } from "./execution-increment-managed-delivery-test-fixtures.mjs";
import {
  acceptedIncrement,
  countPushes,
  coverage,
  siblingCheckouts,
  startReceipt,
  trunkTarget,
} from "./execution-increment-managed-delivery-owner-test-fixtures.mjs";
import { lsRemoteSha } from "./publication-test-fixtures.mjs";

export const attached = /CI observer attached to this coordinator/;

// An increment the remote accepted and no observer was told about, beside
// `sibling`, another coordinator's live observer of the same target.
export async function acceptedBesideSibling(fixture, sibling, isLive) {
  const accepted = await acceptedIncrement(fixture);
  const pushes = await countPushes(fixture);
  const siblingWorker = readWorkerIdentity(sibling).pid;
  return {
    accepted,
    // Remote acceptance stands with no further push, and the sibling keeps
    // its worker, coverage, and lifecycle.
    // `observers` counts every observer the test started: resume adds none.
    async assertAcceptedAndSiblingUntouched({ resumed, code }, observers) {
      assert.equal(code, 0);
      assert.equal(resumed.publication, "accepted");
      assert.equal(resumed.receipt.sha, accepted);
      assert.equal(resumed.pushCount, 0);
      assert.equal(pushes(), 0);
      assert.equal(await lsRemoteSha(fixture.origin, trunkTarget), accepted);
      assert.deepEqual(coverage(sibling), []);
      assert.equal(isLive(sibling), true);
      assert.equal(readWorkerIdentity(sibling).pid, siblingWorker);
      assert.equal(existsSync(join(sibling, "stop")), false);
      assert.equal(watchCount(fixture.storage), observers);
    },
  };
}

// The receipt keeps the publication beside an unobserved observation naming
// `ownership` and a `reason` that tells what recovers it.
export function assertCoverageGap({ resumed }, ownership, reason) {
  assert.equal(resumed.observation.state, "unobserved");
  assert.equal(resumed.observation.pendingCi, "unobserved");
  assert.equal(resumed.observation.ownership, ownership);
  assert.match(resumed.observation.reason, reason);
}

// Two coordinators' bound live observers of the shared target, the sibling's
// directory sorting first, and an accepted increment neither was told about.
export async function interruptedRegistration(t, host) {
  const checkouts = await siblingCheckouts(t, host);
  const { fixture, startObserver, hook, env } = checkouts;
  const [sibling, publisher] = [
    await startObserver("publisher"),
    await startObserver("sibling"),
  ].sort();
  assert.match(
    await hook("publisher", "publisher-coordinator", startReceipt(publisher)),
    attached,
  );
  assert.match(
    await hook("sibling", "sibling-coordinator", startReceipt(sibling)),
    attached,
  );
  const interrupted = await acceptedBesideSibling(
    fixture,
    sibling,
    checkouts.isLive,
  );
  return {
    ...checkouts,
    sibling,
    publisher,
    accepted: interrupted.accepted,
    resume: (coordinator, extra = []) =>
      resumeThroughCli(fixture, {
        candidate: interrupted.accepted,
        host,
        extra,
        env: env(coordinator),
      }),
    assertAcceptedAndSiblingUntouched: (result, observers = 2) =>
      interrupted.assertAcceptedAndSiblingUntouched(result, observers),
  };
}
