import { reportedResponse } from "./usageImportReport.ts";
import { nativeTaskActivity } from "./nativeTaskActivity.ts";
import { recoveredUsageTasks } from "./recoveredUsageTasks.ts";
import { mergeUsageTask } from "./usageTaskReconciliation.ts";
import { usageResponseResolution } from "./usageResponseResolution.ts";
import type { NativeTaskFact } from "./nativeTaskFacts.ts";
// Explicit, offline import. Native evidence is streamed; the history keeps
// what each session read adds to its tasks, and no response. Operational
// launch readers never invoke this path.
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
import { readUsageTasks } from "./usageHistory.ts";
import { collectResponses } from "./usageReconciliation.ts";
import {
  type UsageGap,
  type UsageObservation,
  type UsageAssociation,
  type UsageTask,
} from "./usageRecords.ts";

export type UsageScanOptions = {
  home: string;
  codexRoots: string[];
  codexFiles?: string[];
  claudeFiles?: string[];
  claudeRoots?: string[];
  since: string;
  store?: string;
};
// The tasks the store keeps, by id, each with its retained launch record's
// current facts merged in, and every retained launch not stored yet.
export async function launchCatalog(
  home: string,
  store: string,
): Promise<Map<string, UsageTask>> {
  const tasks = new Map<string, UsageTask>(
    Object.values(await readUsageTasks(store)).map((task) => [task.id, task]),
  );
  for (const task of await retainedUsageTasks(home))
    tasks.set(task.id, mergeUsageTask(tasks.get(task.id), task));
  return tasks;
}
// Read and reconcile retained evidence without refreshing or persisting Usage.
export async function scanUsageHistory(
  options: UsageScanOptions,
  since: number,
  store: string,
) {
  const nativeTasks: NativeTaskFact[] = [];
  const taskMap = await launchCatalog(options.home, store);

  const lineage = codexLineage();
  const gaps: UsageGap[] = [];
  const observations = new Map<string, UsageObservation>();
  const associations: UsageAssociation[] = [];
  let files = 0;
  const collectNativeUsage = async (
    roots: string[],
    read: (file: string) => AsyncIterable<UsageObservation>,
    selectedFiles: string[] = [],
  ) => {
    for (const file of selectedFiles) {
      files++;
      await collectResponses(read(file), observations);
    }
    for (const root of roots) {
      for await (const file of nativeUsageFiles(root, gaps)) {
        files++;
        await collectResponses(read(file), observations);
      }
    }
  };
  await collectNativeUsage(
    options.codexRoots,
    (file) =>
      codexUsage(file, since, gaps, lineage, (fact) => nativeTasks.push(fact)),
    options.codexFiles,
  );
  const claude = claudeLineage();
  await collectNativeUsage(
    options.claudeRoots ?? [],
    (file) =>
      claudeUsage(file, since, gaps, claude, (fact) => nativeTasks.push(fact)),
    options.claudeFiles,
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
    [...taskMap.values()],
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
  const resolution = usageResponseResolution([
    ...taskMap.values(),
    ...recovered,
  ]);
  const tasks = resolution.tasks;
  for (const observation of observations.values()) {
    if (observation.host === "claude") {
      const resolved = claudeAssociation(observation, tasks, claude);
      observations.set(observation.id, resolved.observation);
      associations.push(resolved.association);
    } else associations.push(codexAssociation(observation, tasks, lineage));
  }
  gaps.push(...claudeCoverage(claude));
  gaps.push(...codexCoverage(lineage));
  const associatedTaskIds = new Set(associations.map((item) => item.taskId));
  for (const task of tasks) {
    if (!associatedTaskIds.has(task.id))
      gaps.push({
        code: "no-attributable-response-usage",
        taskId: task.id,
        host: task.host,
        sessionId: task.sessionId,
      });
  }
  const resolved = associations.map((association) =>
    resolution.resolve(
      association,
      observations.get(association.observationId),
    ),
  );
  return {
    files,
    excludedTasks: excludedTasks.size,
    excludedObservations,
    tasks,
    observations: [...observations.values()],
    associations,
    resolvedAssociations: resolved,
    gaps,
    lineage,
    claude,
    responses: resolved.flatMap((association) =>
      reportedResponse(
        observations.get(association.observationId),
        association,
      ),
    ),
  };
}
