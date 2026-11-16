import { codexAncestry } from "./codexUsageLineage.ts";
import { usageHistoryFile } from "./usageHistory.ts";
import { scanUsageHistory, type UsageScanOptions } from "./usageScan.ts";
import type { UsageObservation } from "./usageRecords.ts";
import { effortTotals } from "./agentEffortTotals.ts";
import { effortGroups } from "./agentEffortGroups.ts";
import {
  effortWakes,
  idleWakeRule,
  effortWakeSummary,
} from "./agentEffortWakes.ts";
import { effortAgents } from "./agentEffortObservations.ts";

export type EffortSelection = {
  task?: string | undefined;
  host?: "codex" | "claude" | undefined;
  family?: string | undefined;
  from?: string | undefined;
  until?: string | undefined;
  list?: boolean | undefined;
  guidanceVersion?: string | undefined;
};
export async function agentEffortReport(
  options: UsageScanOptions,
  selection: EffortSelection,
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
  const scan = await scanUsageHistory(options, from, store);
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
  const selected = scan.observations.filter((response) =>
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
      (task !== undefined && gap.taskId === task.id) ||
      (gap.source !== undefined &&
        selected.some((response) =>
          response.measurements.some(
            (measurement) => measurement.source.file === gap.source?.file,
          ),
        )) ||
      (gap.host === host &&
        (gap.sessionId === root ||
          selected.some((response) => response.sessionId === gap.sessionId)))
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
  const wakes = await effortWakes(responses);
  const incomplete = [...gaps].some(
    (gap) =>
      ![
        "idle-wake-evidence-unavailable",
        "auxiliary-usage-not-covered",
      ].includes(gap),
  );
  const agents = effortAgents(groups, responses, incomplete, gaps, wakes);
  const idleWakeRequests = effortWakeSummary(responses, agents, wakes, gaps);
  return {
    format: "agent-effort-v1",
    scope: "retained-local-evidence",
    host,
    selection: {
      kind: task ? "task" : "native-family",
      taskId: task?.id ?? null,
      identity: task?.identity ?? null,
      rootSessionId: root,
      rootTurnId: task?.rootTurnId ?? null,
      nativeTurns: task?.nativeTurns ?? null,
      from: selection.from ?? null,
      until: selection.until ?? null,
      boundary: task
        ? "shared-Usage-task-ownership"
        : "explicit-half-open-native-family-window",
    },
    definition:
      host === "codex" ? "codex-inclusive-input" : "claude-disjoint-input",
    accounting:
      "Input = uncached + cache reads + cache writes. Reasoning output is a subset of output. Partial values are known subtotals; unavailable values are null.",
    requestedSettings: task?.requested ?? null,
    guidanceVersion: {
      value: selection.guidanceVersion ?? null,
      provenance:
        selection.guidanceVersion === undefined ? "unknown" : "supplied",
      evidence:
        "Historical guidance is unavailable without retained source evidence; the current installation is not historical evidence.",
    },
    sources: [
      ...(task?.sources ?? []),
      ...agents.flatMap((agent) => agent.sources),
    ],
    unownedResponses,
    totals: effortTotals(
      [...groups.values()].flatMap((group) => group.entries),
      incomplete,
    ),
    agents,
    gaps: [...gaps].sort(),
    peakInput: null,
    peakInputRule:
      "Per-agent observed request maxima; never summed across agents. Missing requests or input counters make observed values lower bounds.",
    idleWakeRequests,
    idleWakeRule,
  };
}
