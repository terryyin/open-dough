import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { readDeliveryProgress, readRevisionCoverage } from "./ci-mailbox.mjs";
import { publishJson } from "./ci-mailbox-json-file.mjs";
import {
  exec,
  launchComplete,
  parseReceipt,
  register,
  waitFor,
} from "./ci-mailbox-await-test-fixtures.mjs";
import { assertWorkerDead } from "./ci-mailbox-complete-test-fixtures.mjs";
import {
  launcher,
  releaseRun,
  setupProcessMailbox,
  sha,
} from "./ci-mailbox-process-test-fixtures.mjs";

test("complete-revision awaits pending success, returns one receipt with confirmed shutdown, and exits the worker", async (t) => {
  const fixture = await setupProcessMailbox(t);
  await register(fixture.env, fixture.mailbox);
  const deliveryBefore = readDeliveryProgress(fixture.mailbox);
  const waiting = launchComplete(fixture.env, fixture.mailbox);
  await new Promise((resolve) => setTimeout(resolve, 75));
  assert.equal(waiting.output(), "");

  releaseRun(fixture.directory, { conclusion: "success" });
  const completed = await waiting.completed;
  assert.equal(completed.code, 0, completed.stderr);
  const result = parseReceipt(completed.stdout);
  assert.equal(result.verdict, "success");
  assert.equal(result.shutdown.status, "confirmed");
  assert.equal(result.shutdown.terminal.status, "stopped");
  assert.equal(existsSync(join(fixture.mailbox, "result.json")), true);
  assert.deepEqual(readDeliveryProgress(fixture.mailbox), deliveryBefore);
  assertWorkerDead(fixture);
});

test("complete-revision handles already-terminal success without a separate stop", async (t) => {
  const fixture = await setupProcessMailbox(t);
  await register(fixture.env, fixture.mailbox);
  releaseRun(fixture.directory, { conclusion: "success" });
  await waitFor(
    () => readRevisionCoverage(fixture.mailbox)[0]?.state === "success",
    "success coverage",
  );
  const { stdout } = await exec(
    process.execPath,
    [launcher, "complete-revision", fixture.mailbox, sha],
    { env: fixture.env },
  );
  const result = parseReceipt(stdout);
  assert.equal(result.verdict, "success");
  assert.equal(result.shutdown.status, "confirmed");
  assertWorkerDead(fixture);
});

test("complete-revision preserves exact and ignored-only evidence without changing verdicts", async (t) => {
  await t.test("exact success evidence", async (t) => {
    const fixture = await setupProcessMailbox(t);
    await register(fixture.env, fixture.mailbox);
    releaseRun(fixture.directory, { conclusion: "success" });
    await waitFor(
      () => readRevisionCoverage(fixture.mailbox)[0]?.state === "success",
      "exact success",
    );
    const result = parseReceipt(
      (
        await exec(
          process.execPath,
          [launcher, "complete-revision", fixture.mailbox, sha],
          { env: fixture.env },
        )
      ).stdout,
    );
    assert.equal(result.verdict, "success");
    assert.equal(result.effectiveEvidence.source, "exact");
    assert.equal(result.effectiveEvidence.revision.state, "success");
    assert.equal(result.shutdown.status, "confirmed");
    assertWorkerDead(fixture);
  });

  await t.test("ignored-only not_required basis success", async (t) => {
    const fixture = await setupProcessMailbox(t);
    const basisSha = "d".repeat(40);
    await register(fixture.env, fixture.mailbox);
    publishJson(join(fixture.mailbox, "coverage"), `${sha}.json`, {
      sha,
      state: "not_required",
      basis: { sha: basisSha, state: "success" },
    });
    const result = parseReceipt(
      (
        await exec(
          process.execPath,
          [launcher, "complete-revision", fixture.mailbox, sha],
          { env: fixture.env },
        )
      ).stdout,
    );
    assert.equal(result.verdict, "success");
    assert.equal(result.effectiveEvidence.source, "not_required_basis");
    assert.equal(result.effectiveEvidence.revision.state, "not_required");
    assert.deepEqual(result.effectiveEvidence.basis, {
      sha: basisSha,
      state: "success",
    });
    assert.notEqual(result.verdict, "not_required");
    assert.equal(result.shutdown.status, "confirmed");
    assertWorkerDead(fixture);
  });
});
