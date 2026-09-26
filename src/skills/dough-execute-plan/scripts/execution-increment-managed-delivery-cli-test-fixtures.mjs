// Host-shell view of a managed-delivery fixture: the installed `deliver`
// command with its taught arguments, and the installed Claude Code hook as the
// host invokes it after a tool call.
import { execFile } from "node:child_process";
import { join } from "node:path";
import { promisify } from "node:util";
import { invokeHostHook } from "./ci-host-bridge.mjs";

// Runs the taught `deliver` for one increment of the fixture's execution
// branch with only the supplied environment; `extra` adds flags such as
// `--session-json` or `--authority`. The reported observer stops at teardown.
export async function deliverThroughCli(
  fixture,
  { base, host = "claude", extra = [], env = fixture.env },
) {
  const args = [
    "--workspace",
    fixture.execution,
    "--branch",
    "exec/story",
    "--previously-published-base",
    base,
    "--target-ref",
    "refs/heads/main",
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
    { cwd: fixture.execution, env },
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
