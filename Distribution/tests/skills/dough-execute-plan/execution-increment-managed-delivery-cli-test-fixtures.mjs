// Host-shell view of a managed-delivery fixture: the installed `deliver`
// command with its taught arguments, and the installed Claude Code hook as the
// host invokes it after a tool call, and the installed Cursor hook likewise.
// The installed `resume` runs the same way.
import { execFile } from "node:child_process";
import { join } from "node:path";
import { promisify } from "node:util";
import { runHostHook } from "./ci-host-hook-test-fixtures.mjs";
import { receiptPrefix } from "../../../src/skills/dough-execute-plan/scripts/ci-mailbox-location.mjs";

// Runs the taught `deliver` for one increment of the fixture's execution
// branch, or of the supplied `workspace` and `branch`, with only the supplied
// Runs with the supplied mode and tracking. Use mode: null to omit --mode.
// Extra flags reach the CLI directly. The observer stops at teardown.
export async function deliverThroughCli(
  fixture,
  {
    base,
    host = "claude",
    extra = [],
    env = fixture.env,
    workspace = fixture.execution,
    branch = "exec/story",
    mode = "trunk",
    tracking,
    targetRef = "refs/heads/main",
  },
) {
  const args = [
    "--workspace",
    workspace,
    "--branch",
    branch,
    "--previously-published-base",
    base,
    "--target-ref",
    targetRef,
    ...(mode ? ["--mode", mode] : []),
    ...(tracking ? ["--tracking", tracking] : []),
    "--repo",
    "owner/project",
    "--host",
    host,
    ...extra,
  ];
  const script = join(
    fixture.skill,
    "scripts/execution-increment-delivery.mjs",
  );
  const { stdout, stderr, code } = await promisify(execFile)(
    process.execPath,
    [script, "deliver", ...args],
    { cwd: workspace, env },
  ).catch((error) => error);
  const delivered = stdout.trim()
    ? JSON.parse(stdout.trim().split("\n").at(-1))
    : null;
  fixture.stopAtTeardown(delivered?.observation?.directory);
  return { delivered, stdout, stderr, code: code ?? 0 };
}

// Runs the installed `resume` for the retained `candidate` of the fixture's
// execution workspace with only the supplied environment; `extra` adds the
// owner evidence a caller retained. Returns its receipt, or null when the
// command printed none.
export async function resumeThroughCli(
  fixture,
  { candidate, suffixBase, host = "claude", extra = [], env = fixture.env },
) {
  const { stdout, stderr, code } = await promisify(execFile)(
    process.execPath,
    [
      join(fixture.skill, "scripts/execution-increment-resume.mjs"),
      "resume",
      ...["--workspace", fixture.execution, "--candidate-sha", candidate],
      ...(suffixBase === undefined ? [] : ["--suffix-base", suffixBase]),
      ...["--target-ref", "refs/heads/main", "--repo", "owner/project"],
      ...["--host", host, ...extra],
    ],
    { cwd: fixture.execution, env },
  ).catch((error) => error);
  const resumed = stdout.trim()
    ? JSON.parse(stdout.trim().split("\n").at(-1))
    : null;
  fixture.stopAtTeardown(resumed?.observation?.directory);
  return { resumed, stdout, stderr, code: code ?? 0 };
}

// Runs the installed `complete-revision` for `sha` on the observer at
// `directory` and returns its receipt.
export async function completeThroughCli(fixture, directory, sha) {
  const { stdout } = await promisify(execFile)(
    process.execPath,
    [
      join(fixture.skill, "scripts/ci-mailbox.mjs"),
      "complete-revision",
      directory,
      sha,
    ],
    { cwd: fixture.execution, env: fixture.env },
  );
  return JSON.parse(
    stdout.trim().split("\n").at(-1).slice(receiptPrefix.length),
  );
}

export const claudeHookInput = (session_id, extra = {}) => ({
  session_id,
  hook_event_name: "PostToolUse",
  tool_name: "Bash",
  tool_response: { stdout: "" },
  ...extra,
});

// What the fixture's installed Claude Code hook returns for one tool call.
export function invokeInstalledClaudeHook(fixture, input, env) {
  return runHostHook("claude", input, {
    path: join(fixture.skill, "scripts/ci-host-hook.mjs"),
    cwd: fixture.execution,
    env,
  });
}

// A Cursor coordinator's postToolUse for one Shell call in its own generation.
export const cursorHookInput = (
  conversation_id,
  generation_id,
  output = "",
) => ({
  conversation_id,
  generation_id,
  cursor_version: "1.0.0",
  hook_event_name: "postToolUse",
  tool_name: "Shell",
  tool_output: JSON.stringify({ output, exitCode: 0 }),
});

// What the fixture's installed Cursor hook returns for one tool call.
export function invokeInstalledCursorHook(fixture, input, env) {
  return runHostHook("cursor", input, {
    path: join(fixture.skill, "scripts/ci-host-hook.mjs"),
    cwd: fixture.execution,
    env,
  });
}
