import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import {
  publishMailboxEvent,
  readMailboxEvents,
  registerPushedRevision,
} from "./ci-mailbox.mjs";
import {
  createCodexReplay,
  launcher,
  runCommand,
} from "./ci-codex-lifecycle-test-fixtures.mjs";
import { runDocumentedCodexStopBinding } from "./ci-notify-codex-test-fixtures.mjs";
import {
  blockingGithubEnvironment,
  awaitWorkerSignal,
  waitForPidExit,
} from "./watch-ci-test-fixtures.mjs";

test("documented Codex stop ends only its observer with multiple pending revisions", async (t) => {
  const { env, teardown } = blockingGithubEnvironment(t);
  const root = env.CI_TEST_ROOT;
  const replay = createCodexReplay(teardown, env);
  const attached = await replay.setup();
  const child = attached.process;
  await awaitWorkerSignal(
    attached.directory,
    join(root, "github-request-started"),
  );
  const pending = ["a".repeat(40), "b".repeat(40)];
  for (const sha of pending) registerPushedRevision(attached.directory, sha);
  const failure = {
    type: "CI_FAILURE",
    repo: "owner/repo",
    runId: 42,
    attempt: 1,
  };
  publishMailboxEvent(attached.directory, failure);
  const other = createCodexReplay(teardown, env);
  const unaffected = await other.setup();

  const started = Date.now();
  const texts = [];
  const notifications = [];
  const launches = [];
  await runDocumentedCodexStopBinding({
    directory: attached.directory,
    text: (value) => texts.push(value),
    notify: (event) => notifications.push(event),
    tools: {
      exec_command: async (request) => {
        launches.push(request);
        assert.equal(
          request.cmd,
          `node /ABSOLUTE/RESOLVED/SKILL/scripts/ci-mailbox.mjs stop ${attached.directory}`,
        );
        assert.equal(request.workdir, "/ABSOLUTE/VERIFIED/CHECKOUT_ROOT");
        assert.equal(request.tty, undefined);
        const { stdout } = await runCommand(
          process.execPath,
          [launcher, "stop", attached.directory],
          { env, timeout: 10_000 },
        );
        return { output: stdout };
      },
      write_stdin: async () => {
        throw new Error("documented stop must not write_stdin");
      },
    },
  });
  assert.equal(
    await waitForPidExit(attached.pid),
    true,
    "the recorded stream PID exits within the deadline",
  );
  assert.ok(
    Date.now() - started < 10_000,
    "shutdown must not wait for outstanding CI",
  );

  const terminal = JSON.parse(
    readFileSync(join(attached.directory, "result.json")),
  );
  assert.equal(terminal.status, "stopped");
  assert.equal(terminal.coverage.pendingCi, "unobserved");
  assert.deepEqual(
    terminal.coverage.unproved,
    pending.map((sha) => ({ sha, state: "undiscovered" })),
  );
  assert.deepEqual(terminal.evidence, {
    recordedThrough: 1,
    deliveredThrough: 0,
    unread: 1,
  });
  assert.deepEqual(texts, [
    {
      key: "ci-watch-execution:OWNER/REPO:BRANCH:COORDINATOR",
      status: "stopped",
      directory: attached.directory,
      terminal,
      pendingCi: "unobserved",
    },
  ]);
  assert.deepEqual(notifications, []);
  assert.equal(launches.length, 1);
  assert.deepEqual(
    readMailboxEvents(attached.directory).map(({ event }) => event),
    [failure],
  );
  assert.equal(child.exitCode, 0);
  assert.equal(unaffected.process.exitCode, null);
  const live = await runCommand("ps", [
    "-p",
    String(unaffected.pid),
    "-o",
    "pid=",
  ]);
  assert.equal(Number(live.stdout.trim()), unaffected.pid);
  await other.stop();
});
