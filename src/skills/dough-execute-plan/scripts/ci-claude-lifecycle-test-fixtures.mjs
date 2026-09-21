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
  readFileSync(new URL("../assets/claude-hooks.json", import.meta.url)),
).hooks;

export function claudeInput(event, receipt = "", overrides = {}) {
  const base = {
    session_id: "claude-coordinator",
    hook_event_name: event,
    transcript_path: "/test/claude-coordinator.jsonl",
  };
  if (event === "PostToolUse")
    Object.assign(base, {
      tool_name: "Bash",
      tool_response: { stdout: receipt },
    });
  return { ...base, ...overrides };
}

export async function configuredHook(event, input, env) {
  const command = hooks[event][0].hooks[0].command.replace(
    "$CLAUDE_PROJECT_DIR/.claude/skills/dough-execute-plan/scripts/ci-host-hook.mjs",
    fileURLToPath(new URL("./ci-host-hook.mjs", import.meta.url)),
  );
  const child = exec("sh", ["-c", command], {
    env: { ...env, CLAUDE_PROJECT_DIR: checkout },
  });
  child.child.stdin.end(JSON.stringify(input));
  return JSON.parse((await child).stdout);
}

export function createClaudeReplay(env) {
  let observer;
  let launches = 0;

  return {
    async readiness(receipt = "") {
      const { stdout } = await exec(process.execPath, [launcher, "probe"], {
        cwd: checkout,
        env,
      });
      return configuredHook(
        "PostToolUse",
        claudeInput("PostToolUse", receipt || stdout),
        env,
      );
    },
    async setup() {
      if (observer) return observer;
      launches += 1;
      const { stdout } = await exec(
        process.execPath,
        [launcher, "start", "--execution", "owner/repo", "main", "60000"],
        { cwd: checkout, env },
      );
      const directory = JSON.parse(
        stdout.slice(receiptPrefix.length),
      ).directory;
      const attachment = await configuredHook(
        "PostToolUse",
        claudeInput("PostToolUse", stdout),
        env,
      );
      observer = { directory, attachment };
      return observer;
    },
    boundary(overrides = {}) {
      const event = overrides.hook_event_name ?? "PostToolUse";
      return configuredHook(event, claudeInput(event, "", overrides), env);
    },
    launches: () => launches,
    async stop() {
      if (!observer) return;
      return exec(process.execPath, [launcher, "stop", observer.directory], {
        cwd: checkout,
        env,
      });
    },
  };
}
