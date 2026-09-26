import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { completingFixture } from "./ci-codex-lifecycle-test-fixtures.mjs";
import { runDocumentedCodexHostBinding } from "./ci-notify-codex-test-fixtures.mjs";
import {
  deferChildExit,
  fixtureTeardown,
} from "./fixture-teardown-test-fixtures.mjs";
import { waitForFile } from "./watch-ci-test-fixtures.mjs";

const documentedKey = "ci-watch-execution:OWNER/REPO:BRANCH:COORDINATOR";

// Bridges a real, disposable child process's stdout into the documented
// Codex cell's `tools.exec_command`/`write_stdin` shape, so the cell's own
// consume/deliver/store logic runs against genuine process bytes instead of
// hand-written synthetic chunks.
function bridgeCodexStream(child) {
  let buffer = "";
  let closed = false;
  child.stdout.on("data", (chunk) => {
    buffer += chunk.toString();
  });
  child.once("close", () => {
    closed = true;
  });
  const closeEvent = once(child, "close");
  const drain = () => {
    const output = buffer;
    buffer = "";
    return output;
  };
  const nextChunk = async () => {
    if (buffer === "" && !closed)
      await Promise.race([once(child.stdout, "data"), closeEvent]);
    return {
      output: drain(),
      session_id: closed ? undefined : String(child.pid),
    };
  };
  return {
    exec_command: async () => nextChunk(),
    write_stdin: async () => nextChunk(),
  };
}

test("documented Codex host binding reports lost observation, not finished, when a real disposable stream process exits without terminal evidence", async (t) => {
  const root = mkdtempSync(join(tmpdir(), "ci-codex-loss-test-"));
  const teardown = fixtureTeardown(root);
  t.after(teardown.cleanup);
  const child = spawn(process.execPath, [completingFixture, root], {
    env: { ...process.env, DOUGH_CI_MAILBOX_ROOT: root, TMPDIR: root },
  });
  deferChildExit(teardown, child, "SIGKILL");
  const tools = bridgeCodexStream(child);

  const notifications = [];
  const texts = [];
  const stores = [];

  const resultPromise = runDocumentedCodexHostBinding({
    load: () => undefined,
    store: (storedKey, value) => stores.push([storedKey, value]),
    text: (value) => texts.push(value),
    notify: (event) => notifications.push(event),
    yield_control: async () => {},
    tools,
  });

  await waitForFile(join(root, "first-failure-recorded"), 15_000);
  // The fixture's own `runMailboxWorker` records the real terminal result to
  // its own mailbox storage on natural completion (proven separately by the
  // "natural observer completion" test in ci-codex-lifecycle.test.mjs); this
  // fixture process never reaches the CLI's own `CI_OBSERVER_RESULT` stdout
  // write, so the host genuinely receives no terminal evidence even though
  // the underlying worker succeeds.
  writeFileSync(join(root, "release-second-failure"), "");

  const result = await resultPromise;
  assert.deepEqual(result, { completed: true });

  assert.equal(texts.length, 1);
  assert.equal(texts[0].status, "watching");
  const { directory, pid } = texts[0];
  assert.equal(pid, child.pid);

  // The failures streamed before the process closed were still delivered;
  // the missing terminal result does not swallow them.
  const failures = notifications.filter((event) => event.type === "CI_FAILURE");
  assert.equal(failures.length, 2);
  assert.match(failures[0].failedJobs[0].name, /backend failure/);
  assert.match(failures[1].failedJobs[0].name, /frontend timeout/);

  assert.equal(
    notifications.filter((event) => event.type === "CI_MONITOR_UNAVAILABLE")
      .length,
    1,
  );
  const loss = notifications.find(
    (event) => event.type === "CI_MONITOR_UNAVAILABLE",
  );
  assert.equal(loss.key, documentedKey);
  assert.match(loss.reason, /terminal/);

  assert.equal(stores.length, 1);
  assert.equal(stores[0][0], documentedKey);
  assert.equal(stores[0][1].status, "lost");
  assert.equal(stores[0][1].sessionId, undefined);
  assert.equal(stores[0][1].directory, directory);
  assert.equal(stores[0][1].pid, pid);
  assert.equal(stores[0][1].terminal, undefined);

  // Contrast: the worker's own mailbox record shows real natural success —
  // the coordinator's loss report reflects missing host evidence, not an
  // actual crash.
  assert.deepEqual(JSON.parse(readFileSync(join(directory, "result.json"))), {
    status: "finished",
  });
});
