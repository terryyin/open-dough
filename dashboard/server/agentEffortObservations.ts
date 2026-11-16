import type { effortGroups } from "./agentEffortGroups.ts";
import { effortTotals, responseEntries } from "./agentEffortTotals.ts";
import type { UsageObservation } from "./usageRecords.ts";

// Report-only observations retain request detail that stored contributions lack.
export function effortAgents(
  groups: Awaited<ReturnType<typeof effortGroups>>,
  responses: UsageObservation[],
  incomplete: boolean,
  gaps: Set<string>,
) {
  const byId = new Map(responses.map((response) => [response.id, response]));
  // These describe other evidence or retained-local scope, not absent input.
  // Input component coverage is checked request by request below.
  const missingRequests = [...gaps].some(
    (gap) =>
      ![
        "idle-wake-evidence-unavailable",
        "auxiliary-usage-not-covered",
        "retained-native-evidence-only",
        "unresolved-native-task-lineage",
        "missing-worker-evidence",
        "native-files-unavailable",
        "stored-ownership-and-agent-detail-unavailable",
        "stored-counter-time-coverage-unknown",
        "missing-token-components",
        "incomplete-output",
        "contradictory-observed-settings",
      ].includes(gap),
  );
  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([id, group]) => {
      const settings = new Map<
        string,
        {
          model: string | null;
          effort: string | null;
          serviceTier: string | null;
          requests: number;
        }
      >();
      for (const {
        model,
        effort,
        tier,
        responses: requests,
      } of group.entries) {
        const key = JSON.stringify([model, effort, tier]);
        const previous = settings.get(key);
        settings.set(key, {
          model,
          effort,
          serviceTier: tier,
          requests: requests + (previous?.requests ?? 0),
        });
      }
      const requests = group.responseIds.flatMap((responseId) => {
        const response = byId.get(responseId);
        return response ? [response] : [];
      });
      const input = requests.map(
        (response) => effortTotals(responseEntries([response])).totalInput,
      );
      const known = input.flatMap((metric) =>
        metric.value === null ? [] : [metric.value],
      );
      const missingInputRequests = input.filter(
        (metric) => metric.status !== "complete",
      ).length;
      return {
        id,
        sessionId: group.sessionId,
        agentId: group.agentId,
        role: group.role,
        provenance: group.provenance,
        totals: effortTotals(group.entries, incomplete),
        observedSettings: [...settings.entries()]
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([, setting]) => setting),
        sources: [
          ...new Map(
            group.sources.map((source) => [JSON.stringify(source), source]),
          ).values(),
        ],
        responseIds: group.responseIds.sort(),
        peakInput: {
          value: known.length
            ? known.reduce((maximum, value) => Math.max(maximum, value), 0)
            : null,
          status: !known.length
            ? "unavailable"
            : missingRequests || missingInputRequests > 0
              ? "observed-lower-bound"
              : "observed-maximum",
          observedRequests: requests.length,
          missingInputRequests,
          coverage:
            group.provenance === "native"
              ? "selected-retained-requests"
              : "native-requests-unavailable",
        },
        idleWakeRequests: null,
      };
    });
}
