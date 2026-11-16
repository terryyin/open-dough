import { codexAncestry } from "./codexUsageLineage.ts";
import { usageHistoryFile } from "./usageHistory.ts";
import { scanUsageHistory, type UsageScanOptions } from "./usageScan.ts";
import type { UsageObservation } from "./usageRecords.ts";
import { nativeEffortSummary } from "./agentEffortNativeSummary.ts";
import { effortGroups } from "./agentEffortGroups.ts";

export type EffortSelection = {
  task?: string | undefined;
  host?: "codex" | "claude" | undefined;
  family?: string | undefined;
  from?: string | undefined;
  until?: string | undefined;
  list?: boolean | undefined;
  guidanceVersion?: string | undefined;
};
export type EffortEvidence = {
  responses: UsageObservation[];
  groups: Awaited<ReturnType<typeof effortGroups>>;
  gaps: Set<string>;
};
export async function agentEffortReport(
  options: UsageScanOptions,
  selection: EffortSelection,
  observe?: (evidence: EffortEvidence) => void,
) {
  const store = options.store ?? usageHistoryFile(options.home);
  const from =
    selection.from === undefined
      ? Date.parse(options.since)
      : Date.parse(selection.from);
  const until =
    selection.until === undefined ? Infinity : Date.parse(selection.until);
  if (
    !Number.isFinite(from) ||
    (selection.until !== undefined && !Number.isFinite(until)) ||
    from >= until
  )
    throw new Error(
      "Choose valid timestamps with --from before --until (exclusive)",
    );
  if (
    selection.family &&
    (!selection.host || !selection.from || !selection.until)
  )
    throw new Error("Native --family requires --host, --from and --until");
  const scan = await scanUsageHistory(
    { ...options, retainNativeObservations: Boolean(selection.family) },
    from,
    store,
  );
  const catalog = scan.tasks
    .map(({ id, host, sessionId, rootTurnId, identity, launchedAt }) => ({
      id,
      host,
      sessionId,
      rootTurnId,
      identity,
      launchedAt,
    }))
    .sort((a, b) => a.id.localeCompare(b.id));
  if (selection.list) return { format: "agent-effort-v1", selections: catalog };
  if (Boolean(selection.task) === Boolean(selection.family))
    throw new Error(
      "Choose one --task ID (or exact identity), or --family SESSION; use --list for identifiers",
    );
  const matches = selection.task
    ? scan.tasks.filter(
        (task) =>
          task.id === selection.task || task.identity === selection.task,
      )
    : [];
  if (selection.task && matches.length !== 1)
    throw new Error(
      `Task selection ${matches.length ? "is ambiguous" : "was not found"}; choose an explicit id from --list: ${JSON.stringify(catalog.filter((task) => !matches.length || matches.some((match) => match.id === task.id)))}`,
    );
  const task = matches[0];
  const host = task?.host ?? selection.host;
  const root = task?.sessionId ?? selection.family;
  if (host === undefined || root === undefined)
    throw new Error("Native --family requires --host, --from and --until");
  const associations = new Map(
    scan.resolvedAssociations.map((association) => [
      association.observationId,
      association,
    ]),
  );
  const familyMember = (response: UsageObservation) => {
    if (response.host !== host) return false;
    if (host === "claude") return response.sessionId === root;
    const ancestry = codexAncestry(response.sessionId, scan.lineage);
    return !ancestry.contradictory && ancestry.sessions.includes(root);
  };
  const selected = (
    task ? scan.observations : scan.retainedNativeObservations
  ).filter((response) =>
    task
      ? associations.get(response.id)?.taskId === task.id
      : familyMember(response),
  );
  const responses = selected.filter(
    (response) =>
      response.at !== undefined &&
      Date.parse(response.at) >= from &&
      Date.parse(response.at) < until,
  );
  const unownedResponses = task
    ? scan.observations
        .filter(
          (response) =>
            familyMember(response) &&
            associations.get(response.id)?.taskId === null,
        )
        .map((response) => ({
          id: response.id,
          sessionId: response.sessionId,
          agentId: response.agentId ?? null,
          turnId: response.turnId ?? null,
          rootTurnId: response.rootTurnId ?? null,
          sources: response.measurements.map(
            (measurement) => measurement.source,
          ),
          gaps: [
            ...response.gaps,
            ...(associations.get(response.id)?.gaps ?? []),
          ],
        }))
    : [];
  const gaps = new Set<string>(task?.gaps ?? []);
  if (unownedResponses.length) gaps.add("unresolved-family-response-ownership");
  for (const response of selected) {
    if (!response.at) gaps.add("missing-request-timestamp");
    response.gaps.forEach((gap) => gaps.add(gap));
    if (task)
      associations.get(response.id)?.gaps.forEach((gap) => gaps.add(gap));
  }
  // Contradictory parent evidence cannot contribute counters, but a recorded
  // link to this root still makes the uncertainty relevant to its report.
  if (host === "codex")
    for (const [session, evidence] of scan.lineage.sessions)
      if (evidence.parents.includes(root) && evidence.parents.length > 1) {
        gaps.add("contradictory-lineage");
        gaps.add(`unresolved-worker-ownership:${session}`);
      }
  for (const gap of scan.gaps)
    if (
      gap.code === "native-source-unavailable" &&
      gap.source &&
      (host === "codex"
        ? options.codexRoots
        : (options.claudeRoots ?? [])
      ).includes(gap.source.file)
    )
      gaps.add(gap.code);
  for (const association of scan.resolvedAssociations)
    if (
      task &&
      association.taskId === null &&
      association.candidates.includes(task.id)
    )
      association.gaps.forEach((gap) => gaps.add(gap));
  for (const gap of scan.gaps)
    if (
      (task !== undefined || gap.code !== "unrelated-project-excluded") &&
      ((task !== undefined && gap.taskId === task.id) ||
        (gap.source !== undefined &&
          selected.some((response) =>
            response.measurements.some(
              (measurement) => measurement.source.file === gap.source?.file,
            ),
          )) ||
        (gap.host === host &&
          (gap.sessionId === root ||
            selected.some((response) => response.sessionId === gap.sessionId))))
    )
      gaps.add(gap.code);
  const groups = await effortGroups(
    scan,
    responses,
    {
      host,
      root,
      taskId: task?.id,
      windowed: Boolean(selection.from || selection.until),
    },
    store,
    gaps,
  );
  if (!groups.size) gaps.add("no-attributable-response-usage");
  observe?.({ responses, groups, gaps });
  return nativeEffortSummary({
    responses,
    groups,
    gaps,
    task,
    host,
    root,
    selection,
    unownedResponses,
  });
}
