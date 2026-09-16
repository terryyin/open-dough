import assert from "node:assert/strict";
import { test } from "node:test";
import { runDocumentedCodexStopBinding } from "./ci-notify-codex-test-fixtures.mjs";

const key = "ci-watch-execution:OWNER/REPO:BRANCH:COORDINATOR";
const mailbox = "/tmp/observer/watch-1";

function rejectWriteStdin() {
  return async () => {
    throw new Error("stop must not write_stdin");
  };
}

test("documented Codex stop binding confirms cooperative stop without write_stdin", async () => {
  const terminal = {
    status: "stopped",
    coverage: { state: "ended", pendingCi: "unobserved" },
    evidence: { recordedThrough: 1, deliveredThrough: 0, unread: 1 },
  };
  const launches = [];
  const texts = [];
  const notifications = [];

  await runDocumentedCodexStopBinding({
    directory: mailbox,
    text: (value) => texts.push(value),
    notify: (event) => notifications.push(event),
    tools: {
      exec_command: async (request) => {
        launches.push(request);
        return {
          output: `CI_OBSERVER ${JSON.stringify({ directory: mailbox, terminal })}\n`,
        };
      },
      write_stdin: rejectWriteStdin(),
    },
  });

  assert.equal(launches.length, 1);
  assert.equal(
    launches[0].cmd,
    `node /ABSOLUTE/RESOLVED/SKILL/scripts/ci-mailbox.mjs stop ${mailbox}`,
  );
  assert.equal(launches[0].workdir, "/ABSOLUTE/VERIFIED/CHECKOUT_ROOT");
  assert.equal(launches[0].tty, undefined);
  assert.equal(launches[0].yield_time_ms, 10_000);
  assert.deepEqual(texts, [
    {
      key,
      status: "stopped",
      directory: mailbox,
      terminal,
      pendingCi: "unobserved",
    },
  ]);
  assert.deepEqual(notifications, []);
});

test("documented Codex stop binding reports bounded unavailability from one failed stop", async () => {
  const launches = [];
  const notifications = [];
  const reason = "bridge missing ".repeat(80);

  await runDocumentedCodexStopBinding({
    directory: mailbox,
    text: () => {
      throw new Error("text must not run after a failed stop");
    },
    notify: (event) => notifications.push(event),
    tools: {
      exec_command: async (request) => {
        launches.push(request);
        throw new Error(reason);
      },
      write_stdin: rejectWriteStdin(),
    },
  });

  assert.equal(launches.length, 1);
  assert.equal(notifications.length, 1);
  assert.equal(notifications[0].type, "CI_MONITOR_UNAVAILABLE");
  assert.equal(notifications[0].key, key);
  assert.equal(notifications[0].reason, `Error: ${reason}`.slice(-1000));
  assert.equal(notifications[0].reason.length, 1000);
});

test("documented Codex stop binding reports an unconfirmed stop as unavailable", async () => {
  const notifications = [];

  await runDocumentedCodexStopBinding({
    directory: mailbox,
    text: () => {
      throw new Error("text must not run after an unconfirmed stop");
    },
    notify: (event) => notifications.push(event),
    tools: {
      exec_command: async () => ({
        output: "still running",
        session_id: "sess-stream",
      }),
      write_stdin: rejectWriteStdin(),
    },
  });

  assert.equal(notifications.length, 1);
  assert.equal(notifications[0].type, "CI_MONITOR_UNAVAILABLE");
  assert.equal(notifications[0].key, key);
  assert.match(notifications[0].reason, /observer stop still running/);
});
