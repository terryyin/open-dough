// What one native session's responses add to each task: the session
// contribution. Its entries group the session's responses by the candidate
// tasks they named, the observed model, effort and service tier, and whether
// their lineage is contradictory, and keep per group the response count, the
// four token subtotals and the cache writes' split, how many responses miss
// each category, how many are not fully measured and the latest activity. A
// response that names no task has no entry. Which task an entry belongs to is
// resolved when it is read (./usageResponseResolution.ts), so a task that
// loses or regains its assignment withdraws or regains the usage without the
// responses.
import { sessionKey } from "../src/sessionReference.ts";
import { uniqueFacts } from "./usageReconciliation.ts";
import {
  usageTokenCategories,
  type UsageObservation,
  type UsageTask,
} from "./usageRecords.ts";
import { usageResponseResolution } from "./usageResponseResolution.ts";
import type { NamedTasks } from "./usageTaskAssignment.ts";

export type ContributionCounters = Record<
  (typeof usageTokenCategories)[number],
  number
>;

// The cache writes by lifetime, kept only while every response of an entry
// reported them: Codex's entries and an earlier store's are unsplit.
export type CacheWriteSplit = { cacheWrite5m: number; cacheWrite1h: number };
export type ContributionTokens = ContributionCounters &
  Partial<CacheWriteSplit>;

export type ContributionEntry = {
  // The tasks the responses named, sorted.
  candidates: string[];
  // Present when the responses' lineage is contradictory: they count for no
  // task and stay unresolved for each candidate.
  unresolved?: true;
  model: string | null;
  effort: string | null;
  // The recorded service tier (Codex's `default`, Claude's speed) or null.
  tier: string | null;
  responses: number;
  tokens: ContributionTokens;
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

const entryKey = (entry: ContributionEntry) =>
  JSON.stringify([
    entry.candidates,
    entry.unresolved ?? false,
    entry.model,
    entry.effort,
    entry.tier,
  ]);

const counters = (
  a: ContributionCounters,
  b: ContributionCounters,
): ContributionCounters => ({
  uncachedInput: a.uncachedInput + b.uncachedInput,
  cacheRead: a.cacheRead + b.cacheRead,
  cacheWrite: a.cacheWrite + b.cacheWrite,
  output: a.output + b.output,
});

// `tokens` plus `added` (a missing count adds none) in stored key order; the
// write split sits beside the total and stays only while both have one.
export const tokenSum = (
  tokens: ContributionTokens,
  added: Record<keyof ContributionCounters, number | null> & {
    [lifetime in keyof CacheWriteSplit]?: number | null;
  },
): ContributionTokens => {
  const sum = (category: keyof ContributionCounters) =>
    tokens[category] + (added[category] ?? 0);
  const { cacheWrite5m, cacheWrite1h } = tokens;
  const added5m = added.cacheWrite5m ?? undefined;
  const added1h = added.cacheWrite1h ?? undefined;
  return {
    uncachedInput: sum("uncachedInput"),
    cacheRead: sum("cacheRead"),
    cacheWrite: sum("cacheWrite"),
    ...(cacheWrite5m === undefined ||
    cacheWrite1h === undefined ||
    added5m === undefined ||
    added1h === undefined
      ? {}
      : {
          cacheWrite5m: cacheWrite5m + added5m,
          cacheWrite1h: cacheWrite1h + added1h,
        }),
    output: sum("output"),
  };
};

// The sessions in the one order and shape the history stores: sessions by
// key, each entry's candidates as `canonical` names them, sorted, entries
// that then share a key summed, and entries by key. Equal contributions give
// equal JSON.
export function canonicalContributions(
  sessions: SessionContributions,
  canonical: (candidates: string[]) => string[],
): SessionContributions {
  const result: SessionContributions = {};
  for (const session of Object.keys(sessions).sort()) {
    const stored = sessions[session];
    if (stored === undefined) continue;
    const entries = new Map<string, ContributionEntry>();
    for (const entry of stored.entries) {
      const next: ContributionEntry = {
        candidates: uniqueFacts(canonical(entry.candidates)).sort(),
        ...(entry.unresolved ? { unresolved: true } : {}),
        model: entry.model,
        effort: entry.effort,
        tier: entry.tier,
        responses: entry.responses,
        tokens: entry.tokens,
        missing: entry.missing,
        unmeasured: entry.unmeasured,
        lastAt: entry.lastAt,
      };
      const key = entryKey(next);
      const prior = entries.get(key);
      if (prior !== undefined) {
        next.responses += prior.responses;
        next.tokens = tokenSum(prior.tokens, next.tokens);
        next.missing = counters(prior.missing, next.missing);
        next.unmeasured += prior.unmeasured;
        next.lastAt = later(prior.lastAt, next.lastAt);
      }
      entries.set(key, next);
    }
    if (entries.size > 0)
      result[session] = {
        host: stored.host,
        sessionId: stored.sessionId,
        entries: [...entries.keys()]
          .sort()
          .flatMap((key) => entries.get(key) ?? []),
      };
  }
  return result;
}

// Collects the contributions of the responses added, each with its
// association when it has one. A session's contribution is whole only when
// every response of the session was added.
export function collectContributions() {
  const sessions: SessionContributions = {};
  const index = new Map<string, Map<string, ContributionEntry>>();
  function add(response: UsageObservation, association?: NamedTasks): void {
    if (association === undefined) return;
    const candidates = uniqueFacts([
      ...association.candidates,
      ...(association.taskId ? [association.taskId] : []),
    ]).sort();
    if (candidates.length === 0) return;
    const unresolved =
      association.gaps.includes(lineageGap) ||
      response.gaps.includes(lineageGap);
    const session = sessionKey(response);
    const entries = index.get(session) ?? new Map<string, ContributionEntry>();
    index.set(session, entries);
    const fresh: ContributionEntry = {
      candidates,
      ...(unresolved ? { unresolved } : {}),
      model: response.settings.model ?? null,
      effort: response.settings.effort ?? null,
      tier: response.settings.serviceTier ?? null,
      responses: 0,
      tokens: {
        uncachedInput: 0,
        cacheRead: 0,
        cacheWrite: 0,
        cacheWrite5m: 0,
        cacheWrite1h: 0,
        output: 0,
      },
      missing: { uncachedInput: 0, cacheRead: 0, cacheWrite: 0, output: 0 },
      unmeasured: 0,
      lastAt: null,
    };
    const key = entryKey(fresh);
    let entry = entries.get(key);
    if (entry === undefined) {
      entry = fresh;
      entries.set(key, entry);
      const { host, sessionId } = response;
      (sessions[session] ??= { host, sessionId, entries: [] }).entries.push(
        entry,
      );
    }
    entry.responses += 1;
    for (const category of usageTokenCategories)
      if (response.tokens[category] === null) entry.missing[category] += 1;
    entry.tokens = tokenSum(entry.tokens, response.tokens);
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
      const { taskId, candidates } = resolve({
        taskId: null,
        candidates: entry.candidates,
        gaps: entry.unresolved ? [lineageGap] : [],
      });
      yield { sessionId, entry, taskId, candidates };
    }
}
