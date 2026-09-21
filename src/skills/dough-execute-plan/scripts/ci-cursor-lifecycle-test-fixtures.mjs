import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { receiptPrefix } from "./ci-mailbox.mjs";

export const exec = promisify(execFile);
export const checkout = fileURLToPath(new URL("../../../../", import.meta.url));
export const launcher = fileURLToPath(
  new URL("./ci-mailbox.mjs", import.meta.url),
);
const hooks = JSON.parse(
  readFileSync(new URL("../assets/cursor-hooks.json", import.meta.url)),
).hooks;

export function cursorInput(event, receipt = "", overrides = {}) {
  return {
    conversation_id: "cursor-coordinator",
    generation_id: "coordinator-turn",
    hook_event_name: event,
    tool_name: "Shell",
    tool_output: JSON.stringify({ output: receipt, exitCode: 0 }),
    cursor_version: "3.19.7",
    workspace_roots: [checkout],
    transcript_path: "/test/cursor-coordinator.jsonl",
    ...overrides,
  };
}

export async function configuredHook(event, input, env) {
  const [runtime, , host] = hooks[event][0].command.split(" ");
  assert.equal(runtime, "node");
  const child = exec(
    process.execPath,
    [fileURLToPath(new URL("./ci-host-hook.mjs", import.meta.url)), host],
    { env },
  );
  child.child.stdin.end(JSON.stringify(input));
  return JSON.parse((await child).stdout);
}

export function createCursorReplay(launcherEnv, hookEnv = launcherEnv) {
  let observer;
  let launches = 0;

  return {
    async readiness(receipt = "") {
      const { stdout } = await exec(process.execPath, [launcher, "probe"], {
        cwd: checkout,
        env: launcherEnv,
      });
      return configuredHook(
        "postToolUse",
        cursorInput("postToolUse", receipt || stdout),
        hookEnv,
      );
    },
    async setup() {
      if (observer) return observer;
      launches += 1;
      const { stdout } = await exec(
        process.execPath,
        [launcher, "start", "--execution", "owner/repo", "main", "60000"],
        { cwd: checkout, env: launcherEnv },
      );
      const directory = JSON.parse(
        stdout.slice(receiptPrefix.length),
      ).directory;
      const attachment = await configuredHook(
        "postToolUse",
        cursorInput("postToolUse", stdout),
        hookEnv,
      );
      observer = { directory, attachment };
      return observer;
    },
    boundary(overrides = {}) {
      return configuredHook(
        "postToolUse",
        cursorInput("postToolUse", "", overrides),
        hookEnv,
      );
    },
    launches: () => launches,
    async stop() {
      if (!observer) return;
      return exec(process.execPath, [launcher, "stop", observer.directory], {
        cwd: checkout,
        env: launcherEnv,
      });
    },
  };
}
