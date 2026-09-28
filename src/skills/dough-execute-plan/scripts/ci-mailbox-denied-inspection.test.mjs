// A sandbox such as macOS `sandbox-exec` denies running the setuid `ps`, so
// every process-table read fails with EPERM or EACCES while signal probes
// still work. Observation, delivery, and completion keep a live worker
// observable and never signal a process they could not verify.
import assert from "node:assert/strict";
import childProcess from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { syncBuiltinESMExports } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import {
  completeRevision,
  readRevisionCoverage,
  readWorkerIdentity,
} from "./ci-mailbox.mjs";
import { stopMailbox } from "./ci-mailbox-complete.mjs";
import { register } from "./ci-mailbox-await-test-fixtures.mjs";
import {
  mailboxWithUnrelatedWorker,
  releaseRun,
  setupProcessMailbox,
  sha,
  spawnIdleNode,
} from "./ci-mailbox-process-test-fixtures.mjs";
import { overrideTerminalResultDeadline } from "./ci-mailbox-complete-test-fixtures.mjs";
import {
  checkMailboxWorkerLiveness,
  terminateMailboxWorker,
  withStreamWorkerIdentity,
} from "./ci-mailbox-worker-process.mjs";
import {
  createManagedFixture,
  git,
} from "./execution-increment-managed-delivery-test-fixtures.mjs";

// Fails `ps` the way a sandboxed spawn does, for this process's code only;
// every other command, including the observer worker, runs unchanged.
function failPs(t, code) {
  const original = childProcess.execFileSync;
  childProcess.execFileSync = (file, ...rest) => {
    if (file === "ps")
      throw Object.assign(new Error(`spawnSync ps ${code}`), {
        code,
        errno: -1,
        syscall: "spawnSync ps",
        status: null,
      });
    return original(file, ...rest);
  };
  syncBuiltinESMExports();
  t.after(() => {
    childProcess.execFileSync = original;
    syncBuiltinESMExports();
  });
}

for (const code of ["EPERM", "EACCES"]) {
  test(`${code} process inspection keeps a live worker alive and an exited one dead`, async (t) => {
    const live = await spawnIdleNode(t);
    const exited = await spawnIdleNode(t);
    exited.kill("SIGKILL");
    await new Promise((resolve) => exited.once("exit", resolve));
    failPs(t, code);
    assert.equal(
      checkMailboxWorkerLiveness({ pid: live.pid }, "/tmp/watch-x"),
      "alive",
    );
    assert.equal(
      checkMailboxWorkerLiveness({ pid: exited.pid }, "/tmp/watch-x"),
      "dead",
    );
  });
}

test("a process-inspection failure other than permission still surfaces", async (t) => {
  const live = await spawnIdleNode(t);
  failPs(t, "ENOENT");
  assert.throws(
    () => checkMailboxWorkerLiveness({ pid: live.pid }, "/tmp/watch-x"),
    /spawnSync ps ENOENT/,
  );
});

test("an unverifiable worker is never signaled", async (t) => {
  const live = await spawnIdleNode(t);
  failPs(t, "EPERM");
  await terminateMailboxWorker({ pid: live.pid }, "/tmp/watch-x");
  assert.doesNotThrow(() => process.kill(live.pid, 0));
});

test("stop without a terminal result keeps an unverifiable worker and records lost coverage", async (t) => {
  const { directory, storage, unrelated } = await mailboxWithUnrelatedWorker(t);
  overrideTerminalResultDeadline(t)("50");
  failPs(t, "EPERM");
  const terminal = await stopMailbox(directory, { storage });
  assert.equal(terminal.coverage.state, "lost");
  assert.doesNotThrow(() => process.kill(unrelated.pid, 0));
});

test("a stream worker records its identity when inspection is denied", async (t) => {
  const directory = mkdtempSync(join(tmpdir(), "dough-denied-stream-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  failPs(t, "EPERM");
  const identity = await withStreamWorkerIdentity(directory, async () =>
    readWorkerIdentity(directory),
  );
  assert.deepEqual(identity, { pid: process.pid, mode: "stream" });
});

test("complete-revision waits and shuts down under denied inspection", async (t) => {
  const fixture = await setupProcessMailbox(t);
  await register(fixture.env, fixture.mailbox);
  failPs(t, "EPERM");
  const completing = completeRevision(fixture.mailbox, sha, {
    storage: fixture.env.DOUGH_CI_MAILBOX_ROOT,
  });
  releaseRun(fixture.directory, { conclusion: "success" });
  const result = await completing;
  assert.equal(result.verdict, "success");
  assert.equal(result.shutdown.status, "confirmed");
  assert.equal(result.shutdown.terminal.status, "stopped");
});

test("managed delivery establishes and then reuses observation under denied inspection", async (t) => {
  const fixture = await createManagedFixture();
  t.after(fixture.cleanup);
  failPs(t, "EPERM");
  const request = {
    ...fixture.requestBase,
    workspace: fixture.execution,
    branch: "exec/story",
    targetRef: "refs/heads/main",
    repo: "owner/project",
  };

  const first = await fixture.deliverManagedExecutionIncrement({
    ...request,
    previouslyPublishedBase: fixture.trunkSha,
  });
  assert.equal(first.observation.state, "attached");

  writeFileSync(join(fixture.execution, "second.txt"), "second increment\n");
  await git(fixture.execution, "add", "second.txt");
  await git(fixture.execution, "commit", "-m", "second verified increment");
  const second = await fixture.deliverManagedExecutionIncrement({
    ...request,
    previouslyPublishedBase: first.receipt.sha,
  });
  assert.equal(second.observation.state, "reused");
  assert.equal(second.observation.directory, first.observation.directory);
  assert.equal(readRevisionCoverage(second.observation.directory).length, 2);
});
