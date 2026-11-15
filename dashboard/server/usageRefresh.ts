// Refresh: bring the Codex usage written since the last check
// (./usageCheck.ts) into the usage store without the full-corpus import.
// It reads, whole and with the importer's own reader (./codexUsage.ts), every
// rollout of each session one of whose rollouts was modified since that
// check, and the rollouts of the sessions they name as parent or spawned
// worker, so their lineage resolves as an import's would. It assigns their
// responses against the store's tasks merged with the current launch records
// (./usageImport.ts `launchCatalog`), and writes tasks, responses,
// assignments and coverage gaps through the importer's write path, under the
// store's document lock (./usageHistory.ts), which replaces the contribution
// of each session read, so a response read again counts once, and leaves the
// document as it is when nothing in it changes. It keeps only the responses
// and gaps of known tasks' sessions and their workers: recovering tasks from
// native evidence alone, and deciding unrelated projects, stay with the
// offline import. So does a spawn that names only its worker's agent path,
// which only the whole corpus can match. Once the store holds the evidence,
// the check time is the time the Refresh began.
import { stat } from "node:fs/promises";
import { codexUsage } from "./codexUsage.ts";
import {
  codexAncestry,
  codexAssociation,
  codexCoverage,
  codexLineage,
  containingCodexThread,
  type CodexLineage,
} from "./codexUsageLineage.ts";
import { nativeUsageFiles } from "./nativeUsageFiles.ts";
import { recordUsageCheck, refreshCutoff } from "./usageCheck.ts";
import { writeUsageHistory } from "./usageHistory.ts";
import {
  codexUsageRoots,
  launchCatalog,
  usageHistorySince,
} from "./usageImport.ts";
import { reconcileObservation } from "./usageReconciliation.ts";
import type { UsageGap, UsageObservation } from "./usageRecords.ts";
import { canonicalUsageTasks } from "./usageTaskReconciliation.ts";

export type UsageRefreshOptions = {
  readonly home: string;
  readonly store: string;
  readonly codexRoots?: readonly string[];
};

// Every rollout under the roots by the thread that contains it, and every
// rollout of each thread one of whose rollouts was modified at or after
// `cutoff`: a session is read from all its files, so the contribution that
// replaces its stored one is whole.
async function rollouts(
  roots: readonly string[],
  cutoff: number,
  gaps: UsageGap[],
) {
  const modified = new Set<string>();
  const threads = new Map<string, string[]>();
  for (const root of roots)
    for await (const file of nativeUsageFiles(root, gaps)) {
      const thread = containingCodexThread(file);
      threads.set(thread, [...(threads.get(thread) ?? []), file]);
      try {
        if ((await stat(file)).mtimeMs >= cutoff) modified.add(thread);
      } catch {
        /* A rollout removed while listing has nothing left to read. */
      }
    }
  const changed = [...modified].flatMap((thread) => threads.get(thread) ?? []);
  return { changed, threads };
}

// The sessions the lineage names, as a parent or a spawned worker, without
// having read them.
function namedSessions(lineage: CodexLineage): string[] {
  return [
    ...[...lineage.sessions.values()].flatMap((session) => session.parents),
    ...lineage.workers.flatMap((worker) => worker.sessionId ?? []),
  ].filter((id) => !lineage.sessions.has(id));
}

export async function refreshUsageHistory({
  home,
  store,
  codexRoots = codexUsageRoots(home),
}: UsageRefreshOptions): Promise<{ readonly checkedAt: string }> {
  const checkedAt = new Date().toISOString();
  const cutoff = await refreshCutoff(store);
  if (cutoff === undefined)
    throw new Error(
      "No usage history was imported on this machine yet. Import it once before refreshing.",
    );
  const tasks = canonicalUsageTasks([
    ...(await launchCatalog(home, store)).values(),
  ]);
  const gaps: UsageGap[] = [];
  const { changed, threads } = await rollouts(codexRoots, cutoff, gaps);
  const lineage = codexLineage();
  const observations = new Map<string, UsageObservation>();
  const since = Date.parse(usageHistorySince);
  const read = new Set<string>();
  for (let pending = changed; pending.length > 0;) {
    for (const file of pending) {
      read.add(file);
      for await (const observation of codexUsage(file, since, gaps, lineage))
        observations.set(
          observation.id,
          reconcileObservation(observations.get(observation.id), observation),
        );
    }
    pending = namedSessions(lineage)
      .flatMap((id) => threads.get(id) ?? [])
      .filter((file) => !read.has(file));
  }
  const taskSessions = new Set(
    tasks.filter((task) => task.host === "codex").map((task) => task.sessionId),
  );
  const known = (sessionId: string | undefined) =>
    sessionId !== undefined &&
    codexAncestry(sessionId, lineage).sessions.some((id) =>
      taskSessions.has(id),
    );
  const responses = [...observations.values()].filter((observation) =>
    known(observation.sessionId),
  );
  const coverage = codexCoverage({
    ...lineage,
    workers: lineage.workers.filter((worker) => worker.sessionId !== undefined),
  });
  await writeUsageHistory(
    {
      tasks,
      observations: responses,
      associations: responses.map((observation) =>
        codexAssociation(observation, tasks, lineage),
      ),
      gaps: [...gaps, ...coverage].filter(
        (gap) =>
          known(gap.sessionId) ||
          (gap.source?.kind === "native" &&
            known(containingCodexThread(gap.source.file))),
      ),
    },
    store,
  );
  await recordUsageCheck(store, checkedAt);
  return { checkedAt };
}
