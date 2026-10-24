import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import {
  completionBudgetMs,
  completionState,
} from "./ci-mailbox-completion-state.mjs";
import { revisionWaitDeadlineMs } from "./ci-mailbox-await.mjs";
import { completeRevision } from "./ci-mailbox-complete.mjs";
import { launchComplete, register } from "./ci-mailbox-await-test-fixtures.mjs";
import {
  setupProcessMailbox,
  sha,
} from "./ci-mailbox-process-test-fixtures.mjs";
import { assertWorkerAlive } from "./ci-mailbox-complete-test-fixtures.mjs";
import { awaitWorkerState } from "./watch-ci-test-fixtures.mjs";
import {
  commandAttempt as attempt,
  createRevisionCoverageFixture,
  queueEntry,
} from "./ci-revision-coverage-test-fixtures.mjs";

for (const signal of ["SIGINT", "SIGTERM", "SIGKILL"]) {
  test(`${signal} leaves the first completion record recoverable without cap renewal`, async (t) => {
    const h = await setupProcessMailbox(t);
    await register(h.env, h.mailbox);
    const waiting = launchComplete(h.teardown, h.env, h.mailbox);
    const path = join(h.mailbox, "completion", `${sha}.json`);
    await awaitWorkerState(
      h.mailbox,
      () => existsSync(path),
      "durable first completion record",
    );
    const original = readFileSync(path, "utf8");
    waiting.child.kill(signal);
    const terminal = await waiting.completed;
    if (signal !== "SIGKILL") {
      assert.equal(terminal.code, 0, terminal.stderr);
      const receipt = JSON.parse(terminal.stdout.slice("CI_OBSERVER ".length));
      assert.equal(receipt.unresolvedReason, "wait_cancelled");
      assert.equal(receipt.shutdown.status, "retained");
      assert.equal(receipt.handoff.record, path);
    } else assert.equal(terminal.signal, signal);
    const recorded = JSON.parse(original);
    const resumed = await completeRevision(h.mailbox, sha, {
      storage: h.env.DOUGH_CI_MAILBOX_ROOT,
      now: () => recorded.startedAt + 100,
      cancellation: AbortSignal.abort(),
    });
    assert.equal(resumed.unresolvedReason, "wait_cancelled");
    assert.equal(readFileSync(path, "utf8"), original);
    assert.equal(
      resumed.handoff.deadline - resumed.handoff.startedAt,
      completionBudgetMs,
    );
    assertWorkerAlive(h);
  });
}

test("concurrent first completion claims one immutable budget before either wait", async (t) => {
  const h = await setupProcessMailbox(t);
  await register(h.env, h.mailbox);
  const calls = [1000, 2000].map((clock) =>
    launchComplete(
      h.teardown,
      {
        ...h.env,
        NODE_OPTIONS: `--import=data:text/javascript,${encodeURIComponent(`Date.now = () => ${clock};`)}`,
      },
      h.mailbox,
    ),
  );
  await Promise.all(calls.map((call) => call.waitForCancellationReady()));
  await awaitWorkerState(
    h.mailbox,
    () => existsSync(join(h.mailbox, "completion", `${sha}.json`)),
    "exclusive completion claim",
  );
  for (const call of calls) call.child.kill("SIGTERM");
  const receipts = await Promise.all(
    calls.map(async (call) => {
      const terminal = await call.completed;
      assert.equal(terminal.code, 0, terminal.stderr);
      return JSON.parse(terminal.stdout.slice("CI_OBSERVER ".length));
    }),
  );
  assert.deepEqual(receipts[0].handoff, receipts[1].handoff);
  assert.ok([1000, 2000].includes(receipts[0].handoff.startedAt));
  assert.equal(
    receipts[0].handoff.deadline - receipts[0].handoff.startedAt,
    completionBudgetMs,
  );
});

for (const unavailable of [
  "stale",
  "withdrawn",
  "foreign",
  "unsupported",
  "monitor",
  "missing_registration",
]) {
  test(`${unavailable} facts cannot turn completion into a pending handoff`, async (t) => {
    let clock = 1000;
    const h = await createRevisionCoverageFixture(t, {
      now: () => clock,
      maxDurationMs: 1e9,
    });
    h.setSnapshot({ attempts: [] });
    const a = await h.deliver();
    h.setSnapshot({ attempts: [], queue: [queueEntry(a)] });
    await h.advancePoll();
    if (unavailable === "withdrawn") {
      h.setSnapshot({ attempts: [], queue: [] });
      await h.advancePoll();
    }
    if (unavailable === "foreign") {
      h.setSnapshot({
        attempts: [],
        queue: [queueEntry(a, "queued", { branch: "foreign" })],
      });
      await h.advancePoll();
    }
    if (unavailable === "unsupported") {
      h.setSnapshot({ attempts: [] });
      await h.advancePoll();
    }
    if (unavailable === "monitor")
      h.mailbox.publishMailboxEvent(h.directory, {
        type: "CI_MONITOR_UNAVAILABLE",
      });
    const result = await h.mailbox.completeRevision(
      h.directory,
      unavailable === "missing_registration" ? "f".repeat(40) : a,
      {
        root: h.project,
        storage: h.storage,
        now: () => clock,
        workerLiveness: () => "alive",
        sleep: async () => {
          clock += revisionWaitDeadlineMs;
        },
      },
    );
    assert.notEqual(result.unresolvedReason, "pending");
    assert.equal(result.verdict, undefined);
    assert.notEqual(result.shutdown.status, "retained");
  });
}

test("expiry still reports exact failure and retains unread failure evidence", async (t) => {
  let clock = 1000;
  const h = await createRevisionCoverageFixture(t, {
    now: () => clock,
    maxDurationMs: 1e9,
  });
  h.setSnapshot({ attempts: [] });
  const a = await h.deliver();
  const options = {
    root: h.project,
    storage: h.storage,
    now: () => clock,
    workerLiveness: () => "alive",
  };
  const original = completionState(h.directory, a, options).handoff;
  h.setSnapshot({ attempts: [attempt(a, "failure")] });
  await h.advancePoll();
  clock = original.deadline;
  const failed = await h.mailbox.completeRevision(h.directory, a, options);
  assert.equal(failed.verdict, "failure");
  assert.equal(failed.shutdown.status, "retained");
  assert.ok(existsSync(join(h.directory, "completion", `${a}.expired.json`)));
  h.setSnapshot({
    attempts: [
      attempt(a, "success", {
        attemptId: "repaired",
        time: "2026-10-25T02:00:00Z",
      }),
    ],
  });
  await h.advancePoll();
  const expired = await h.mailbox.completeRevision(h.directory, a, options);
  assert.equal(expired.unresolvedReason, "completion_expired");
  assert.equal(expired.verdict, undefined);
  assert.equal(expired.shutdown.reason, "unread_actionable_failure");
  assert.equal(expired.unreadActionableFailures[0].type, "CI_FAILURE");
});

test("fresh queue cannot hide a missing worker identity or replace its observation", async (t) => {
  const h = await createRevisionCoverageFixture(t, { now: () => 1000 });
  h.setSnapshot({ attempts: [] });
  const a = await h.deliver();
  h.setSnapshot({ attempts: [], queue: [queueEntry(a)] });
  await h.advancePoll();
  const result = await h.mailbox.completeRevision(h.directory, a, {
    root: h.project,
    storage: h.storage,
    now: () => 1000,
  });
  assert.equal(result.unresolvedReason, "observation_unavailable");
  assert.equal(result.detail, "worker_identity_unknown");
  assert.equal(result.verdict, undefined);
  assert.equal(result.handoff.directory, h.directory);
  assert.equal(result.shutdown.status, "confirmed");
});
