// Codex managed delivery never borrows, adopts, or replaces a stream: absent,
// foreign, wrong-target, detached, unclaimed, and ended retained inputs
// through the installed stream and `deliver`, with real workers. Streams are
// starting conditions only; every receipt below is a product outcome.
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { readWorkerIdentity } from "./ci-mailbox.mjs";
import {
  createManagedFixture,
  watchCount,
} from "./execution-increment-managed-delivery-test-fixtures.mjs";
import { deliverThroughCli } from "./execution-increment-managed-delivery-cli-test-fixtures.mjs";
import {
  armStream,
  isLiveStream,
  retained,
} from "./execution-increment-managed-delivery-codex-test-fixtures.mjs";
import {
  commitIncrement,
  coverage,
  revisions,
  trunkTarget,
} from "./execution-increment-managed-delivery-owner-test-fixtures.mjs";
import { lsRemoteSha } from "./publication-test-fixtures.mjs";

// Every gap names the retained inputs and the arming step that recover it.
const recoveryInput = [
  /--observer-directory/,
  /ci-mailbox\.mjs stream --execution owner\/project main --coordinator <value>/,
  /ci-notify-codex\.md/,
];

// Delivers one new increment per call and asserts its accepted publication
// stands whatever the observation result.
function deliveries(fixture) {
  let base = fixture.trunkSha;
  let count = 0;
  return async (extra) => {
    if (count > 0) await commitIncrement(fixture, `increment-${count}`);
    count += 1;
    const { delivered, code } = await deliverThroughCli(fixture, {
      host: "codex",
      base,
      extra,
    });
    assert.equal(code, 0);
    assert.equal(delivered.publication, "accepted");
    assert.equal(
      await lsRemoteSha(fixture.origin, trunkTarget),
      delivered.receipt.sha,
    );
    assert.equal(delivered.startReceipt, null);
    base = delivered.receipt.sha;
    return delivered;
  };
}

function assertGap(delivered, ownership, reason) {
  assert.equal(delivered.observation.state, "unobserved");
  assert.equal(delivered.observation.pendingCi, "unobserved");
  assert.equal(delivered.observation.ownership, ownership);
  assert.match(delivered.observation.reason, reason);
  for (const input of recoveryInput)
    assert.match(delivered.observation.reason, input);
}

test("a Codex delivery without its retained coordinator and directory reports the ownership gap even when one foreign stream is live", async (t) => {
  const fixture = await createManagedFixture();
  t.after(fixture.cleanup);
  const sibling = await armStream(fixture, { coordinator: "sibling" });
  const deliver = deliveries(fixture);

  for (const [extra, missing] of [
    [[], /--coordinator and --observer-directory were not supplied/],
    [
      ["--observer-directory", sibling.directory],
      /--coordinator was not supplied/,
    ],
    [["--coordinator", "sibling"], /--observer-directory was not supplied/],
  ]) {
    const delivered = await deliver(extra);
    assertGap(delivered, "unidentified", missing);
    assert.equal(delivered.observation.directory, undefined);
  }

  assert.deepEqual(coverage(sibling.directory), []);
  assert.equal(isLiveStream(fixture, sibling.directory), true);
  assert.equal(readWorkerIdentity(sibling.directory).pid, sibling.pid);
  assert.equal(watchCount(fixture.storage), 1);
});

test("a Codex delivery whose retained directory is not its coordinator's live stream of the target reports that gap without registering on, adopting, or replacing any observer", async (t) => {
  const fixture = await createManagedFixture();
  t.after(fixture.cleanup);
  const sibling = await armStream(fixture, { coordinator: "sibling" });
  const otherTarget = await armStream(fixture, {
    coordinator: "publisher",
    branch: "release",
  });
  // Armed as before `--coordinator` existed: nobody's claim is on it.
  const legacy = await armStream(fixture);
  const detached = await fixture.startExecutionMailbox(
    {
      mode: "execution",
      repo: "owner/project",
      branch: "main",
      maxDurationMs: 60_000,
    },
    { root: fixture.execution, storage: fixture.storage, env: fixture.env },
  );
  const absent = join(fixture.storage, "watch-absent");
  const deliver = deliveries(fixture);

  for (const [directory, ownership, reason] of [
    [sibling.directory, "foreign", /belongs to another coordinator/],
    [otherTarget.directory, "wrong-target", /observes owner\/project release/],
    [legacy.directory, "unclaimed", /armed without --coordinator/],
    [detached, "detached", /is not a yielded stream/],
    [absent, "missing", /is not a CI observer/],
    [
      fixture.execution,
      "foreign",
      /belongs to another coordinator or repository/,
    ],
  ]) {
    const delivered = await deliver(retained("publisher", directory));
    assertGap(delivered, ownership, reason);
    assert.equal(delivered.observation.directory, undefined);
  }

  for (const directory of [
    sibling.directory,
    otherTarget.directory,
    legacy.directory,
    detached,
  ])
    assert.deepEqual(coverage(directory), []);
  assert.equal(existsSync(join(legacy.directory, "owner")), false);
  assert.equal(existsSync(join(detached, "owner")), false);
  assert.equal(isLiveStream(fixture, sibling.directory), true);
  assert.equal(isLiveStream(fixture, legacy.directory), true);
  assert.equal(isLiveStream(fixture, detached), true);
  assert.equal(isLiveStream(fixture, otherTarget.directory, "release"), true);
  assert.equal(watchCount(fixture.storage), 4);
});

test("a Codex delivery after its coordinator's stream ended reports that stream's state and rearming; the stream armed next receives the following delivery", async (t) => {
  const fixture = await createManagedFixture();
  t.after(fixture.cleanup);
  const sibling = await armStream(fixture, { coordinator: "sibling" });
  const ended = await armStream(fixture, { coordinator: "publisher" });
  await fixture.stopObserver(ended.directory);
  const deliver = deliveries(fixture);

  const unobserved = await deliver(retained("publisher", ended.directory));
  assertGap(
    unobserved,
    "ended",
    /this coordinator's stream at .* ended \(stopped\)/,
  );
  assert.equal(unobserved.observation.directory, ended.directory);
  assert.deepEqual(coverage(ended.directory), []);
  assert.equal(watchCount(fixture.storage), 2);

  const rearmed = await armStream(fixture, { coordinator: "publisher" });
  const observed = await deliver(retained("publisher", rearmed.directory));
  assert.equal(
    observed.observation.state,
    "reused",
    observed.observation.reason,
  );
  assert.equal(observed.observation.directory, rearmed.directory);
  assert.deepEqual(
    coverage(rearmed.directory),
    revisions(observed.receipt.sha),
  );
  assert.deepEqual(coverage(sibling.directory), []);
  assert.equal(isLiveStream(fixture, sibling.directory), true);
});
