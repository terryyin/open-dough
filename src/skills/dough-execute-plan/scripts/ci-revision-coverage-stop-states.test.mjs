import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { promisify } from "node:util";
import {
  createRevisionCoverageFixture,
  git,
} from "./ci-revision-coverage-test-fixtures.mjs";

const exec = promisify(execFile);

test("stop reports one pending and one undiscovered revision without waiting", async (t) => {
  const {
    project,
    storage,
    directory,
    mailbox,
    worker,
    deliver,
    advancePoll,
    setAttempts,
  } = await createRevisionCoverageFixture(t);
  const launcher = join(
    project,
    ".agents/skills/dough-execute-plan/scripts/ci-mailbox.mjs",
  );

  const shaPending = await deliver();
  writeFileSync(join(project, "application.txt"), "B\n");
  await git(project, "commit", "-am", "revision never discovered");
  const shaUndiscovered = await deliver();

  setAttempts([
    {
      runId: "run:pending",
      attemptId: "attempt/pending",
      sha: shaPending,
      outcome: "pending",
    },
  ]);
  await advancePoll(2);
  assert.deepEqual(
    mailbox
      .readRevisionCoverage(directory)
      .map(({ sha, state }) => ({ sha, state }))
      .sort((a, b) => a.sha.localeCompare(b.sha)),
    [
      { sha: shaPending, state: "pending" },
      { sha: shaUndiscovered, state: "undiscovered" },
    ].sort((a, b) => a.sha.localeCompare(b.sha)),
  );

  const started = Date.now();
  const { stdout } = await exec(
    process.execPath,
    [launcher, "stop", directory],
    {
      cwd: project,
      env: { ...process.env, DOUGH_CI_MAILBOX_ROOT: storage },
      timeout: 10_000,
    },
  );
  await worker;
  assert.ok(Date.now() - started < 10_000, "stop must not wait for CI");

  const expectedUnproved = [
    { sha: shaPending, state: "pending" },
    { sha: shaUndiscovered, state: "undiscovered" },
  ].sort((a, b) => a.sha.localeCompare(b.sha));
  const receipt = JSON.parse(stdout.slice(mailbox.receiptPrefix.length));
  assert.equal(receipt.terminal.status, "stopped");
  assert.equal(receipt.terminal.coverage.pendingCi, "unobserved");
  assert.deepEqual(
    [...receipt.terminal.coverage.unproved].sort((a, b) =>
      a.sha.localeCompare(b.sha),
    ),
    expectedUnproved,
  );

  const terminal = JSON.parse(
    readFileSync(join(directory, "result.json"), "utf8"),
  );
  assert.equal(terminal.coverage.pendingCi, "unobserved");
  assert.deepEqual(
    [...terminal.coverage.unproved].sort((a, b) => a.sha.localeCompare(b.sha)),
    expectedUnproved,
  );
});
