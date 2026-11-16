import { sessionKey } from "../src/sessionReference.ts";
import {
  resolveContributions,
  type ContributionEntry,
} from "./usageContributions.ts";
import { readUsageHistory } from "./usageHistory.ts";
import type { scanUsageHistory } from "./usageScan.ts";
import type { UsageObservation, UsageSource } from "./usageRecords.ts";
import { responseEntries } from "./agentEffortTotals.ts";

// Native requests retain agent identity. Stored whole-session contributions
// supply counters only when native evidence is gone and no window is requested.
export async function effortGroups(
  scan: Awaited<ReturnType<typeof scanUsageHistory>>,
  responses: UsageObservation[],
  boundary: {
    host: "codex" | "claude";
    root: string;
    taskId: string | undefined;
    windowed: boolean;
  },
  store: string,
  gaps: Set<string>,
) {
  const { host, root } = boundary;
  const groups = new Map<
    string,
    {
      sessionId: string;
      agentId: string | null;
      role: string;
      provenance: string;
      entries: ContributionEntry[];
      sources: UsageSource[];
      responseIds: string[];
    }
  >();
  for (const response of responses) {
    const id = JSON.stringify([response.sessionId, response.agentId ?? null]);
    const group = groups.get(id) ?? {
      sessionId: response.sessionId,
      agentId: response.agentId ?? null,
      role:
        response.agentId || response.sessionId !== root
          ? "worker"
          : "coordinator",
      provenance: "native",
      entries: [],
      sources: [],
      responseIds: [],
    };
    group.entries.push(...responseEntries([response]));
    group.sources.push(
      ...response.measurements.map((measurement) => measurement.source),
    );
    group.responseIds.push(response.id);
    groups.set(id, group);
  }
  // Stored contributions cover whole sessions, so only a whole-task selection
  // can use them. Never pretend their absent request timestamps prove a window.
  const history = await readUsageHistory(store);
  const nativeSessions = new Set(scan.observations.map(sessionKey));
  if (boundary.taskId !== undefined)
    for (const contribution of resolveContributions(
      history.sessions,
      scan.tasks,
    )) {
      if (contribution.taskId !== boundary.taskId) continue;
      const key = sessionKey({ host, sessionId: contribution.sessionId });
      if (nativeSessions.has(key)) continue;
      gaps.add("native-files-unavailable");
      gaps.add("stored-ownership-and-agent-detail-unavailable");
      gaps.add("stored-counter-time-coverage-unknown");
      if (boundary.windowed) {
        gaps.add("stored-counters-cannot-prove-window");
        continue;
      }
      const id = JSON.stringify([contribution.sessionId, "stored"]);
      const group = groups.get(id) ?? {
        sessionId: contribution.sessionId,
        agentId: null,
        role:
          host === "claude"
            ? "unknown"
            : contribution.sessionId === root
              ? "coordinator"
              : "worker",
        provenance: "stored-session-contribution",
        entries: [],
        sources: [{ kind: "history" as const, file: store }],
        responseIds: [],
      };
      group.entries.push(contribution.entry);
      groups.set(id, group);
    }
  return groups;
}
