// Interrupted registration on Codex recovers only the stream its coordinator
// retained: installed `stream` and `resume`, real workers, and a bare remote
// that already accepted the increment. Streams and the accepted revision are
// starting conditions only; every registration and gap below is a product
// outcome.
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import {
  publishMailboxEvent,
  readDeliveryProgress,
  readMailboxEvents,
  readWorkerIdentity,
} from "./ci-mailbox.mjs";
import { resumeThroughCli } from "./execution-increment-managed-delivery-cli-test-fixtures.mjs";
import {
  armStream,
  isLiveStream,
  retained,
} from "./execution-increment-managed-delivery-codex-test-fixtures.mjs";
import {
  coverage,
  revisions,
} from "./execution-increment-managed-delivery-owner-test-fixtures.mjs";
import {
  acceptedBesideSibling,
  assertCoverageGap,
} from "./execution-increment-managed-delivery-resume-owner-test-fixtures.mjs";
import { createManagedFixture } from "./execution-increment-managed-delivery-test-fixtures.mjs";

// Every gap names the retained inputs and the arming step that recover it.
const recoveryInput = [
  /--observer-directory/,
  /ci-mailbox\.mjs stream --execution owner\/project main --coordinator <value>/,
  /the next resume registers on it/,
];

// A sibling coordinator's live stream, armed first, and an accepted increment
// no stream was told about.
async function interruptedRegistration(t) {
  const fixture = await createManagedFixture();
  t.after(fixture.cleanup);
  const sibling = await armStream(fixture, { coordinator: "sibling" });
  const interrupted = await acceptedBesideSibling(
    fixture,
    sibling.directory,
    (directory) => isLiveStream(fixture, directory),
  );
  return {
    fixture,
    sibling,
    ...interrupted,
    resume: (extra = []) =>
      resumeThroughCli(fixture, {
        candidate: interrupted.accepted,
        host: "codex",
        extra,
      }),
  };
}

function assertGap({ resumed }, ownership, reason) {
  assertCoverageGap({ resumed }, ownership, reason);
  for (const input of recoveryInput)
    assert.match(resumed.observation.reason, input);
}

test("a Codex resume registers its accepted increment once on the stream its coordinator retained while a sibling stream observes the same target", async (t) => {
  const journey = await interruptedRegistration(t);
  const { fixture, accepted, resume } = journey;
  const publisher = await armStream(fixture, { coordinator: "publisher" });
  // A failure the publisher has not acknowledged yet.
  publishMailboxEvent(publisher.directory, {
    type: "CI_FAILURE",
    runId: "run:unread",
    attempt: 1,
    sha: accepted,
  });
  const progress = readDeliveryProgress(publisher.directory);

  // The interrupted resume, then a repeated one.
  for (let attempt = 0; attempt < 2; attempt++) {
    const result = await resume(retained("publisher", publisher.directory));
    await journey.assertAcceptedAndSiblingUntouched(result, 2);
    assert.equal(result.resumed.observation.state, "recovered");
    assert.equal(result.resumed.observation.directory, publisher.directory);
    assert.deepEqual(coverage(publisher.directory), revisions(accepted));
  }
  assert.equal(readMailboxEvents(publisher.directory).length, 1);
  assert.deepEqual(readDeliveryProgress(publisher.directory), progress);
  assert.equal(readWorkerIdentity(publisher.directory).pid, publisher.pid);
});

test("a Codex resume without retained inputs, with a sibling's or an unclaimed stream, or after its own stream ended reports that gap and registers on no stream", async (t) => {
  const journey = await interruptedRegistration(t);
  const { fixture, sibling, resume } = journey;
  // Armed as before `--coordinator` existed: nobody's claim is on it.
  const legacy = await armStream(fixture);
  const ended = await armStream(fixture, { coordinator: "publisher" });
  await fixture.stopObserver(ended.directory);

  for (const [extra, ownership, reason, directory] of [
    [
      [],
      "unidentified",
      /Codex resume registers only on the stream this coordinator retained, and --coordinator and --observer-directory were not supplied/,
    ],
    [
      retained("publisher", sibling.directory),
      "foreign",
      /belongs to another coordinator/,
    ],
    [
      retained("publisher", legacy.directory),
      "unclaimed",
      /armed without --coordinator/,
    ],
    [
      retained("publisher", ended.directory),
      "ended",
      /this coordinator's stream at .* ended \(stopped\)/,
      ended.directory,
    ],
  ]) {
    const result = await resume(extra);
    await journey.assertAcceptedAndSiblingUntouched(result, 3);
    assertGap(result, ownership, reason);
    // Only this coordinator's own stream is named on the receipt.
    assert.equal(result.resumed.observation.directory, directory);
  }

  for (const stream of [legacy, ended])
    assert.deepEqual(coverage(stream.directory), []);
  assert.equal(existsSync(join(legacy.directory, "owner")), false);
  assert.equal(isLiveStream(fixture, legacy.directory), true);
});
