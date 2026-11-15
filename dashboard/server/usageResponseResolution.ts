// Which task a response belongs to, as the usage history resolves it: its
// candidates under the canonical task ids, counted only for a task whose
// assignment holds, and for no task when its lineage is contradictory. The
// writer and an import's responses file share this one resolution.
import {
  canonicalUsageTasks,
  sameUsageTask,
} from "./usageTaskReconciliation.ts";
import {
  eligibleUsageAssociation,
  hasUsageAssignment,
} from "./usageTaskAssignment.ts";
import { uniqueFacts } from "./usageReconciliation.ts";
import type {
  UsageAssociation,
  UsageObservation,
  UsageTask,
} from "./usageRecords.ts";

// `known` is every task record in play, stored and incoming, before they are
// reconciled into the canonical `tasks` returned here.
export function usageResponseResolution(known: UsageTask[]) {
  const tasks = canonicalUsageTasks(known);
  const eligible = new Set(
    tasks.filter(hasUsageAssignment).map((task) => task.id),
  );
  const aliases = new Map<string, string>();
  for (const task of known) {
    const matches = tasks.filter(
      (item) => item.id === task.id || sameUsageTask(item, task),
    );
    const [match] = matches;
    if (matches.length === 1 && match) aliases.set(task.id, match.id);
  }
  const alias = (value: UsageAssociation): UsageAssociation => ({
    ...value,
    taskId: value.taskId ? (aliases.get(value.taskId) ?? value.taskId) : null,
    candidates: uniqueFacts(
      value.candidates.map((id) => aliases.get(id) ?? id),
    ),
  });
  const resolve = (
    value: UsageAssociation,
    observation: UsageObservation | undefined,
  ): UsageAssociation => {
    const association = eligibleUsageAssociation(alias(value), eligible);
    if (observation?.gaps.includes("contradictory-lineage")) {
      association.taskId = null;
      association.gaps = uniqueFacts([
        ...association.gaps,
        "contradictory-lineage",
      ]);
    }
    return association;
  };
  return { tasks, alias, resolve };
}
