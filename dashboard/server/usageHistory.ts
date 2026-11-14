// Logical usage records retain their v1 API; physical snapshots are paged.
import { homedir } from "node:os";
import path from "node:path";
import { launchHistoryDirectory } from "./launchHistory.ts";
import {
  emptyUsageTokens,
  type UsageHistory,
  type UsageBatch,
  type UsageTokens,
} from "./usageRecords.ts";
import {
  openUsageSnapshot,
  readSnapshotHistory,
  snapshotRows,
} from "./usageSnapshot.ts";
import { writeUsageSnapshot } from "./usageSnapshotReconciliation.ts";
export type { UsageHistory, UsageBatch } from "./usageRecords.ts";
export function usageHistoryFile(home = homedir()): string {
  return path.join(launchHistoryDirectory(home), "usage.json");
}
export async function readUsageHistory(
  file = usageHistoryFile(),
): Promise<UsageHistory> {
  return readSnapshotHistory(await openUsageSnapshot(file));
}
export async function readUsageTasks(
  file = usageHistoryFile(),
): Promise<UsageHistory["tasks"]> {
  const tasks: UsageHistory["tasks"] = {};
  for await (const [id, value] of snapshotRows(
    await openUsageSnapshot(file),
    "tasks",
  ))
    tasks[id] = value as UsageHistory["tasks"][string];
  return tasks;
}
export async function writeUsageHistory(
  batch: UsageBatch,
  file = usageHistoryFile(),
): Promise<void> {
  await writeUsageSnapshot(batch, file);
}
// These are measured subtotals, with unmeasured counts alongside each category.
// No measured value means null, including a task with no attributable responses.
export function taskUsage(history: UsageHistory, taskId: string) {
  const observations = Object.values(history.observations).filter(
    (item) => history.associations[item.id]?.taskId === taskId,
  );
  const tokens = emptyUsageTokens();
  const unmeasured = {} as Record<keyof UsageTokens, number>;
  for (const name of Object.keys(tokens) as (keyof UsageTokens)[]) {
    const values = observations
      .map((item) => item.tokens[name])
      .filter((value) => value !== null);
    tokens[name] =
      values.length === 0
        ? null
        : values.reduce((sum, value) => sum + value, 0);
    unmeasured[name] = observations.length - values.length;
  }
  return {
    requests: observations.length,
    tokens,
    unmeasured,
    scope: "retained-evidence" as const,
  };
}
