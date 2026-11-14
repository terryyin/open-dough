// Case-only fallback for proof delegated to an owned native worker.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { codexSessionSettings } from "../../support/native-codex-session.mjs";

const read = (file) =>
  readFileSync(file, "utf8").split("\n").filter(Boolean).map(JSON.parse);
const proofCommand = (command) =>
  typeof command === "string" &&
  /^(?:node --test(?: [^;&|\r\n]+)?|npm (?:run )?test(?: [^;&|\r\n]+)?)$/.test(
    command.trim(),
  );

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

function workerProof(worker, rootTurn, workspace) {
  const rows = read(worker.file);
  const ownTurns = new Set(
    rows
      .filter(
        (row) =>
          row.type === "token_usage_record" &&
          row.payload?.thread_id === worker.thread &&
          row.payload.root_turn_id === rootTurn,
      )
      .map((row) => row.payload.turn_id),
  );
  const completed = new Set(
    rows
      .filter(
        (row) =>
          row.type === "event_msg" && row.payload?.type === "task_complete",
      )
      .map((row) => row.payload.turn_id),
  );
  const calls = new Map(),
    proof = [];
  let context;
  for (const row of rows) {
    const value = row.payload ?? {};
    if (row.type === "turn_context") context = value;
    if (row.type !== "response_item" || !ownTurns.has(context?.turn_id))
      continue;
    if (["custom_tool_call", "function_call"].includes(value.type)) {
      calls.set(value.call_id, { value, context });
    } else if (
      ["custom_tool_call_output", "function_call_output"].includes(value.type)
    ) {
      const call = calls.get(value.call_id);
      if (!call || !completed.has(call.context.turn_id)) continue;
      const invoked = commands(call.value),
        terminal = results(value.output);
      for (const [index, args] of invoked.entries()) {
        if (
          !proofCommand(args.cmd) ||
          resolve(call.context.cwd) !== resolve(workspace) ||
          resolve(args.workdir ?? call.context.cwd) !== resolve(workspace)
        )
          continue;
        const result =
          terminal.length === invoked.length ? terminal[index] : undefined;
        const status =
          !result || result.session_id || !Number.isInteger(result.exit_code)
            ? "unknown"
            : result.exit_code === 0
              ? "passed"
              : "failed";
        proof.push({
          status,
          at: row.timestamp ?? "",
          worker: worker.thread,
          callId: value.call_id,
        });
      }
    }
  }
  return proof;
}

export function ownedWorkerProof(thread, workspace, sessionsRoot) {
  if (!thread || !workspace || !sessionsRoot) return "none";
  try {
    const saved = codexSessionSettings(thread, sessionsRoot);
    if (!saved) return "none";
    const parent = read(saved.file);
    const started = parent
      .filter(
        (row) =>
          row.type === "event_msg" && row.payload?.type === "task_started",
      )
      .at(-1);
    const rootTurn = started?.payload.turn_id;
    if (
      !rootTurn ||
      !parent.some(
        (row) =>
          row.type === "event_msg" &&
          row.payload?.type === "task_complete" &&
          row.payload.turn_id === rootTurn,
      )
    )
      return "unknown";
    const proof = saved.workers.flatMap((worker) =>
      workerProof(worker, rootTurn, workspace),
    );
    proof.sort((a, b) => a.at.localeCompare(b.at));
    return proof.at(-1)?.status ?? "none";
  } catch {
    return "unknown";
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  process.stdout.write(`${ownedWorkerProof(...process.argv.slice(2))}\n`);
}
