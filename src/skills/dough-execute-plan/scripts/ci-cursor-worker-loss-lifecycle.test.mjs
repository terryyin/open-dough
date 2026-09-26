import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { readWorkerIdentity, receiptPrefix } from "./ci-mailbox.mjs";
import {
  checkout,
  configuredHook,
  cursorInput,
  exec,
  launcher,
} from "./ci-cursor-lifecycle-test-fixtures.mjs";
import {
  awaitWorkerSignal,
  blockingGithubEnvironment,
  deferObserverStop,
  waitForPidExit,
} from "./watch-ci-test-fixtures.mjs";

test("Cursor reports its detached observer lost when the worker dies, and a repeated receipt does not restore attachment", async (t) => {
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
    "postToolUse",
    cursorInput("postToolUse", stdout),
    env,
  );
  assert.match(
    attachment.additional_context,
    /CI observer attached to this coordinator/,
  );

  const { pid } = readWorkerIdentity(directory);
  process.kill(pid, "SIGKILL");
  assert.equal(await waitForPidExit(pid), true);

  const lost = await configuredHook(
    "postToolUse",
    cursorInput("postToolUse", ""),
    env,
  );
  assert.match(lost.additional_context, /CI observer lost its worker/);

  const repeated = await configuredHook(
    "postToolUse",
    cursorInput("postToolUse", stdout),
    env,
  );
  assert.match(repeated.additional_context, /CI observer lost its worker/);
  assert.doesNotMatch(repeated.additional_context, /attached to this/);

  // A different coordinator conversation must not be able to read this loss.
  const unrelated = await configuredHook(
    "postToolUse",
    cursorInput("postToolUse", "", { conversation_id: "other-coordinator" }),
    env,
  );
  assert.deepEqual(unrelated, {});

  await exec(process.execPath, [launcher, "stop", directory], { env });
});
