// The derived per-task summary the Usage view reads instead of the usage
// store (ADR 0008: a rebuildable cache beside the store, no database). It
// keeps each dashboard-origin Codex task's facts, finished or not, with the
// model and effort its launch requested, and the session contributions
// (./usageContributions.ts) that belong to it: their counters and response
// counts, summed per observed model, effort, service tier and whether the
// session is the task's root conversation or a worker's; the counts decide a
// task's primary observed setting. Every associated response counts, whatever
// its turn or its work's fate: resumed turns, workers, background, failed and
// cancelled work alike. It also keeps the gaps that show usage missing from
// the task (./usageTaskGaps.ts).
// Pricing happens when the chart is read (./tokenIndex.ts), so another tariff
// version weighs the same counters again. Deriving reads the history document
// (./usageHistoryDocument.ts), no response, and never writes to the store.
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { UsageCoverageGap } from "../src/usageTokenIndex.ts";
import {
  later,
  resolveContributions,
  type ContributionCounters,
  type ContributionEntry,
} from "./usageContributions.ts";
import { usageHistoryFrom } from "./usageHistoryDocument.ts";
import type { UsageTask } from "./usageRecords.ts";
import { TaskGaps } from "./usageTaskGaps.ts";

export const summaryFormat = "usage-task-summary-v4";

export type SummaryCounters = Readonly<ContributionCounters>;

export type SummaryUsage = {
  readonly model: string | null;
  readonly effort: string | null;
  // The recorded service tier, such as Codex's `default`; null when none was.
  readonly tier: string | null;
  readonly root: boolean;
  readonly responses: number;
  readonly tokens: SummaryCounters;
};

export type SummaryTask = Pick<
  UsageTask,
  "id" | "kind" | "project" | "workflow" | "identity" | "title"
> & {
  readonly requested: {
    readonly model: string | null;
    readonly effort: string | null;
  };
  readonly outcome: NonNullable<UsageTask["outcome"]> | null;
  // The task's or its latest response's recorded activity.
  readonly lastActivityAt: string | null;
  readonly usage: readonly SummaryUsage[];
  // The recorded gaps that show usage missing from it, if any.
  readonly gaps: readonly UsageCoverageGap[];
};

export type UsageTaskSummary = {
  readonly format: typeof summaryFormat;
  // The digest of the store document the summary was derived from.
  readonly store: string;
  readonly tasks: readonly SummaryTask[];
};

export function usageTaskSummaryFile(store: string): string {
  return path.join(
    path.dirname(store),
    `${path.basename(store, ".json")}-task-summary.json`,
  );
}

export const storeDigest = (bytes: Buffer | undefined): string =>
  bytes === undefined
    ? "none"
    : createHash("sha256").update(bytes).digest("hex");

export async function storeBytes(store: string): Promise<Buffer | undefined> {
  try {
    return await readFile(store);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined;
    throw error;
  }
}

function addEntry(
  usage: Map<string, SummaryUsage>,
  { model, effort, tier, responses, tokens }: ContributionEntry,
  root: boolean,
): void {
  const key = JSON.stringify([model, effort, tier, root]);
  const prior = usage.get(key);
  const counter = (name: keyof SummaryCounters) =>
    (prior?.tokens[name] ?? 0) + tokens[name];
  usage.set(key, {
    model,
    effort,
    tier,
    root,
    responses: (prior?.responses ?? 0) + responses,
    tokens: {
      uncachedInput: counter("uncachedInput"),
      cacheRead: counter("cacheRead"),
      cacheWrite: counter("cacheWrite"),
      output: counter("output"),
    },
  });
}

export async function deriveUsageTaskSummary(
  store: string,
): Promise<UsageTaskSummary> {
  const bytes = await storeBytes(store);
  const history = await usageHistoryFrom(store, bytes);
  const known = Object.values(history.tasks);
  const tasks = new Map<string, UsageTask>();
  const gaps = new TaskGaps();
  for (const task of known) {
    if (task.host !== "codex" || task.origin !== "dashboard") continue;
    tasks.set(task.id, task);
    gaps.task(task);
  }
  const usage = new Map<string, Map<string, SummaryUsage>>();
  const activity = new Map<string, string | null>();
  for (const contribution of resolveContributions(history.sessions, known)) {
    const { taskId, sessionId, entry } = contribution;
    gaps.contribution(contribution);
    const task = taskId === null ? undefined : tasks.get(taskId);
    if (taskId === null || task === undefined) continue;
    const groups = usage.get(taskId) ?? new Map<string, SummaryUsage>();
    addEntry(groups, entry, sessionId === task.sessionId);
    usage.set(taskId, groups);
    activity.set(taskId, later(activity.get(taskId) ?? null, entry.lastAt));
  }
  for (const gap of history.gaps) gaps.record(gap);
  return {
    format: summaryFormat,
    store: storeDigest(bytes),
    tasks: [...tasks.values()].map((task) => ({
      id: task.id,
      kind: task.kind,
      project: task.project,
      workflow: task.workflow,
      identity: task.identity,
      title: task.title,
      requested: {
        model: task.requested.model ?? null,
        effort: task.requested.effort ?? null,
      },
      outcome: task.outcome ?? null,
      lastActivityAt: later(activity.get(task.id) ?? null, task.lastActivityAt),
      usage: [...(usage.get(task.id)?.values() ?? [])],
      gaps: gaps.of(task.id),
    })),
  };
}
