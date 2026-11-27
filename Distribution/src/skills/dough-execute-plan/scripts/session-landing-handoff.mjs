import { execFileSync } from "node:child_process";
import { readFileSync, realpathSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { managementContext } from "./publication-git.mjs";

const identities = {
  claude: "CLAUDE_CODE_SESSION_ID",
  codex: "CODEX_THREAD_ID",
};

function nativeShell() {
  const found = Object.entries(identities).filter(
    ([, key]) => process.env[key],
  );
  return found.length === 1
    ? [found[0][0], process.env[found[0][1]], process.cwd()]
    : [];
}

function cursorProbe(input) {
  if (
    !input.cursor_version ||
    input.hook_event_name !== "postToolUse" ||
    input.tool_name !== "Shell" ||
    input.tool_input?.command !==
      "node .agents/skills/dough-execute-plan/scripts/session-landing-handoff.mjs"
  )
    return [];
  return ["cursor", input.conversation_id, input.cwd];
}

async function retainedHandoff(host, id, cwd) {
  if (typeof id !== "string" || !id || typeof cwd !== "string" || !cwd) return;
  try {
    const records = JSON.parse(
      readFileSync(
        join(homedir(), ".open-dough/dashboard/ready-session-handoffs.json"),
        "utf8",
      ),
    );
    const handoff = records[`${host}:${id}`];
    if (typeof handoff?.text !== "string" || !handoff.text) return;
    const git = (...args) =>
      execFileSync("git", args, {
        cwd,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      }).trimEnd();
    const workspace = realpathSync(git("rev-parse", "--show-toplevel"));
    const branch = git("symbolic-ref", "--short", "HEAD");
    if (
      handoff.branch !== branch ||
      realpathSync(handoff.workspace) !== workspace ||
      realpathSync(await managementContext(workspace)) !==
        realpathSync(handoff.repository)
    )
      return;
    return handoff.text;
  } catch {
    return undefined;
  }
}

const args = process.argv.slice(2);
if (args.length === 0) {
  const handoff = await retainedHandoff(...nativeShell());
  if (handoff) process.stdout.write(`${handoff}\n`);
} else if (args.length === 1 && args[0] === "--cursor-hook") {
  try {
    const handoff = await retainedHandoff(
      ...cursorProbe(JSON.parse(readFileSync(0, "utf8"))),
    );
    process.stdout.write(
      `${JSON.stringify(handoff ? { additional_context: handoff } : {})}\n`,
    );
  } catch {
    process.stdout.write("{}\n");
  }
}
