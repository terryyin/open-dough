// Discover activity for native units before proving assignment eligibility.
// These temporary units intentionally omit assignment evidence: even a rejected
// wrapper can have an in-window worker worth inspecting. Final task accounting
// applies eligibility after reconstruction; held corrections bypass the window.
import { codexAssociation, type CodexLineage } from "./codexUsageLineage.ts";
import { claudeAssociation, type ClaudeLineage } from "./claudeUsageLineage.ts";
import {
  canonicalUsageTasks,
  usageTaskIndex,
} from "./usageTaskReconciliation.ts";
import type { NativeTaskFact } from "./nativeTaskFacts.ts";
import type { UsageObservation, UsageTask } from "./usageRecords.ts";

export const nativeTaskKey = (
  fact: Pick<NativeTaskFact, "host" | "sessionId" | "turnId">,
) => JSON.stringify([fact.host, fact.sessionId, fact.turnId]);
// The native units the facts read, each claiming its turns.
function nativeTaskUnits(facts: readonly NativeTaskFact[]) {
  return canonicalUsageTasks(
    facts.map((fact): UsageTask => ({
      id: nativeTaskKey(fact),
      kind: "recovered",
      host: fact.host,
      sessionId: fact.sessionId,
      rootTurnId: fact.turnId,
      nativeTurns: fact.turns,
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
}
// The units that are each exactly one of `known`, to merge into it: the turns
// a known task claims in the sessions read, and no task of their own.
export function knownTaskClaims(
  facts: readonly NativeTaskFact[],
  known: readonly UsageTask[],
): UsageTask[] {
  const index = usageTaskIndex(known);
  return nativeTaskUnits(facts).filter(
    (unit) => index.only(unit) !== undefined,
  );
}
export function nativeTaskActivity(
  facts: NativeTaskFact[],
  observations: UsageObservation[],
  codex: CodexLineage,
  claude: ClaudeLineage,
) {
  const units = nativeTaskUnits(facts);
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
