import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { readFileSync, realpathSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { promisify } from "node:util";
import { installedCheckouts } from "./ci-installed-checkouts-test-fixtures.mjs";
import { deferObserverStop } from "./watch-ci-test-fixtures.mjs";

const exec = promisify(execFile);
const cursorHooks = JSON.parse(
  readFileSync(new URL("../assets/cursor-hooks.json", import.meta.url)),
).hooks;

function runOriginatingCursorHook(originating, stdin, env) {
  const command = cursorHooks.postToolUse[0].command;
  const child = exec("sh", ["-c", command], {
    cwd: originating,
    env,
    timeout: 5000,
  });
  child.child.stdin.end(stdin);
  return child;
}

function cursorShellInput(stdout) {
  return JSON.stringify({
    conversation_id: "coordinator",
    generation_id: "coordinator-turn",
    hook_event_name: "postToolUse",
    tool_name: "Shell",
    tool_output: JSON.stringify({ output: stdout }),
  });
}

test("originating Cursor hook attaches READY then start from a same-repo worktree probe", async (t) => {
  const {
    teardown,
    checkout: originating,
    worktree: execution,
    unrelated,
    launchers,
    env,
  } = await installedCheckouts(t, "ci-worktree-hook-");

  const probed = await exec(process.execPath, [launchers.worktree, "probe"], {
    cwd: execution,
    env,
  });
  const probeReceipt = JSON.parse(probed.stdout.slice("CI_OBSERVER ".length));
  const probeRequest = JSON.parse(
    readFileSync(join(probeReceipt.directory, "request.json"), "utf8"),
  );
  assert.equal(realpathSync(probeRequest.root), realpathSync(execution));
  assert.notEqual(realpathSync(probeRequest.root), realpathSync(originating));
  assert.equal(probeRequest.probe, true);

  const ready = JSON.parse(
    (
      await runOriginatingCursorHook(
        originating,
        cursorShellInput(probed.stdout),
        env,
      )
    ).stdout,
  );
  assert.match(ready.additional_context, /CI_MONITOR_READY/);
  assert.doesNotMatch(
    ready.additional_context,
    /CI observer attached to this coordinator/,
  );

  const started = await exec(
    process.execPath,
    [launchers.worktree, "start", "--execution", "owner/repo", "main", "60000"],
    { cwd: execution, env },
  );
  const startReceipt = JSON.parse(started.stdout.slice("CI_OBSERVER ".length));
  deferObserverStop(teardown, {
    launcher: launchers.worktree,
    directory: startReceipt.directory,
    cwd: execution,
    env,
  });
  assert.notEqual(startReceipt.directory, probeReceipt.directory);
  const startRequest = JSON.parse(
    readFileSync(join(startReceipt.directory, "request.json"), "utf8"),
  );
  assert.equal(startRequest.probe, undefined);
  assert.equal(realpathSync(startRequest.root), realpathSync(execution));

  const attached = JSON.parse(
    (
      await runOriginatingCursorHook(
        originating,
        cursorShellInput(started.stdout),
        env,
      )
    ).stdout,
  );
  assert.match(
    attached.additional_context,
    /CI observer attached to this coordinator/,
  );

  const foreign = await exec(process.execPath, [launchers.unrelated, "probe"], {
    cwd: unrelated,
    env,
  });
  await assert.rejects(
    () =>
      runOriginatingCursorHook(
        originating,
        cursorShellInput(foreign.stdout),
        env,
      ),
    /CI mailbox belongs to another checkout/,
  );
});
