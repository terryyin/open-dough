// Recovery eligibility and timing use the same task/worker association rules as
// final accounting. A root need not have any own response inside the window.
import { codexAssociation, type CodexLineage } from "./codexUsageLineage.ts";
import { claudeAssociation, type ClaudeLineage } from "./claudeUsageLineage.ts";
import { canonicalUsageTasks } from "./usageTaskReconciliation.ts";
import type { NativeTaskFact } from "./nativeTaskFacts.ts";
import type { UsageObservation, UsageTask } from "./usageRecords.ts";

export const nativeTaskKey = (
  fact: Pick<NativeTaskFact, "host" | "sessionId" | "turnId">,
) => JSON.stringify([fact.host, fact.sessionId, fact.turnId]);
export function nativeTaskActivity(
  facts: NativeTaskFact[],
  observations: UsageObservation[],
  codex: CodexLineage,
  claude: ClaudeLineage,
) {
  const units = canonicalUsageTasks(
    facts.map((fact): UsageTask => ({
      id: nativeTaskKey(fact),
      kind: "recovered",
      host: fact.host,
      sessionId: fact.sessionId,
      rootTurnId: fact.turnId,
      nativeTurns: [fact.turnId],
      project: null,
      workflow: null,
      identity: null,
      title: null,
      launchedAt: null,
      origin: "unknown",
      requested: {},
      ...(fact.reference ? { launchReference: fact.reference } : {}),
      sources: [fact.source],
      gaps: [],
    })),
  );
  const byId = new Map(units.map((unit) => [unit.id, unit]));
  const result = new Map<string, UsageObservation[]>();
  for (const observation of observations) {
    const association =
      observation.host === "claude"
        ? claudeAssociation(observation, units, claude).association
        : codexAssociation(observation, units, codex);
    const unit = association.taskId ? byId.get(association.taskId) : undefined;
    if (!unit) continue;
    for (const turnId of unit.nativeTurns ?? []) {
      const key = nativeTaskKey({
        host: unit.host,
        sessionId: unit.sessionId,
        turnId,
      });
      result.set(key, [...(result.get(key) ?? []), observation]);
    }
  }
  return result;
}
