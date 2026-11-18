// The Trunk Mode closure's coordinator claims its CI observer as a Cursor
// coordinator does: through the installed host hook, not a written claim.
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import { expect } from "@playwright/test";

const exec = promisify(execFile);
// The coordinator whose observer the Trunk Mode closure completes.
export const completionCoordinator = {
  conversation_id: "completion-closure-coordinator",
};

// One Shell call of the coordinator at the Cursor hook `installed` holds,
// whose output is an observer start receipt: the hook claims that observer.
export async function claimCompletionObserver(
  installed: string,
  workspace: string,
  receipt: string,
  env: NodeJS.ProcessEnv,
): Promise<void> {
  const hook = exec(
    process.execPath,
    [
      path.join(installed, "dough-execute-plan/scripts/ci-host-hook.mjs"),
      "cursor",
    ],
    { cwd: workspace, env },
  );
  hook.child.stdin?.end(
    JSON.stringify({
      ...completionCoordinator,
      generation_id: "completion-closure-turn",
      cursor_version: "1.0.0",
      hook_event_name: "postToolUse",
      tool_name: "Shell",
      tool_output: JSON.stringify({ output: receipt, exitCode: 0 }),
    }),
  );
  expect((await hook).stdout).toContain(
    "CI observer attached to this coordinator",
  );
}
