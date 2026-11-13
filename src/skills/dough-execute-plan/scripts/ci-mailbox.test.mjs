import assert from "node:assert/strict";
import fs, {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { syncBuiltinESMExports } from "node:module";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { test } from "node:test";
import { setImmediate } from "node:timers/promises";
import {
  checkoutRoot,
  createMailbox,
  mailboxRoot,
  publishMailboxEvent,
  readMailbox,
  readMailboxEvents,
  readWorkerIdentity,
  registerPushedRevision,
  recordWorkerIdentity,
  requestMailboxStop,
  runMailboxWorker,
} from "./ci-mailbox.mjs";
import {
  terminalResultDeadlineMs,
  waitForTerminalResult,
} from "./ci-mailbox-store.mjs";
import { overrideTerminalResultDeadline } from "./ci-mailbox-complete-test-fixtures.mjs";

function createTestMailbox(t, request = {}) {
  const storage = mkdtempSync(join(tmpdir(), "ci-mailbox-test-"));
  t.after(() => rmSync(storage, { recursive: true, force: true }));
  const options = { root: "/test/example", storage };
  return { directory: createMailbox(request, options), options };
}

test("a mailbox under a process TMPDIR is outside the shared observer directory", (t) => {
  const nixTmp = mkdtempSync(join(tmpdir(), "nix-shell-"));
  t.after(() => rmSync(nixTmp, { recursive: true, force: true }));
  const directory = createMailbox(
    { probe: true },
    { root: checkoutRoot, storage: nixTmp },
  );
  assert.notEqual(resolve(directory, ".."), resolve(mailboxRoot));
  assert.throws(
    () => readMailbox(directory),
    /CI mailbox is outside the observer directory/,
  );
});

test("event evidence is appendable and independent of worker status", (t) => {
  const { directory } = createTestMailbox(t);
  const failure = { type: "CI_FAILURE", runId: 42, attempt: 1 };
  publishMailboxEvent(directory, failure);
  publishMailboxEvent(directory, { type: "CI_INCOMPLETE", runId: 43 });
  assert.deepEqual(readMailboxEvents(directory), [
    { sequence: 1, event: failure },
    { sequence: 2, event: { type: "CI_INCOMPLETE", runId: 43 } },
  ]);
  assert.equal(existsSync(join(directory, "result.json")), false);
});

test("worker identity is retained as one cohesive mailbox record", (t) => {
  const { directory } = createTestMailbox(t);
  recordWorkerIdentity(directory, { pid: 42 });
  assert.deepEqual(readWorkerIdentity(directory), { pid: 42 });
});

test("terminal result remains observable when its file notification is missed", async (t) => {
  const { directory, options } = createTestMailbox(t);
  const terminal = { status: "stopped" };
  const terminalRecord = join(options.storage, "terminal-record.json");
  symlinkSync(terminalRecord, join(directory, "result.json"));
  const lifecycleDeadline = new AbortController();
  let received;
  const waiting = waitForTerminalResult(directory, {
    deadline: lifecycleDeadline.signal,
  }).then((result) => {
    received = result;
    return result;
  });

  writeFileSync(terminalRecord, JSON.stringify(terminal));
  lifecycleDeadline.abort();
  await setImmediate();

  if (!received) {
    writeFileSync(join(directory, "notification-wakeup"), "");
    await waiting;
    assert.fail(
      "terminal wait did not consult result.json at the lifecycle deadline",
    );
  }
  assert.deepEqual(received, terminal);
});

test("the terminal result deadline stays 5 s unless a test shortens it", (t) => {
  const setDeadline = overrideTerminalResultDeadline(t);
  setDeadline(undefined);
  assert.equal(terminalResultDeadlineMs(), 5_000);
  for (const invalid of ["", "0", "-1", "soon"]) {
    setDeadline(invalid);
    assert.equal(terminalResultDeadlineMs(), 5_000, invalid);
  }
  setDeadline("300");
  assert.equal(terminalResultDeadlineMs(), 300);
});

test("stopping an active watcher records no failure event", async (t) => {
  const { directory, options } = createTestMailbox(t, { mode: "execution" });
  let started;
  const ready = new Promise((resolve) => {
    started = resolve;
  });
  const running = runMailboxWorker(directory, {
    ...options,
    observe: ({ signal }) =>
      // eslint-disable-next-line no-unused-vars -- Promise rejection is the cancellation signal.
      new Promise((resolve, reject) => {
        signal.addEventListener("abort", () => reject(signal.reason), {
          once: true,
        });
        started();
      }),
  });
  await ready;
  requestMailboxStop(directory, options);
  await running;
  assert.deepEqual(JSON.parse(readFileSync(join(directory, "result.json"))), {
    status: "stopped",
    coverage: { state: "ended", pendingCi: "unobserved" },
    evidence: { recordedThrough: 0, deliveredThrough: 0, unread: 0 },
  });
  assert.deepEqual(readMailboxEvents(directory), []);
});

test("a stop requested before worker startup does not start observation", async (t) => {
  const { directory, options } = createTestMailbox(t, { mode: "execution" });
  requestMailboxStop(directory, options);
  await runMailboxWorker(directory, {
    ...options,
    observe: async () => assert.fail("observation should not start"),
  });
  assert.deepEqual(JSON.parse(readFileSync(join(directory, "result.json"))), {
    status: "stopped",
    coverage: { state: "ended", pendingCi: "unobserved" },
    evidence: { recordedThrough: 0, deliveredThrough: 0, unread: 0 },
  });
});

// Calls `onOpen` as `run` opens each directory watch. On macOS a busy
// fseventsd can hold or miss a directory notification, and closing a watch
// blocks the process for seconds, so the mailbox's own waits poll instead.
async function onWatchOpened(t, onOpen, run) {
  const { watch } = fs;
  t.mock.method(fs, "watch", (...args) => {
    onOpen(args[0]);
    return watch(...args);
  });
  syncBuiltinESMExports();
  try {
    await run();
  } finally {
    t.mock.restoreAll();
    syncBuiltinESMExports();
  }
}

test("a stopped worker publishes its terminal result without a directory watch", async (t) => {
  const { directory, options } = createTestMailbox(t, { mode: "execution" });
  const watched = [];
  await onWatchOpened(t, watched.push.bind(watched), async () => {
    requestMailboxStop(directory, options);
    await runMailboxWorker(directory, {
      ...options,
      observe: async () => assert.fail("observation should not start"),
    });
  });
  assert.deepEqual(watched, []);
  assert.equal(existsSync(join(directory, "result.json")), true);
});

// An opened watch counts as one notified only after the deadline.
test("the terminal wait reads its result without a directory notification", async (t) => {
  const { directory } = createTestMailbox(t);
  const terminal = { status: "stopped" };
  const lifecycleDeadline = new AbortController();
  const deadlineFirst = () => queueMicrotask(() => lifecycleDeadline.abort());
  await onWatchOpened(t, deadlineFirst, async () => {
    const waiting = waitForTerminalResult(directory, {
      deadline: lifecycleDeadline.signal,
    });
    await setImmediate();
    writeFileSync(join(directory, "result.json"), JSON.stringify(terminal));
    assert.deepEqual(await waiting, terminal);
  });
});

test("shutdown reports a registered but undiscovered revision as unproved", async (t) => {
  const { directory, options } = createTestMailbox(t, { mode: "execution" });
  const sha = "d".repeat(40);
  registerPushedRevision(directory, sha);
  requestMailboxStop(directory, options);
  await runMailboxWorker(directory, {
    ...options,
    observe: async () => assert.fail("observation should not start"),
  });
  assert.deepEqual(JSON.parse(readFileSync(join(directory, "result.json"))), {
    status: "stopped",
    coverage: {
      state: "ended",
      pendingCi: "unobserved",
      unproved: [{ sha, state: "undiscovered" }],
    },
    evidence: { recordedThrough: 0, deliveredThrough: 0, unread: 0 },
  });
});

test("a worker error records monitoring unavailability", async (t) => {
  const { directory, options } = createTestMailbox(t);
  await runMailboxWorker(directory, {
    ...options,
    observe: async () => {
      throw new Error("broken observer");
    },
  });
  assert.deepEqual(JSON.parse(readFileSync(join(directory, "result.json"))), {
    status: "finished",
  });
  assert.equal(
    readMailboxEvents(directory)[0].event.type,
    "CI_MONITOR_UNAVAILABLE",
  );
});
