// Interrupted registration recovers only the publishing coordinator's
// observer: installed `resume`, the installed host hook's own owner claims,
// real workers, and a bare remote that already accepted the increment.
// Observers and the accepted revision are starting conditions only; every
// registration and gap below is a product outcome.
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  publishMailboxEvent,
  readDeliveryProgress,
  readMailboxEvents,
} from "./ci-mailbox.mjs";
import {
  coverage,
  hosts,
  revisions,
} from "./execution-increment-managed-delivery-owner-test-fixtures.mjs";
import { interruptedRegistration } from "./execution-increment-managed-delivery-resume-owner-test-fixtures.mjs";

for (const host of Object.keys(hosts)) {
  test(`a ${host} coordinator's resume registers its accepted increment once on its own observer, by ambient or explicit identity, while a sibling observes the same target`, async (t) => {
    const journey = await interruptedRegistration(t, host);
    const { publisher, accepted, resume } = journey;
    // A failure the publisher has not read yet.
    publishMailboxEvent(publisher, {
      type: "CI_FAILURE",
      runId: "run:unread",
      attempt: 1,
      sha: accepted,
    });
    const progress = readDeliveryProgress(publisher);

    const first = await resume("publisher-coordinator");
    await journey.assertAcceptedAndSiblingUntouched(first);
    assert.equal(first.resumed.observation.state, "recovered");
    assert.equal(first.resumed.observation.directory, publisher);
    assert.deepEqual(coverage(publisher), revisions(accepted));

    // Explicit session input names the owner even where the ambient identity
    // is the sibling's; a repeated resume adds no second registration.
    const field = host === "cursor" ? "conversation_id" : "session_id";
    const again = await resume("sibling-coordinator", [
      "--session-json",
      JSON.stringify({ [field]: "publisher-coordinator" }),
    ]);
    await journey.assertAcceptedAndSiblingUntouched(again);
    assert.equal(again.resumed.observation.directory, publisher);
    assert.deepEqual(coverage(publisher), revisions(accepted));
    assert.equal(readMailboxEvents(publisher).length, 1);
    assert.deepEqual(readDeliveryProgress(publisher), progress);
  });

  test(`a ${host} resume without its coordinator's identity, with another coordinator's, or with malformed session input reports the gap and never registers on the live sibling`, async (t) => {
    const journey = await interruptedRegistration(t, host);
    const { publisher, sibling, resume } = journey;

    const unidentified = await resume();
    await journey.assertAcceptedAndSiblingUntouched(unidentified);
    assert.equal(unidentified.resumed.observation.state, "unobserved");
    assert.equal(unidentified.resumed.observation.pendingCi, "unobserved");
    assert.equal(unidentified.resumed.observation.ownership, "unidentified");
    assert.match(
      unidentified.resumed.observation.reason,
      new RegExp(
        `${hosts[host].variable} is unset.*run resume.*--session-json`,
      ),
    );

    const stranger = await resume("third-coordinator");
    await journey.assertAcceptedAndSiblingUntouched(stranger);
    assert.equal(stranger.resumed.observation.state, "unobserved");
    assert.equal(stranger.resumed.observation.ownership, "missing");
    assert.equal(stranger.resumed.observation.directory, undefined);
    assert.match(
      stranger.resumed.observation.reason,
      /holds no observer of owner\/project main.*2 unclaimed or other coordinators' observers.*not adopted.*--session-json.*resume starts no observer/,
    );
    for (const directory of [publisher, sibling])
      assert.doesNotMatch(
        stranger.resumed.observation.reason,
        new RegExp(directory),
      );

    const malformed = await resume("publisher-coordinator", [
      "--session-json",
      "{not json",
    ]);
    assert.equal(malformed.code, 2);
    assert.equal(malformed.resumed, null);
    assert.deepEqual(coverage(publisher), []);
    assert.deepEqual(coverage(sibling), []);
  });
}
