// Saved Codex session records supplement the CLI stream with turn ownership,
// lifecycle and commands delegated through literal exec calls. This is part of
// the shared native-host reader; callers apply their own proof policy to facts.
import { readFileSync } from "node:fs";

// Only literal, sequential exec calls are decoded. Unsupported JavaScript is
// unknown evidence; it is never executed by an observer.
function commands(call) {
  if (["exec_command", "functions.exec_command"].includes(call.name)) {
    try {
      return [JSON.parse(call.arguments)];
    } catch {
      return [];
    }
  }
  if (call.name !== "exec" || typeof call.input !== "string") return [];
  const statement =
    /\s*text\(\s*await\s+tools\.exec_command\(\s*(\{(?:[^"{}]|"(?:\\.|[^"\\])*")*\})\s*\)\s*\)\s*;?/y;
  const found = [];
  let position = 0;
  while (position < call.input.trimEnd().length) {
    statement.lastIndex = position;
    const match = statement.exec(call.input);
    if (!match) return [];
    // Quoted strings consume their contents before bare object keys match.
    const json = match[1].replace(
      /("(?:\\.|[^"\\])*")|([A-Za-z_$][\w$]*)(?=\s*:)/g,
      (whole, quoted, key) => (quoted ? whole : JSON.stringify(key)),
    );
    try {
      found.push(JSON.parse(json));
    } catch {
      return [];
    }
    position = statement.lastIndex;
  }
  return found;
}

function results(output) {
  if (typeof output === "string") {
    try {
      return results(JSON.parse(output));
    } catch {
      return [];
    }
  }
  if (Array.isArray(output)) return output.flatMap(results);
  if (!output || typeof output !== "object") return [];
  if (Object.hasOwn(output, "exit_code") || Object.hasOwn(output, "session_id"))
    return [output];
  // Do not inspect stdout for nested objects that could impersonate a receipt.
  return results(output.content ?? output.text);
}

// Reads one caller-named saved session, never the developer's default home.
// A command has a null exitCode when its paired receipt is absent, unresolved
// or ambiguous. A fork's copied turns retain their recorded context and are
// distinct from ownership established by that session's usage records.
export function readCodexSession(file) {
  const startedTurns = [],
    completedTurns = [],
    ownership = [],
    calls = [];
  const pending = new Map();
  let context = {};
  for (const line of readFileSync(file, "utf8").split("\n")) {
    if (line.trim() === "") continue;
    const row = JSON.parse(line);
    const value = row.payload ?? {};
    if (row.type === "turn_context") {
      context = { turn: value.turn_id, cwd: value.cwd };
    } else if (row.type === "token_usage_record") {
      ownership.push({
        thread: value.thread_id,
        turn: value.turn_id,
        rootTurn: value.root_turn_id,
      });
    } else if (row.type === "event_msg") {
      if (value.type === "task_started") startedTurns.push(value.turn_id);
      if (value.type === "task_complete") completedTurns.push(value.turn_id);
    } else if (row.type === "response_item") {
      if (["custom_tool_call", "function_call"].includes(value.type)) {
        pending.set(value.call_id, { value, context });
      } else if (
        ["custom_tool_call_output", "function_call_output"].includes(value.type)
      ) {
        const call = pending.get(value.call_id);
        if (!call) continue;
        const invoked = commands(call.value),
          terminal = results(value.output);
        for (const [index, args] of invoked.entries()) {
          const result =
            terminal.length === invoked.length ? terminal[index] : undefined;
          calls.push({
            command: args.cmd,
            cwd: call.context.cwd,
            workdir: args.workdir ?? call.context.cwd,
            turn: call.context.turn,
            receiptTurn: context.turn,
            exitCode:
              result && !result.session_id && Number.isInteger(result.exit_code)
                ? result.exit_code
                : null,
            at: row.timestamp ?? "",
            id: value.call_id,
          });
        }
      }
    }
  }
  return { startedTurns, completedTurns, ownership, calls };
}
