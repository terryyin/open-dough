// The usage history as it is stored: one machine-local document (ADR 0008)
// holding every task with its attribution facts, the coverage gaps, and one
// contribution per native session whose responses name a task
// (./usageContributions.ts). No response is stored. The document is written
// in one canonical order (tasks and gaps as first recorded, sessions and
// their entries sorted), so equal content gives equal bytes. A store an
// earlier dashboard wrote (./usageEarlierStore.ts) reads as the same history.
import { readFile } from "node:fs/promises";
import {
  canonicalContributions,
  type SessionContributions,
} from "./usageContributions.ts";
import { readEarlierStore } from "./usageEarlierStore.ts";
import type { UsageGap, UsageTask } from "./usageRecords.ts";

export const usageHistoryFormat = "usage-history-v2";

export type UsageHistory = {
  format: typeof usageHistoryFormat;
  tasks: Record<string, UsageTask>;
  // Each session's contribution under its `sessionKey`.
  sessions: SessionContributions;
  gaps: UsageGap[];
};

const emptyUsageHistory = (): UsageHistory => ({
  format: usageHistoryFormat,
  tasks: {},
  sessions: {},
  gaps: [],
});

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

// The history `bytes`, the content of `file`, holds; `bytes` is undefined
// when there is no file yet. The document's own records are trusted to its
// writer and not validated again.
export async function usageHistoryFrom(
  file: string,
  bytes: Buffer | undefined,
): Promise<UsageHistory> {
  if (bytes === undefined) return emptyUsageHistory();
  try {
    const document: unknown = JSON.parse(bytes.toString("utf8"));
    if (isRecord(document) && document["format"] === usageHistoryFormat) {
      const { tasks, sessions, gaps } = document;
      if (!isRecord(tasks) || !isRecord(sessions) || !Array.isArray(gaps))
        throw new Error("The usage history document is incomplete");
      return document as UsageHistory;
    }
    const earlier = await readEarlierStore(file, document);
    return {
      format: usageHistoryFormat,
      tasks: Object.fromEntries(earlier.tasks.map((task) => [task.id, task])),
      sessions: earlier.sessions,
      gaps: earlier.gaps,
    };
  } catch (error) {
    throw new Error(`Usage history is unreadable: ${file}`, { cause: error });
  }
}

export async function usageHistoryBytes(
  file: string,
): Promise<Buffer | undefined> {
  try {
    return await readFile(file);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined;
    throw new Error(`Usage history is unreadable: ${file}`, { cause: error });
  }
}

// The document's bytes. `sessions` must already be canonical
// (./usageContributions.ts `canonicalContributions`).
export function serializeUsageHistory(history: UsageHistory): string {
  const { tasks, sessions, gaps } = history;
  return `${JSON.stringify({ format: usageHistoryFormat, tasks, sessions, gaps })}\n`;
}

// The history as `read` prints it and as a writer would store it unchanged.
export const canonicalUsageHistory = (history: UsageHistory): UsageHistory => ({
  ...history,
  sessions: canonicalContributions(history.sessions, (ids) => ids),
});
