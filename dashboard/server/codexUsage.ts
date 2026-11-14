// Passive Codex response reads. The containing thread owns its responses; copied
// session_meta rows and cumulative token_count snapshots cannot change ownership.
import { codexCounters } from "./codexUsageCounters.ts";
import {
  nativeUsageLines,
  objectOf,
  stringOf,
  timestampOf,
} from "./nativeUsageFiles.ts";
import {
  responseKey,
  type UsageObservation,
  type UsageSettings,
  type UsageGap,
  type UsageSource,
} from "./usageRecords.ts";
import { reconcileObservation } from "./usageReconciliation.ts";
import {
  containingCodexThread,
  recordCodexSession,
  type CodexLineage,
} from "./codexUsageLineage.ts";

function settingsOf(payload: Record<string, unknown>): UsageSettings {
  const result: UsageSettings = {};
  const model = stringOf(payload["model"]);
  const effort =
    stringOf(payload["effort"]) ?? stringOf(payload["reasoning_effort"]);
  const approval = stringOf(payload["approval_policy"]);
  const sandbox = stringOf(objectOf(payload["sandbox_policy"])["type"]);
  if (model) result.model = model;
  if (effort) result.effort = effort;
  if (approval) result.approvalPolicy = approval;
  if (sandbox) result.sandbox = sandbox;
  return result;
}
export async function* codexUsage(
  file: string,
  since: number,
  gaps: UsageGap[],
  lineageEvidence: CodexLineage,
): AsyncGenerator<UsageObservation> {
  const owner = containingCodexThread(file);
  let ownMetadata = false;
  let parentSessionId: string | undefined;
  const spawned = new Set<string>();
  const settings = new Map<
    string,
    { settings: UsageSettings; source: UsageSource }
  >();
  for await (const { row, line } of nativeUsageLines(file, gaps)) {
    const payload = objectOf(row["payload"]);
    if (row["type"] === "session_meta" && payload["id"] === owner) {
      ownMetadata = true;
      const session = recordCodexSession(lineageEvidence, owner, payload, {
        kind: "native",
        file,
        line,
      });
      parentSessionId =
        session.parents.length === 1 ? session.parents[0] : undefined;
    }
    if (row["type"] === "event_msg" && payload["type"] === "token_count") {
      const session =
        lineageEvidence.sessions.get(owner) ??
        recordCodexSession(
          lineageEvidence,
          owner,
          {},
          { kind: "native", file, line },
        );
      session.legacyCounters.push({ kind: "native", file, line });
    }
    if (
      row["type"] === "response_item" &&
      payload["type"] === "function_call" &&
      payload["name"] === "spawn_agent"
    ) {
      const call = stringOf(payload["call_id"]);
      if (call) spawned.add(call);
    }
    if (
      row["type"] === "response_item" &&
      payload["type"] === "function_call_output" &&
      spawned.has(stringOf(payload["call_id"]) ?? "")
    ) {
      let result: Record<string, unknown> = {};
      try {
        const parsed: unknown = JSON.parse(stringOf(payload["output"]) ?? "");
        result = objectOf(parsed);
      } catch {
        /* Unavailable worker identity remains a coverage gap. */
      }
      const sessionId = stringOf(result["agent_id"]);
      const agentPath = stringOf(result["task_name"]);
      lineageEvidence.workers.push({
        ...(sessionId ? { sessionId } : {}),
        ...(agentPath ? { agentPath } : {}),
        source: { kind: "native", file, line },
      });
    }
    if (row["type"] === "turn_context") {
      const turn = stringOf(payload["turn_id"]);
      if (turn)
        settings.set(turn, {
          settings: settingsOf(payload),
          source: { kind: "native", file, line },
        });
    }
    if (row["type"] !== "token_usage_record") continue;
    const sessionId = stringOf(payload["thread_id"]);
    const responseId = stringOf(payload["response_id"]);
    const at = timestampOf(row["timestamp"]);
    if (sessionId !== undefined && sessionId !== owner) continue;
    if (!sessionId || !responseId || !at) {
      gaps.push({
        code: "unsupported-response-identity",
        source: { kind: "native", file, line },
      });
      continue;
    }
    const session =
      lineageEvidence.sessions.get(owner) ??
      recordCodexSession(
        lineageEvidence,
        owner,
        {},
        { kind: "native", file, line },
      );
    session.responses++;
    if (!ownMetadata)
      gaps.push({
        code: "missing-session-metadata",
        host: "codex",
        sessionId,
        source: { kind: "native", file, line },
      });
    if (Date.parse(at) < since) continue;
    const turnId = stringOf(payload["turn_id"]);
    const rootTurnId = stringOf(payload["root_turn_id"]);
    const {
      reported,
      tokens,
      gaps: counterGaps,
    } = codexCounters(objectOf(payload["usage"]));
    const context = turnId ? settings.get(turnId) : undefined;
    const observedSettings = context?.settings ?? {};
    const lineage = {
      ...(turnId ? { turnId } : {}),
      ...(rootTurnId ? { rootTurnId } : {}),
      ...(parentSessionId ? { parentSessionId } : {}),
      at,
    };
    yield reconcileObservation(undefined, {
      id: responseKey("codex", sessionId, responseId),
      host: "codex",
      sessionId,
      responseId,
      ...lineage,
      scope: "response",
      settings: observedSettings,
      measurements: [
        {
          source: { kind: "native", file, line },
          settings: observedSettings,
          ...(context ? { settingsSource: context.source } : {}),
          ...lineage,
          definition: "codex-inclusive-input",
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
