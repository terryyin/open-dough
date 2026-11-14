import {
  hasUsageAssignment,
  eligibleUsageAssociation,
} from "./usageTaskAssignment.ts";
import {
  usageSnapshotInputs,
  canonicalGapPartitions,
  type RecordCollection,
} from "./usageSnapshotBatch.ts";
import { acquireWriteLock, releaseWriteLock } from "./machineJsonLock.ts";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import {
  canonicalUsageTasks,
  sameUsageTask,
} from "./usageTaskReconciliation.ts";
import {
  reconcileAssociation,
  reconcileObservation,
  uniqueFacts,
} from "./usageReconciliation.ts";
import {
  responseKey,
  type UsageBatch,
  type UsageTask,
  type UsageAssociation,
  type UsageObservation,
} from "./usageRecords.ts";
import {
  openUsageSnapshot,
  pageKey,
  parseValue,
  readPartition,
  snapshotRows,
  type Collection,
  type Manifest,
  type Row,
  type Value,
} from "./usageSnapshot.ts";
import {
  prepareSnapshotDirectory,
  publishPartition,
  publishManifest,
} from "./usageSnapshotPublication.ts";

export async function writeUsageSnapshot(
  batch: UsageBatch,
  file: string,
): Promise<void> {
  await mkdir(path.dirname(file), { recursive: true });
  const lock = `${file}.lock`;
  await acquireWriteLock(lock);
  try {
    const held = await openUsageSnapshot(file);
    await prepareSnapshotDirectory(file);
    const manifest: Manifest = {
      format: "usage-pages-v1",
      version: 1,
      next: {},
      pages: {},
    };
    const previousTasks: UsageTask[] = [];
    for await (const [, value] of snapshotRows(held, "tasks"))
      previousTasks.push(value as UsageTask);
    const incomingTasks = (batch.tasks ?? []).map(
      (value) => parseValue("tasks", value) as UsageTask,
    );
    const tasks = canonicalUsageTasks([...previousTasks, ...incomingTasks]);
    const eligible = new Set(
      tasks.filter(hasUsageAssignment).map((task) => task.id),
    );
    const taskIds = new Set(tasks.map((task) => task.id));
    const aliases = new Map<string, string>();
    for (const task of [...previousTasks, ...incomingTasks]) {
      const matches = tasks.filter(
        (item) => item.id === task.id || sameUsageTask(item, task),
      );
      const [match] = matches;
      if (matches.length === 1 && match) aliases.set(task.id, match.id);
    }
    const aliasAssociation = (value: UsageAssociation): UsageAssociation => ({
      ...value,
      taskId: value.taskId ? (aliases.get(value.taskId) ?? value.taskId) : null,
      candidates: uniqueFacts(
        value.candidates.map((id) => aliases.get(id) ?? id),
      ),
    });
    const { inputs, orders } = usageSnapshotInputs(batch, tasks);
    const associatedTasks = new Set<string>();
    async function merge(
      kind: RecordCollection,
      partition: string,
      reconcile: (value: Value, previous: Value | undefined) => Value,
    ) {
      const rows = new Map(
        (await readPartition(held, kind, partition)).map((row) => [
          row[0],
          row,
        ]),
      );
      for (const [id, original] of inputs[kind].get(partition) ?? []) {
        const value = parseValue(kind, original);
        const previous = rows.get(id);
        const start =
          held.manifest?.next[kind] ??
          (held.legacy ? Object.keys(held.legacy[kind]).length : 0);
        const order = previous?.[2] ?? start + (orders.get(kind)?.get(id) ?? 0);
        manifest.next[kind] = Math.max(manifest.next[kind] ?? start, order + 1);
        rows.set(id, [id, reconcile(value, previous?.[1]), order]);
      }
      return rows;
    }
    for (const kind of [
      "tasks",
      "observations",
      "associations",
      "gaps",
    ] as const) {
      manifest.next[kind] =
        held.manifest?.next[kind] ??
        (held.legacy ? Object.keys(held.legacy[kind]).length : 0);
    }
    async function publish(
      kind: Collection,
      partition: string,
      rows: Iterable<Row>,
    ) {
      manifest.pages[pageKey(kind, partition)] = await publishPartition(file, [
        ...rows,
      ]);
    }
    for (let index = 0; index < 256; index++) {
      const partition = index.toString(16).padStart(2, "0");
      const taskRows = await merge("tasks", partition, (value) => value);
      for (const id of [...taskRows.keys()])
        if (!taskIds.has(id)) taskRows.delete(id);
      await publish("tasks", partition, taskRows.values());
      const observations = await merge(
        "observations",
        partition,
        (value, old) => {
          const observation = value as UsageObservation;
          if (
            responseKey(
              observation.host,
              observation.sessionId,
              observation.responseId,
            ) !== observation.id
          )
            throw new Error(
              "Usage observation identity does not match its native key",
            );
          return reconcileObservation(
            old as UsageObservation | undefined,
            observation,
          );
        },
      );
      await publish("observations", partition, observations.values());
      const associations = await merge(
        "associations",
        partition,
        (value, old) => {
          const association = aliasAssociation(value as UsageAssociation);
          if (!observations.has(association.observationId))
            throw new Error("Usage association lacks its observation");
          if (
            [
              ...association.candidates,
              ...(association.taskId ? [association.taskId] : []),
            ].some((id) => !taskIds.has(id))
          )
            throw new Error("Usage association names an unknown task");
          return reconcileAssociation(
            old ? aliasAssociation(old as UsageAssociation) : undefined,
            association,
          );
        },
      );
      for (const [id, row] of associations) {
        const association = eligibleUsageAssociation(
          aliasAssociation(row[1] as UsageAssociation),
          eligible,
        );
        if (
          (
            observations.get(id)?.[1] as UsageObservation | undefined
          )?.gaps.includes("contradictory-lineage")
        ) {
          association.taskId = null;
          association.gaps = uniqueFacts([
            ...association.gaps,
            "contradictory-lineage",
          ]);
        }
        row[1] = association;
        if (association.taskId) associatedTasks.add(association.taskId);
      }
      await publish("associations", partition, associations.values());
    }
    const gaps = await canonicalGapPartitions(held, batch.gaps);
    manifest.next.gaps = gaps.next;
    for (let index = 0; index < 256; index++) {
      const partition = index.toString(16).padStart(2, "0");
      const rows = (gaps.groups.get(partition) ?? []).filter((row) => {
        const gap = row[1] as NonNullable<UsageBatch["gaps"]>[number];
        return (
          gap.code !== "no-attributable-response-usage" ||
          !gap.taskId ||
          !associatedTasks.has(gap.taskId)
        );
      });
      await publish("gaps", partition, rows);
    }
    if (JSON.stringify(manifest) !== JSON.stringify(held.manifest))
      await publishManifest(file, manifest);
  } finally {
    releaseWriteLock(lock);
  }
}
