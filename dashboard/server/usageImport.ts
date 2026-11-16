import path from "node:path";
import { usageImportSummary } from "./usageImportReport.ts";
import { writeUsageResponses } from "./usageResponsesFile.ts";
import {
  readUsageHistory,
  writeUsageHistory,
  usageHistoryFile,
} from "./usageHistory.ts";
import { scanUsageHistory, type UsageScanOptions } from "./usageScan.ts";
export { launchCatalog } from "./usageScan.ts";
// Where this machine's Codex keeps its rollouts, live and archived, and its
// Claude Code its transcripts, under `home`, and the earliest response the
// usage history keeps.
export const codexUsageRoots = (home: string) => [
  path.join(home, ".codex/sessions"),
  path.join(home, ".codex/archived_sessions"),
];
export const claudeUsageRoots = (home: string) => [
  path.join(home, ".claude/projects"),
];
export const usageHistorySince = "2026-09-16T00:00:00+08:00";

export type UsageImportOptions = UsageScanOptions & { responses?: string };
export async function importUsageHistory(options: UsageImportOptions) {
  const since = Date.parse(options.since);
  if (!Number.isFinite(since))
    throw new Error("Usage import requires a valid --since timestamp");
  const store = options.store ?? usageHistoryFile(options.home);
  const scan = await collectUsageHistory(options, since, store);
  const history = await readUsageHistory(store);
  return {
    scope: "retained-evidence",
    since: options.since,
    files: scan.files,
    tasks: Object.keys(history.tasks).length,
    observations: scan.responses.length,
    excludedUnrelatedTasks: scan.excludedTasks,
    excludedUnrelatedObservations: scan.excludedObservations,
    gaps: history.gaps,
    summary: usageImportSummary(
      history,
      scan.responses,
      options.home,
      since,
      scan.gaps,
    ),
  };
}
// Release native graphs before reading the history for the import summary.
async function collectUsageHistory(
  options: UsageImportOptions,
  since: number,
  store: string,
) {
  const scan = await scanUsageHistory(options, since, store);
  await writeUsageHistory(scan, store);
  if (options.responses)
    await writeUsageResponses(
      options.responses,
      scan.observations,
      scan.resolvedAssociations,
    );
  const { files, excludedTasks, excludedObservations, gaps, responses } = scan;
  return { files, excludedTasks, excludedObservations, gaps, responses };
}
