import { codexWakes } from "./agentEffortCodexWakes.ts";
import { claudeWakes } from "./agentEffortClaudeWakes.ts";
import { consistentWakeKind, type WakeKind } from "./agentEffortWakeKinds.ts";
import type { UsageObservation } from "./usageRecords.ts";

export const idleWakeRule =
  "Count an owned request only when its immediately preceding, completely paired tool-result batch is solely empty still-running continuations or explicit wait timeouts, with no observed progress. Mixed and unsupported evidence remains unclassified. Counts describe exposure, not waste or savings; clock-only requests are separate workflow evidence.";
export async function effortWakes(responses: UsageObservation[]) {
  const byFile = new Map<string, UsageObservation[]>();
  for (const response of responses)
    for (const file of new Set(
      response.measurements.map((measurement) => measurement.source.file),
    )) {
      const requests = byFile.get(file) ?? [];
      requests.push(response);
      byFile.set(file, requests);
    }
  const candidates = new Map<string, WakeKind[]>();
  for (const [file, requests] of byFile) {
    const observations = await (requests[0]?.host === "codex"
      ? codexWakes(file, requests)
      : claudeWakes(file, requests));
    for (const [id, kind] of observations)
      candidates.set(id, [...(candidates.get(id) ?? []), kind]);
  }
  return new Map(
    [...candidates].map(([id, kinds]) => [id, consistentWakeKind(kinds)]),
  );
}
export function wakeCoverage(
  ids: string[],
  observations: Map<string, WakeKind>,
  storedRequests = 0,
) {
  const kinds = [...new Set(ids)].map(
    (id) => observations.get(id) ?? "unclassified",
  );
  const count = (kind: WakeKind) =>
    kinds.filter((value) => value === kind).length;
  const unclassifiedRequests =
    count("unclassified") + count("mixed") + storedRequests;
  const classifiedRequests =
    kinds.length + storedRequests - unclassifiedRequests;
  return {
    value: classifiedRequests ? count("idle") : null,
    status: !classifiedRequests
      ? "unavailable"
      : unclassifiedRequests
        ? "partial"
        : "complete",
    classifiedRequests,
    unclassifiedRequests,
    progressRequests: count("progress"),
    mixedResultRequests: count("mixed"),
    clockOnlyRequests: count("clock-only"),
    coverage:
      "selected-owned-requests; unsupported wrappers and missing joins remain unclassified",
  };
}

export function effortWakeSummary(
  responses: UsageObservation[],
  agents: {
    provenance: string;
    idleWakeRequests: ReturnType<typeof wakeCoverage>;
  }[],
  wakes: Map<string, WakeKind>,
  gaps: Set<string>,
) {
  const stored = agents
    .filter((agent) => agent.provenance !== "native")
    .reduce(
      (sum, agent) => sum + agent.idleWakeRequests.unclassifiedRequests,
      0,
    );
  const summary = wakeCoverage(
    responses.map((response) => response.id),
    wakes,
    stored,
  );
  if (summary.status === "unavailable")
    gaps.add("idle-wake-evidence-unavailable");
  else if (summary.status === "partial") gaps.add("idle-wake-evidence-partial");
  return summary;
}
