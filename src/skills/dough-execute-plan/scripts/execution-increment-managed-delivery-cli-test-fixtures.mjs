// Host-shell view of a managed-delivery fixture: the installed `deliver`
// command with its taught arguments, and the installed Claude Code hook as the
// host invokes it after a tool call, and the installed Cursor hook likewise.
import { execFile } from "node:child_process";
import { join } from "node:path";
import { promisify } from "node:util";
import { invokeHostHook } from "./ci-host-bridge.mjs";

// Runs the taught `deliver` for one increment of the fixture's execution
// branch, or of the supplied `workspace` and `branch`, with only the supplied
// environment under the supplied `mode` and optional `tracking`; `extra` adds
// flags such as `--session-json` or `--authority`. `mode: null` omits
// `--mode`. The reported observer stops at teardown.
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
    "--max-duration-ms",
    "60000",
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

export const claudeHookInput = (session_id, extra = {}) => ({
  session_id,
  hook_event_name: "PostToolUse",
  tool_name: "Bash",
  tool_response: { stdout: "" },
  ...extra,
});

// What the fixture's installed Claude Code hook returns for one tool call.
export function invokeInstalledClaudeHook(fixture, input, env) {
  return invokeHostHook("claude", input, {
    hookPath: join(fixture.skill, "scripts/ci-host-hook.mjs"),
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
  return invokeHostHook("cursor", input, {
    hookPath: join(fixture.skill, "scripts/ci-host-hook.mjs"),
    cwd: fixture.execution,
    env,
  });
}
