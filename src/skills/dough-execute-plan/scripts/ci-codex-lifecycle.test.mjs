import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import {
  checkoutRoot,
  publishMailboxEvent,
  readMailbox,
  readMailboxEvents,
  receiptPrefix,
} from "./ci-mailbox.mjs";
import {
  completingFixture,
  createCodexReplay,
  key,
  launcher,
  runCommand,
  waitForExit,
} from "./ci-codex-lifecycle-test-fixtures.mjs";
import {
  blockingGithubEnvironment,
  awaitWorkerSignal,
  waitForFile,
  waitForPidExit,
} from "./watch-ci-test-fixtures.mjs";
import {
  deferChildExit,
  fixtureTeardown,
} from "./fixture-teardown-test-fixtures.mjs";

test("Codex retains its execution handles until natural observer completion", async (t) => {
  const root = mkdtempSync(join(tmpdir(), "ci-codex-completion-test-"));
  const teardown = fixtureTeardown(root);
  t.after(teardown.cleanup);
  const replay = createCodexReplay(
    { ...process.env, DOUGH_CI_MAILBOX_ROOT: root, TMPDIR: root },
    [completingFixture, root],
  );

  const attached = await replay.setup();
  deferChildExit(teardown, attached.process);
  await waitForFile(join(root, "first-failure-recorded"), 15_000);
  const repeatedSetup = await replay.setup();
  writeFileSync(join(root, "release-second-failure"), "");
  await waitForExit(attached.process);

  const finished = replay.state();
  assert.equal(replay.launches(), 1);
  assert.equal(repeatedSetup.sessionId, attached.sessionId);
  assert.equal(repeatedSetup.directory, attached.directory);
  assert.equal(finished.status, "finished");
  assert.equal(finished.sessionId, undefined);
  assert.equal(finished.directory, attached.directory);
  assert.equal(finished.process.pid, attached.process.pid);
  assert.equal(attached.process.exitCode, 0);
});

test("Codex recovers only its retained identity after losing handles and cooperatively stops that observer", async (t) => {
  const { env, teardown } = blockingGithubEnvironment(t);
  const root = env.CI_TEST_ROOT;
  const replay = createCodexReplay(env);
  const attached = await replay.setup();
  const child = attached.process;
  deferChildExit(teardown, child);
  await awaitWorkerSignal(
    attached.directory,
    join(root, "github-request-started"),
  );
  assert.equal(attached.pid, child.pid);
  const note = join(root, "PLAN.md");
  writeFileSync(
    note,
    `Observer: ${JSON.stringify({
      coordinator: key,
      checkout: checkoutRoot,
      directory: attached.directory,
      pid: attached.pid,
    })}\n`,
  );
  const failure = {
    type: "CI_FAILURE",
    repo: "owner/repo",
    runId: 42,
    attempt: 1,
  };
  publishMailboxEvent(attached.directory, failure);
  const other = createCodexReplay(env);
  const unaffected = await other.setup();
  deferChildExit(teardown, unaffected.process);

  replay.forgetHandles();
  assert.equal(replay.state(), undefined);
  const retained = JSON.parse(
    readFileSync(note, "utf8").slice("Observer: ".length),
  );
  assert.equal(retained.coordinator, key);
  assert.equal(retained.checkout, checkoutRoot);
  const request = readMailbox(retained.directory, retained.checkout, root);
  assert.equal(request.mode, "execution");
  assert.equal(request.repo, "owner/repo");
  assert.equal(request.branch, "main");
  const { stdout } = await runCommand(
    process.execPath,
    [launcher, "stop", retained.directory],
    { env, timeout: 10_000 },
  );
  assert.equal(
    await waitForPidExit(retained.pid),
    true,
    "the recorded stream PID exits within the deadline",
  );
  const terminal = JSON.parse(
    readFileSync(join(retained.directory, "result.json")),
  );
  assert.deepEqual(terminal, {
    status: "stopped",
    coverage: { state: "ended", pendingCi: "unobserved" },
    evidence: { recordedThrough: 1, deliveredThrough: 0, unread: 1 },
  });
  assert.deepEqual(
    JSON.parse(stdout.slice(receiptPrefix.length)).terminal,
    terminal,
  );
  assert.deepEqual(
    readMailboxEvents(retained.directory).map(({ event }) => event),
    [failure],
  );
  assert.equal(replay.launches(), 1);
  assert.equal(other.launches(), 1);
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

test("Codex reuses one execution observer through normal and repair pushes, then stops its exact handles", async (t) => {
  const { env, teardown } = blockingGithubEnvironment(t);
  const root = env.CI_TEST_ROOT;
  const replay = createCodexReplay(env);

  const attached = await replay.setup();
  deferChildExit(teardown, attached.process);
  await awaitWorkerSignal(
    attached.directory,
    join(root, "github-request-started"),
  );
  const repeatedSetup = await replay.setup();
  const afterNormalPush = await replay.setup();
  const afterRepairPush = await replay.setup();

  assert.equal(replay.launches(), 1);
  for (const retained of [repeatedSetup, afterNormalPush, afterRepairPush]) {
    assert.equal(retained.sessionId, attached.sessionId);
    assert.equal(retained.directory, attached.directory);
    assert.equal(retained.process.pid, attached.process.pid);
  }

  publishMailboxEvent(attached.directory, {
    type: "CI_FAILURE",
    repo: "owner/repo",
    runId: 42,
    attempt: 1,
  });
  const stopped = await replay.stop();
  await waitForFile(join(root, "github-request-stopped"));

  assert.equal(stopped.sessionId, attached.sessionId);
  assert.equal(stopped.directory, attached.directory);
  assert.equal(attached.process.exitCode, 0);
  assert.deepEqual(
    JSON.parse(readFileSync(join(attached.directory, "result.json"))),
    {
      status: "stopped",
      coverage: { state: "ended", pendingCi: "unobserved" },
      evidence: { recordedThrough: 1, deliveredThrough: 0, unread: 1 },
    },
  );
});
