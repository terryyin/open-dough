// Reconcile evidence facts, never add replayed counters. Different measured
// values remain inspectable and their aggregate is unknown until reconciled.
import {
  emptyUsageTokens,
  type UsageObservation,
  type UsageTokens,
  type UsageAssociation,
} from "./usageRecords.ts";

export function uniqueFacts<T>(facts: readonly T[]): T[] {
  const seen = new Set<string>();
  return facts.filter((fact) => {
    const key = JSON.stringify(fact);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
export function reconcileObservation(
  previous: UsageObservation | undefined,
  incoming: UsageObservation,
): UsageObservation {
  const measurements = uniqueFacts([
    ...(previous?.measurements ?? []),
    ...incoming.measurements,
  ]);
  const tokens = emptyUsageTokens();
  let contradiction = false;
  for (const name of Object.keys(tokens) as (keyof UsageTokens)[]) {
    const values = new Set(
      measurements
        .map((item) => item.tokens[name])
        .filter((value) => value !== null),
    );
    tokens[name] = values.size === 1 ? ([...values][0] ?? null) : null;
    if (values.size > 1) contradiction = true;
  }
  const core = [
    tokens.uncachedInput,
    tokens.cacheRead,
    tokens.cacheWrite,
    tokens.output,
  ];
  const gaps = uniqueFacts([
    ...(previous?.gaps ?? []),
    ...incoming.gaps,
  ]).filter((gap) => gap !== "missing-token-components");
  if (core.some((value) => value === null))
    gaps.push("missing-token-components");
  if (contradiction) gaps.push("contradictory-measurements");
  const result: UsageObservation = {
    id: incoming.id,
    host: incoming.host,
    sessionId: incoming.sessionId,
    responseId: incoming.responseId,
    scope: incoming.scope,
    settings: {},
    measurements,
    tokens,
    coverage: core.every((value) => value === null)
      ? "unavailable"
      : core.some((value) => value === null)
        ? "partial"
        : "measured",
    gaps: uniqueFacts(gaps),
  };
  for (const field of [
    "model",
    "effort",
    "approvalPolicy",
    "sandbox",
  ] as const) {
    const values = uniqueFacts(
      measurements
        .map((item) => item.settings[field])
        .filter((value) => value !== undefined),
    );
    const [value] = values;
    if (values.length === 1 && value !== undefined)
      result.settings[field] = value;
    else if (values.length > 1)
      result.gaps.push("contradictory-observed-settings");
  }
  for (const field of [
    "turnId",
    "rootTurnId",
    "parentSessionId",
    "at",
  ] as const) {
    const values = uniqueFacts(
      [
        ...measurements.map((item) => item[field]),
        previous?.[field],
        incoming[field],
      ].filter((value) => value !== undefined),
    );
    const [value] = values;
    if (values.length === 1 && value !== undefined) result[field] = value;
    else if (values.length > 1) result.gaps.push("contradictory-lineage");
  }
  result.gaps = uniqueFacts(result.gaps);
  return result;
}
export function reconcileAssociation(
  previous: UsageAssociation | undefined,
  incoming: UsageAssociation,
): UsageAssociation {
  const candidates = uniqueFacts([
    ...(previous?.candidates ?? []),
    ...incoming.candidates,
    ...(previous?.taskId ? [previous.taskId] : []),
    ...(incoming.taskId ? [incoming.taskId] : []),
  ]);
  return {
    observationId: incoming.observationId,
    taskId: candidates.length === 1 ? (candidates[0] ?? null) : null,
    candidates,
    sources: uniqueFacts([...(previous?.sources ?? []), ...incoming.sources]),
    gaps:
      candidates.length > 1
        ? ["ambiguous-task-association"]
        : candidates.length === 0
          ? ["unresolved-task-association"]
          : [],
  };
}
