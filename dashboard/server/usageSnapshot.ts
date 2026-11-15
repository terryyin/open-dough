// Immutable pages belong to one manifest. Readers retain that manifest, so a
// concurrent publication cannot mix generations; unreferenced pages are ignored.
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import {
  usageHistorySchema,
  usageTaskSchema,
  usageObservationSchema,
  usageAssociationSchema,
  usageGapSchema,
  emptyUsageHistory,
  type UsageHistory,
} from "./usageRecords.ts";
export const collections = [
  "tasks",
  "observations",
  "associations",
  "gaps",
] as const;
export type Collection = (typeof collections)[number];
export type Value =
  | UsageHistory["tasks"][string]
  | UsageHistory["observations"][string]
  | UsageHistory["associations"][string]
  | UsageHistory["gaps"][number];
export type Row = [string, Value, number];
const manifestSchema = z.object({
  format: z.literal("usage-pages-v1"),
  version: z.literal(1),
  next: z.record(z.string(), z.number().int().nonnegative()),
  pages: z.record(z.string(), z.array(z.string().regex(/^[a-f0-9-]+\.json$/))),
});
export type Manifest = z.infer<typeof manifestSchema>;
export type Snapshot = {
  file: string;
  manifest?: Manifest;
  legacy?: UsageHistory;
};
export const bucket = (key: string) =>
  createHash("sha256").update(key).digest("hex").slice(0, 2);
export const pageKey = (kind: Collection, partition: string) =>
  `${kind}:${partition}`;
export const pageDirectory = (file: string) => `${file}.pages`;
export function parseValue(kind: Collection, value: unknown): Value {
  if (kind === "tasks") return usageTaskSchema.parse(value);
  if (kind === "observations") return usageObservationSchema.parse(value);
  if (kind === "associations") return usageAssociationSchema.parse(value);
  return usageGapSchema.parse(value);
}
export async function openUsageSnapshot(file: string): Promise<Snapshot> {
  try {
    const data: unknown = JSON.parse(await readFile(file, "utf8"));
    const manifest = manifestSchema.safeParse(data);
    if (manifest.success) return { file, manifest: manifest.data };
    return { file, legacy: usageHistorySchema.parse(data) };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT")
      return { file, legacy: emptyUsageHistory() };
    throw new Error(`Usage history is unreadable: ${file}`, { cause: error });
  }
}
function* legacyRows(history: UsageHistory, kind: Collection): Generator<Row> {
  let order = 0;
  if (kind === "gaps") {
    for (const value of history.gaps)
      yield [JSON.stringify(value), value, order++];
  } else {
    for (const key in history[kind]) {
      const value = history[kind][key];
      if (value !== undefined) yield [key, value, order++];
    }
  }
}
export async function readPartition(
  snapshot: Snapshot,
  kind: Collection,
  partition: string,
): Promise<Row[]> {
  const rows: Row[] = [];
  for await (const row of partitionRows(snapshot, kind, partition))
    rows.push(row);
  return rows;
}
async function* partitionRows(
  snapshot: Snapshot,
  kind: Collection,
  partition: string,
): AsyncGenerator<Row> {
  if (snapshot.legacy) {
    for (const row of legacyRows(snapshot.legacy, kind))
      if (bucket(row[0]) === partition) yield row;
    return;
  }
  for (const name of snapshot.manifest?.pages[pageKey(kind, partition)] ?? []) {
    const data: unknown = JSON.parse(
      await readFile(path.join(pageDirectory(snapshot.file), name), "utf8"),
    );
    if (!Array.isArray(data)) throw new Error("Usage page is unreadable");
    for (const row of data) {
      if (
        !Array.isArray(row) ||
        typeof row[0] !== "string" ||
        typeof row[2] !== "number" ||
        !Number.isSafeInteger(row[2])
      )
        throw new Error("Usage page is unreadable");
      yield [row[0], parseValue(kind, row[1]), row[2]];
    }
  }
}
// Each stored value of one collection, unvalidated and in page rather than
// insertion order, from the store `document` already read from `file`: for a
// whole-store derivation (./usageTaskSummary.ts) that cannot afford schema
// validation and trusts the store's own writer.
export async function* unvalidatedValues(
  file: string,
  document: unknown,
  kind: Collection,
): AsyncGenerator {
  const stored = document as {
    format?: unknown;
    pages?: Manifest["pages"];
  } & Partial<Record<Collection, object>>;
  if (stored.format !== manifestSchema.shape.format.value) {
    yield* Object.values(stored[kind] ?? {});
    return;
  }
  for (const [key, names] of Object.entries(stored.pages ?? {})) {
    if (!key.startsWith(pageKey(kind, ""))) continue;
    for (const name of names) {
      const rows = JSON.parse(
        await readFile(path.join(pageDirectory(file), name), "utf8"),
      ) as Row[];
      for (const row of rows) yield row[1];
    }
  }
}
// Merge ordered partition streams, retaining at most one bounded page per
// partition. Original object insertion order survives migration and enrichment.
export async function* snapshotRows(
  snapshot: Snapshot,
  kind: Collection,
): AsyncGenerator<Row> {
  if (snapshot.legacy) {
    yield* legacyRows(snapshot.legacy, kind);
    return;
  }
  const streams = [...Array<number>(256).keys()].map((index) =>
    partitionRows(snapshot, kind, index.toString(16).padStart(2, "0")),
  );
  const heads = await Promise.all(streams.map((stream) => stream.next()));
  for (;;) {
    let selected:
      { index: number; row: Row; stream: AsyncGenerator<Row> } | undefined;
    for (const [index, stream] of streams.entries()) {
      const head = heads[index];
      if (head && !head.done && (!selected || head.value[2] < selected.row[2]))
        selected = { index, row: head.value, stream };
    }
    if (!selected) return;
    yield selected.row;
    heads[selected.index] = await selected.stream.next();
  }
}
export async function readSnapshotHistory(
  snapshot: Snapshot,
): Promise<UsageHistory> {
  const history = emptyUsageHistory();
  for (const kind of collections) {
    for await (const [key, value] of snapshotRows(snapshot, kind)) {
      if (kind === "gaps")
        history.gaps.push(value as UsageHistory["gaps"][number]);
      else (history[kind] as Record<string, Value>)[key] = value;
    }
  }
  return history;
}
export async function* exportUsageSnapshot(
  snapshot: Snapshot,
): AsyncGenerator<string> {
  yield '{"version":1';
  for (const kind of collections) {
    yield `,${JSON.stringify(kind)}:${kind === "gaps" ? "[" : "{"}`;
    let separator = "";
    for await (const [key, value] of snapshotRows(snapshot, kind)) {
      yield `${separator}${kind === "gaps" ? "" : `${JSON.stringify(key)}:`}${JSON.stringify(value)}`;
      separator = ",";
    }
    yield kind === "gaps" ? "]" : "}";
  }
  yield "}\n";
}
