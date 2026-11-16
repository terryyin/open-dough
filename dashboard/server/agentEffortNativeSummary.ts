import { effortTotals } from "./agentEffortTotals.ts";
import {
  effortWakes,
  idleWakeRule,
  effortWakeSummary,
} from "./agentEffortWakes.ts";
import { effortAgents } from "./agentEffortObservations.ts";
import type { UsageTask } from "./usageRecords.ts";
import type { EffortEvidence, EffortSelection } from "./agentEffortReport.ts";

export async function nativeEffortSummary({
  responses,
  groups,
  gaps,
  task,
  host,
  root,
  selection,
  unownedResponses,
}: EffortEvidence & {
  task: UsageTask | undefined;
  host: "codex" | "claude";
  root: string;
  selection: EffortSelection;
  unownedResponses: unknown[];
}) {
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
      projectScope: task
        ? "Usage-configured-task"
        : "explicit-family-independent-of-Usage-project-filter",
      boundary: task
        ? "shared-Usage-task-ownership"
        : "explicit-half-open-native-family-window",
    },
    definition:
      host === "codex" ? "codex-inclusive-input" : "claude-disjoint-input",
    accounting:
      "Codex input is reported inclusive input; Claude input = uncached + cache reads + cache writes. Reasoning output is a subset of output. Partial values are known subtotals; unavailable values are null.",
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
      responses,
    ),
    threads: groups.size
      ? new Set([...groups.values()].map((group) => group.sessionId)).size
      : null,
    agents,
    gaps: [...gaps].sort(),
    peakInput: null,
    peakInputRule:
      "Per-agent observed request maxima; never summed across agents. Missing requests or input counters make observed values lower bounds.",
    idleWakeRequests,
    idleWakeRule,
  };
}
