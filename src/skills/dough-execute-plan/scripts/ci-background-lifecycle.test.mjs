import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { once } from "node:events";
import { join } from "node:path";
import { test } from "node:test";
import { isDeepStrictEqual } from "node:util";
import {
  backgroundFixture,
  deliverStoryIncrement,
  integratedProvider,
  story,
  waitUntil,
  attempted,
} from "./ci-background-test-fixtures.mjs";
import { readRevisionCoverage } from "./ci-mailbox-revision-coverage.mjs";
import { recordedVerdict } from "./ci-mailbox-await.mjs";

test("closed original session ends the waiter quietly and status names the retained limitation", async (t) => {
  const fixture = await backgroundFixture(t);
  assert.equal((await fixture.run("handoff")).code, 0);
  const waiter = fixture.hook();
  await waitUntil(() =>
    existsSync(join(fixture.directory, "background-waiter.json")),
  );
  const closed = once(fixture.host, "exit");
  fixture.host.kill();
  await closed;
  assert.deepEqual(await waiter.finished, { code: 0, stdout: "", stderr: "" });
  assert.equal(
    fixture.receipt(await fixture.run("status")).state,
    "session_closed",
  );
  assert.equal(attempted(fixture), false);
});

test("explicit stop revokes local delivery and retains truthful cancelled status", async (t) => {
  const fixture = await backgroundFixture(t);
  assert.equal((await fixture.run("handoff")).code, 0);
  const waiter = fixture.hook();
  await fixture.stopObserver(fixture.directory);
  assert.deepEqual(await waiter.finished, { code: 0, stdout: "", stderr: "" });
  assert.equal(fixture.receipt(await fixture.run("status")).state, "cancelled");
  assert.equal(attempted(fixture), false);
});

test("bounded expiry is silent and an explicit delivery cancellation never rearms", async (t) => {
  const fixture = await backgroundFixture(t);
  assert.equal((await fixture.run("handoff")).code, 0);
  // Move the hook clock beyond the actual product-created ten-minute deadline;
  // no fixture writes an expiry result or supplies a failure event.
  const shiftedClock = `data:text/javascript,${encodeURIComponent("const now = Date.now; Date.now = () => now() + 600001;")}`;
  assert.deepEqual(await fixture.hook({ preload: shiftedClock }).finished, {
    code: 0,
    stdout: "",
    stderr: "",
  });
  assert.equal(fixture.receipt(await fixture.run("status")).state, "expired");
  assert.equal(attempted(fixture), false);
  assert.equal(
    fixture.receipt(await fixture.run("handoff")).state,
    "expired",
    "repeat cannot rearm",
  );
  const cancelled = await backgroundFixture(t);
  assert.equal((await cancelled.run("handoff")).code, 0);
  const waiter = cancelled.hook();
  assert.equal(
    cancelled.receipt(await cancelled.run("cancel")).state,
    "cancelled",
  );
  assert.deepEqual(await waiter.finished, { code: 0, stdout: "", stderr: "" });
});

test("declared policy: a pending descendant then lost observation settle the waiter unobserved, and C's later green cannot make B succeed", async (t) => {
  const fixture = await backgroundFixture(t, { provider: integratedProvider });
  const b = fixture.sha;
  assert.equal((await fixture.run("handoff")).code, 0);
  const waiter = fixture.hook();
  const c = await deliverStoryIncrement(fixture, b, "c.txt");
  const pending = await fixture.provider.holdPending(c, { ref: story });
  const integrated = () =>
    readRevisionCoverage(fixture.directory).find(({ sha }) => sha === b)
      ?.integrated;
  const considered = [{ sha: c, reason: "not_current_success" }];
  await waitUntil(() =>
    isDeepStrictEqual(integrated()?.considered, considered),
  );
  assert.deepEqual(integrated().considered, considered);
  fixture.provider.setUnavailable(true);

  assert.deepEqual(await waiter.finished, { code: 0, stdout: "", stderr: "" });
  assert.equal(fixture.state().state, "observation_unavailable");
  assert.equal(fixture.state().ci, "unobserved");
  assert.equal(fixture.state().evidence, undefined);
  assert.equal(integrated().reason, "candidate_lookup_unavailable");
  assert.equal(recordedVerdict(fixture.directory, b), undefined);
  fixture.provider.setUnavailable(false);
  assert.equal((await pending.release()).outcome, "success");
  assert.equal(fixture.provider.provider.count(c), 1);
  assert.equal(recordedVerdict(fixture.directory, b), undefined);
  assert.equal(
    fixture.receipt(await fixture.run("status")).state,
    "observation_unavailable",
  );
  assert.equal(attempted(fixture), false);
  assert.equal(existsSync(fixture.execution), true);
});

test("broken native feedback is retained as uncertain and never blindly retried", async (t) => {
  const fixture = await backgroundFixture(t);
  assert.equal((await fixture.run("handoff")).code, 0);
  const waiter = fixture.hook({ brokenStderr: true });
  fixture.releaseFailure(fixture.sha, "exec/story");
  assert.notEqual(
    (await waiter.finished).code,
    2,
    "broken write cannot report emitted feedback",
  );
  assert.ok(attempted(fixture));
  const status = fixture.receipt(await fixture.run("status"));
  assert.equal(status.state, "delivery_uncertain");
  assert.equal(status.feedbackEmitted, undefined);
  assert.match(status.reason, /no delivery acknowledgment/);
  assert.equal(
    JSON.parse(readFileSync(join(fixture.directory, "background-attempt.json")))
      .event.type,
    "CI_FAILURE",
  );
  assert.deepEqual(await fixture.hook().finished, {
    code: 0,
    stdout: "",
    stderr: "",
  });
});
