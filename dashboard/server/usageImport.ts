import path from "node:path";
import { reportedResponse, usageImportSummary } from "./usageImportReport.ts";
import { nativeTaskActivity } from "./nativeTaskActivity.ts";
import { recoveredUsageTasks } from "./recoveredUsageTasks.ts";
import { mergeUsageTask } from "./usageTaskReconciliation.ts";
import { usageResponseResolution } from "./usageResponseResolution.ts";
import { writeUsageResponses } from "./usageResponsesFile.ts";
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
import {
  readUsageHistory,
  readUsageTasks,
  writeUsageHistory,
  usageHistoryFile,
} from "./usageHistory.ts";
import { collectResponses } from "./usageReconciliation.ts";
import {
  type UsageGap,
  type UsageObservation,
  type UsageAssociation,
  type UsageTask,
} from "./usageRecords.ts";

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

export type UsageImportOptions = {
  home: string;
  codexRoots: string[];
  claudeRoots?: string[];
  since: string;
  store?: string;
  // Where to write the responses this import read; nothing when absent.
  responses?: string;
};
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
// Returning releases native graphs before the history is read for the
// report: of each response read it keeps only what the report counts.
async function collectUsageHistory(
  options: UsageImportOptions,
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
  ) => {
    for (const root of roots) {
      for await (const file of nativeUsageFiles(root, gaps)) {
        files++;
        await collectResponses(read(file), observations);
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
  await writeUsageHistory(
    { tasks, observations: [...observations.values()], associations, gaps },
    store,
  );
  const resolved = associations.map((association) =>
    resolution.resolve(
      association,
      observations.get(association.observationId),
    ),
  );
  if (options.responses)
    await writeUsageResponses(
      options.responses,
      observations.values(),
      resolved,
    );
  return {
    files,
    excludedTasks: excludedTasks.size,
    excludedObservations,
    gaps,
    responses: resolved.flatMap((association) =>
      reportedResponse(
        observations.get(association.observationId),
        association,
      ),
    ),
  };
}
