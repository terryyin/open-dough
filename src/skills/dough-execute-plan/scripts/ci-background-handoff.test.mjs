import assert from "node:assert/strict";
import { writeFileSync, existsSync } from "node:fs";
import { setTimeout as pause } from "node:timers/promises";
import { join } from "node:path";
import { test } from "node:test";
import {
  backgroundFixture,
  waitUntil,
  attempted,
} from "./ci-background-test-fixtures.mjs";
import {
  readDeliveryProgress,
  readMailboxEvents,
} from "./ci-mailbox-store.mjs";
import { readRevisionCoverage } from "./ci-mailbox-revision-coverage.mjs";

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
