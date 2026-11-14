// Explicit, offline import. Native evidence is streamed; only compact response
// observations are retained. Operational launch readers never invoke this path.
import { codexUsage } from "./codexUsage.ts";
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
  const sessions = new Set(
    tasks.map((task) => `${task.host}:${task.sessionId}`),
  );
  const gaps: UsageGap[] = [];
  const observations = new Map<string, UsageObservation>();
  const associations: UsageAssociation[] = [];
  let files = 0;
  for (const root of options.codexRoots) {
    for await (const file of nativeUsageFiles(root, gaps)) {
      files++;
      for await (const observation of codexUsage(file, since, gaps)) {
        if (!sessions.has(`${observation.host}:${observation.sessionId}`))
          continue;
        observations.set(
          observation.id,
          reconcileObservation(observations.get(observation.id), observation),
        );
      }
    }
  }
  for (const observation of observations.values()) {
    const candidates = observation.gaps.includes("contradictory-lineage")
      ? []
      : tasks.filter(
          (task) =>
            task.host === observation.host &&
            task.sessionId === observation.sessionId &&
            task.rootTurnId !== undefined &&
            (task.rootTurnId === observation.rootTurnId ||
              task.rootTurnId === observation.turnId),
        );
    associations.push({
      observationId: observation.id,
      taskId: candidates.length === 1 ? (candidates[0]?.id ?? null) : null,
      candidates: candidates.map((task) => task.id),
      sources: candidates.flatMap((task) => task.sources),
      gaps: candidates.length === 1 ? [] : ["unresolved-task-association"],
    });
  }
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
