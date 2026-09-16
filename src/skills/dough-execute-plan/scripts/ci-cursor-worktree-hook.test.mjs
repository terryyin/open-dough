import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { writeBlockingGithubListCommand } from "./watch-ci-test-fixtures.mjs";

const exec = promisify(execFile);
const source = fileURLToPath(new URL("../", import.meta.url));
const cursorHooks = JSON.parse(
  readFileSync(new URL("../assets/cursor-hooks.json", import.meta.url)),
).hooks;

function deployRuntime(root) {
  const skill = join(root, ".agents/skills/dough-execute-plan");
  mkdirSync(skill, { recursive: true });
  cpSync(join(source, "scripts"), join(skill, "scripts"), {
    recursive: true,
    filter: (path) => !/test|fixture/.test(path.slice(source.length)),
  });
  return skill;
}

async function git(root, ...args) {
  return exec("git", args, { cwd: root });
}

async function initCheckout(root) {
  mkdirSync(root, { recursive: true });
  await git(root, "init", "-b", "main");
  await git(root, "config", "user.name", "Worktree Hook");
  await git(root, "config", "user.email", "worktree-hook@example.test");
  writeFileSync(join(root, "README"), "checkout\n");
  await git(root, "add", "README");
  await git(root, "commit", "-m", "init");
}

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
  const fixture = realpathSync(
    mkdtempSync(join(tmpdir(), "ci-worktree-hook-")),
  );
  t.after(() => rmSync(fixture, { recursive: true, force: true }));
  const originating = join(fixture, "originating");
  const execution = join(fixture, "execution");
  const unrelated = join(fixture, "unrelated");
  await initCheckout(originating);
  await git(originating, "worktree", "add", execution, "-b", "exec/story");
  await initCheckout(unrelated);
  deployRuntime(originating);
  const executionSkill = deployRuntime(execution);
  const unrelatedSkill = deployRuntime(unrelated);
  const storage = join(fixture, "mailboxes");
  const bin = join(fixture, "bin");
  writeBlockingGithubListCommand(bin);
  const env = {
    ...process.env,
    DOUGH_CI_MAILBOX_ROOT: storage,
    CI_TEST_ROOT: fixture,
    PATH: `${bin}:${process.env.PATH}`,
  };

  const probed = await exec(
    process.execPath,
    [join(executionSkill, "scripts/ci-mailbox.mjs"), "probe"],
    { cwd: execution, env },
  );
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
    [
      join(executionSkill, "scripts/ci-mailbox.mjs"),
      "start",
      "--execution",
      "owner/repo",
      "main",
      "60000",
    ],
    { cwd: execution, env },
  );
  const startReceipt = JSON.parse(started.stdout.slice("CI_OBSERVER ".length));
  t.after(async () => {
    await exec(
      process.execPath,
      [
        join(executionSkill, "scripts/ci-mailbox.mjs"),
        "stop",
        startReceipt.directory,
      ],
      { cwd: execution, env },
    ).catch(() => undefined);
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

  const foreign = await exec(
    process.execPath,
    [join(unrelatedSkill, "scripts/ci-mailbox.mjs"), "probe"],
    { cwd: unrelated, env },
  );
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
