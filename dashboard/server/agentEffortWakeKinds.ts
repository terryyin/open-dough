import { objectOf } from "./nativeUsageFiles.ts";

export type WakeKind =
  "idle" | "progress" | "mixed" | "clock-only" | "unclassified";
export type WakeCall = { name: string; input: Record<string, unknown> };
export function wakeResult(
  call: WakeCall | undefined,
  output: unknown,
): WakeKind {
  if (!call) return "unclassified";
  if (["clock__curr_time", "mcp__clock__curr_time"].includes(call.name))
    return "clock-only";
  // A launched process is never a continuation, even if it returns no output.
  const continuation =
    (["write_stdin", "functions.write_stdin"].includes(call.name) &&
      typeof call.input["session_id"] === "number" &&
      !call.input["chars"]) ||
    (["wait", "functions.wait"].includes(call.name) &&
      typeof call.input["cell_id"] === "string" &&
      call.input["terminate"] !== true) ||
    (call.name === "TaskOutput" && typeof call.input["task_id"] === "string") ||
    (call.name === "wait" && Array.isArray(call.input["ids"]));
  if (!continuation) return "unclassified";
  let result = objectOf(output);
  if (typeof output === "string") {
    try {
      result = objectOf(JSON.parse(output));
    } catch {
      /* exact text below */
    }
  }
  if (call.name === "wait" && Array.isArray(call.input["ids"]))
    return result["timed_out"] === true &&
      Object.keys(result).every((key) =>
        ["status", "timed_out"].includes(key),
      ) &&
      Object.keys(objectOf(result["status"])).length === 0 &&
      result["status"] !== null &&
      typeof result["status"] === "object" &&
      !Array.isArray(result["status"])
      ? "idle"
      : "unclassified";
  if (call.name === "TaskOutput") {
    // Historical native envelope reported at anthropics/claude-code#36532.
    // Exact whole-body matching excludes arbitrary stdout or mixed progress.
    return typeof output === "string" &&
      /^\s*<retrieval_status>timeout<\/retrieval_status>\s*$/.test(output)
      ? "idle"
      : "unclassified";
  }
  if (typeof result["output"] === "string") {
    if (
      Object.keys(result).some(
        (key) =>
          ![
            "output",
            "session_id",
            "exit_code",
            "chunk_id",
            "wall_time_seconds",
            "original_token_count",
          ].includes(key),
      )
    )
      return "unclassified";
    if (
      typeof result["original_token_count"] === "number" &&
      result["original_token_count"] > 0 &&
      result["output"] === ""
    )
      return "unclassified";
    if (result["output"].length) return "progress";
    if (
      typeof result["session_id"] === "number" &&
      result["session_id"] === call.input["session_id"] &&
      (result["exit_code"] === null || result["exit_code"] === undefined)
    )
      return "idle";
  }
  if (typeof output !== "string") return "unclassified";
  // Whitelist the complete empty continuation envelope, not a substring that
  // a useful command could print. Unknown envelopes remain uncovered.
  const session =
    /^(?:Chunk ID: [^\n]+\n)?Wall time: [\d.]+ seconds\nProcess running with session ID \d+\n(?:Original token count: 0\n)?Output:\s*$/.exec(
      output,
    );
  if (
    session &&
    output.match(/Process running with session ID (\d+)/)?.[1] ===
      String(call.input["session_id"])
  )
    return "idle";
  const cell = /^Script running with cell ID ([^\s]+)\s*$/.exec(output);
  if (cell && cell[1] === call.input["cell_id"]) return "idle";
  return "unclassified";
}
export function combineWakeResults(kinds: WakeKind[]): WakeKind {
  if (!kinds.length || kinds.includes("unclassified")) return "unclassified";
  if (kinds.every((kind) => kind === "idle")) return "idle";
  if (kinds.every((kind) => kind === "clock-only")) return "clock-only";
  if (kinds.every((kind) => kind === "progress")) return "progress";
  return "mixed";
}
export function consistentWakeKind(kinds: WakeKind[]): WakeKind {
  return kinds.every((kind) => kind === kinds[0])
    ? (kinds[0] ?? "unclassified")
    : "unclassified";
}
export function wakeCall(name: unknown, input: unknown): WakeCall {
  let parsed = input;
  if (typeof input === "string") {
    try {
      parsed = JSON.parse(input);
    } catch {
      parsed = undefined;
    }
  }
  return {
    name: typeof name === "string" ? name : "",
    input: objectOf(parsed),
  };
}
