import { nativeUsageLines, objectOf, stringOf } from "./nativeUsageFiles.ts";
import {
  combineWakeResults,
  wakeCall,
  wakeResult,
  type WakeCall,
  type WakeKind,
} from "./agentEffortWakeKinds.ts";
import type { UsageGap, UsageObservation } from "./usageRecords.ts";

// A token_usage_record closes one native response. Only results matched to
// the complete call set emitted by the prior response can qualify its successor.
export async function codexWakes(file: string, requests: UsageObservation[]) {
  const selected = new Map(
    requests.map((request) => [request.responseId, request]),
  );
  const observed = new Map<string, WakeKind>();
  const seen = new Set<string>();
  let pending = new Map<string, WakeCall>();
  let emitted = new Map<string, WakeCall>();
  let results = new Map<string, { wire: string; kind: WakeKind }>();
  let turn: string | undefined;
  let interrupted = false;
  const gaps: UsageGap[] = [];
  for await (const { row } of nativeUsageLines(file, gaps)) {
    const payload = objectOf(row["payload"]);
    if (row["type"] === "response_item") {
      const type = payload["type"];
      const id = stringOf(payload["call_id"]);
      if (
        type === "message" &&
        ["user", "developer"].includes(String(payload["role"]))
      )
        interrupted = true;
      if (type === "function_call" || type === "custom_tool_call") {
        if (id)
          emitted.set(
            id,
            wakeCall(payload["name"], payload["arguments"] ?? payload["input"]),
          );
        else interrupted = true;
      }
      if (
        type === "function_call_output" ||
        type === "custom_tool_call_output"
      ) {
        const output = payload["output"];
        const wire = JSON.stringify(output);
        if (!id || !pending.has(id)) interrupted = true;
        else {
          const previous = results.get(id);
          results.set(id, {
            wire,
            kind:
              previous &&
              (previous.kind === "unclassified" || previous.wire !== wire)
                ? "unclassified"
                : wakeResult(pending.get(id), output),
          });
        }
      }
    }
    if (row["type"] !== "token_usage_record") continue;
    const id = stringOf(payload["response_id"]);
    if (!id || seen.has(id)) continue;
    seen.add(id);
    const request = selected.get(id);
    if (request && payload["thread_id"] === request.sessionId) {
      observed.set(
        request.id,
        !interrupted &&
          turn === payload["turn_id"] &&
          pending.size > 0 &&
          results.size === pending.size
          ? combineWakeResults(
              [...results.values()].map((result) => result.kind),
            )
          : "unclassified",
      );
    }
    turn = stringOf(payload["turn_id"]);
    pending = emitted;
    emitted = new Map();
    results = new Map();
    interrupted = false;
  }
  if (gaps.length)
    for (const id of observed.keys()) observed.set(id, "unclassified");
  return observed;
}
