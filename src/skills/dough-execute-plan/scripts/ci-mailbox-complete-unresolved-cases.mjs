import assert from "node:assert/strict";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { test } from "node:test";
import {
  completeRevision,
  createMailbox,
  readRevisionCoverage,
  recordWorkerIdentity,
  registerPushedRevision,
} from "./ci-mailbox.mjs";
import { awaitRevision } from "./ci-mailbox-await.mjs";
import { stopMailbox } from "./ci-mailbox-complete.mjs";
import { publishJson } from "./ci-mailbox-json-file.mjs";
import {
  exec,
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
  assertWorkerDead(fixture);
});

test("invalid mailbox identity never authorizes completion shutdown", async () => {
  await assert.rejects(
    () => completeRevision("/tmp/not-a-ci-mailbox", sha),
    /CI mailbox is outside the observer directory/,
  );
});

test("permission-denied process inspection keeps a live worker observable", async (t) => {
  const { checkMailboxWorkerLiveness } =
    await import("./ci-mailbox-worker-process.mjs");
  const { spawnIdleNode } =
    await import("./ci-mailbox-process-test-fixtures.mjs");
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

test("await-revision remains read-only while complete-revision owns shutdown", async (t) => {
  const fixture = await setupProcessMailbox(t);
  await register(fixture.env, fixture.mailbox);
  releaseRun(fixture.directory, { conclusion: "success" });
  await waitFor(
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
  const { mailboxWithUnrelatedWorker } =
    await import("./ci-mailbox-process-test-fixtures.mjs");
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
  const fixture = await setupProcessMailbox(t);
  await register(fixture.env, fixture.mailbox);
  await new Promise((resolve) => setTimeout(resolve, 150));
  assertWorkerAlive(fixture);
  assert.equal(existsSync(join(fixture.mailbox, "result.json")), false);
  assert.equal(
    readRevisionCoverage(fixture.mailbox)[0]?.state === "undiscovered" ||
      readRevisionCoverage(fixture.mailbox)[0]?.state === "pending",
    true,
  );

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

test("explicit stop returns only after the worker exits the post-terminal window", async (t) => {
  const storage = mkdtempSync(join(tmpdir(), "ci-stop-exit-"));
  t.after(() => rmSync(storage, { recursive: true, force: true }));
  const directory = createMailbox(
    {
      mode: "execution",
      repo: "owner/repo",
      branch: "main",
      maxDurationMs: 60000,
    },
    { storage },
  );
  // Stub command line must match mailbox-worker identity so stop waits on it.
  const stub = join(storage, "ci-mailbox.mjs");
  writeFileSync(
    stub,
    `import { existsSync, watch, writeFileSync } from "node:fs";
import { join } from "node:path";
const directory = process.argv[3];
const check = () => {
  if (!existsSync(join(directory, "stop"))) return;
  writeFileSync(join(directory, "result.json"), JSON.stringify({ status: "stopped" }));
  setTimeout(() => process.exit(0), 300);
};
watch(directory, check);
check();
setInterval(() => {}, 1000);
`,
  );
  const child = spawn(process.execPath, [stub, "worker", directory], {
    stdio: "ignore",
  });
  t.after(() => {
    try {
      child.kill("SIGKILL");
    } catch (error) {
      if (error.code !== "ESRCH") throw error;
    }
  });
  await new Promise((resolve, reject) => {
    child.once("spawn", resolve);
    child.once("error", reject);
  });
  recordWorkerIdentity(directory, { pid: child.pid });

  const terminal = await stopMailbox(directory, { storage });
  assert.equal(terminal.status, "stopped");
  assert.throws(() => process.kill(child.pid, 0), { code: "ESRCH" });
});
