// Reports need categorized facts, not endpoint provenance payloads. Persisted
// evidence stays complete; this bounded read projects one page at a time.
import {
  emptyUsageHistory,
  type UsageHistory,
  type UsageObservation,
  type UsageAssociation,
} from "./usageRecords.ts";
import { openUsageSnapshot, snapshotRows } from "./usageSnapshot.ts";
export async function readUsageReportHistory(
  file: string,
): Promise<UsageHistory> {
  const snapshot = await openUsageSnapshot(file);
  const history = emptyUsageHistory();
  for await (const [id, value] of snapshotRows(snapshot, "tasks"))
    history.tasks[id] = value as UsageHistory["tasks"][string];
  for await (const [id, value] of snapshotRows(snapshot, "observations")) {
    const item = value as UsageObservation;
    history.observations[id] = {
      id,
      host: item.host,
      sessionId: item.sessionId,
      responseId: item.responseId,
      scope: item.scope,
      at: item.at,
      settings: {},
      measurements: [],
      tokens: item.tokens,
      coverage: item.coverage,
      gaps: item.gaps,
    };
  }
  for await (const [id, value] of snapshotRows(snapshot, "associations")) {
    const item = value as UsageAssociation;
    history.associations[id] = {
      observationId: id,
      taskId: item.taskId,
      candidates: [],
      sources: [],
      gaps: item.gaps,
    };
  }
  for await (const [, value] of snapshotRows(snapshot, "gaps"))
    history.gaps.push(value as UsageHistory["gaps"][number]);
  return history;
}
