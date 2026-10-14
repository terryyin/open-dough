import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import {
  completeRevision,
  createMailbox,
  registerPushedRevision,
  workerLossReason,
} from "./ci-mailbox.mjs";
import { publishJson } from "./ci-mailbox-json-file.mjs";
import { stopMailbox } from "./ci-mailbox-complete.mjs";
import {
  mailboxWithUnrelatedWorker,
  sha,
} from "./ci-mailbox-process-test-fixtures.mjs";
import {
  checkMailboxWorkerLiveness,
  terminateMailboxWorker,
} from "./ci-mailbox-worker-process.mjs";
import { shownProcessSync } from "./process-table.mjs";
import { fixtureTeardown } from "./fixture-teardown-test-fixtures.mjs";
import {
  startStubWorker,
  publishThenExitSource,
} from "./ci-mailbox-stub-worker-test-fixtures.mjs";

// A mailbox whose recorded worker is a stub started from `source`, with a
// command line matching a mailbox worker's so stop treats it as one. It
// returns once the stub has run `source`, so the stub already watches for
// the stop request that a test then makes.
async function mailboxWithStubWorker(t, source) {
  const storage = mkdtempSync(join(tmpdir(), "ci-stop-exit-"));
  const teardown = fixtureTeardown(storage);
  t.after(teardown.cleanup);
  const directory = createMailbox(
    {
      mode: "execution",
      repo: "owner/repo",
      branch: "main",
      maxDurationMs: 60000,
    },
    { storage },
  );
  const child = await startStubWorker({
    root: storage,
    directory,
    teardown,
    source,
  });
  return { storage, directory, child };
}

test("explicit stop returns only after the worker exits the post-terminal window", async (t) => {
  const { storage, directory, child } = await mailboxWithStubWorker(
    t,
    publishThenExitSource(),
  );

  const terminal = await stopMailbox(directory, { storage });
  assert.equal(terminal.status, "stopped");
  assert.equal(
    checkMailboxWorkerLiveness({ pid: child.pid }, directory),
    "dead",
  );
});

test("explicit stop returns only after a worker showing a transient command while exiting is gone", async (t) => {
  // Linux can show an exiting worker, not yet a zombie, by its bare bracketed
  // name once its arguments are released; the stub holds that view briefly.
  const { storage, directory, child } = await mailboxWithStubWorker(
    t,
    publishThenExitSource({ exitingCommand: "[node]" }),
  );

  const terminal = await stopMailbox(directory, { storage });
  assert.equal(terminal.status, "stopped");
  assert.equal(
    checkMailboxWorkerLiveness({ pid: child.pid }, directory),
    "dead",
  );
});

test("completion does not confirm shutdown for a worker whose liveness stays unknown past the exit wait", async (t) => {
  // The transient command outlasts the one-second exit wait, so the observer
  // is neither known gone nor known running when the receipt is written.
  const { storage, directory } = await mailboxWithStubWorker(
    t,
    publishThenExitSource({ exitingCommand: "[node]", exitDelayMs: 2500 }),
  );
  registerPushedRevision(directory, sha);
  publishJson(join(directory, "coverage"), `${sha}.json`, {
    sha,
    state: "success",
    checkedBy: { runId: 1, attemptId: 1 },
  });

  const result = await completeRevision(directory, sha, { storage });
  assert.equal(result.verdict, "success");
  assert.equal(result.shutdown.status, "unconfirmed");
  assert.equal(result.shutdown.limitation, "observer_liveness_unknown");
});

test("stop ends when the worker exits without publishing and reports it lost", async (t) => {
  const { storage, directory, child } = await mailboxWithStubWorker(
    t,
    `import { existsSync, watch } from "node:fs";
import { join } from "node:path";
const directory = process.argv[3];
const check = () => {
  if (existsSync(join(directory, "stop"))) process.exit(1);
};
watch(directory, check);
check();
setInterval(() => {}, 1000);
`,
  );

  const terminal = await stopMailbox(directory, { storage });
  assert.equal(terminal.coverage.state, "lost");
  assert.equal(terminal.coverage.reason, workerLossReason);
  assert.equal(
    checkMailboxWorkerLiveness({ pid: child.pid }, directory),
    "dead",
  );
});

test("stop reports a worker lost when it shows a transient command while exiting", async (t) => {
  const {
    directory,
    storage,
    unrelated: worker,
  } = await mailboxWithUnrelatedWorker(t);
  const reads = [
    // Departure's read sees macOS's exiting form: the worker is gone.
    () => "(node)",
    // Termination's read catches the same worker later in its exit, showing
    // neither its worker command nor an exit form; then it stops running.
    (pid) => {
      worker.kill("SIGKILL");
      // This process cannot reap the child while the read runs synchronously,
      // so the killed child stays a zombie, as an exiting detached worker does.
      while (
        !execFileSync("ps", ["-p", String(pid), "-o", "stat="], {
          encoding: "utf8",
        })
          .trim()
          .startsWith("Z")
      );
      return "[node]";
    },
  ];
  const readCommand = (pid) => {
    const read = reads.shift();
    assert.ok(read, "stop read the worker command more than twice");
    return read(pid);
  };

  const terminal = await stopMailbox(directory, { storage, readCommand });
  assert.equal(terminal.coverage.state, "lost");
  assert.equal(terminal.coverage.reason, workerLossReason);
  assert.deepEqual(reads, []);
});

test("a worker whose identity changes after TERM is never killed", async (t) => {
  const { directory, child } = await mailboxWithStubWorker(
    t,
    "process.on('SIGTERM', () => {}); setInterval(() => {}, 1000);",
  );
  let reads = 0;
  const readCommand = (pid) => {
    const command = shownProcessSync(pid)?.command;
    return ++reads === 1 ? command : "another process";
  };

  await assert.rejects(
    terminateMailboxWorker({ pid: child.pid }, directory, { readCommand }),
    /does not match this mailbox/,
  );
  assert.equal(reads, 2);
  assert.doesNotThrow(() => process.kill(child.pid, 0));
  assert.equal(child.exitCode, null);
  assert.equal(child.signalCode, null);
});
