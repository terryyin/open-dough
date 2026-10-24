import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import {
  commandAttempt as attempt,
  createRevisionCoverageFixture,
  git,
  queueEntry,
  queuePolicy,
} from "./ci-revision-coverage-test-fixtures.mjs";
import {
  acceptedWorkflow,
  writeWorkflow,
} from "./ci-path-applicability-test-fixtures.mjs";
import { completionBudgetMs } from "./ci-mailbox-completion-state.mjs";

test("renewed accepted pending freshness preserves known integrated success, but a different late successful attempt cannot reopen its cap", async (t) => {
  let clock = 1000;
  const h = await createRevisionCoverageFixture(t, {
    now: () => clock,
    maxDurationMs: 1e9,
    integratedPolicy: queuePolicy,
  });
  h.setSnapshot({ attempts: [] });
  writeWorkflow(h.project, acceptedWorkflow);
  await git(h.project, "add", ".github/workflows/ci.yml");
  await git(h.project, "commit", "-m", "workflow source ancestor");
  const ancestor = (await git(h.project, "rev-parse", "HEAD")).stdout.trim();
  mkdirSync(join(h.project, "docs"));
  writeFileSync(
    join(h.project, "docs/accepted.md"),
    "ignored-only accepted revision\n",
  );
  await git(h.project, "add", "docs/accepted.md");
  await git(h.project, "commit", "-m", "ignored-only accepted revision");
  const a = await h.deliver();
  writeFileSync(join(h.project, "application.txt"), "B\n");
  await git(h.project, "commit", "-am", "descendant B");
  const b = (await git(h.project, "rev-parse", "HEAD")).stdout.trim();
  const pending = attempt(ancestor, "pending", queuePolicy);
  const success = attempt(b, "success", queuePolicy);
  h.setSnapshot({
    attempts: [pending, success],
    queue: [queueEntry(a, "queued", queuePolicy)],
  });
  await h.advancePoll();
  // Unread failure is this test's starting retention precondition, allowing
  // the real observer to poll after completion has saved applicable success.
  h.mailbox.publishMailboxEvent(h.directory, {
    type: "CI_FAILURE",
    sha: "f".repeat(40),
  });
  assert.equal(
    h.mailbox.readRevisionCoverage(h.directory)[0].integrated.state,
    "success",
  );
  const options = {
    root: h.project,
    storage: h.storage,
    now: () => clock,
    workerLiveness: () => "alive",
    sleep: async () =>
      assert.fail("applicable success must already be observable"),
  };
  const first = await h.mailbox.completeRevision(h.directory, a, options);
  assert.equal(first.verdict, "success");
  assert.equal(first.effectiveEvidence.source, "integrated_state");
  assert.equal(first.effectiveEvidence.accepted.state, "not_required");
  assert.deepEqual(first.effectiveEvidence.accepted.basis, {
    sha: ancestor,
    state: "pending",
  });
  assert.equal(first.shutdown.reason, "unread_actionable_failure");
  clock += 100;
  h.setSnapshot({
    attempts: [pending, success],
    queue: [queueEntry(a, "running", queuePolicy)],
  });
  await h.advancePoll();
  clock = 1000 + completionBudgetMs;
  const same = await h.mailbox.completeRevision(h.directory, a, options);
  assert.notEqual(
    same.effectiveEvidence.accepted.observedAt,
    first.effectiveEvidence.accepted.observedAt,
  );
  assert.notDeepEqual(
    same.effectiveEvidence.accepted.queue,
    first.effectiveEvidence.accepted.queue,
  );
  assert.equal(
    same.verdict,
    "success",
    "freshness changes cannot revoke the same proved result",
  );
  h.setSnapshot({
    attempts: [
      pending,
      attempt(b, "success", {
        ...queuePolicy,
        attemptId: "late",
        time: "2026-10-25T02:00:00Z",
      }),
    ],
    queue: [],
  });
  await h.advancePoll();
  const late = await h.mailbox.completeRevision(h.directory, a, options);
  assert.equal(late.effectiveEvidence.validated.attempt, "late");
  assert.equal(late.unresolvedReason, "completion_expired");
  assert.equal(late.verdict, undefined);
  assert.equal(late.shutdown.reason, "unread_actionable_failure");
});
