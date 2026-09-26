import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { readWorkerIdentity, receiptPrefix } from "./ci-mailbox.mjs";
import {
  checkout,
  configuredHook,
  claudeInput,
  exec,
  launcher,
} from "./ci-claude-lifecycle-test-fixtures.mjs";
import {
  blockingGithubEnvironment,
  awaitWorkerSignal,
  deferObserverStop,
  waitForPidExit,
} from "./watch-ci-test-fixtures.mjs";

test("Claude Code reports its detached observer lost when the worker dies, and a repeated receipt does not restore attachment", async (t) => {
  const { env, teardown } = blockingGithubEnvironment(t);
  const root = env.CI_TEST_ROOT;

  const { stdout } = await exec(
    process.execPath,
    [launcher, "start", "--execution", "owner/repo", "main", "60000"],
    { cwd: checkout, env },
  );
  const directory = JSON.parse(stdout.slice(receiptPrefix.length)).directory;
  deferObserverStop(teardown, { launcher, directory, cwd: checkout, env });
  await awaitWorkerSignal(directory, join(root, "github-request-started"));

  const attachment = await configuredHook(
    "PostToolUse",
    claudeInput("PostToolUse", stdout),
    env,
  );
  assert.match(
    attachment.hookSpecificOutput.additionalContext,
    /CI observer attached to this coordinator/,
  );

  const { pid } = readWorkerIdentity(directory);
  process.kill(pid, "SIGKILL");
  assert.equal(await waitForPidExit(pid), true);

  const lost = await configuredHook(
    "PostToolUse",
    claudeInput("PostToolUse", ""),
    env,
  );
  assert.match(
    lost.hookSpecificOutput.additionalContext,
    /CI observer lost its worker/,
  );

  const repeated = await configuredHook(
    "PostToolUse",
    claudeInput("PostToolUse", stdout),
    env,
  );
  assert.match(
    repeated.hookSpecificOutput.additionalContext,
    /CI observer lost its worker/,
  );
  assert.doesNotMatch(
    repeated.hookSpecificOutput.additionalContext,
    /attached to this/,
  );

  // A different coordinator session must not be able to read this loss.
  const unrelated = await configuredHook(
    "PostToolUse",
    claudeInput("PostToolUse", "", { session_id: "other-coordinator" }),
    env,
  );
  assert.deepEqual(unrelated, {});

  await exec(process.execPath, [launcher, "stop", directory], { env });
});
