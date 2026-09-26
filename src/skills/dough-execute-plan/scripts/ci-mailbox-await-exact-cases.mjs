import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import {
  exec,
  launchAwait,
  parseReceipt,
  register,
  waitFor,
} from "./ci-mailbox-await-test-fixtures.mjs";
import { readDeliveryProgress, readRevisionCoverage } from "./ci-mailbox.mjs";
import {
  launcher,
  releaseRun,
  setupProcessMailbox,
  sha,
} from "./ci-mailbox-process-test-fixtures.mjs";

test("the real CLI quietly awaits pending exact coverage, returns one success result, and leaves observer delivery and lifetime untouched", async (t) => {
  const fixture = await setupProcessMailbox(t);
  await register(fixture.env, fixture.mailbox);
  const deliveryBefore = readDeliveryProgress(fixture.mailbox);
  const waiting = launchAwait(fixture.teardown, fixture.env, fixture.mailbox);
  // The first recheck follows a complete read that found the coverage pending.
  await waiting.waitForRechecks(1);
  assert.equal(waiting.output(), "");

  releaseRun(fixture.directory, { conclusion: "success" });
  const completed = await waiting.completed;
  assert.equal(completed.code, 0, completed.stderr);
  const result = parseReceipt(completed.stdout);
  assert.equal(
    Number.isFinite(result.effectiveEvidence.revision.registeredAt),
    true,
  );
  delete result.effectiveEvidence.revision.registeredAt;
  assert.deepEqual(result, {
    requestedSha: sha,
    target: { repo: "owner/repo", branch: "main" },
    effectiveEvidence: {
      source: "exact",
      revision: {
        sha,
        state: "success",
        checkedBy: { runId: 42, attemptId: 1 },
      },
    },
    verdict: "success",
  });
  assert.deepEqual(readDeliveryProgress(fixture.mailbox), deliveryBefore);
  assert.equal(existsSync(join(fixture.mailbox, "result.json")), false);
  process.kill(Number(readFileSync(join(fixture.directory, "worker-pid"))), 0);
});

test("an already-recorded exact failure takes precedence and the wait reader makes no provider call", async (t) => {
  const fixture = await setupProcessMailbox(t);
  await register(fixture.env, fixture.mailbox);
  releaseRun(fixture.directory, { conclusion: "failure" });
  await waitFor(
    () => readRevisionCoverage(fixture.mailbox)[0]?.state === "failure",
    "failure coverage",
  );
  const releaseObservedAt = readFileSync(join(fixture.directory, "observed"));
  const { stdout } = await exec(
    process.execPath,
    [launcher, "await-revision", fixture.mailbox, sha],
    { env: fixture.env },
  );
  const result = parseReceipt(stdout);
  assert.equal(result.verdict, "failure");
  assert.equal(result.effectiveEvidence.source, "exact");
  assert.deepEqual(
    readFileSync(join(fixture.directory, "observed")),
    releaseObservedAt,
  );
  assert.equal(existsSync(join(fixture.mailbox, "result.json")), false);
});

test("the real CLI handles already-terminal success and pending-to-terminal failure", async (t) => {
  await t.test("already-terminal success", async (t) => {
    const fixture = await setupProcessMailbox(t);
    await register(fixture.env, fixture.mailbox);
    releaseRun(fixture.directory, { conclusion: "success" });
    await waitFor(
      () => readRevisionCoverage(fixture.mailbox)[0]?.state === "success",
      "success coverage",
    );
    const { stdout } = await exec(
      process.execPath,
      [launcher, "await-revision", fixture.mailbox, sha],
      { env: fixture.env },
    );
    assert.equal(parseReceipt(stdout).verdict, "success");
  });

  await t.test("pending-to-terminal failure", async (t) => {
    const fixture = await setupProcessMailbox(t);
    await register(fixture.env, fixture.mailbox);
    const waiting = launchAwait(fixture.teardown, fixture.env, fixture.mailbox);
    // The first recheck follows a complete read that found the coverage pending.
    await waiting.waitForRechecks(1);
    assert.equal(waiting.output(), "");
    releaseRun(fixture.directory, { conclusion: "failure" });
    assert.equal(
      parseReceipt((await waiting.completed).stdout).verdict,
      "failure",
    );
  });
});
