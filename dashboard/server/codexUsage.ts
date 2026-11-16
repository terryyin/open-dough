import { codexTaskReader, type NativeTaskSink } from "./nativeTaskFacts.ts";
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

type TurnSettings = { settings: UsageSettings; source: UsageSource };
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
  taskSink?: NativeTaskSink,
): AsyncGenerator<UsageObservation> {
  const owner = containingCodexThread(file);
  const taskReader = codexTaskReader(owner, taskSink);
  let ownMetadata = false;
  let parentSessionId: string | undefined;
  const spawned = new Set<string>();
  const settings = new Map<string, TurnSettings>();
  // The service tier the thread's latest applied settings record; later
  // responses run at it. Settings that record none leave responses without.
  let serviceTier: string | undefined;
  // A turn-start compaction's response is recorded before its turn's
  // turn_context; it waits for that turn's settings or the end of the file.
  const awaitingTurn = new Map<
    string,
    Array<(context?: TurnSettings) => UsageObservation>
  >();
  for await (const { row, line } of nativeUsageLines(file, gaps)) {
    taskReader(row, { kind: "native", file, line });
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
    if (
      row["type"] === "event_msg" &&
      payload["type"] === "thread_settings_applied" &&
      (stringOf(payload["thread_id"]) ?? owner) === owner
    )
      serviceTier = stringOf(
        objectOf(payload["thread_settings"])["service_tier"],
      );
    if (row["type"] === "turn_context") {
      const turn = stringOf(payload["turn_id"]);
      if (turn) {
        const context: TurnSettings = {
          settings: settingsOf(payload),
          source: { kind: "native", file, line },
        };
        settings.set(turn, context);
        for (const observe of awaitingTurn.get(turn) ?? [])
          yield observe(context);
        awaitingTurn.delete(turn);
      }
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
    const tier = serviceTier;
    const lineage = {
      ...(turnId ? { turnId } : {}),
      ...(rootTurnId ? { rootTurnId } : {}),
      ...(parentSessionId ? { parentSessionId } : {}),
      at,
    };
    const observe = (context?: TurnSettings): UsageObservation => {
      const observedSettings: UsageSettings = {
        ...context?.settings,
        ...(tier ? { serviceTier: tier } : {}),
      };
      return reconcileObservation(undefined, {
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
    };
    const context = turnId ? settings.get(turnId) : undefined;
    if (turnId && !context)
      awaitingTurn.set(turnId, [...(awaitingTurn.get(turnId) ?? []), observe]);
    else yield observe(context);
  }
  for (const pending of awaitingTurn.values())
    for (const observe of pending) yield observe();
}
