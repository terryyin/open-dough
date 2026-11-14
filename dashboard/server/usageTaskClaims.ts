// Keep competing known field facts inspectable; a later value is not a vote.
import { launchWorkflows } from "../src/launchWorkflow.ts";
import { uniqueFacts } from "./usageReconciliation.ts";
import type { UsageTask } from "./usageRecords.ts";

export function taskClaims(
  task: UsageTask,
): NonNullable<UsageTask["fieldClaims"]> {
  const claims = { ...task.fieldClaims };
  const fields = {
    project: task.project,
    identity: task.identity,
    title: task.title,
    workflow:
      Object.entries(launchWorkflows).find(
        ([name]) => name === task.workflow,
      )?.[1].skill ?? task.workflow,
    origin: task.origin === "unknown" ? null : task.origin,
    outcome: task.outcome ?? null,
    ...Object.fromEntries(
      Object.entries(task.requested).map(([key, value]) => [
        `requested.${key}`,
        value,
      ]),
    ),
  };
  for (const [field, value] of Object.entries(fields)) {
    if (value === null || claims[field]?.length) continue;
    claims[field] = uniqueFacts([
      ...(claims[field] ?? []),
      { value, sources: task.fieldSources?.[field] ?? task.sources },
    ]);
  }
  return claims;
}
function incompatibleOutcome(a: unknown, b: unknown): boolean {
  if (
    typeof a !== "object" ||
    a === null ||
    Array.isArray(a) ||
    typeof b !== "object" ||
    b === null ||
    Array.isArray(b)
  )
    return JSON.stringify(a) !== JSON.stringify(b);
  const left = a as Record<string, unknown>;
  const right = b as Record<string, unknown>;
  return Object.keys(left).some(
    (key) =>
      left[key] !== undefined &&
      right[key] !== undefined &&
      left[key] !== right[key],
  );
}
export function reconcileTaskClaims(task: UsageTask): UsageTask {
  const claims = taskClaims(task);
  const conflicts = new Set(
    Object.entries(claims)
      .filter(([field, evidence]) =>
        field === "outcome"
          ? evidence.some((left) =>
              evidence.some((right) =>
                incompatibleOutcome(left.value, right.value),
              ),
            )
          : new Set(evidence.map((item) => JSON.stringify(item.value))).size >
            1,
      )
      .map(([field]) => field),
  );
  const requested = Object.fromEntries(
    Object.entries(task.requested).filter(
      ([key]) => !conflicts.has(`requested.${key}`),
    ),
  );
  return {
    ...task,
    fieldClaims: claims,
    requested,
    project: conflicts.has("project") ? null : task.project,
    identity: conflicts.has("identity") ? null : task.identity,
    title: conflicts.has("title") ? null : task.title,
    workflow: conflicts.has("workflow") ? null : task.workflow,
    origin: conflicts.has("origin") ? "unknown" : task.origin,
    outcome: conflicts.has("outcome") ? null : task.outcome,
    gaps: uniqueFacts([
      ...task.gaps,
      ...[...conflicts].map((field) => `contradictory-task-field:${field}`),
    ]),
  };
}
