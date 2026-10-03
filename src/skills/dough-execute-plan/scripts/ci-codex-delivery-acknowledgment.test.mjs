// A Codex coordinator's yielded stream acknowledges what its binding handed
// to `notify`, so a failure it received no longer holds completion open. The
// documented binding from ci-notify-codex.md runs against the real stream.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import {
  createMailbox,
  publishMailboxEvent,
  readDeliveryProgress,
  readMailboxEvents,
  readRevisionCoverage,
} from "./ci-mailbox.mjs";
import {
  processBackedCodexTools,
  runDocumentedCodexHostBinding,
} from "./ci-notify-codex-test-fixtures.mjs";
import {
  launcher,
  processMailboxEnvironment,
  releaseRun,
} from "./ci-mailbox-process-test-fixtures.mjs";
import {
  exec,
  parseReceipt,
  register,
} from "./ci-mailbox-await-test-fixtures.mjs";
import {
  deferChildExit,
  fixtureTeardown,
} from "./fixture-teardown-test-fixtures.mjs";
import {
  awaitWorkerState,
  deferObserverStop,
} from "./watch-ci-test-fixtures.mjs";
import { awaitSignalWhileRunning } from "./process-lifetime-test-fixtures.mjs";

const first = "a".repeat(40);
const repair = "b".repeat(40);
const green = "c".repeat(40);
const failedRun = (databaseId, headSha) => ({
  databaseId,
  headSha,
  conclusion: "failure",
});

// Starts the documented binding on a real `ci-mailbox.mjs stream` and
// resolves once its first yielded output reported the mailbox.
async function armDocumentedStream(t) {
  const root = mkdtempSync(join(tmpdir(), "ci-codex-ack-test-"));
  const teardown = fixtureTeardown(root);
  t.after(teardown.cleanup);
  const env = processMailboxEnvironment(root);
  const host = processBackedCodexTools({
    env,
    startStream: (nodeArguments) => {
      const child = spawn(process.execPath, nodeArguments, { env });
      deferChildExit(teardown, child, "SIGKILL");
      return child;
    },
  });
  const notifications = [];
  const stores = [];
  let watching;
  const watched = new Promise((resolve) => {
    watching = resolve;
  });
  const binding = runDocumentedCodexHostBinding({
    load: () => undefined,
    store: (key, value) => stores.push([key, value]),
    text: watching,
    notify: (event) => notifications.push(event),
    yield_control: async () => {},
    tools: host.tools,
  });
  const { directory } = await Promise.race([
    watched,
    binding.then(() => {
      throw new Error("binding ended before reporting its mailbox");
    }),
  ]);
  deferObserverStop(teardown, { launcher, directory, env });
  // The binding acknowledges right after it notifies; a bounded wait reports
  // what was notified when acknowledgment never arrives.
  const deliveredThrough = (sequence, description) => {
    const deadline = Date.now() + 15_000;
    return awaitSignalWhileRunning(
      () => readDeliveryProgress(directory).deliveredThrough === sequence,
      () => Date.now() > deadline,
      () =>
        `${description}: progress ${JSON.stringify(readDeliveryProgress(directory))} after notifying ${JSON.stringify(notifications)}`,
    );
  };
  return {
    root,
    env,
    directory,
    host,
    binding,
    notifications,
    stores,
    deliveredThrough,
  };
}

const complete = async (env, directory, sha) =>
  parseReceipt(
    (
      await exec(
        process.execPath,
        [launcher, "complete-revision", directory, sha],
        {
          env,
        },
      )
    ).stdout,
  );

test("two failures notified to a Codex coordinator and repaired no longer hold completion of the green revision open", async (t) => {
  const codex = await armDocumentedStream(t);
  const { env, root, directory } = codex;

  await register(env, directory, first);
  releaseRun(root, failedRun(41, first));
  await codex.deliveredThrough(1, "the first failure acknowledged");

  releaseRun(root, failedRun(41, first), failedRun(42, repair));
  await register(env, directory, repair);
  await codex.deliveredThrough(2, "the repair's failure acknowledged");

  releaseRun(root, failedRun(41, first), failedRun(42, repair), {
    databaseId: 43,
    headSha: green,
    conclusion: "success",
  });
  await register(env, directory, green);
  const completed = await complete(env, directory, green);

  assert.equal(completed.verdict, "success");
  assert.equal(completed.shutdown.status, "confirmed");
  assert.equal(completed.unreadActionableFailures, undefined);
  assert.deepEqual(readDeliveryProgress(directory), { deliveredThrough: 2 });
  assert.deepEqual(
    codex.notifications.map(({ type, runId }) => ({ type, runId })),
    [
      { type: "CI_FAILURE", runId: 41 },
      { type: "CI_FAILURE", runId: 42 },
    ],
  );
  assert.deepEqual(codex.host.commands, [
    ["acknowledge", directory, "1"],
    ["acknowledge", directory, "2"],
  ]);
  assert.deepEqual(await codex.binding, { completed: true });
  assert.equal(codex.stores.length, 1);
  assert.equal(codex.stores[0][1].status, "stopped");
});

test("a failure recorded after the Codex coordinator stopped reading stays unread and completion retains the observer", async (t) => {
  const codex = await armDocumentedStream(t);
  const { env, root, directory } = codex;

  await register(env, directory, first);
  releaseRun(root, failedRun(41, first));
  await codex.deliveredThrough(1, "the first failure acknowledged");
  codex.host.stopReading();
  assert.deepEqual(await codex.binding, { completed: true });

  releaseRun(root, failedRun(41, first), failedRun(42, repair), {
    databaseId: 43,
    headSha: green,
    conclusion: "success",
  });
  await register(env, directory, repair);
  await register(env, directory, green);
  await awaitWorkerState(
    directory,
    () =>
      readMailboxEvents(directory).some(
        ({ event }) => event.type === "CI_FAILURE" && event.runId === 42,
      ) &&
      readRevisionCoverage(directory).some(
        ({ sha, state }) => sha === green && state === "success",
      ),
    "the unread repair failure and green coverage",
  );
  const completed = await complete(env, directory, green);

  assert.equal(completed.verdict, "success");
  assert.deepEqual(completed.shutdown, {
    status: "retained",
    reason: "unread_actionable_failure",
  });
  assert.deepEqual(
    completed.unreadActionableFailures.map(({ runId }) => runId),
    [42],
  );
  assert.deepEqual(readDeliveryProgress(directory), { deliveredThrough: 1 });
  assert.deepEqual(
    codex.notifications.map(({ type, runId }) => ({ type, runId })),
    [
      { type: "CI_FAILURE", runId: 41 },
      { type: "CI_MONITOR_UNAVAILABLE", runId: undefined },
    ],
  );
  assert.deepEqual(codex.host.commands, [["acknowledge", directory, "1"]]);
});

test("acknowledge accepts only published records and never moves delivery progress backward", async (t) => {
  const root = mkdtempSync(join(tmpdir(), "ci-codex-ack-test-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const env = { ...process.env, DOUGH_CI_MAILBOX_ROOT: root };
  const directory = createMailbox(
    { mode: "execution", repo: "owner/repo", branch: "main" },
    { storage: root },
  );
  for (const runId of [41, 42])
    publishMailboxEvent(directory, { type: "CI_FAILURE", runId });
  const acknowledge = (sequence) =>
    exec(process.execPath, [launcher, "acknowledge", directory, sequence], {
      env,
    });

  await assert.rejects(acknowledge("3"), /records end at 2/);
  await assert.rejects(acknowledge("0"), /Cannot acknowledge record 0/);
  assert.deepEqual(readDeliveryProgress(directory), { deliveredThrough: 0 });
  const { stdout } = await acknowledge("2");
  assert.deepEqual(parseReceipt(stdout), { directory, deliveredThrough: 2 });
  await acknowledge("1");
  assert.deepEqual(readDeliveryProgress(directory), { deliveredThrough: 2 });
});
