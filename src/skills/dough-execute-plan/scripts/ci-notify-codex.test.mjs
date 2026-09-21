import assert from "node:assert/strict";
import { test } from "node:test";
import { runDocumentedCodexHostBinding } from "./ci-notify-codex-test-fixtures.mjs";

test("documented Codex host binding notifies pre-yield events after yield, then fragmented later events, with one launch", async () => {
  const key = "ci-watch-execution:OWNER/REPO:BRANCH:COORDINATOR";
  const mailbox = "/tmp/observer/watch-1";
  const stream = [
    `CI_OBSERVER ${JSON.stringify({ directory: mailbox, pid: 9 })}\n`,
    `${JSON.stringify({ sequence: 1, event: { type: "CI_FAILURE", runId: 41 } })}\n`,
    `${JSON.stringify({ sequence: 2, event: { type: "CI_INCOMPLETE", runId: 42 } })}\n`,
    `CI_OBSERVER_RESULT ${JSON.stringify({ directory: mailbox, terminal: { status: "stopped" } })}\n`,
  ].join("");
  const firstEventEnd = stream.indexOf("\n", stream.indexOf("\n") + 1) + 1;
  const launches = [];
  const notifications = [];
  const texts = [];
  const stores = [];
  let yielded = false;
  let writes = 0;

  const result = await runDocumentedCodexHostBinding({
    load: () => undefined,
    store: (storedKey, value) => stores.push([storedKey, value]),
    text: (value) => texts.push({ ...value, yielded }),
    notify: (event) => notifications.push({ event, yielded }),
    yield_control: async () => {
      yielded = true;
    },
    tools: {
      exec_command: async (request) => {
        launches.push(request);
        return { output: stream.slice(0, firstEventEnd), session_id: "sess-1" };
      },
      write_stdin: async (request) => {
        writes += 1;
        assert.equal(request.session_id, "sess-1");
        assert.equal(request.chars, "");
        assert.equal(request.tty, undefined);
        assert.equal(yielded, true);
        if (writes === 1)
          return {
            output: stream.slice(firstEventEnd, firstEventEnd + 7),
            session_id: "sess-1",
          };
        return {
          output: stream.slice(firstEventEnd + 7),
          session_id: undefined,
        };
      },
    },
  });

  assert.deepEqual(result, { completed: true });
  assert.equal(launches.length, 1);
  assert.equal(
    launches[0].cmd,
    "node /ABSOLUTE/RESOLVED/SKILL/scripts/ci-mailbox.mjs stream --execution OWNER/REPO BRANCH",
  );
  assert.equal(launches[0].workdir, "/ABSOLUTE/VERIFIED/CHECKOUT_ROOT");
  assert.equal(launches[0].tty, true);
  assert.equal(writes, 2);
  assert.equal(texts.length, 1);
  assert.equal(texts[0].yielded, false);
  assert.equal(texts[0].status, "watching");
  assert.equal(texts[0].sessionId, "sess-1");
  assert.equal(texts[0].directory, mailbox);
  assert.equal(texts[0].pid, 9);
  assert.deepEqual(
    notifications.map(({ event, yielded: afterYield }) => ({
      event,
      afterYield,
    })),
    [
      { event: { type: "CI_FAILURE", runId: 41 }, afterYield: true },
      { event: { type: "CI_INCOMPLETE", runId: 42 }, afterYield: true },
    ],
  );
  assert.equal(stores.length, 1);
  assert.equal(stores[0][0], key);
  assert.equal(stores[0][1].status, "stopped");
  assert.equal(stores[0][1].sessionId, undefined);
  assert.equal(stores[0][1].directory, mailbox);
  assert.equal(stores[0][1].pid, 9);
  assert.equal(stores[0][1].tail, "");
  assert.deepEqual(stores[0][1].terminal, { status: "stopped" });
});

test("documented Codex host binding reports bounded unavailability from one failed launch", async () => {
  const key = "ci-watch-execution:OWNER/REPO:BRANCH:COORDINATOR";
  const launches = [];
  const notifications = [];
  const stores = [];
  const reason = "bridge missing ".repeat(80);

  const result = await runDocumentedCodexHostBinding({
    load: () => undefined,
    store: (storedKey, value) => stores.push([storedKey, value]),
    text: () => {
      throw new Error("text must not run after a failed launch");
    },
    notify: (event) => notifications.push(event),
    yield_control: async () => {
      throw new Error("yield must not run after a failed launch");
    },
    tools: {
      exec_command: async (request) => {
        launches.push(request);
        throw new Error(reason);
      },
      write_stdin: async () => {
        throw new Error("write_stdin must not run after a failed launch");
      },
    },
  });

  assert.deepEqual(result, { completed: true });
  assert.equal(launches.length, 1);
  assert.deepEqual(stores, [[key, { status: "lost" }]]);
  assert.equal(notifications.length, 1);
  assert.equal(notifications[0].type, "CI_MONITOR_UNAVAILABLE");
  assert.equal(notifications[0].key, key);
  assert.equal(notifications[0].reason, `Error: ${reason}`.slice(-1000));
  assert.equal(notifications[0].reason.length, 1000);
});

test("documented Codex host binding reports lost observation, not finished, when the stream ends without a terminal result", async () => {
  const key = "ci-watch-execution:OWNER/REPO:BRANCH:COORDINATOR";
  const mailbox = "/tmp/observer/watch-2";
  const receipt = `CI_OBSERVER ${JSON.stringify({ directory: mailbox, pid: 11 })}\n`;
  const failure = `${JSON.stringify({ sequence: 1, event: { type: "CI_FAILURE", runId: 41 } })}\n`;
  const launches = [];
  const notifications = [];
  const texts = [];
  const stores = [];
  let writes = 0;

  const result = await runDocumentedCodexHostBinding({
    load: () => undefined,
    store: (storedKey, value) => stores.push([storedKey, value]),
    text: (value) => texts.push(value),
    notify: (event) => notifications.push(event),
    yield_control: async () => {},
    tools: {
      exec_command: async (request) => {
        launches.push(request);
        return { output: receipt, session_id: "sess-2" };
      },
      write_stdin: async (request) => {
        writes += 1;
        assert.equal(request.session_id, "sess-2");
        if (writes === 1) return { output: failure, session_id: "sess-2" };
        // The stream ends here (real process exit, host disconnect, or
        // truncated capture) with no CI_OBSERVER_RESULT line ever parsed.
        return { output: "", session_id: undefined };
      },
    },
  });

  assert.deepEqual(result, { completed: true });
  assert.equal(launches.length, 1);
  assert.equal(writes, 2);
  assert.equal(texts.length, 1);
  assert.equal(texts[0].status, "watching");
  assert.equal(texts[0].directory, mailbox);
  assert.equal(texts[0].pid, 11);

  // The prior failure was still delivered; loss does not swallow it.
  assert.deepEqual(notifications[0], { type: "CI_FAILURE", runId: 41 });
  assert.equal(notifications.length, 2);
  assert.equal(notifications[1].type, "CI_MONITOR_UNAVAILABLE");
  assert.equal(notifications[1].key, key);
  assert.match(notifications[1].reason, /terminal/);

  assert.equal(stores.length, 1);
  assert.equal(stores[0][0], key);
  assert.equal(stores[0][1].status, "lost");
  assert.equal(stores[0][1].sessionId, undefined);
  assert.equal(stores[0][1].directory, mailbox);
  assert.equal(stores[0][1].pid, 11);
  assert.equal(stores[0][1].terminal, undefined);
});

test("documented Codex host binding does not relaunch a finished observer", async () => {
  let launches = 0;
  const result = await runDocumentedCodexHostBinding({
    load: (key) => {
      assert.equal(key, "ci-watch-execution:OWNER/REPO:BRANCH:COORDINATOR");
      return { status: "finished" };
    },
    store: () => {
      throw new Error("store must not run for a finished observer");
    },
    text: () => {
      throw new Error("text must not run for a finished observer");
    },
    notify: () => {
      throw new Error("notify must not run for a finished observer");
    },
    yield_control: async () => {
      throw new Error("yield must not run for a finished observer");
    },
    tools: {
      exec_command: async () => {
        launches += 1;
        throw new Error("exec_command must not run for a finished observer");
      },
      write_stdin: async () => {
        throw new Error("write_stdin must not run for a finished observer");
      },
    },
  });
  assert.deepEqual(result, { skipped: true });
  assert.equal(launches, 0);
});
