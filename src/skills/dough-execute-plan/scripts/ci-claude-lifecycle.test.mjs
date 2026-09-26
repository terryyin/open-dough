import assert from "node:assert/strict";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { publishMailboxEvent, receiptPrefix } from "./ci-mailbox.mjs";
import {
  configuredHook,
  claudeInput,
  createClaudeReplay,
} from "./ci-claude-lifecycle-test-fixtures.mjs";
import { fixtureTeardown } from "./fixture-teardown-test-fixtures.mjs";
import {
  awaitWorkerSignal,
  waitForFile,
  writeBlockingGithubListCommand,
} from "./watch-ci-test-fixtures.mjs";

test("Claude Code reuses one execution observer through pushes and stops its exact mailbox", async (t) => {
  const root = mkdtempSync(join(tmpdir(), "ci-claude-lifecycle-test-"));
  const teardown = fixtureTeardown(root);
  t.after(teardown.cleanup);
  const bin = join(root, "bin");
  writeBlockingGithubListCommand(bin);
  const env = {
    ...process.env,
    DOUGH_CI_MAILBOX_ROOT: root,
    CI_TEST_ROOT: root,
    PATH: `${bin}:${process.env.PATH}`,
  };
  const replay = createClaudeReplay(teardown, env);

  const ready = await replay.readiness();
  assert.match(ready.hookSpecificOutput.additionalContext, /CI_MONITOR_READY/);
  assert.deepEqual(
    await configuredHook(
      "PostToolUse",
      claudeInput("PostToolUse", "", { cursor_version: "test" }),
      env,
    ),
    {},
  );

  const attached = await replay.setup();
  await awaitWorkerSignal(
    attached.directory,
    join(root, "github-request-started"),
  );
  assert.match(
    attached.attachment.hookSpecificOutput.additionalContext,
    /CI observer attached to this coordinator/,
  );

  const repeatedSetup = await replay.setup();
  const afterNormalPush = await replay.setup();
  const afterRepairPush = await replay.setup();
  assert.equal(replay.launches(), 1);
  assert.equal(repeatedSetup.directory, attached.directory);
  assert.equal(afterNormalPush.directory, attached.directory);
  assert.equal(afterRepairPush.directory, attached.directory);

  publishMailboxEvent(attached.directory, {
    type: "CI_FAILURE",
    repo: "owner/repo",
    runId: 42,
    attempt: 1,
  });
  assert.deepEqual(await replay.boundary({ agent_id: "child-agent" }), {});
  assert.match(
    (await replay.boundary()).hookSpecificOutput.additionalContext,
    /"type":"CI_FAILURE"/,
  );
  publishMailboxEvent(attached.directory, {
    type: "CI_MONITOR_UNAVAILABLE",
    repo: "owner/repo",
    reason: "fixture lost coverage",
  });
  assert.match(
    (await replay.boundary()).hookSpecificOutput.additionalContext,
    /"type":"CI_MONITOR_UNAVAILABLE"/,
  );

  publishMailboxEvent(attached.directory, {
    type: "CI_FAILURE",
    repo: "owner/repo",
    runId: 43,
    attempt: 1,
  });
  const stopBoundary = await replay.boundary({ hook_event_name: "Stop" });
  assert.equal(stopBoundary.decision, "block");
  assert.match(stopBoundary.reason, /"runId":43/);

  const stopped = await replay.stop();
  await waitForFile(join(root, "github-request-stopped"));
  const terminal = JSON.parse(
    stopped.stdout.slice(receiptPrefix.length),
  ).terminal;
  assert.deepEqual(terminal, {
    status: "stopped",
    coverage: { state: "ended", pendingCi: "unobserved" },
    evidence: { recordedThrough: 3, deliveredThrough: 3, unread: 0 },
  });
  assert.deepEqual(
    JSON.parse(readFileSync(join(attached.directory, "result.json"))),
    terminal,
  );
});
