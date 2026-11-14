// Stable native task identity and monotonic enrichment shared by import and write.
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
  if (!old) return reconcileTaskClaims(incoming);
  const claims = taskClaims(old);
  for (const [field, evidence] of Object.entries(taskClaims(incoming)))
    claims[field] = uniqueFacts([...(claims[field] ?? []), ...evidence]);
  const sources = { ...old.fieldSources };
  for (const [field, refs] of Object.entries(incoming.fieldSources ?? {}))
    sources[field] = uniqueFacts([...(sources[field] ?? []), ...refs]);
  const merged: UsageTask = reconcileTaskClaims({
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
    launchedAt: old.launchedAt ?? incoming.launchedAt,
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
  });
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
export function canonicalUsageTasks(tasks: UsageTask[]) {
  const result: UsageTask[] = [];
  for (const task of tasks) {
    const matches = result.filter(
      (item) => item.id === task.id || sameUsageTask(item, task),
    );
    if (matches.length === 1 && matches[0]) {
      const index = result.indexOf(matches[0]);
      result[index] = mergeUsageTask(matches[0], task);
    } else result.push(reconcileTaskClaims(task));
  }
  return result;
}
