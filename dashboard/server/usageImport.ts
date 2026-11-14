// Explicit, offline import. Native evidence is streamed; only compact response
// observations are retained. Operational launch readers never invoke this path.
import { claudeUsage } from "./claudeUsage.ts";
import {
  claudeLineage,
  claudeAssociation,
  claudeCoverage,
} from "./claudeUsageLineage.ts";
import { codexUsage } from "./codexUsage.ts";
import {
  codexAssociation,
  codexCoverage,
  codexLineage,
} from "./codexUsageLineage.ts";
import { nativeUsageFiles } from "./nativeUsageFiles.ts";
import { retainedUsageTasks } from "./retainedUsageTasks.ts";
import {
  readUsageHistory,
  writeUsageHistory,
  usageHistoryFile,
} from "./usageHistory.ts";
import { reconcileObservation, uniqueFacts } from "./usageReconciliation.ts";
import {
  type UsageGap,
  type UsageObservation,
  type UsageAssociation,
  type UsageTask,
} from "./usageRecords.ts";

export type UsageImportOptions = {
  home: string;
  codexRoots: string[];
  claudeRoots?: string[];
  since: string;
  store?: string;
};
export async function importUsageHistory(options: UsageImportOptions) {
  const since = Date.parse(options.since);
  if (!Number.isFinite(since))
    throw new Error("Usage import requires a valid --since timestamp");
  const taskMap = new Map<string, UsageTask>();
  for (const task of await retainedUsageTasks(options.home)) {
    const previous = taskMap.get(task.id);
    taskMap.set(task.id, {
      ...previous,
      ...task,
      sources: uniqueFacts([...(previous?.sources ?? []), ...task.sources]),
    });
  }
  const tasks = [...taskMap.values()];
  const lineage = codexLineage();
  const gaps: UsageGap[] = [];
  const observations = new Map<string, UsageObservation>();
  const associations: UsageAssociation[] = [];
  let files = 0;
  const collectNativeUsage = async (
    roots: string[],
    read: (file: string) => AsyncIterable<UsageObservation>,
  ) => {
    for (const root of roots) {
      for await (const file of nativeUsageFiles(root, gaps)) {
        files++;
        for await (const observation of read(file)) {
          observations.set(
            observation.id,
            reconcileObservation(observations.get(observation.id), observation),
          );
        }
      }
    }
  };
  await collectNativeUsage(options.codexRoots, (file) =>
    codexUsage(file, since, gaps, lineage),
  );
  const claude = claudeLineage();
  await collectNativeUsage(options.claudeRoots ?? [], (file) =>
    claudeUsage(file, since, gaps, claude),
  );
  for (const observation of observations.values()) {
    if (observation.host === "claude") {
      const resolved = claudeAssociation(observation, tasks, claude);
      observations.set(observation.id, resolved.observation);
      associations.push(resolved.association);
    } else associations.push(codexAssociation(observation, tasks, lineage));
  }
  gaps.push(...claudeCoverage(claude));
  gaps.push(...codexCoverage(lineage));
  for (const task of tasks) {
    if (!associations.some((association) => association.taskId === task.id))
      gaps.push({
        code: "no-attributable-response-usage",
        taskId: task.id,
        host: task.host,
        sessionId: task.sessionId,
      });
  }
  const store = options.store ?? usageHistoryFile(options.home);
  await writeUsageHistory(
    { tasks, observations: [...observations.values()], associations, gaps },
    store,
  );
  const persisted = await readUsageHistory(store);
  return {
    scope: "retained-evidence",
    since: options.since,
    files,
    tasks: Object.keys(persisted.tasks).length,
    observations: Object.keys(persisted.observations).length,
    gaps: persisted.gaps,
  };
}
