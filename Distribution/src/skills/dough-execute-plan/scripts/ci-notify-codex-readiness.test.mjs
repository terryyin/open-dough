import assert from "node:assert/strict";
import { test } from "node:test";
import { runDocumentedCodexHostBinding } from "./ci-notify-codex-test-fixtures.mjs";

const key = "ci-watch-execution:OWNER/REPO:BRANCH:COORDINATOR";
const directory = "/tmp/observer/watch-late";
const pid = 19;
const receipt = `CI_OBSERVER ${JSON.stringify({ directory, pid })}\r\n`;
const ended = (status) =>
  `CI_OBSERVER_RESULT ${JSON.stringify({ directory, terminal: { status } })}\r\n`;

async function replay(chunks) {
  const texts = [];
  const notifications = [];
  const stores = [];
  const acknowledgments = [];
  let launches = 0;
  let yielded = false;
  const next = () => ({
    output: chunks.shift(),
    session_id: chunks.length ? "session-late" : undefined,
  });
  await runDocumentedCodexHostBinding({
    load: () => undefined,
    text: (value) => texts.push(value),
    notify: (event) => notifications.push({ ...event, yielded }),
    store: (storedKey, value) => {
      assert.equal(storedKey, key);
      stores.push(value);
    },
    yield_control: async () => {
      yielded = true;
    },
    tools: {
      exec_command: async (request) => {
        if (request.cmd.includes(" acknowledge ")) {
          acknowledgments.push(request.cmd);
          return { output: "" };
        }
        launches += 1;
        return next();
      },
      write_stdin: async () => next(),
    },
  });
  return { texts, notifications, stores, acknowledgments, launches };
}

test("a split late identity is exposed once after an empty first yield, before its failure notification", async () => {
  const failure = `${JSON.stringify({ sequence: 1, event: { type: "CI_FAILURE", runId: 41 } })}\n`;
  const result = await replay([
    "",
    receipt.slice(0, 17),
    receipt.slice(17),
    receipt + failure,
    ended("stopped"),
  ]);
  assert.equal(result.launches, 1);
  assert.equal(result.texts.length, 1);
  assert.equal(result.texts[0].status, "starting");
  assert.equal(result.texts[0].directory, undefined);
  assert.deepEqual(result.notifications, [
    {
      type: "CI_OBSERVER_READY",
      key,
      coordinator: "COORDINATOR",
      status: "watching",
      sessionId: "session-late",
      directory,
      pid,
      yielded: true,
    },
    { type: "CI_FAILURE", runId: 41, yielded: true },
  ]);
  assert.deepEqual(result.acknowledgments, [
    `node /ABSOLUTE/RESOLVED/SKILL/scripts/ci-mailbox.mjs acknowledge ${directory} 1`,
  ]);
  assert.equal(result.stores[0].status, "stopped");
});

for (const status of ["stopped", "finished"]) {
  test(`an initially ended ${status} stream exposes its actual state without readiness`, async () => {
    const result = await replay([receipt + ended(status), ""]);
    assert.equal(result.texts[0].status, status);
    assert.equal(result.texts[0].directory, directory);
    assert.equal(result.texts[0].sessionId, undefined);
    assert.deepEqual(result.notifications, []);
    assert.equal(result.stores[0].status, status);
  });

  test(`a late identity in the final ${status} chunk never advertises a live observer`, async () => {
    const result = await replay(["", receipt + ended(status)]);
    assert.equal(result.texts[0].status, "starting");
    assert.deepEqual(result.notifications, []);
    assert.equal(result.stores[0].status, status);
    assert.equal(result.stores[0].directory, directory);
  });
}

test("a receipt followed by exit without terminal evidence reports loss without readiness", async () => {
  const result = await replay([receipt]);
  assert.equal(result.texts[0].status, "lost");
  assert.equal(result.notifications.length, 1);
  assert.equal(result.notifications[0].type, "CI_MONITOR_UNAVAILABLE");
  assert.equal(result.stores[0].status, "lost");
});
