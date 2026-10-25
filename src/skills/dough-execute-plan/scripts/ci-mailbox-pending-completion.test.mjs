import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { completionBudgetMs } from "./ci-mailbox-completion-state.mjs";
import { revisionWaitDeadlineMs } from "./ci-mailbox-await.mjs";
import {
  commandAttempt as attempt,
  descendantRevision,
  queueEntry,
  queuePolicy,
  revisionCoverage,
} from "./ci-revision-coverage-test-fixtures.mjs";

import { pendingFixture } from "./ci-mailbox-pending-completion-test-fixtures.mjs";

const exec = promisify(execFile);
const read = (path) => JSON.parse(readFileSync(path, "utf8"));

for (const progress of ["queued", "running", "retrying", "attempt"]) {
  test(`real adapter ${progress} yields a durable handoff and resumes to a real pass`, async (t) => {
    const h = await pendingFixture(t);
    const snapshot = () =>
      progress === "attempt"
        ? { attempts: [attempt(h.sha, "pending")] }
        : { attempts: [], queue: [queueEntry(h.sha, progress)] };
    h.setSnapshot(snapshot());
    await h.advancePoll();
    const result = await h.complete({
      sleep: async () => {
        assert.equal(
          read(join(h.directory, "completion", `${h.sha}.json`)).startedAt,
          1000,
          "budget exists before the first wait",
        );
        h.advance(revisionWaitDeadlineMs);
        await h.advancePoll();
      },
    });
    assert.equal(result.unresolvedReason, "pending");
    assert.equal(result.verdict, undefined);
    assert.equal(result.shutdown.status, "retained");
    assert.equal(result.handoff.startedAt, 1000);
    assert.equal(result.handoff.deadline, 1000 + completionBudgetMs);
    assert.match(
      result.handoff.command,
      /ci-mailbox.mjs' complete-revision '.+watch-.+' [a-f0-9]{40}$/,
    );
    assert.deepEqual(read(result.handoff.pendingReceipt), result);
    assert.equal(existsSync(join(h.directory, "result.json")), false);
    h.setSnapshot({ attempts: [attempt(h.sha, "success")] });
    await h.advancePoll();
    const { stdout } = await exec("/bin/sh", ["-c", result.handoff.command], {
      env: {
        ...process.env,
        DOUGH_CI_MAILBOX_ROOT: h.storage,
        NODE_OPTIONS: `--import=data:text/javascript,${encodeURIComponent(`Date.now = () => ${h.time()};`)}`,
      },
    });
    const pass = JSON.parse(stdout.slice(h.mailbox.receiptPrefix.length));
    assert.equal(pass.verdict, "success");
    assert.equal(pass.shutdown.status, "confirmed");
    assert.deepEqual(read(result.handoff.record), result.handoff);
    h.advance(completionBudgetMs);
    const repeated = await h.complete();
    assert.equal(
      repeated.verdict,
      "success",
      "already observed in-budget success stays truthful",
    );
    assert.deepEqual(read(result.handoff.record), result.handoff);
  });
}

test("coalesced progress preserves A's state and cannot renew its completion cap", async (t) => {
  const h = await pendingFixture(t, queuePolicy);
  const first = await h.complete({ cancellation: AbortSignal.abort() });
  const b = await descendantRevision(h);
  h.setSnapshot({
    attempts: [],
    queue: [queueEntry(b, "queued", queuePolicy)],
  });
  await h.advancePoll();
  const pending = await h.complete({
    sleep: h.waitForPoll,
  });
  assert.equal(pending.unresolvedReason, "pending");
  assert.deepEqual(pending.handoff, first.handoff);
  assert.equal(pending.pending.sha, b);
  assert.equal(pending.effectiveEvidence.revision.state, "undiscovered");
  assert.equal(revisionCoverage(h, h.sha).checkedBy, undefined);
  h.setSnapshot({ attempts: [attempt(b, "pending", queuePolicy)] });
  await h.advancePoll();
  const retry = await h.complete({ sleep: h.waitForPoll });
  assert.equal(retry.unresolvedReason, "pending");
  assert.deepEqual(retry.handoff, first.handoff);
  h.advance(completionBudgetMs);
  const expired = await h.complete({
    sleep: async () => assert.fail("expired completion must not wait"),
  });
  assert.equal(expired.unresolvedReason, "completion_expired");
  assert.equal(expired.detail, "overall_completion_deadline");
  assert.equal(expired.verdict, undefined);
  assert.equal(expired.shutdown.status, "confirmed");
  // Real observation has ended; this later green is the persisted late evidence
  // a resumed reader could encounter, and cannot reopen the closed handoff.
  writeFileSync(
    join(h.directory, "coverage", `${h.sha}.json`),
    JSON.stringify({ sha: h.sha, state: "success" }),
  );
  const late = await h.complete();
  assert.equal(late.unresolvedReason, "completion_expired");
  assert.equal(late.verdict, undefined);
  assert.deepEqual(late.handoff, first.handoff);
});

test("a new pending rerun overrides old green before pending handoff", async (t) => {
  const h = await pendingFixture(t);
  h.setSnapshot({ attempts: [attempt(h.sha, "success")] });
  await h.advancePoll();
  h.setSnapshot({
    attempts: [
      attempt(h.sha, "pending", {
        attemptId: "second",
        time: "2026-10-25T01:00:00Z",
      }),
    ],
  });
  await h.advancePoll();
  const pending = await h.complete({
    sleep: h.waitForPoll,
  });
  assert.equal(pending.unresolvedReason, "pending");
  assert.equal(pending.verdict, undefined);
  assert.equal(pending.pending.checkedBy.attemptId, "second");
});

test("coalesced pending recovery completes A from a real successful descendant without giving A its own pass", async (t) => {
  const h = await pendingFixture(t, queuePolicy);
  const b = await descendantRevision(h);
  h.setSnapshot({
    attempts: [],
    queue: [queueEntry(b, "running", queuePolicy)],
  });
  await h.advancePoll();
  const pending = await h.complete({
    sleep: h.waitForPoll,
  });
  assert.equal(pending.unresolvedReason, "pending");
  h.setSnapshot({ attempts: [attempt(b, "success", queuePolicy)], queue: [] });
  await h.advancePoll();
  const completed = await h.complete();
  assert.equal(completed.verdict, "success");
  assert.equal(completed.effectiveEvidence.source, "integrated_state");
  assert.equal(completed.effectiveEvidence.accepted.state, "undiscovered");
  assert.equal(completed.effectiveEvidence.accepted.checkedBy, undefined);
  assert.equal(completed.effectiveEvidence.validated.sha, b);
  assert.equal(completed.shutdown.status, "confirmed");
  assert.deepEqual(read(pending.handoff.record), pending.handoff);
});

test("a containing revision's automatic retry preserves the original handoff after queue facts disappear", async (t) => {
  const h = await pendingFixture(t, queuePolicy);
  const b = await descendantRevision(h);
  h.setSnapshot({
    attempts: [],
    queue: [queueEntry(b, "retrying", queuePolicy)],
  });
  await h.advancePoll();
  const first = await h.complete({ cancellation: AbortSignal.abort() });
  const retryAttempts = [
    attempt(b, "pending", { ...queuePolicy, attemptId: "automatic-retry" }),
    attempt(b, "incomplete", {
      ...queuePolicy,
      attemptId: "previous",
      time: "2026-10-24T23:00:00Z",
    }),
    attempt(b, "incomplete", {
      ...queuePolicy,
      attemptId: "original",
      time: "2026-10-24T22:00:00Z",
    }),
  ];
  h.setSnapshot({ attempts: retryAttempts });
  await h.advancePoll();
  const pending = await h.complete({
    sleep: h.waitForPoll,
  });
  assert.equal(pending.unresolvedReason, "pending");
  assert.equal(pending.verdict, undefined);
  assert.equal(pending.shutdown.status, "retained");
  assert.deepEqual(pending.handoff, first.handoff);
  assert.equal(pending.pending.sha, b);
  assert.equal(revisionCoverage(h, h.sha).state, "undiscovered");
  assert.equal(revisionCoverage(h, h.sha).checkedBy, undefined);
  assert.equal(revisionCoverage(h, h.sha).queue, undefined);
  h.setSnapshot({
    attempts: retryAttempts,
    queue: [queueEntry(b, "running", queuePolicy)],
  });
  await h.advancePoll();
  const running = await h.complete({ sleep: h.waitForPoll });
  assert.equal(running.unresolvedReason, "pending");
  assert.equal(running.verdict, undefined);
  assert.deepEqual(running.handoff, first.handoff);
  h.setSnapshot({
    attempts: [
      attempt(b, "success", { ...queuePolicy, attemptId: "automatic-retry" }),
    ],
  });
  await h.advancePoll();
  const completed = await h.complete();
  assert.equal(completed.verdict, "success");
  assert.equal(completed.effectiveEvidence.source, "integrated_state");
  assert.equal(completed.effectiveEvidence.validated.sha, b);
  assert.equal(completed.shutdown.status, "confirmed");
  assert.deepEqual(read(pending.handoff.record), first.handoff);
});
