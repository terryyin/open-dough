// What one native session's responses add to each task: the session
// contribution. Its entries group the session's responses by the candidate
// tasks they named, the observed model, effort and service tier, and whether
// their lineage is contradictory, and keep per group the response count, the
// four token subtotals, how many responses miss each category, how many are
// not fully measured and the latest activity. A response that names no task
// has no entry. Which task an entry belongs to is resolved when it is read
// (./usageResponseResolution.ts), so a task that loses or regains its
// assignment withdraws or regains the usage without the responses.
import { sessionKey } from "../src/sessionReference.ts";
import { uniqueFacts } from "./usageReconciliation.ts";
import {
  usageTokenCategories,
  type UsageAssociation,
  type UsageObservation,
  type UsageTask,
} from "./usageRecords.ts";
import { usageResponseResolution } from "./usageResponseResolution.ts";

export type ContributionCounters = Record<
  (typeof usageTokenCategories)[number],
  number
>;

export type ContributionEntry = {
  // The tasks the responses named, sorted.
  candidates: string[];
  // Present when the responses' lineage is contradictory: they count for no
  // task and stay unresolved for each candidate.
  unresolved?: true;
  model: string | null;
  effort: string | null;
  // The recorded service tier, such as Codex's `default`; null when none was.
  tier: string | null;
  responses: number;
  tokens: ContributionCounters;
  // The responses with no count for each category.
  missing: ContributionCounters;
  // The responses whose coverage is not "measured".
  unmeasured: number;
  lastAt: string | null;
};

export type SessionContribution = {
  host: UsageObservation["host"];
  sessionId: string;
  entries: ContributionEntry[];
};

// Each session's contribution under its `sessionKey`
// (../src/sessionReference.ts).
export type SessionContributions = Record<string, SessionContribution>;

export const later = (a: string | null, b: string | null | undefined) =>
  b !== undefined && b !== null && (a === null || Date.parse(b) > Date.parse(a))
    ? b
    : a;

const lineageGap = "contradictory-lineage";

// Collects the contributions of the responses added, each with its
// association when it has one. A session's contribution is whole only when
// every response of the session was added.
export function collectContributions() {
  const sessions: SessionContributions = {};
  const index = new Map<string, Map<string, ContributionEntry>>();
  function add(
    response: UsageObservation,
    association:
      Pick<UsageAssociation, "taskId" | "candidates" | "gaps"> | undefined,
  ): void {
    if (association === undefined) return;
    const candidates = uniqueFacts([
      ...association.candidates,
      ...(association.taskId ? [association.taskId] : []),
    ]).sort();
    if (candidates.length === 0) return;
    const unresolved =
      association.gaps.includes(lineageGap) ||
      response.gaps.includes(lineageGap);
    const model = response.settings.model ?? null;
    const effort = response.settings.effort ?? null;
    const tier = response.settings.serviceTier ?? null;
    const session = sessionKey(response);
    const entries = index.get(session) ?? new Map<string, ContributionEntry>();
    index.set(session, entries);
    const key = JSON.stringify([candidates, unresolved, model, effort, tier]);
    let entry = entries.get(key);
    if (entry === undefined) {
      entry = {
        candidates,
        ...(unresolved ? { unresolved } : {}),
        model,
        effort,
        tier,
        responses: 0,
        tokens: { uncachedInput: 0, cacheRead: 0, cacheWrite: 0, output: 0 },
        missing: { uncachedInput: 0, cacheRead: 0, cacheWrite: 0, output: 0 },
        unmeasured: 0,
        lastAt: null,
      };
      entries.set(key, entry);
      const { host, sessionId } = response;
      (sessions[session] ??= { host, sessionId, entries: [] }).entries.push(
        entry,
      );
    }
    entry.responses += 1;
    for (const category of usageTokenCategories) {
      const count = response.tokens[category];
      if (count === null) entry.missing[category] += 1;
      else entry.tokens[category] += count;
    }
    if (response.coverage !== "measured") entry.unmeasured += 1;
    entry.lastAt = later(entry.lastAt, response.lastAt ?? response.at);
  }
  return { sessions, add };
}

export type ResolvedContribution = {
  sessionId: string;
  entry: ContributionEntry;
  // The one task the entry belongs to, or null while it belongs to none.
  taskId: string | null;
  // The entry's candidates under the tasks' canonical ids.
  candidates: string[];
};

// Each entry with the task it belongs to among `tasks`, every task record of
// the history: the one candidate whose assignment holds, and none when the
// entry is unresolved or names no such task or several.
export function* resolveContributions(
  sessions: SessionContributions,
  tasks: UsageTask[],
): Generator<ResolvedContribution> {
  const { resolve } = usageResponseResolution(tasks);
  for (const { sessionId, entries } of Object.values(sessions))
    for (const entry of entries) {
      const { taskId, candidates } = resolve(
        {
          observationId: "",
          taskId: null,
          candidates: entry.candidates,
          sources: [],
          gaps: entry.unresolved ? [lineageGap] : [],
        },
        undefined,
      );
      yield { sessionId, entry, taskId, candidates };
    }
}
