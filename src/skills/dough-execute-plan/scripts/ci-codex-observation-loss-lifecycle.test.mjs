import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { completingFixture } from "./ci-codex-lifecycle-test-fixtures.mjs";
import { readDeliveryProgress } from "./ci-mailbox.mjs";
import {
  processBackedCodexTools,
  runDocumentedCodexHostBinding,
} from "./ci-notify-codex-test-fixtures.mjs";
import {
  deferChildExit,
  fixtureTeardown,
} from "./fixture-teardown-test-fixtures.mjs";
import { waitForFile } from "./watch-ci-test-fixtures.mjs";

const documentedKey = "ci-watch-execution:OWNER/REPO:BRANCH:COORDINATOR";

test("documented Codex host binding reports lost observation, not finished, when a real disposable stream process exits without terminal evidence", async (t) => {
  const root = mkdtempSync(join(tmpdir(), "ci-codex-loss-test-"));
  const teardown = fixtureTeardown(root);
  t.after(teardown.cleanup);
  const env = { ...process.env, DOUGH_CI_MAILBOX_ROOT: root, TMPDIR: root };
  let child;
  // The documented stream command runs this disposable fixture instead, so
  // the cell's own consume/deliver/store logic reads genuine process bytes.
  const { tools } = processBackedCodexTools({
    env,
    startStream: () => {
      child = spawn(process.execPath, [completingFixture, root], { env });
      deferChildExit(teardown, child, "SIGKILL");
      return child;
    },
  });

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
  assert.deepEqual(readDeliveryProgress(directory), { deliveredThrough: 2 });

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
