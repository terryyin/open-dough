import { realpathSync } from "node:fs";
import { effortAgents } from "./agentEffortObservations.ts";
import { effortWakes, wakeCoverage } from "./agentEffortWakes.ts";
import type { EffortEvidence } from "./agentEffortReport.ts";
import type { EffortReport } from "./agentEffortRequest.ts";
import { effortTotals, responseEntries } from "./agentEffortTotals.ts";
import { reconcileObservation } from "./usageReconciliation.ts";
import type { UsageObservation } from "./usageRecords.ts";
import { cursorWorkflowTotals } from "./agentEffortCursorWorkflow.ts";

export type EffortExecution = {
  label: string;
  report: EffortReport;
  evidence?: EffortEvidence | undefined;
};
export async function comparisonGroup(
  executions: EffortExecution[],
  notes: unknown,
) {
  const hosts = [
    ...new Set(executions.map(({ report }) => report.host)),
  ].sort();
  const perHost = await Promise.all(
    hosts.map(async (host) => {
      const members = executions.filter(({ report }) => report.host === host);
      const responses = new Map<string, UsageObservation>();
      const stored = new Map<
        string,
        EffortEvidence["groups"] extends Map<string, infer Group>
          ? Group
          : never
      >();
      const unionGroups: EffortEvidence["groups"] = new Map();
      const gaps = new Set(members.flatMap(({ report }) => report.gaps));
      for (const { evidence } of members) {
        for (const response of evidence?.responses ?? [])
          responses.set(
            response.id,
            reconcileObservation(responses.get(response.id), response),
          );
        for (const group of evidence?.groups.values() ?? []) {
          if (group.provenance === "native") {
            unionGroups.set(JSON.stringify([group.sessionId, group.agentId]), {
              ...group,
              entries: [],
              sources: [],
              responseIds: [],
            });
            continue;
          }
          const key = JSON.stringify([host, group.sessionId, group.entries]);
          stored.set(key, group);
          gaps.add("stored-cross-selection-response-dedup-unprovable");
        }
      }
      const selected = [...responses.values()].sort((a, b) =>
        a.id.localeCompare(b.id),
      );
      const nativeSessions = new Set(
        selected.map((response) => response.sessionId),
      );
      for (const [key, group] of stored) {
        if (nativeSessions.has(group.sessionId)) {
          stored.delete(key);
          gaps.add(
            `stored-native-response-overlap-unprovable:${group.sessionId}`,
          );
        } else unionGroups.set(key, group);
      }
      for (const response of selected) {
        const key = JSON.stringify([
          response.sessionId,
          response.agentId ?? null,
        ]);
        const group = unionGroups.get(key);
        if (!group)
          throw new Error("Selected native response has no shared agent group");
        group.entries.push(...responseEntries([response]));
        group.responseIds.push(response.id);
        group.sources.push(
          ...response.measurements.map((measurement) => measurement.source),
        );
      }
      const storedEntries = [...stored.values()].flatMap(
        (group) => group.entries,
      );
      const wakes = await effortWakes(selected);
      const nativeAgents = effortAgents(
        unionGroups,
        selected,
        gaps.size > 0,
        gaps,
        wakes,
      );
      const first = members[0];
      if (!first) throw new Error("Comparison host requires an execution");
      const cursorAgents = new Map(
        members.flatMap(({ report }) =>
          report.host === "cursor"
            ? report.agents.map((agent) => {
                let id = agent.id;
                try {
                  id = realpathSync(agent.id);
                } catch {
                  gaps.add(`cursor-file-identity-unavailable:${agent.id}`);
                }
                return [id, { ...agent, id }] as const;
              })
            : [],
        ),
      );
      return {
        host,
        definition: first.report.definition,
        totals:
          host === "cursor"
            ? first.report.totals
            : effortTotals(
                [...responseEntries(selected), ...storedEntries],
                gaps.size > 0,
                selected,
              ),
        workflow:
          host === "cursor"
            ? {
                ...cursorWorkflowTotals(
                  [...cursorAgents.values()].map((agent) => agent.workflow),
                ),
                workers: cursorAgents.size
                  ? [...cursorAgents.values()].filter(
                      (agent) => agent.role === "worker",
                    ).length
                  : null,
              }
            : null,
        idleWakeRequests:
          host === "cursor"
            ? { value: null, status: "unavailable" }
            : wakeCoverage(
                selected.map((response) => response.id),
                wakes,
                storedEntries.reduce((sum, entry) => sum + entry.responses, 0),
              ),
        agents: (host === "cursor" ? [...cursorAgents.values()] : nativeAgents)
          .map(({ id, peakInput }) => ({ host, id, peakInput }))
          .sort((a, b) => a.id.localeCompare(b.id)),
        sources: [
          ...new Map(
            members
              .flatMap(({ report }) => report.sources)
              .map((source) => [JSON.stringify(source), source]),
          ).values(),
        ],
        gaps: [...gaps].sort(),
        deduplication:
          host === "cursor"
            ? "transcript-file-identity"
            : "reconciled-response-identity; exact-stored-contribution-identity",
      };
    }),
  );
  return {
    notes: notes ?? null,
    executions: executions.map(({ label, report }) => ({ label, ...report })),
    perHost,
  };
}
