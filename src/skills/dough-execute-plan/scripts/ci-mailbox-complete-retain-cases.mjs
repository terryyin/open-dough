import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import {
  publishMailboxEvent,
  readDeliveryProgress,
  readMailboxEvents,
  readRevisionCoverage,
  recordDeliveryProgress,
} from "./ci-mailbox.mjs";
import { publishJson } from "./ci-mailbox-json-file.mjs";
import {
  exec,
  launchComplete,
  parseReceipt,
  register,
  waitFor,
} from "./ci-mailbox-await-test-fixtures.mjs";
import {
  assertWorkerAlive,
  assertWorkerDead,
} from "./ci-mailbox-complete-test-fixtures.mjs";
import {
  launcher,
  releaseRun,
  setupProcessMailbox,
  sha,
} from "./ci-mailbox-process-test-fixtures.mjs";

test("complete-revision retains the observer on failure without acknowledging events", async (t) => {
  const fixture = await setupProcessMailbox(t);
  await register(fixture.env, fixture.mailbox);
  releaseRun(fixture.directory, { conclusion: "failure" });
  await waitFor(
    () => readRevisionCoverage(fixture.mailbox)[0]?.state === "failure",
    "failure coverage",
  );
  await waitFor(
    () => readMailboxEvents(fixture.mailbox).length > 0,
    "failure event",
  );
  const deliveryBefore = readDeliveryProgress(fixture.mailbox);
  const eventsBefore = readMailboxEvents(fixture.mailbox);
  const { stdout } = await exec(
    process.execPath,
    [launcher, "complete-revision", fixture.mailbox, sha],
    { env: fixture.env },
  );
  const result = parseReceipt(stdout);
  assert.equal(result.verdict, "failure");
  assert.deepEqual(result.shutdown, { status: "retained" });
  assert.equal(existsSync(join(fixture.mailbox, "result.json")), false);
  assert.deepEqual(readDeliveryProgress(fixture.mailbox), deliveryBefore);
  assert.deepEqual(readMailboxEvents(fixture.mailbox), eventsBefore);
  assertWorkerAlive(fixture);
});

test("an unread earlier failure blocks shutdown of a later green revision", async (t) => {
  const fixture = await setupProcessMailbox(t);
  const earlier = "b".repeat(40);
  await register(fixture.env, fixture.mailbox, earlier);
  publishMailboxEvent(fixture.mailbox, {
    type: "CI_FAILURE",
    runId: 7,
    attempt: 1,
    sha: earlier,
  });
  await register(fixture.env, fixture.mailbox);
  releaseRun(fixture.directory, { conclusion: "success" });
  await waitFor(
    () =>
      readRevisionCoverage(fixture.mailbox).some(
        (revision) => revision.sha === sha && revision.state === "success",
      ),
    "later success coverage",
  );
  const { stdout } = await exec(
    process.execPath,
    [launcher, "complete-revision", fixture.mailbox, sha],
    { env: fixture.env },
  );
  const result = parseReceipt(stdout);
  assert.equal(result.verdict, "success");
  assert.deepEqual(result.shutdown, {
    status: "retained",
    reason: "unread_actionable_failure",
  });
  assert.equal(result.unreadActionableFailures[0].type, "CI_FAILURE");
  assert.equal(existsSync(join(fixture.mailbox, "result.json")), false);
  assertWorkerAlive(fixture);
});

test("authorized repair registration reuses the live observer for a later completion", async (t) => {
  const fixture = await setupProcessMailbox(t);
  await register(fixture.env, fixture.mailbox);
  releaseRun(fixture.directory, { conclusion: "failure" });
  await waitFor(
    () => readRevisionCoverage(fixture.mailbox)[0]?.state === "failure",
    "failure coverage",
  );
  const failed = parseReceipt(
    (
      await exec(
        process.execPath,
        [launcher, "complete-revision", fixture.mailbox, sha],
        { env: fixture.env },
      )
    ).stdout,
  );
  assert.equal(failed.shutdown.status, "retained");
  assertWorkerAlive(fixture);

  // Simulate host delivery of the actionable failure into diagnosis/repair.
  const deliveredThrough =
    readMailboxEvents(fixture.mailbox).at(-1)?.sequence ?? 0;
  recordDeliveryProgress(fixture.mailbox, deliveredThrough);

  const repair = "c".repeat(40);
  await register(fixture.env, fixture.mailbox, repair);
  assertWorkerAlive(fixture);
  // Same live mailbox/worker owns the repair registration; write the observed
  // success coverage the next poll would record without waiting the 30s cadence.
  publishJson(join(fixture.mailbox, "coverage"), `${repair}.json`, {
    sha: repair,
    state: "success",
    checkedBy: { runId: 99, attemptId: 1 },
  });
  const completed = parseReceipt(
    (
      await exec(
        process.execPath,
        [launcher, "complete-revision", fixture.mailbox, repair],
        { env: fixture.env },
      )
    ).stdout,
  );
  assert.equal(completed.verdict, "success");
  assert.equal(completed.requestedSha, repair);
  assert.equal(completed.shutdown.status, "confirmed");
  assertWorkerDead(fixture);
});

test("wait_cancelled retains the observer without confirmed shutdown", async (t) => {
  const fixture = await setupProcessMailbox(t);
  await register(fixture.env, fixture.mailbox);
  publishMailboxEvent(fixture.mailbox, {
    type: "CI_DISCOVERY_DELAYED",
    repo: "owner/repo",
    branch: "main",
    revisions: [sha],
  });
  const deliveryBefore = readDeliveryProgress(fixture.mailbox);
  const eventsBefore = readMailboxEvents(fixture.mailbox);
  const waiting = launchComplete(fixture.env, fixture.mailbox);
  await waiting.waitForCancellationReady();
  assert.equal(waiting.output(), "");
  waiting.child.kill("SIGTERM");
  const completed = await waiting.completed;
  assert.equal(completed.code, 0, completed.stderr);
  const result = parseReceipt(completed.stdout);
  assert.equal(result.unresolvedReason, "wait_cancelled");
  assert.deepEqual(result.shutdown, { status: "retained" });
  assert.equal(existsSync(join(fixture.mailbox, "result.json")), false);
  assert.deepEqual(readDeliveryProgress(fixture.mailbox), deliveryBefore);
  assert.deepEqual(readMailboxEvents(fixture.mailbox), eventsBefore);
  assertWorkerAlive(fixture);
});
