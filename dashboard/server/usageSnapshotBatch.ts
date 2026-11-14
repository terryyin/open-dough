// Prepare keyed references without cloning incoming response/provenance graphs.
// Gaps are small compared with response evidence; normalize their logical keys
// across legacy documents and earlier page encodings before repartitioning.
import {
  type UsageBatch,
  type UsageTask,
  usageGapSchema,
} from "./usageRecords.ts";
import {
  bucket,
  snapshotRows,
  type Snapshot,
  type Row,
  type Value,
} from "./usageSnapshot.ts";
export type RecordCollection = "tasks" | "observations" | "associations";
export function usageSnapshotInputs(batch: UsageBatch, tasks: UsageTask[]) {
  const inputs = {} as Record<RecordCollection, Map<string, [string, Value][]>>;
  const orders = new Map<RecordCollection, Map<string, number>>();
  for (const kind of ["tasks", "observations", "associations"] as const) {
    const groups = new Map<string, [string, Value][]>();
    const order = new Map<string, number>();
    for (const value of kind === "tasks" ? tasks : (batch[kind] ?? [])) {
      const id = "observationId" in value ? value.observationId : value.id;
      const partition = bucket(id);
      const group = groups.get(partition) ?? [];
      group.push([id, value]);
      groups.set(partition, group);
      if (!order.has(id)) order.set(id, order.size);
    }
    inputs[kind] = groups;
    orders.set(kind, order);
  }
  return { inputs, orders };
}
export async function canonicalGapPartitions(
  snapshot: Snapshot,
  incoming: UsageBatch["gaps"],
) {
  const rows = new Map<string, Row>();
  let next = snapshot.manifest?.next.gaps ?? snapshot.legacy?.gaps.length ?? 0;
  for await (const [, value, order] of snapshotRows(snapshot, "gaps")) {
    const gap = usageGapSchema.parse(value);
    const id = JSON.stringify(gap);
    if (!rows.has(id)) rows.set(id, [id, gap, order]);
    next = Math.max(next, order + 1);
  }
  for (const value of incoming ?? []) {
    const gap = usageGapSchema.parse(value);
    const id = JSON.stringify(gap);
    if (!rows.has(id)) rows.set(id, [id, gap, next++]);
  }
  const groups = new Map<string, Row[]>();
  for (const row of rows.values()) {
    const partition = bucket(row[0]);
    const group = groups.get(partition) ?? [];
    group.push(row);
    groups.set(partition, group);
  }
  return { groups, next };
}
