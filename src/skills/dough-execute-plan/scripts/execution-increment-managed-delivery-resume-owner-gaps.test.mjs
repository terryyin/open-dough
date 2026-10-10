// A live sibling never disguises the publishing coordinator's ended, lost,
// ambiguous, or unverifiable observer on resume: installed `resume`, the
// installed host hook's own owner claims, and real workers. Resume starts no
// replacement and keeps the accepted publication on its receipt.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { mailboxWorkerLoss, readWorkerIdentity } from "./ci-mailbox.mjs";
import {
  coverage,
  hosts,
  revisions,
  startReceipt,
  writeLegacyClaim,
} from "./execution-increment-managed-delivery-owner-test-fixtures.mjs";
import {
  assertCoverageGap,
  attached,
  interruptedRegistration,
} from "./execution-increment-managed-delivery-resume-owner-test-fixtures.mjs";
import { awaitProcessExit } from "./process-lifetime-test-fixtures.mjs";

const noReplacement = /resume starts no observer.*next `deliver`.*rerunning/;

for (const host of Object.keys(hosts)) {
  test(`a ${host} resume after its coordinator's observer ended reports that terminal state while the sibling stays live`, async (t) => {
    const journey = await interruptedRegistration(t, host);
    const { fixture, publisher, resume } = journey;
    await fixture.stopObserver(publisher);

    const result = await resume("publisher-coordinator");
    await journey.assertAcceptedAndSiblingUntouched(result);
    assertCoverageGap(
      result,
      "ended",
      /this coordinator's observer at .* ended \(stopped\)/,
    );
    assert.match(result.resumed.observation.reason, noReplacement);
    assert.equal(result.resumed.observation.directory, publisher);
    assert.deepEqual(coverage(publisher), []);
    assert.equal(
      JSON.parse(readFileSync(join(publisher, "result.json"), "utf8")).coverage
        .state,
      "ended",
    );
  });

  test(`a ${host} resume after its coordinator's observer lost its worker reports that loss while the sibling stays live`, async (t) => {
    const journey = await interruptedRegistration(t, host);
    const { publisher, resume } = journey;
    const { pid } = readWorkerIdentity(publisher);
    process.kill(pid, "SIGKILL");
    await awaitProcessExit(pid);

    const result = await resume("publisher-coordinator");
    await journey.assertAcceptedAndSiblingUntouched(result);
    assertCoverageGap(
      result,
      "lost",
      /this coordinator's observer at .* lost its worker/,
    );
    assert.match(result.resumed.observation.reason, noReplacement);
    assert.equal(result.resumed.observation.directory, publisher);
    assert.deepEqual(coverage(publisher), []);
    assert.equal(mailboxWorkerLoss(publisher)?.coverage.state, "lost");
  });
}

test("a resume whose coordinator owns two live observers of its target reports both and registers on neither", async (t) => {
  const journey = await interruptedRegistration(t, "cursor");
  const { publisher, startObserver, hook, resume, isLive } = journey;
  const second = await startObserver("sibling");
  assert.match(
    await hook("publisher", "publisher-coordinator", startReceipt(second)),
    attached,
  );
  const owned = [publisher, second].sort();

  const result = await resume("publisher-coordinator");
  await journey.assertAcceptedAndSiblingUntouched(result, 3);
  assertCoverageGap(
    result,
    "ambiguous",
    /owns 2 live observers.*next resume reuses it/,
  );
  assert.deepEqual([...result.resumed.observation.directories].sort(), owned);
  assert.equal(result.resumed.observation.directory, undefined);
  for (const directory of owned) {
    assert.match(result.resumed.observation.reason, new RegExp(directory));
    assert.deepEqual(coverage(directory), []);
    assert.equal(isLive(directory), true);
  }
});

test("a resume recovers an older observer by the owner claim its session input verifies, and adopts no unclaimed observer for an owner without one", async (t) => {
  const journey = await interruptedRegistration(t, "claude");
  const { fixture, publisher, accepted, startObserver, resume, isLive } =
    journey;
  const explicit = { session_id: "earlier-session", agent_id: "publisher" };
  // Carries only the claim an earlier hook wrote, from the other worktree.
  const legacy = await startObserver("sibling");
  await writeLegacyClaim(fixture, legacy, explicit);
  // Started in the publisher's own checkout, and claimed by nobody.
  const unclaimed = await startObserver("publisher");
  const sessionInput = (session) => ["--session-json", JSON.stringify(session)];

  const unverified = await resume(
    undefined,
    sessionInput({ ...explicit, agent_id: "another-agent" }),
  );
  await journey.assertAcceptedAndSiblingUntouched(unverified, 4);
  assertCoverageGap(
    unverified,
    "missing",
    /holds no observer of owner\/project main.*4 unclaimed or other coordinators' observers.*not adopted.*--session-json with its session_id, and its agent_id when it is a subagent coordinator.*replaced the coordinator/,
  );
  assert.equal(unverified.resumed.observation.directory, undefined);
  for (const directory of [legacy, unclaimed, publisher])
    assert.deepEqual(coverage(directory), []);

  const verified = await resume(undefined, sessionInput(explicit));
  await journey.assertAcceptedAndSiblingUntouched(verified, 4);
  assert.equal(verified.resumed.observation.state, "recovered");
  assert.equal(verified.resumed.observation.directory, legacy);
  assert.deepEqual(coverage(legacy), revisions(accepted));
  for (const directory of [unclaimed, publisher]) {
    assert.deepEqual(coverage(directory), []);
    assert.equal(isLive(directory), true);
  }
  assert.equal(existsSync(join(unclaimed, "owner")), false);
});
