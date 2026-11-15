// Which task a response belongs to, as the usage history resolves it: its
// candidates under the canonical task ids, counted only for a task whose
// assignment holds, and for no task when its lineage is contradictory. A
// session contribution's entry (./usageContributions.ts) resolves as the
// responses it sums do, and an import's responses file shares the resolution.
import {
  canonicalUsageTasks,
  usageTaskIndex,
} from "./usageTaskReconciliation.ts";
import {
  eligibleUsageAssociation,
  hasUsageAssignment,
  type NamedTasks,
} from "./usageTaskAssignment.ts";
import { uniqueFacts } from "./usageReconciliation.ts";
import type { UsageObservation, UsageTask } from "./usageRecords.ts";

// `known` is every task record in play, stored and incoming, before they are
// reconciled into the canonical `tasks` returned here.
export function usageResponseResolution(known: UsageTask[]) {
  const tasks = canonicalUsageTasks(known);
  const eligible = new Set(
    tasks.filter(hasUsageAssignment).map((task) => task.id),
  );
  const aliases = new Map<string, string>();
  const canonical = usageTaskIndex(tasks);
  for (const task of known) {
    const position = canonical.only(task);
    const match = position === undefined ? undefined : tasks[position];
    if (match) aliases.set(task.id, match.id);
  }
  const alias = <Named extends NamedTasks>(value: Named): Named => ({
    ...value,
    taskId: value.taskId ? (aliases.get(value.taskId) ?? value.taskId) : null,
    candidates: uniqueFacts(
      value.candidates.map((id) => aliases.get(id) ?? id),
    ),
  });
  const resolve = <Named extends NamedTasks>(
    value: Named,
    observation?: Pick<UsageObservation, "gaps">,
  ): Named => {
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
