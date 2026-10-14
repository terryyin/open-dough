import assert from "node:assert/strict";
import { writeFileSync, existsSync, readFileSync } from "node:fs";
import { setTimeout as pause } from "node:timers/promises";
import { join } from "node:path";
import { test } from "node:test";
import {
  backgroundFixture,
  deliverStoryIncrement,
  integratedProvider,
  story,
  waitUntil,
  attempted,
} from "./ci-background-test-fixtures.mjs";
import {
  readDeliveryProgress,
  readMailboxEvents,
  readWorkerIdentity,
} from "./ci-mailbox-store.mjs";
import { readRevisionCoverage } from "./ci-mailbox-revision-coverage.mjs";
import { checkMailboxWorkerLiveness } from "./ci-mailbox-worker-process.mjs";
import { recordedVerdict } from "./ci-mailbox-await.mjs";

test("installed handoff returns pending before provider observation and concurrent Stop hooks attempt late failure once", async (t) => {
  const fixture = await backgroundFixture(t);
  const started = Date.now();
  const handoff = await fixture.run("handoff");
  assert.equal(handoff.code, 0, handoff.stderr);
  const receipt = fixture.receipt(handoff);
  assert.equal(receipt.state, "pending");
  assert.equal(receipt.ci, "pending");
  assert.equal(receipt.resources, "retained");
  assert.equal(receipt.requestedSha, fixture.sha);
  assert.ok(receipt.deadlineAt >= started + 600_000);
  assert.ok(
    Date.now() - started < 5000,
    "handoff did not wait on blocked provider",
  );
  assert.equal(readMailboxEvents(fixture.directory).length, 0);
  assert.deepEqual(
    readDeliveryProgress(fixture.directory).acceptedPublication,
    {
      sha: fixture.sha,
      mode: "story-branch",
      targetRef: "refs/heads/exec/story",
    },
  );
  const first = fixture.hook();
  const duplicate = fixture.hook();
  assert.deepEqual(await fixture.hook({ agent_id: "child" }).finished, {
    code: 0,
    stdout: "",
    stderr: "",
  });
  assert.deepEqual(await fixture.hook({ session_id: "another" }).finished, {
    code: 0,
    stdout: "",
    stderr: "",
  });
  fixture.releaseFailure(fixture.sha, "exec/story");
  const results = await Promise.all([first.finished, duplicate.finished]);
  assert.deepEqual(results.map(({ code }) => code).sort(), [0, 2]);
  const feedback = results.find(({ code }) => code === 2);
  assert.equal(feedback.stdout, "");
  assert.match(feedback.stderr, /CI_FAILURE/);
  assert.match(feedback.stderr, new RegExp(fixture.sha));
  assert.match(feedback.stderr, /ci-monitor\.md/);
  assert.ok(attempted(fixture));
  assert.equal(fixture.state().state, "delivery_uncertain");
  assert.equal(fixture.state().feedbackEmitted, true);
  assert.equal(
    readDeliveryProgress(fixture.directory).deliveredThrough,
    0,
    "native output is not an acknowledgment",
  );
  assert.deepEqual(await fixture.legacy(), {});
  assert.deepEqual(await fixture.legacy("Stop"), {});
  assert.deepEqual(await fixture.hook().finished, {
    code: 0,
    stdout: "",
    stderr: "",
  });
});

test("pending is silent and provider success settles installed waiter without feedback", async (t) => {
  const fixture = await backgroundFixture(t);
  assert.equal((await fixture.run("handoff")).code, 0);
  const waiter = fixture.hook();
  fixture.releasePending();
  await waitUntil(
    () =>
      existsSync(join(fixture.directory, "background-waiter.json")) &&
      readRevisionCoverage(fixture.directory).find(
        ({ sha }) => sha === fixture.sha,
      )?.state === "pending",
  );
  await pause(150);
  assert.equal(
    waiter.child.exitCode,
    null,
    "pending observer keeps only local hook alive",
  );
  assert.deepEqual(
    waiter.output(),
    { stdout: "", stderr: "" },
    "observed provider pending emits no feedback",
  );
  assert.deepEqual(await fixture.legacy("Stop"), {});
  fixture.releaseSuccess(fixture.sha);
  assert.deepEqual(await waiter.finished, { code: 0, stdout: "", stderr: "" });
  assert.equal(fixture.state().state, "success");
  assert.equal(fixture.state().resources, "retained");
  assert.equal(attempted(fixture), false);
});

test("declared policy: the installed waiter settles accepted B from a later validated C with D pending, keeping that evidence and every resource", async (t) => {
  const fixture = await backgroundFixture(t, { provider: integratedProvider });
  const b = fixture.sha;
  assert.equal(fixture.receipt(await fixture.run("handoff")).state, "pending");
  const waiter = fixture.hook();
  const c = await deliverStoryIncrement(fixture, b, "c.txt");
  const d = await deliverStoryIncrement(fixture, c, "d.txt");
  await fixture.provider.holdPending(d, { ref: story });
  await pause(150);
  assert.equal(waiter.child.exitCode, null, "B has no evidence yet");
  const cAttempt = await fixture.provider.validate(c, { ref: story });

  assert.deepEqual(await waiter.finished, { code: 0, stdout: "", stderr: "" });
  const settled = fixture.state();
  assert.equal(settled.state, "success");
  assert.equal(settled.ci, "success");
  assert.equal(settled.requestedSha, b);
  assert.equal(settled.resources, "retained");
  const { evidence } = settled;
  assert.equal(evidence.source, "integrated_state");
  assert.equal(evidence.accepted.sha, b);
  assert.equal(evidence.accepted.checkedBy, undefined, "no invented B run");
  assert.deepEqual(
    [
      evidence.validated.sha,
      evidence.validated.runId,
      evidence.validated.branch,
    ],
    [c, cAttempt.runId, "exec/story"],
  );
  assert.deepEqual(evidence.ancestry, {
    ancestor: b,
    descendant: c,
    basis: "git merge-base --is-ancestor",
  });
  assert.deepEqual(fixture.receipt(await fixture.run("status")), {
    directory: fixture.directory,
    ...settled,
  });
  // The waiter neither stops observation nor claims cleanup.
  assert.equal(
    checkMailboxWorkerLiveness(
      readWorkerIdentity(fixture.directory),
      fixture.directory,
    ),
    "alive",
  );
  assert.equal(existsSync(join(fixture.directory, "stop")), false);
  assert.equal(existsSync(fixture.execution), true);
  assert.equal(attempted(fixture), false);
  assert.deepEqual(
    [b, c, d].map((sha) => fixture.provider.provider.count(sha)),
    [0, 1, 0],
  );
});

test("declared policy: the coordinator's own failed descendant is delivered once to its owner, never settled as B's success", async (t) => {
  const fixture = await backgroundFixture(t, { provider: integratedProvider });
  assert.equal((await fixture.run("handoff")).code, 0);
  const waiter = fixture.hook();
  const c = await deliverStoryIncrement(fixture, fixture.sha, "c.txt");
  await fixture.provider.validate(c, { ref: story, failed: true });
  const feedback = await waiter.finished;
  assert.equal(feedback.code, 2);
  assert.match(feedback.stderr, /CI_FAILURE/);
  assert.match(feedback.stderr, new RegExp(c));
  assert.equal(fixture.state().state, "delivery_uncertain");
  assert.equal(fixture.state().ci, "failure");
  assert.equal(
    JSON.parse(
      readFileSync(join(fixture.directory, "background-attempt.json"), "utf8"),
    ).event.sha,
    c,
  );
  assert.equal(recordedVerdict(fixture.directory, fixture.sha), undefined);
});

test("handoff refuses another owner, unregistered SHA, non-live host, Trunk Mode and missing native registration", async (t) => {
  const fixture = await backgroundFixture(t);
  assert.match(
    (await fixture.run("handoff", fixture.sha, "another")).stderr,
    /owner claim/,
  );
  assert.match(
    (await fixture.run("handoff", "a".repeat(40))).stderr,
    /exact latest accepted registered/,
  );
  writeFileSync(join(fixture.execution, ".claude/settings.json"), "{}");
  assert.match(
    (await fixture.run("handoff")).stderr,
    /asyncRewake Stop waiter/,
  );
  await fixture.stopObserver(fixture.directory);
  assert.match((await fixture.run("handoff")).stderr, /live detached observer/);
  const print = await backgroundFixture(t, { title: "claude --print" });
  assert.match((await print.run("handoff")).stderr, /still-live interactive/);
  const trunk = await backgroundFixture(t, { mode: "trunk" });
  assert.match(
    (await trunk.run("handoff")).stderr,
    /exact latest accepted registered Story Branch/,
  );
});
