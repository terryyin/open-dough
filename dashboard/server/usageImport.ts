import { usageImportSummary } from "./usageImportReport.ts";
import { nativeTaskActivity } from "./nativeTaskActivity.ts";
import { recoveredUsageTasks } from "./recoveredUsageTasks.ts";
import {
  canonicalUsageTasks,
  mergeUsageTask,
} from "./usageTaskReconciliation.ts";
import type { NativeTaskFact } from "./nativeTaskFacts.ts";
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
import { reconcileObservation } from "./usageReconciliation.ts";
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
  const store = options.store ?? usageHistoryFile(options.home);
  const held = await readUsageHistory(store);
  const nativeTasks: NativeTaskFact[] = [];
  const taskMap = new Map<string, UsageTask>(
    Object.values(held.tasks).map((task) => [task.id, task]),
  );
  for (const task of await retainedUsageTasks(options.home)) {
    const previous = taskMap.get(task.id);
    taskMap.set(task.id, mergeUsageTask(previous, task));
  }

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
    codexUsage(file, since, gaps, lineage, (fact) => nativeTasks.push(fact)),
  );
  const claude = claudeLineage();
  await collectNativeUsage(options.claudeRoots ?? [], (file) =>
    claudeUsage(file, since, gaps, claude, (fact) => nativeTasks.push(fact)),
  );
  const excluded = new Set<string>();
  const excludedTasks = new Set<string>();
  const recovered = await recoveredUsageTasks(
    options.home,
    nativeTasks,
    nativeTaskActivity(
      nativeTasks,
      [...observations.values()],
      lineage,
      claude,
    ),
    since,
    (fact) => {
      excluded.add(JSON.stringify([fact.host, fact.sessionId]));
      excludedTasks.add(
        JSON.stringify([fact.host, fact.sessionId, fact.turnId]),
      );
      gaps.push({
        code: "unrelated-project-excluded",
        host: fact.host,
        sessionId: fact.sessionId,
        source: fact.source,
      });
    },
  );
  const unrelated = (observation: UsageObservation) => {
    let session: string | undefined = observation.sessionId;
    const seen = new Set<string>();
    while (session && !seen.has(session)) {
      if (excluded.has(JSON.stringify([observation.host, session])))
        return true;
      seen.add(session);
      const parents: string[] = lineage.sessions.get(session)?.parents ?? [];
      session =
        observation.host === "codex" && parents.length === 1
          ? parents[0]
          : undefined;
    }
    return false;
  };
  const relevant = [...observations.values()].filter(
    (item) => !unrelated(item),
  );
  const excludedObservations = observations.size - relevant.length;
  observations.clear();
  for (const item of relevant) observations.set(item.id, item);
  const tasks = canonicalUsageTasks([...taskMap.values(), ...recovered]);
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
    excludedUnrelatedTasks: excludedTasks.size,
    excludedUnrelatedObservations: excludedObservations,
    gaps: persisted.gaps,
    summary: usageImportSummary(persisted, options.home, since, gaps),
  };
}
