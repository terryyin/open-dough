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
  createRevisionCoverageFixture,
  git,
  queueEntry,
  queuePolicy,
  revisionCoverage,
} from "./ci-revision-coverage-test-fixtures.mjs";

const exec = promisify(execFile);
const read = (path) => JSON.parse(readFileSync(path, "utf8"));

async function pendingFixture(t, integratedPolicy) {
  let clock = 1000;
  const h = await createRevisionCoverageFixture(t, {
    now: () => clock,
    maxDurationMs: 1e9,
    integratedPolicy,
  });
  h.setSnapshot({ attempts: [] });
  const sha = await h.deliver();
  const options = {
    root: h.project,
    storage: h.storage,
    now: () => clock,
    workerLiveness: () => "alive",
  };
  const complete = (extra = {}) =>
    h.mailbox.completeRevision(h.directory, sha, { ...options, ...extra });
  return {
    ...h,
    sha,
    options,
    complete,
    time: () => clock,
    advance: (ms) => {
      clock += ms;
    },
  };
}

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
  writeFileSync(join(h.project, "application.txt"), "B\n");
  await git(h.project, "commit", "-am", "descendant B");
  const b = (await git(h.project, "rev-parse", "HEAD")).stdout.trim();
  h.setSnapshot({
    attempts: [],
    queue: [queueEntry(b, "queued", queuePolicy)],
  });
  await h.advancePoll();
  const pending = await h.complete({
    sleep: async () => {
      h.advance(revisionWaitDeadlineMs);
      await h.advancePoll();
    },
  });
  assert.equal(pending.unresolvedReason, "pending");
  assert.deepEqual(pending.handoff, first.handoff);
  assert.equal(pending.pending.sha, b);
  assert.equal(pending.effectiveEvidence.revision.state, "undiscovered");
  assert.equal(revisionCoverage(h, h.sha).checkedBy, undefined);
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
    sleep: async () => {
      h.advance(revisionWaitDeadlineMs);
      await h.advancePoll();
    },
  });
  assert.equal(pending.unresolvedReason, "pending");
  assert.equal(pending.verdict, undefined);
  assert.equal(pending.pending.checkedBy.attemptId, "second");
});

test("coalesced pending recovery completes A from a real successful descendant without giving A its own pass", async (t) => {
  const h = await pendingFixture(t, queuePolicy);
  writeFileSync(join(h.project, "application.txt"), "B\n");
  await git(h.project, "commit", "-am", "descendant B");
  const b = (await git(h.project, "rev-parse", "HEAD")).stdout.trim();
  h.setSnapshot({
    attempts: [],
    queue: [queueEntry(b, "running", queuePolicy)],
  });
  await h.advancePoll();
  const pending = await h.complete({
    sleep: async () => {
      h.advance(revisionWaitDeadlineMs);
      await h.advancePoll();
    },
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
