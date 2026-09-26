import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import {
  completeRevision,
  readRevisionCoverage,
  registerPushedRevision,
} from "./ci-mailbox.mjs";
import { awaitRevision } from "./ci-mailbox-await.mjs";
import { publishJson } from "./ci-mailbox-json-file.mjs";
import {
  exec,
  parseReceipt,
  register,
} from "./ci-mailbox-await-test-fixtures.mjs";
import {
  assertWorkerAlive,
  assertWorkerDead,
  workerPid,
} from "./ci-mailbox-complete-test-fixtures.mjs";
import {
  launcher,
  mailboxWithUnrelatedWorker,
  releaseRun,
  setupProcessMailbox,
  sha,
  spawnIdleNode,
} from "./ci-mailbox-process-test-fixtures.mjs";
import { checkMailboxWorkerLiveness } from "./ci-mailbox-worker-process.mjs";
import { awaitWorkerState, waitForPidExit } from "./watch-ci-test-fixtures.mjs";

test("bounded timeout completion shuts down without claiming success", async (t) => {
  const fixture = await setupProcessMailbox(t);
  await register(fixture.env, fixture.mailbox);
  let time = 0;
  const result = await completeRevision(fixture.mailbox, sha, {
    deadlineMs: 20,
    now: () => time,
    sleep: async (duration) => {
      time += duration;
    },
    storage: fixture.env.DOUGH_CI_MAILBOX_ROOT,
  });
  assert.equal(result.unresolvedReason, "timeout");
  assert.equal(result.shutdown.status, "confirmed");
  assert.equal(result.shutdown.terminal.status, "stopped");
  assert.equal(existsSync(join(fixture.mailbox, "result.json")), true);
  assert.equal(await waitForPidExit(workerPid(fixture)), true);
});

test("invalid mailbox identity never authorizes completion shutdown", async () => {
  await assert.rejects(
    () => completeRevision("/tmp/not-a-ci-mailbox", sha),
    /CI mailbox is outside the observer directory/,
  );
});

test("permission-denied process inspection keeps a live worker observable", async (t) => {
  const child = await spawnIdleNode(t);
  const denied = () => {
    const error = new Error("spawnSync ps EPERM");
    error.code = "EPERM";
    throw error;
  };
  assert.equal(
    checkMailboxWorkerLiveness({ pid: child.pid }, "/tmp/watch-x", {
      readCommand: denied,
    }),
    "alive",
  );
});

test("a worker that exits while its command is read is dead, not unknown", async (t) => {
  const child = await spawnIdleNode(t);
  // This process cannot reap the child while the read runs synchronously, so
  // the killed child stays a zombie, as an exiting detached worker does.
  const exitsDuringRead = (pid) => {
    child.kill("SIGKILL");
    const state = () =>
      execFileSync("ps", ["-p", String(pid), "-o", "stat="], {
        encoding: "utf8",
      }).trim();
    while (!state().startsWith("Z"));
    // An exiting process can show neither its worker command nor `<defunct>`.
    return "[node]";
  };
  assert.equal(
    checkMailboxWorkerLiveness({ pid: child.pid }, "/tmp/watch-x", {
      readCommand: exitsDuringRead,
    }),
    "dead",
  );
});

// An exiting worker that is not yet a zombie can still show that it exited:
// Linux reports a multithreaded process whose main thread exited as `Sl`, with
// that thread's command shown as defunct; macOS shows it by its bare name in
// parentheses once its arguments are gone.
for (const [exiting, command] of [
  [
    "whose main thread exited while other threads unwind",
    "[MainThread] <defunct>",
  ],
  ["whose arguments are gone while it exits", "(node)"],
]) {
  test(`a worker ${exiting} is dead`, async (t) => {
    const child = await spawnIdleNode(t);
    assert.equal(
      checkMailboxWorkerLiveness({ pid: child.pid }, "/tmp/watch-x", {
        readCommand: () => command,
      }),
      "dead",
    );
  });
}

test("await-revision remains read-only while complete-revision owns shutdown", async (t) => {
  const fixture = await setupProcessMailbox(t);
  await register(fixture.env, fixture.mailbox);
  releaseRun(fixture.directory, { conclusion: "success" });
  await awaitWorkerState(
    fixture.mailbox,
    () => readRevisionCoverage(fixture.mailbox)[0]?.state === "success",
    "success coverage",
  );
  const awaited = parseReceipt(
    (
      await exec(
        process.execPath,
        [launcher, "await-revision", fixture.mailbox, sha],
        { env: fixture.env },
      )
    ).stdout,
  );
  assert.equal(awaited.verdict, "success");
  assert.equal(awaited.shutdown, undefined);
  assert.equal(existsSync(join(fixture.mailbox, "result.json")), false);
  assertWorkerAlive(fixture);

  const completed = await awaitRevision(fixture.mailbox, sha, {
    storage: fixture.env.DOUGH_CI_MAILBOX_ROOT,
  });
  assert.equal(completed.verdict, "success");
  assert.equal(existsSync(join(fixture.mailbox, "result.json")), false);
});

test("unreadable and unavailable outcomes stay unresolved and still shut down", async (t) => {
  await t.test("evidence_unreadable", async (t) => {
    const fixture = await setupProcessMailbox(t);
    await register(fixture.env, fixture.mailbox);
    writeFileSync(join(fixture.mailbox, "coverage", `${sha}.json`), "not json");
    const result = await completeRevision(fixture.mailbox, sha, {
      storage: fixture.env.DOUGH_CI_MAILBOX_ROOT,
    });
    assert.equal(result.unresolvedReason, "evidence_unreadable");
    assert.notEqual(result.verdict, "success");
    assert.equal(result.verdict, undefined);
    assert.ok(
      result.shutdown.status === "confirmed" ||
        result.shutdown.status === "unconfirmed",
    );
    assert.notEqual(result.shutdown.status, "retained");
    // Restore readable coverage so the process-mailbox teardown stop can run.
    publishJson(join(fixture.mailbox, "coverage"), `${sha}.json`, {
      sha,
      state: "undiscovered",
    });
  });

  await t.test("observation_unavailable", async (t) => {
    const fixture = await setupProcessMailbox(t);
    await register(fixture.env, fixture.mailbox);
    publishJson(fixture.mailbox, "result.json", {
      status: "finished",
      coverage: { state: "ended", pendingCi: "unobserved" },
      evidence: { recordedThrough: 0, deliveredThrough: 0, unread: 0 },
    });
    const result = await completeRevision(fixture.mailbox, sha, {
      storage: fixture.env.DOUGH_CI_MAILBOX_ROOT,
      workerLiveness: () => "alive",
    });
    assert.equal(result.unresolvedReason, "observation_unavailable");
    assert.equal(result.detail, "observation_ended");
    assert.notEqual(result.verdict, "success");
    assert.ok(
      result.shutdown.status === "confirmed" ||
        result.shutdown.status === "unconfirmed",
    );
  });
});

test("unconfirmed shutdown names the limitation and does not stop another worker", async (t) => {
  const { directory, storage, unrelated } = await mailboxWithUnrelatedWorker(t);
  registerPushedRevision(directory, sha);
  publishJson(join(directory, "coverage"), `${sha}.json`, {
    sha,
    state: "success",
    checkedBy: { runId: 1, attemptId: 1 },
  });
  const result = await completeRevision(directory, sha, {
    root: process.cwd(),
    storage,
  });
  assert.equal(result.verdict, "success");
  assert.equal(result.shutdown.status, "unconfirmed");
  assert.match(
    String(result.shutdown.limitation),
    /does not match this mailbox|observer/,
  );
  assert.doesNotThrow(() => process.kill(unrelated.pid, 0));
  // Mailbox resources remain; no confirmed terminal cleanup ownership claimed.
  assert.equal(existsSync(directory), true);
});

test("a quiet gap without completion leaves the worker alive; explicit stop stays separate", async (t) => {
  const fixture = await setupProcessMailbox(t, undefined, {
    observeWorkerRechecks: true,
  });
  await register(fixture.env, fixture.mailbox);
  // The quiet gap is one full observation pass over the registered revision's
  // still-running CI, ending in the worker's pause before its next recheck.
  releaseRun(fixture.directory, { status: "in_progress", conclusion: null });
  await awaitWorkerState(
    fixture.mailbox,
    () => existsSync(join(fixture.directory, "worker-rechecking")),
    "worker recheck pause",
  );
  assert.equal(readRevisionCoverage(fixture.mailbox)[0]?.state, "pending");
  assertWorkerAlive(fixture);
  assert.equal(existsSync(join(fixture.mailbox, "result.json")), false);

  const stopped = parseReceipt(
    (
      await exec(process.execPath, [launcher, "stop", fixture.mailbox], {
        env: fixture.env,
      })
    ).stdout,
  );
  assert.equal(stopped.terminal.status, "stopped");
  assertWorkerDead(fixture);
  // Eight-hour observer budget is owned by watch-ci-execution-coverage.test.mjs
  // ("the declared execution budget expires once…", assert.equal(executionBudgetMs, 8 * 60 * 60 * 1000)).
});
