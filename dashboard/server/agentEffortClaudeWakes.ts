import { nativeUsageLines, objectOf, stringOf } from "./nativeUsageFiles.ts";
import {
  combineWakeResults,
  consistentWakeKind,
  wakeCall,
  wakeResult,
  type WakeKind,
} from "./agentEffortWakeKinds.ts";
import type { UsageGap, UsageObservation } from "./usageRecords.ts";

type Row = Record<string, unknown>;
const blocks = (row: Row) => {
  const content = objectOf(row["message"])["content"];
  return Array.isArray(content) ? content.map(objectOf) : [];
};
export async function claudeWakes(file: string, requests: UsageObservation[]) {
  const rows = new Map<string, Row>();
  const gaps: UsageGap[] = [];
  let conflictingUuid = false;
  for await (const { row } of nativeUsageLines(file, gaps, "claude")) {
    const uuid = stringOf(row["uuid"]);
    if (uuid) {
      const previous = rows.get(uuid);
      if (previous && JSON.stringify(previous) !== JSON.stringify(row))
        conflictingUuid = true;
      rows.set(uuid, row);
    }
  }
  const observed = new Map<string, WakeKind>();
  for (const request of requests) {
    const kinds = request.measurements
      .filter((measurement) => measurement.source.file === file)
      .map((measurement): WakeKind => {
        let row = rows.get(measurement.nativeRowId ?? "");
        const resultBlocks = new Map<string, Row>();
        const visited = new Set<string>();
        let parent = stringOf(row?.["parentUuid"]);
        while (parent && !visited.has(parent)) {
          visited.add(parent);
          row = rows.get(parent);
          if (
            !row ||
            row["sessionId"] !== request.sessionId ||
            row["agentId"] !== request.agentId
          )
            return "unclassified";
          if (row["type"] === "assistant") break;
          const content = blocks(row);
          if (
            row["type"] !== "user" ||
            !content.length ||
            content.some((block) => block["type"] !== "tool_result")
          )
            return "unclassified";
          for (const block of content) {
            const id = stringOf(block["tool_use_id"]);
            if (!id) return "unclassified";
            const previous = resultBlocks.get(id);
            if (previous && JSON.stringify(previous) !== JSON.stringify(block))
              return "unclassified";
            resultBlocks.set(id, block);
          }
          parent = stringOf(row["parentUuid"]);
        }
        if (!row || row["type"] !== "assistant" || !resultBlocks.size)
          return "unclassified";
        const emitter = objectOf(row["message"])["id"];
        if (typeof emitter !== "string") return "unclassified";
        const emitted = new Map<string, Row>();
        for (const candidate of rows.values()) {
          if (
            candidate["type"] !== "assistant" ||
            candidate["sessionId"] !== request.sessionId ||
            candidate["agentId"] !== request.agentId ||
            objectOf(candidate["message"])["id"] !== emitter
          )
            continue;
          for (const call of blocks(candidate).filter(
            (block) => block["type"] === "tool_use",
          )) {
            const id = stringOf(call["id"]);
            if (
              !id ||
              (emitted.has(id) &&
                JSON.stringify(emitted.get(id)) !== JSON.stringify(call))
            )
              return "unclassified";
            emitted.set(id, call);
          }
        }
        const calls = [...emitted.values()];
        if (calls.length !== resultBlocks.size) return "unclassified";
        return combineWakeResults(
          calls.map((call) => {
            const result = resultBlocks.get(String(call["id"]));
            if (!result) return "unclassified";
            return wakeResult(
              wakeCall(call["name"], call["input"]),
              result["content"],
            );
          }),
        );
      });
    observed.set(
      request.id,
      !conflictingUuid && !gaps.length
        ? consistentWakeKind(kinds)
        : "unclassified",
    );
  }
  return observed;
}
