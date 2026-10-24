import assert from "node:assert/strict";
import { test } from "node:test";
import {
  freshPendingRevision,
  pendingFreshnessMs,
} from "./ci-mailbox-revision-records.mjs";
import {
  commandAttempt as attempt,
  createRevisionCoverageFixture,
  queueEntry,
  queuePolicy as policy,
  revisionCoverage as coverage,
} from "./ci-revision-coverage-test-fixtures.mjs";
import { awaitRevision, recordedVerdict } from "./ci-mailbox-await.mjs";

const waitOptions = (h, extra) => ({
  root: h.project,
  storage: h.storage,
  workerLiveness: () => "alive",
  ...extra,
});

test("fresh queue defers an older incomplete wait read only; stale queue and exact failures do not", async (t) => {
  let clock = 1000;
  const h = await createRevisionCoverageFixture(t, {
    now: () => clock,
    maxDurationMs: 1e9,
  });
  h.setSnapshot({ attempts: [] });
  const a = await h.deliver();
  h.setSnapshot({
    attempts: [attempt(a, "incomplete")],
    queue: [queueEntry(a, "retrying")],
  });
  await h.advancePoll();
  const deliveryBefore = h.mailbox.readMailboxEvents(h.directory);
  let pauses = 0;
  const waiting = await awaitRevision(
    h.directory,
    a,
    waitOptions(h, {
      now: () => clock,
      deadlineMs: 10,
      sleep: async (ms) => {
        pauses += 1;
        clock += ms;
      },
    }),
  );
  assert.equal(waiting.unresolvedReason, "timeout");
  assert.equal(waiting.verdict, undefined);
  assert.ok(
    pauses > 0,
    "read-only wait reached its recheck for fresh pending queue",
  );
  assert.deepEqual(h.mailbox.readMailboxEvents(h.directory), deliveryBefore);
  clock += pendingFreshnessMs + 1;
  const stale = await awaitRevision(
    h.directory,
    a,
    waitOptions(h, { now: () => clock }),
  );
  assert.equal(stale.unresolvedReason, "incomplete");
  h.setSnapshot({
    attempts: [attempt(a, "failure")],
    queue: [queueEntry(a, "retrying")],
  });
  await h.advancePoll();
  assert.equal(coverage(h, a).queue, undefined);
  assert.equal(freshPendingRevision(coverage(h, a), clock), undefined);
  const failed = await awaitRevision(
    h.directory,
    a,
    waitOptions(h, { now: () => clock }),
  );
  assert.equal(failed.verdict, "failure");
});

test("current actual retry supersedes older green, stays fresh each poll, and loses freshness on failed discovery", async (t) => {
  let clock = 1000;
  const h = await createRevisionCoverageFixture(t, {
    now: () => clock,
    maxDurationMs: 1e9,
    integratedPolicy: policy,
  });
  h.setSnapshot({ attempts: [] });
  const a = await h.deliver();
  const green = attempt(a, "success", policy);
  const retry = attempt(a, "pending", {
    ...policy,
    attemptId: "retry:opaque",
    time: "2026-10-25T00:01:00Z",
  });
  h.setSnapshot({ attempts: [retry, green], queue: [] });
  await h.advancePoll();
  assert.equal(coverage(h, a).state, "pending");
  assert.deepEqual(coverage(h, a).checkedBy, {
    runId: "real-run",
    attemptId: "retry:opaque",
  });
  assert.equal(recordedVerdict(h.directory, a), undefined);
  clock += pendingFreshnessMs;
  await h.advancePoll();
  assert.equal(coverage(h, a).observedAt, clock);
  assert.ok(freshPendingRevision(coverage(h, a), clock));
  h.setSnapshot("not JSON");
  await h.advancePoll();
  assert.equal(
    coverage(h, a).state,
    "pending",
    "actual state is retained without inventing a verdict",
  );
  assert.equal(coverage(h, a).observedAt, undefined);
  assert.equal(freshPendingRevision(coverage(h, a), clock), undefined);
  h.setSnapshot({
    attempts: [],
    queue: [queueEntry(a, "retrying", { ...policy, context: "other" })],
  });
  await h.advancePoll();
  assert.equal(
    coverage(h, a).queue,
    undefined,
    "wrong exact context is not legitimate progress under policy",
  );
});
