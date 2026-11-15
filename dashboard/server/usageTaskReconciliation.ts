// Stable native task identity and monotonic enrichment shared by import and write.
import { reconcileTaskAssignment } from "./usageTaskAssignment.ts";
import { reconcileTaskClaims, taskClaims } from "./usageTaskClaims.ts";
import { uniqueFacts } from "./usageReconciliation.ts";
import type { UsageTask } from "./usageRecords.ts";

export function sameUsageTask(a: UsageTask, b: UsageTask) {
  if (a.host !== b.host || a.sessionId !== b.sessionId) return false;

  return (
    (a.rootTurnId !== undefined &&
      [b.rootTurnId, ...(b.nativeTurns ?? [])].includes(a.rootTurnId)) ||
    (a.launchReference !== undefined && a.launchReference === b.launchReference)
  );
}
export function mergeUsageTask(
  old: UsageTask | undefined,
  incoming: UsageTask,
): UsageTask {
  if (!old) return reconcileTaskAssignment(reconcileTaskClaims(incoming));
  const claims = taskClaims(old);
  for (const [field, evidence] of Object.entries(taskClaims(incoming)))
    claims[field] = uniqueFacts([...(claims[field] ?? []), ...evidence]);
  const sources = { ...old.fieldSources };
  for (const [field, refs] of Object.entries(incoming.fieldSources ?? {}))
    sources[field] = uniqueFacts([...(sources[field] ?? []), ...refs]);
  const merged: UsageTask = reconcileTaskAssignment(
    reconcileTaskClaims({
      ...old,
      ...incoming,
      id: old.id,
      kind:
        old.kind === "launch" || incoming.kind === "launch"
          ? "launch"
          : "recovered",
      nativeTurns: uniqueFacts([
        ...(old.nativeTurns ?? []),
        ...(incoming.nativeTurns ?? []),
        ...[old.rootTurnId, incoming.rootTurnId].filter(
          (turn) => turn !== undefined,
        ),
      ]),
      rootTurnId: old.rootTurnId ?? incoming.rootTurnId,
      project: incoming.project ?? old.project,
      workflow: incoming.workflow ?? old.workflow,
      identity: incoming.identity ?? old.identity,
      title: incoming.title ?? old.title,
      launchedAt:
        old.kind === "launch"
          ? old.launchedAt
          : incoming.kind === "launch"
            ? incoming.launchedAt
            : (old.launchedAt ?? incoming.launchedAt),
      ...([old.lastActivityAt, incoming.lastActivityAt].some(Boolean)
        ? {
            lastActivityAt: [old.lastActivityAt, incoming.lastActivityAt]
              .filter((at) => at !== undefined)
              .sort()
              .at(-1),
          }
        : {}),
      origin:
        old.origin === "dashboard" || incoming.origin === "dashboard"
          ? "dashboard"
          : incoming.origin === "unknown"
            ? old.origin
            : incoming.origin,
      outcome: incoming.outcome
        ? { ...old.outcome, ...incoming.outcome }
        : old.outcome,
      requested: { ...old.requested, ...incoming.requested },
      sources: uniqueFacts([...old.sources, ...incoming.sources]),
      fieldSources: sources,
      fieldClaims: claims,
      gaps: uniqueFacts([...old.gaps, ...incoming.gaps]),
    }),
    old,
  );
  const settled: Record<string, boolean> = {
    "unresolved-project": merged.project !== null,
    "task-outcome-unknown": Boolean(merged.outcome),
    "workflow-unknown": merged.workflow !== null,
    "story-identity-unknown": merged.identity !== null,
    "story-title-unknown": merged.title !== null,
    "requested-settings-unknown": Object.keys(merged.requested).length > 0,
    "task-start-unknown": merged.launchedAt !== null,
    "origin-unknown": merged.origin !== "unknown",
    "missing-historical-revision": merged.identity !== null,
    "unresolved-historical-story":
      merged.identity !== null && merged.title !== null,
  };
  return { ...merged, gaps: merged.gaps.filter((gap) => !settled[gap]) };
}
// The task records kept so far, found by what a record can share with one:
// its id, or its host and session, without which no two are the same task.
// Reconciling a history's thousands of records stays linear in their number.
export function usageTaskIndex(known: readonly UsageTask[] = []) {
  const tasks: UsageTask[] = [];
  const positions = new Map<string, number[]>();
  const keys = (task: UsageTask) => [
    JSON.stringify([task.id]),
    JSON.stringify([task.host, task.sessionId]),
  ];
  // Keeps `task` as a further record, or at `position` in place of the
  // record it was merged from.
  const keep = (task: UsageTask, position = tasks.length) => {
    tasks[position] = task;
    for (const key of keys(task)) {
      const sharing = positions.get(key);
      if (sharing === undefined) positions.set(key, [position]);
      else if (!sharing.includes(position)) sharing.push(position);
    }
  };
  for (const task of known) keep(task);
  // Where the one kept record that is `task` stands: nowhere when none is,
  // and when several are, which leaves the task its own record.
  const only = (task: UsageTask): number | undefined => {
    const matches = [
      ...new Set(keys(task).flatMap((key) => positions.get(key) ?? [])),
    ].filter((position) => {
      const item = tasks[position];
      return (
        item !== undefined && (item.id === task.id || sameUsageTask(item, task))
      );
    });
    return matches.length === 1 ? matches[0] : undefined;
  };
  return { tasks, keep, only };
}
export function canonicalUsageTasks(tasks: UsageTask[]) {
  const kept = usageTaskIndex();
  for (const task of tasks) {
    const position = kept.only(task);
    const old = position === undefined ? undefined : kept.tasks[position];
    kept.keep(mergeUsageTask(old, task), position);
  }
  return kept.tasks;
}
