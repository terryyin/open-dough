// The launch-history store's usage document. Existing monthly launch JSONL stays
// readable unchanged; routine launch reads/writes do not import this module.
import { homedir } from "node:os";
import path from "node:path";
import { launchHistoryDirectory } from "./launchHistory.ts";
import {
  readMachineJson,
  replaceMachineJson,
  leaveMachineJson,
} from "./machineJsonStore.ts";
import {
  reconcileAssociation,
  reconcileObservation,
  uniqueFacts,
} from "./usageReconciliation.ts";
import {
  emptyUsageHistory,
  emptyUsageTokens,
  responseKey,
  usageHistorySchema,
  usageTaskSchema,
  usageObservationSchema,
  usageAssociationSchema,
  usageGapSchema,
  type UsageBatch,
  type UsageHistory,
  type UsageTokens,
} from "./usageRecords.ts";
export type { UsageHistory, UsageBatch } from "./usageRecords.ts";

export function usageHistoryFile(home = homedir()): string {
  return path.join(launchHistoryDirectory(home), "usage.json");
}
function store(file = usageHistoryFile()) {
  return {
    file,
    schema: usageHistorySchema,
    empty: emptyUsageHistory(),
    unreadable: "preserve" as const,
    durable: true,
  };
}
export async function readUsageHistory(
  file = usageHistoryFile(),
): Promise<UsageHistory> {
  const result = await readMachineJson(store(file));
  if (result.kind === "unreadable")
    throw new Error(`Usage history is unreadable: ${file}`);
  return result.document;
}
// Native decoders and later collectors use this one writer with the same
// host/session/response key and source-defined disjoint measurements.
export async function writeUsageHistory(
  batch: UsageBatch,
  file = usageHistoryFile(),
): Promise<void> {
  const tasks = (batch.tasks ?? []).map((item) => usageTaskSchema.parse(item));
  const observations = (batch.observations ?? []).map((item) =>
    usageObservationSchema.parse(item),
  );
  const associations = (batch.associations ?? []).map((item) =>
    usageAssociationSchema.parse(item),
  );
  const gaps = (batch.gaps ?? []).map((item) => usageGapSchema.parse(item));
  await replaceMachineJson(store(file), (held) => {
    const next = structuredClone(held);
    for (const task of tasks) {
      const old = next.tasks[task.id];
      next.tasks[task.id] = {
        ...old,
        ...task,
        requested: { ...old?.requested, ...task.requested },
        sources: uniqueFacts([...(old?.sources ?? []), ...task.sources]),
        gaps: uniqueFacts([...(old?.gaps ?? []), ...task.gaps]),
      };
    }
    for (const observation of observations) {
      const id = responseKey(
        observation.host,
        observation.sessionId,
        observation.responseId,
      );
      if (id !== observation.id)
        throw new Error(
          "Usage observation identity does not match its native key",
        );
      next.observations[id] = reconcileObservation(
        next.observations[id],
        observation,
      );
    }
    for (const association of associations) {
      if (!next.observations[association.observationId])
        throw new Error("Usage association lacks its observation");
      for (const candidate of association.candidates) {
        if (!next.tasks[candidate])
          throw new Error("Usage association names an unknown task");
      }
      if (association.taskId && !next.tasks[association.taskId])
        throw new Error("Usage association names an unknown task");
      next.associations[association.observationId] = reconcileAssociation(
        next.associations[association.observationId],
        association,
      );
    }
    for (const [id, association] of Object.entries(next.associations)) {
      if (next.observations[id]?.gaps.includes("contradictory-lineage")) {
        association.taskId = null;
        association.gaps = uniqueFacts([
          ...association.gaps,
          "contradictory-lineage",
        ]);
      }
    }
    next.gaps = uniqueFacts([...next.gaps, ...gaps]).filter(
      (gap) =>
        gap.code !== "no-attributable-response-usage" ||
        !Object.values(next.associations).some(
          (association) => association.taskId === gap.taskId,
        ),
    );
    return JSON.stringify(next) === JSON.stringify(held)
      ? leaveMachineJson
      : next;
  });
}
// These are measured subtotals, with unmeasured counts alongside each category.
// No measured value means null, including a task with no attributable responses.
export function taskUsage(history: UsageHistory, taskId: string) {
  const observations = Object.values(history.observations).filter(
    (item) => history.associations[item.id]?.taskId === taskId,
  );
  const tokens = emptyUsageTokens();
  const unmeasured = {} as Record<keyof UsageTokens, number>;
  for (const name of Object.keys(tokens) as (keyof UsageTokens)[]) {
    const values = observations
      .map((item) => item.tokens[name])
      .filter((value) => value !== null);
    tokens[name] =
      values.length === 0
        ? null
        : values.reduce((sum, value) => sum + value, 0);
    unmeasured[name] = observations.length - values.length;
  }
  return {
    requests: observations.length,
    tokens,
    unmeasured,
    scope: "retained-evidence" as const,
  };
}
