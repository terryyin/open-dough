import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import {
  mailboxWorkerLoss,
  publishMailboxEvent,
  readMailboxEvents,
  readRevisionCoverage,
  readWorkerIdentity,
  workerLossReason,
} from "./ci-mailbox.mjs";
import {
  exec,
  launcher,
  mailboxWithUnrelatedWorker,
  sha,
  setupProcessMailbox,
  spawnIdleNode,
} from "./ci-mailbox-process-test-fixtures.mjs";
import {
  awaitWorkerSignal,
  waitForFile,
  waitForPidExit,
} from "./watch-ci-test-fixtures.mjs";

test("a reused worker pid is not signaled when it does not belong to the mailbox", async (t) => {
  const { directory, storage, unrelated } = await mailboxWithUnrelatedWorker(t);
  const retained = { type: "CI_FAILURE", runId: 41, attempt: 1 };
  publishMailboxEvent(directory, retained);

  await assert.rejects(
    exec(process.execPath, [launcher, "stop", directory], {
      env: { ...process.env, DOUGH_CI_MAILBOX_ROOT: storage },
    }),
    /does not match this mailbox/,
  );

  assert.doesNotThrow(() => process.kill(unrelated.pid, 0));
  assert.equal(existsSync(join(directory, "result.json")), false);
  assert.deepEqual(readMailboxEvents(directory), [
    { sequence: 1, event: retained },
  ]);
});

test("a mismatched worker identity yields uncertainty instead of reassurance or termination", async (t) => {
  const { directory, unrelated } = await mailboxWithUnrelatedWorker(t);

  assert.equal(mailboxWorkerLoss(directory), undefined);
  assert.equal(existsSync(join(directory, "result.json")), false);
  assert.doesNotThrow(() => process.kill(unrelated.pid, 0));
});

test("a detached worker that dies is reported lost at the next ordinary interaction, and a repeated receipt does not restore attachment", async (t) => {
  const { directory, mailbox, stdout, deliver, env } =
    await setupProcessMailbox(t, [
      "--execution",
      "owner/repo",
      "main",
      "60000",
    ]);
  await awaitWorkerSignal(mailbox, join(directory, "started"));

  const attached = await deliver("claude", stdout);
  assert.match(
    JSON.stringify(attached),
    /CI observer attached to this coordinator/,
  );

  await exec(process.execPath, [launcher, "register-push", mailbox, sha], {
    env,
  });
  const retained = { type: "CI_FAILURE", runId: 41, attempt: 1 };
  publishMailboxEvent(mailbox, retained);

  const { pid } = readWorkerIdentity(mailbox);
  const githubPid = Number(readFileSync(join(directory, "github-pid"), "utf8"));
  process.kill(pid, "SIGKILL");
  assert.equal(await waitForPidExit(pid), true);
  assert.equal(
    await waitForPidExit(githubPid),
    true,
    "the blocked GitHub fixture exits with its killed worker",
  );

  // Plain filesystem writes to the mailbox still work once the worker is gone.
  const otherSha = "b".repeat(40);
  const { stdout: pushReceipt } = await exec(
    process.execPath,
    [launcher, "register-push", mailbox, otherSha],
    { env },
  );
  assert.match(pushReceipt, /^CI_OBSERVER /);
  assert.deepEqual(
    readRevisionCoverage(mailbox)
      .map(({ sha: revisionSha }) => revisionSha)
      .sort(),
    [sha, otherSha].sort(),
  );

  const lostOrdinary = await deliver("claude");
  assert.match(JSON.stringify(lostOrdinary), /CI observer lost its worker/);
  assert.doesNotMatch(JSON.stringify(lostOrdinary), /attached to this/);
  assert.match(
    lostOrdinary.hookSpecificOutput.additionalContext,
    /"type":"CI_FAILURE"/,
  );

  const repeated = await deliver("claude", stdout);
  assert.match(JSON.stringify(repeated), /CI observer lost its worker/);
  assert.doesNotMatch(JSON.stringify(repeated), /attached to this/);

  const unrelated = await spawnIdleNode(t);

  const { stdout: stopReceipt } = await exec(
    process.execPath,
    [launcher, "stop", mailbox],
    { env },
  );
  const terminal = JSON.parse(
    stopReceipt.slice("CI_OBSERVER ".length),
  ).terminal;
  assert.equal(terminal.status, "stopped");
  assert.equal(terminal.coverage.state, "lost");
  assert.equal(terminal.coverage.reason, workerLossReason);
  assert.deepEqual(
    [...terminal.coverage.unproved].sort((a, b) => a.sha.localeCompare(b.sha)),
    [
      { sha, state: "undiscovered" },
      { sha: otherSha, state: "undiscovered" },
    ].sort((a, b) => a.sha.localeCompare(b.sha)),
  );
  assert.deepEqual(readMailboxEvents(mailbox), [
    { sequence: 1, event: retained },
  ]);

  assert.doesNotThrow(() => process.kill(unrelated.pid, 0));
});

test("a normally stopped detached observer keeps ended coverage, not lost, at the next ordinary interaction", async (t) => {
  const { directory, mailbox, stdout, deliver, env } =
    await setupProcessMailbox(t);
  await awaitWorkerSignal(mailbox, join(directory, "started"));
  await deliver("claude", stdout);

  await exec(process.execPath, [launcher, "stop", mailbox], { env });
  await waitForFile(join(directory, "request-stopped"));

  const after = await deliver("claude");
  assert.deepEqual(after, {});
  const terminal = JSON.parse(readFileSync(join(mailbox, "result.json")));
  assert.equal(terminal.coverage.state, "ended");
});
