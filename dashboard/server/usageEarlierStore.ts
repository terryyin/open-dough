// The stores earlier dashboards wrote, read as the starting point of today's
// usage history (./usageHistoryDocument.ts): the whole-document v1 history,
// and the paged store, a manifest in `usage.json` naming immutable page files
// under `usage.json.pages`. Both kept a row per response and per task
// association; reading sums them into session contributions
// (./usageContributions.ts) and keeps no response. Tasks and gaps come in
// their stored order. Pages no manifest names are ignored. A paged store's
// response rows are read unvalidated, one page at a time: they are trusted
// to their own writer and too many to validate. The first write of the
// history document removes the page directory.
import { readFile, rm } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import {
  collectContributions,
  type SessionContributions,
} from "./usageContributions.ts";
import {
  usageAssociationSchema,
  usageGapSchema,
  usageObservationSchema,
  usageTaskSchema,
  type UsageAssociation,
  type UsageGap,
  type UsageObservation,
  type UsageTask,
} from "./usageRecords.ts";
import type { NamedTasks } from "./usageTaskAssignment.ts";

// The whole-document v1 history.
const legacyUsageHistorySchema = z.object({
  version: z.literal(1),
  tasks: z.record(z.string(), usageTaskSchema),
  observations: z.record(z.string(), usageObservationSchema),
  associations: z.record(z.string(), usageAssociationSchema),
  gaps: z.array(usageGapSchema),
});
export type LegacyUsageHistory = z.infer<typeof legacyUsageHistorySchema>;

const manifestSchema = z.object({
  format: z.literal("usage-pages-v1"),
  version: z.literal(1),
  next: z.record(z.string(), z.number().int().nonnegative()),
  pages: z.record(z.string(), z.array(z.string().regex(/^[a-f0-9-]+\.json$/))),
});
type Collection = "tasks" | "observations" | "associations" | "gaps";
type Row = [key: string, value: unknown, order: number];

export const pageDirectory = (file: string) => `${file}.pages`;

// Removes the page directory of the store in `file` whole, with the pages no
// manifest names: only ever `<file>.pages`, and only for a caller that holds
// the file's lock and has made its history document durable.
export const removeEarlierPages = (file: string): Promise<void> =>
  rm(pageDirectory(file), { recursive: true, force: true });

export type EarlierHistory = {
  tasks: UsageTask[];
  sessions: SessionContributions;
  gaps: UsageGap[];
};

async function* pagedRows(
  file: string,
  pages: z.infer<typeof manifestSchema>["pages"],
  kind: Collection,
): AsyncGenerator<Row> {
  for (const [key, names] of Object.entries(pages)) {
    if (!key.startsWith(`${kind}:`)) continue;
    for (const name of names) {
      const rows: unknown = JSON.parse(
        await readFile(path.join(pageDirectory(file), name), "utf8"),
      );
      if (!Array.isArray(rows)) throw new Error("Usage page is unreadable");
      for (const row of rows as unknown[]) {
        if (
          !Array.isArray(row) ||
          typeof row[0] !== "string" ||
          !Number.isSafeInteger(row[2])
        )
          throw new Error("Usage page is unreadable");
        yield row as Row;
      }
    }
  }
}

async function ordered(rows: AsyncGenerator<Row>): Promise<unknown[]> {
  const all: Row[] = [];
  for await (const row of rows) all.push(row);
  return all.sort((a, b) => a[2] - b[2]).map((row) => row[1]);
}

// The store in `document`, already read from `file`.
export async function readEarlierStore(
  file: string,
  document: unknown,
): Promise<EarlierHistory> {
  const { sessions, add } = collectContributions();
  const manifest = manifestSchema.safeParse(document);
  if (!manifest.success) {
    const legacy = legacyUsageHistorySchema.parse(document);
    for (const response of Object.values(legacy.observations))
      add(response, legacy.associations[response.id]);
    return { tasks: Object.values(legacy.tasks), sessions, gaps: legacy.gaps };
  }
  const rows = (kind: Collection) => pagedRows(file, manifest.data.pages, kind);
  const named = new Map<string, NamedTasks>();
  for await (const [id, value] of rows("associations")) {
    const { taskId, candidates, gaps } = value as UsageAssociation;
    if (taskId !== null || candidates.length > 0)
      named.set(id, { taskId, candidates, gaps });
  }
  for await (const [id, value] of rows("observations"))
    add(value as UsageObservation, named.get(id));
  return {
    tasks: (await ordered(rows("tasks"))).map((task) =>
      usageTaskSchema.parse(task),
    ),
    sessions,
    gaps: (await ordered(rows("gaps"))).map((gap) => usageGapSchema.parse(gap)),
  };
}
