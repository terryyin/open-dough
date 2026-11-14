// Managed resume preserves unread failures, truthful completion coverage, and
// host-hook ended receipts (never "attached" after a terminal finish).
import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { deliverHostBoundary, invokeHostHook } from "./ci-host-bridge.mjs";
import {
  completeRevision,
  publishMailboxEvent,
  readDeliveryProgress,
  readMailboxEvents,
  readRevisionCoverage,
  receiptPrefix,
} from "./ci-mailbox.mjs";
import {
  createManagedFixture,
  git,
  waitForFailureEvent,
} from "./execution-increment-managed-delivery-test-fixtures.mjs";

const trunkTarget = "refs/heads/main";
const repo = "owner/project";

test("unread failures survive resume and a later failure is delivered", async (t) => {
  const fixture = await createManagedFixture();
  t.after(fixture.cleanup);

  const delivered = await fixture.deliverManagedExecutionIncrement({
    ...fixture.requestBase,
    workspace: fixture.execution,
    branch: "exec/story",
    previouslyPublishedBase: fixture.trunkSha,
    targetRef: trunkTarget,
    repo,
  });
  const accepted = delivered.receipt.sha;

  publishMailboxEvent(delivered.observation.directory, {
    type: "CI_FAILURE",
    runId: "run:unread",
    attempt: 1,
    sha: accepted,
  });
  assert.equal(
    readDeliveryProgress(delivered.observation.directory).deliveredThrough,
    0,
  );
  assert.equal(readMailboxEvents(delivered.observation.directory).length, 1);

  const resumed = await fixture.resumeManagedExecutionIncrement({
    ...fixture.requestBase,
    workspace: fixture.execution,
    candidateSha: accepted,
    targetRef: trunkTarget,
    repo,
    publishedRevisions: [accepted],
    defaultCheckout: fixture.integration,
  });
  assert.equal(resumed.observation.state, "recovered");
  assert.equal(readMailboxEvents(resumed.observation.directory).length, 1);
  assert.equal(
    readDeliveryProgress(resumed.observation.directory).deliveredThrough,
    0,
  );

  writeFileSync(join(fixture.execution, "later.txt"), "later increment\n");
  await git(fixture.execution, "add", "later.txt");
  await git(fixture.execution, "commit", "-m", "later verified increment");
  const later = await fixture.deliverManagedExecutionIncrement({
    ...fixture.requestBase,
    workspace: fixture.execution,
    branch: "exec/story",
    previouslyPublishedBase: accepted,
    targetRef: trunkTarget,
    repo,
  });
  assert.equal(later.observation.state, "reused");
  fixture.releaseFailure(later.receipt.sha, "main");
  await waitForFailureEvent(later.observation.directory);

  const boundary = await deliverHostBoundary({
    host: "cursor",
    session: fixture.session,
    workspace: fixture.execution,
    hookPath: join(fixture.skill, "scripts/ci-host-hook.mjs"),
    env: fixture.env,
  });
  const context =
    boundary.additional_context ??
    boundary.hookSpecificOutput?.additionalContext ??
    "";
  assert.match(context, /CI_FAILURE/);
  assert.match(context, /run:unread|run:opaque\/managed/);
});

test("undiscovered revision through completion reports truthful unproved coverage", async (t) => {
  const fixture = await createManagedFixture();
  t.after(fixture.cleanup);

  const delivered = await fixture.deliverManagedExecutionIncrement({
    ...fixture.requestBase,
    workspace: fixture.execution,
    branch: "exec/story",
    previouslyPublishedBase: fixture.trunkSha,
    targetRef: trunkTarget,
    repo,
  });
  const accepted = delivered.receipt.sha;
  assert.equal(
    readRevisionCoverage(delivered.observation.directory)[0].state,
    "undiscovered",
  );

  const resumed = await fixture.resumeManagedExecutionIncrement({
    ...fixture.requestBase,
    workspace: fixture.execution,
    candidateSha: accepted,
    targetRef: trunkTarget,
    repo,
    publishedRevisions: [accepted],
    defaultCheckout: fixture.integration,
  });
  assert.equal(resumed.observation.state, "recovered");

  let time = 0;
  const completion = await completeRevision(
    resumed.observation.directory,
    accepted,
    {
      deadlineMs: 50,
      now: () => time,
      sleep: async (duration) => {
        time += duration;
      },
      storage: fixture.storage,
      root: fixture.execution,
    },
  );
  assert.equal(completion.unresolvedReason, "timeout");
  assert.equal(completion.shutdown.status, "confirmed");
  assert.equal(completion.shutdown.terminal.coverage.pendingCi, "unobserved");
  assert.equal(
    completion.shutdown.terminal.coverage.unproved?.some(
      (entry) =>
        entry.sha === accepted.toLowerCase() && entry.state === "undiscovered",
    ),
    true,
  );
});

test("ended observer receipt never reports active attachment on the host hook", async (t) => {
  const fixture = await createManagedFixture();
  t.after(fixture.cleanup);

  const delivered = await fixture.deliverManagedExecutionIncrement({
    ...fixture.requestBase,
    workspace: fixture.execution,
    branch: "exec/story",
    previouslyPublishedBase: fixture.trunkSha,
    targetRef: trunkTarget,
    repo,
  });
  const directory = delivered.observation.directory;
  await fixture.stopObserver(directory);
  const terminal = JSON.parse(
    readFileSync(join(directory, "result.json"), "utf8"),
  );
  assert.equal(terminal.status, "stopped");

  // Re-parse a push-style receipt through the installed hook process so the
  // owner hash matches the original coordinator binding path encoding.
  const receipt = `${receiptPrefix}${JSON.stringify({ directory })}\n`;
  const output = await invokeHostHook(
    "cursor",
    {
      session_id: fixture.session.session_id,
      conversation_id: fixture.session.conversation_id,
      generation_id: fixture.session.generation_id,
      transcript_path: "/tmp/dough-managed-delivery.jsonl",
      hook_event_name: "postToolUse",
      tool_name: "Shell",
      tool_output: JSON.stringify({
        stdout: receipt,
        output: receipt,
        exitCode: 0,
      }),
      tool_response: { stdout: receipt },
      cursor_version: "0.0.0",
    },
    {
      hookPath: join(fixture.skill, "scripts/ci-host-hook.mjs"),
      cwd: fixture.execution,
      env: fixture.env,
    },
  );
  const text =
    output.additional_context ??
    output.hookSpecificOutput?.additionalContext ??
    "";
  assert.doesNotMatch(text, /CI observer attached to this coordinator/);
  assert.match(
    text,
    new RegExp(
      `CI observer ended for this coordinator: ${directory.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")} \\(${terminal.status}\\)`,
    ),
  );
});
