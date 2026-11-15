// Reading and writing the usage history (./usageHistoryDocument.ts). A write
// reconciles the batch's tasks with the stored ones, and replaces the
// contribution of every session the batch holds a response of with the sum of
// those responses, and its coverage gaps with the batch's
// (./usageGapReconciliation.ts), so a writer passes every response and gap of
// each session it read and a session read again is counted once. Sessions the
// batch does not name keep their contributions and gaps. The document is
// replaced atomically under its `<file>.lock`, and only when its bytes differ.
// Every write then removes the page directory an earlier paged store left
// beside the file (./usageEarlierStore.ts), so a removal that failed or was
// interrupted is finished by the next write.
import { randomUUID } from "node:crypto";
import { mkdir, rm } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";
import { sessionKey } from "../src/sessionReference.ts";
import { replaceDurableJson } from "./durableJsonReplacement.ts";
import { launchHistoryDirectory } from "./launchHistory.ts";
import { recordMachineJsonReplacement } from "./machineDocumentsRevision.ts";
import { acquireWriteLock, releaseWriteLock } from "./machineJsonLock.ts";
import {
  canonicalContributions,
  collectContributions,
  resolveContributions,
} from "./usageContributions.ts";
import { removeEarlierPages } from "./usageEarlierStore.ts";
import { reconciledGaps } from "./usageGapReconciliation.ts";
import {
  canonicalUsageHistory,
  serializeUsageHistory,
  usageHistoryBytes,
  usageHistoryFormat,
  usageHistoryFrom,
  type UsageHistory,
} from "./usageHistoryDocument.ts";
import {
  reconcileAssociation,
  reconcileObservation,
} from "./usageReconciliation.ts";
import {
  responseKey,
  usageAssociationSchema,
  usageObservationSchema,
  usageTaskSchema,
  usageTokenCategories,
  type UsageAssociation,
  type UsageBatch,
  type UsageObservation,
  type UsageTask,
} from "./usageRecords.ts";
import { usageResponseResolution } from "./usageResponseResolution.ts";
export type { UsageBatch } from "./usageRecords.ts";
export type { UsageHistory } from "./usageHistoryDocument.ts";

export function usageHistoryFile(home = homedir()): string {
  return path.join(launchHistoryDirectory(home), "usage.json");
}
export async function readUsageHistory(
  file = usageHistoryFile(),
): Promise<UsageHistory> {
  return canonicalUsageHistory(
    await usageHistoryFrom(file, await usageHistoryBytes(file)),
  );
}
export async function readUsageTasks(
  file = usageHistoryFile(),
): Promise<UsageHistory["tasks"]> {
  return (await readUsageHistory(file)).tasks;
}

// The batch's responses, each id once, with the association the batch gives
// it under the tasks' canonical ids.
function batchResponses(
  batch: UsageBatch,
  taskIds: ReadonlySet<string>,
  alias: (value: UsageAssociation) => UsageAssociation,
) {
  const observations = new Map<string, UsageObservation>();
  for (const value of batch.observations ?? []) {
    const observation = usageObservationSchema.parse(value);
    const { host, sessionId, responseId, id } = observation;
    if (responseKey(host, sessionId, responseId) !== id)
      throw new Error(
        "Usage observation identity does not match its native key",
      );
    observations.set(
      id,
      reconcileObservation(observations.get(id), observation),
    );
  }
  const associations = new Map<string, UsageAssociation>();
  for (const value of batch.associations ?? []) {
    const association = alias(usageAssociationSchema.parse(value));
    const id = association.observationId;
    if (!observations.has(id))
      throw new Error("Usage association lacks its observation");
    if (
      [
        ...association.candidates,
        ...(association.taskId ? [association.taskId] : []),
      ].some((task) => !taskIds.has(task))
    )
      throw new Error("Usage association names an unknown task");
    associations.set(
      id,
      reconcileAssociation(associations.get(id), association),
    );
  }
  return { observations, associations };
}

export async function writeUsageHistory(
  batch: UsageBatch,
  file = usageHistoryFile(),
): Promise<void> {
  await mkdir(path.dirname(file), { recursive: true });
  const lock = `${file}.lock`;
  await acquireWriteLock(lock);
  try {
    const bytes = await usageHistoryBytes(file);
    const stored = await usageHistoryFrom(file, bytes);
    const known: UsageTask[] = [
      ...Object.values(stored.tasks),
      ...(batch.tasks ?? []).map((task) => usageTaskSchema.parse(task)),
    ];
    const { tasks, alias } = usageResponseResolution(known);
    const { observations, associations } = batchResponses(
      batch,
      new Set(tasks.map((task) => task.id)),
      alias,
    );
    const read = collectContributions();
    const replaced = new Set<string>();
    for (const observation of observations.values()) {
      replaced.add(sessionKey(observation));
      read.add(observation, associations.get(observation.id));
    }
    const kept = Object.entries(stored.sessions).filter(
      ([session]) => !replaced.has(session),
    );
    const merged = canonicalContributions(
      { ...Object.fromEntries(kept), ...read.sessions },
      (candidates) => alias({ taskId: null, candidates, gaps: [] }).candidates,
    );
    const answered = new Set<string>();
    for (const { taskId } of resolveContributions(merged, tasks))
      if (taskId !== null) answered.add(taskId);
    const text = serializeUsageHistory({
      format: usageHistoryFormat,
      tasks: Object.fromEntries(tasks.map((task) => [task.id, task])),
      sessions: merged,
      gaps: reconciledGaps(stored.gaps, batch.gaps, replaced, answered),
    });
    if (bytes?.toString("utf8") !== text) {
      const temporary = `${file}.${randomUUID()}.tmp`;
      try {
        await replaceDurableJson(temporary, file, text);
        recordMachineJsonReplacement();
      } finally {
        await rm(temporary, { force: true });
      }
    }
    // The document is durable here, written now or found equal, so nothing
    // reads an earlier store's pages again.
    await removeEarlierPages(file);
  } finally {
    releaseWriteLock(lock);
  }
}

// One task's measured subtotals from the history's contributions, with the
// count of its responses that lack each category alongside. No measured value
// means null, including a task with no attributable responses.
export function taskUsage(history: UsageHistory, taskId: string) {
  let requests = 0;
  const sums = { uncachedInput: 0, cacheRead: 0, cacheWrite: 0, output: 0 };
  const unmeasured = { ...sums };
  const contributions = resolveContributions(
    history.sessions,
    Object.values(history.tasks),
  );
  for (const { entry, taskId: owner } of contributions) {
    if (owner !== taskId) continue;
    requests += entry.responses;
    for (const category of usageTokenCategories) {
      sums[category] += entry.tokens[category];
      unmeasured[category] += entry.missing[category];
    }
  }
  const measured = (category: keyof typeof sums) =>
    unmeasured[category] < requests ? sums[category] : null;
  return {
    requests,
    tokens: {
      uncachedInput: measured("uncachedInput"),
      cacheRead: measured("cacheRead"),
      cacheWrite: measured("cacheWrite"),
      output: measured("output"),
    },
    unmeasured,
    scope: "retained-evidence" as const,
  };
}
