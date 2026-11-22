// Refresh: bring the Codex and Claude Code usage written since the last check
// (./usageCheck.ts) into the usage store without the full-corpus import.
// Each host's reading takes, whole and with the importer's own reader
// (./codexUsage.ts, ./claudeUsage.ts), every file of each session one of
// whose files was modified since that check: a Codex session's rollouts, and
// those of the sessions they name as parent or spawned worker, so their
// lineage resolves as an import's would; a Claude session's root transcript
// and its workers' under `subagents/`. It assigns their responses against the
// store's tasks merged with the current launch records
// (./usageImport.ts `launchCatalog`), each with the native turns the sessions
// read show it claims, as the import derives them, such as a developer
// reply's (./nativeTaskActivity.ts `knownTaskClaims`), and writes tasks,
// responses, assignments and coverage gaps through the importer's write path,
// under the store's document lock (./usageHistory.ts), which replaces the
// contribution of each session read, so a response read again counts once,
// and leaves the document as it is when nothing in it changes. It keeps only
// the responses and gaps of known tasks' sessions and their workers:
// recovering tasks from native evidence alone, and deciding unrelated
// projects, stay with the offline import. So does a Codex spawn that names
// only its worker's agent path, which only the whole corpus can match. Once
// the store holds the evidence, the check time is the time the Refresh began.
import { claudeUsage } from "./claudeUsage.ts";
import { containingClaudeSession } from "./claudeUsageKeys.ts";
import {
  claudeAssociation,
  claudeCoverage,
  claudeLineage,
} from "./claudeUsageLineage.ts";
import { codexUsage } from "./codexUsage.ts";
import {
  codexAncestry,
  codexAssociation,
  codexCoverage,
  codexLineage,
  containingCodexThread,
  type CodexLineage,
} from "./codexUsageLineage.ts";
import { knownTaskClaims } from "./nativeTaskActivity.ts";
import type { NativeTaskFact } from "./nativeTaskFacts.ts";
import { recordUsageCheck, refreshCutoff } from "./usageCheck.ts";
import { writeUsageHistory } from "./usageHistory.ts";
import { changedSessions } from "./usageRefreshFiles.ts";
import {
  claudeUsageRoots,
  codexUsageRoots,
  launchCatalog,
  usageHistorySince,
} from "./usageImport.ts";
import { collectResponses } from "./usageReconciliation.ts";
import type {
  UsageAssociation,
  UsageGap,
  UsageObservation,
  UsageTask,
} from "./usageRecords.ts";
import { canonicalUsageTasks } from "./usageTaskReconciliation.ts";

export type UsageRefreshOptions = {
  readonly home: string;
  readonly store: string;
  readonly codexRoots?: readonly string[];
  readonly claudeRoots?: readonly string[];
};

// What one host's reading adds to the Refresh's batch.
type HostReading = {
  // The turns known tasks claim in the sessions read (./nativeTaskActivity.ts).
  readonly claims: UsageTask[];
  readonly observations: UsageObservation[];
  readonly associations: UsageAssociation[];
  readonly gaps: UsageGap[];
};

const since = Date.parse(usageHistorySince);

// The gaps of known sessions, named directly or by the file they cite.
const knownGaps = (
  gaps: readonly UsageGap[],
  known: (sessionId: string | undefined) => boolean,
  containing: (file: string) => string,
) =>
  gaps.filter(
    (gap) =>
      known(gap.sessionId) ||
      (gap.source?.kind === "native" && known(containing(gap.source.file))),
  );

const taskSessions = (tasks: readonly UsageTask[], host: UsageTask["host"]) =>
  new Set(
    tasks.filter((task) => task.host === host).map((task) => task.sessionId),
  );

// The sessions the lineage names, as a parent or a spawned worker, without
// having read them.
function namedSessions(lineage: CodexLineage): string[] {
  return [
    ...[...lineage.sessions.values()].flatMap((session) => session.parents),
    ...lineage.workers.flatMap((worker) => worker.sessionId ?? []),
  ].filter((id) => !lineage.sessions.has(id));
}

async function codexReading(
  roots: readonly string[],
  cutoff: number,
  tasks: UsageTask[],
): Promise<HostReading> {
  const gaps: UsageGap[] = [];
  const { changed, sessions } = await changedSessions(
    roots,
    containingCodexThread,
    cutoff,
    gaps,
  );
  const lineage = codexLineage();
  const observations = new Map<string, UsageObservation>();
  const read = new Set<string>();
  for (let pending = changed; pending.length > 0;) {
    for (const file of pending) {
      read.add(file);
      await collectResponses(
        codexUsage(file, since, gaps, lineage),
        observations,
      );
    }
    pending = namedSessions(lineage)
      .flatMap((id) => sessions.get(id) ?? [])
      .filter((file) => !read.has(file));
  }
  const launched = taskSessions(tasks, "codex");
  const known = (sessionId: string | undefined) =>
    sessionId !== undefined &&
    codexAncestry(sessionId, lineage).sessions.some((id) => launched.has(id));
  const responses = [...observations.values()].filter((observation) =>
    known(observation.sessionId),
  );
  const coverage = codexCoverage({
    ...lineage,
    workers: lineage.workers.filter((worker) => worker.sessionId !== undefined),
  });
  return {
    claims: [],
    observations: responses,
    associations: responses.map((observation) =>
      codexAssociation(observation, tasks, lineage),
    ),
    gaps: knownGaps([...gaps, ...coverage], known, containingCodexThread),
  };
}

// A Claude session's workers write under its own directory, so the session's
// files hold its whole lineage.
async function claudeReading(
  roots: readonly string[],
  cutoff: number,
  tasks: UsageTask[],
): Promise<HostReading> {
  const gaps: UsageGap[] = [];
  const { changed } = await changedSessions(
    roots,
    containingClaudeSession,
    cutoff,
    gaps,
  );
  const lineage = claudeLineage();
  const observations = new Map<string, UsageObservation>();
  const facts: NativeTaskFact[] = [];
  for (const file of changed)
    await collectResponses(
      claudeUsage(file, since, gaps, lineage, (fact) => facts.push(fact)),
      observations,
    );
  const claims = knownTaskClaims(facts, tasks);
  const claimed = canonicalUsageTasks([...tasks, ...claims]);
  const launched = taskSessions(tasks, "claude");
  const known = (sessionId: string | undefined) =>
    sessionId !== undefined && launched.has(sessionId);
  const resolved = [...observations.values()]
    .filter((observation) => known(observation.sessionId))
    .map((observation) => claudeAssociation(observation, claimed, lineage));
  return {
    claims,
    observations: resolved.map(({ observation }) => observation),
    associations: resolved.map(({ association }) => association),
    gaps: knownGaps(
      [...gaps, ...claudeCoverage(lineage)],
      known,
      containingClaudeSession,
    ),
  };
}

export async function refreshUsageHistory({
  home,
  store,
  codexRoots = codexUsageRoots(home),
  claudeRoots = claudeUsageRoots(home),
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
  const readings = [
    await codexReading(codexRoots, cutoff, tasks),
    await claudeReading(claudeRoots, cutoff, tasks),
  ];
  await writeUsageHistory(
    {
      tasks: canonicalUsageTasks([
        ...tasks,
        ...readings.flatMap((reading) => reading.claims),
      ]),
      observations: readings.flatMap((reading) => reading.observations),
      associations: readings.flatMap((reading) => reading.associations),
      gaps: readings.flatMap((reading) => reading.gaps),
    },
    store,
  );
  await recordUsageCheck(store, checkedAt);
  return { checkedAt };
}
