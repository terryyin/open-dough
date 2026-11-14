import { claudeTaskReader, type NativeTaskSink } from "./nativeTaskFacts.ts";
// Native rows are read transiently. Never retain message content, tool input or
// provider request bodies; only API identity, counters and structured lineage.
import path from "node:path";
import { claudeCounters } from "./claudeUsageCounters.ts";
import {
  recordClaudeNode,
  recordClaudeResponse,
  type ClaudeLineage,
} from "./claudeUsageLineage.ts";
import {
  nativeUsageLines,
  objectOf,
  stringOf,
  timestampOf,
} from "./nativeUsageFiles.ts";
import { reconcileObservation } from "./usageReconciliation.ts";
import {
  responseKey,
  type UsageGap,
  type UsageObservation,
  type UsageSettings,
} from "./usageRecords.ts";

export async function* claudeUsage(
  file: string,
  since: number,
  gaps: UsageGap[],
  lineage: ClaudeLineage,
  taskSink?: NativeTaskSink,
): AsyncGenerator<UsageObservation> {
  const taskReader = claudeTaskReader(taskSink);
  const filename = path.basename(file).replace(/\.jsonl(?:\.zst)?$/, "");
  for await (const { row, line } of nativeUsageLines(file, gaps)) {
    const sessionId = stringOf(row["sessionId"]);
    const agentId = stringOf(row["agentId"]);
    // The native row must corroborate the file's owner; copied ancestors cannot
    // create another response or establish worker ancestry by directory alone.
    if (
      !sessionId ||
      (agentId ? filename !== `agent-${agentId}` : filename !== sessionId)
    )
      continue;
    const source = { kind: "native" as const, file, line };
    taskReader(row, source);
    recordClaudeNode(lineage, sessionId, agentId, row, source);
    if (row["type"] !== "assistant") continue;
    const message = objectOf(row["message"]);
    const responseId = stringOf(message["id"]);
    const nativeRowId = stringOf(row["uuid"]);
    const at = timestampOf(row["timestamp"]);
    if (!responseId || !at) {
      gaps.push({
        code: "unsupported-response-identity",
        host: "claude",
        sessionId,
        source,
      });
      continue;
    }
    recordClaudeResponse(lineage, sessionId, agentId);
    if (Date.parse(at) < since) continue;
    const settings: UsageSettings = {};
    const model = stringOf(message["model"]);
    const effort = stringOf(row["effort"]);
    if (model) settings.model = model;
    if (effort) settings.effort = effort;
    const {
      reported,
      tokens,
      gaps: counterGaps,
    } = claudeCounters(objectOf(message["usage"]));
    const requestId = stringOf(row["requestId"]);
    const native = {
      at,
      ...(agentId ? { agentId, parentSessionId: sessionId } : {}),
    };
    yield reconcileObservation(undefined, {
      id: responseKey("claude", sessionId, responseId),
      host: "claude",
      sessionId,
      responseId,
      ...native,
      scope: "response",
      settings,
      measurements: [
        {
          source,
          settings,
          ...native,
          ...(nativeRowId ? { nativeRowId } : {}),
          ...(requestId ? { requestId } : {}),
          definition: "claude-disjoint-input",
          reported,
          tokens,
        },
      ],
      tokens,
      coverage: "partial",
      gaps: counterGaps,
    });
  }
}
