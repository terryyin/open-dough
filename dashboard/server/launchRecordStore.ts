// This machine's launch records (`../src/agentLaunch.ts`), kept for the local
// launch boundary (`./agentLaunches.ts`) in one file outside every repository:
// `~/.open-dough/dashboard/agent-launches.json`, resolved through `HOME` like
// `./projectFolders.ts`. One JSON document holds each catalog project's
// records by project id. Every read and write reads the file afresh, so each
// dashboard server on this machine -- dev and preview alike -- sees every
// launch. A record launched more than `launchRetentionDays` before a read is
// not answered, and a write drops it. A write replaces the file atomically;
// two launches at the same instant can still race, which is accepted rather
// than locked against.
// A missing file holds no records. A file that does not parse holds none
// either and is left as it is until the next launch, which starts a new
// document and moves the unreadable one aside as
// `agent-launches.json.unreadable`, or as
// `agent-launches.json.unreadable-<move time>` when an earlier copy already
// has that name, so nothing is silently lost.

import { randomUUID } from "node:crypto";
import { access, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";
import { z } from "zod";
import {
  launchRecordSchema,
  launchRetentionDays,
  type LaunchRecord,
} from "../src/agentLaunch.ts";

const retentionMs = launchRetentionDays * 24 * 60 * 60 * 1000;

const storeSchema = z.record(z.string(), z.array(launchRecordSchema));

type StoredRecords = z.infer<typeof storeSchema>;

type StoreRead =
  | { readonly kind: "records"; readonly records: StoredRecords }
  | { readonly kind: "unreadable" };

function storeFile(): string {
  return path.join(
    homedir(),
    ".open-dough",
    "dashboard",
    "agent-launches.json",
  );
}

async function readStore(file: string): Promise<StoreRead> {
  let text: string;
  try {
    text = await readFile(file, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return { kind: "records", records: {} };
    }
    return { kind: "unreadable" };
  }
  try {
    const parsed = storeSchema.safeParse(JSON.parse(text));
    return parsed.success
      ? { kind: "records", records: parsed.data }
      : { kind: "unreadable" };
  } catch {
    return { kind: "unreadable" };
  }
}

// Where an unreadable store moves aside without replacing an earlier copy.
async function unreadableCopy(file: string): Promise<string> {
  const first = `${file}.unreadable`;
  try {
    await access(first);
  } catch {
    return first;
  }
  return `${first}-${new Date().toISOString().replaceAll(":", "-")}`;
}

function withinRetention(
  records: readonly LaunchRecord[],
  now: number,
): LaunchRecord[] {
  return records.filter(
    (record) => now - Date.parse(record.launchedAt) <= retentionMs,
  );
}

// One project's records still kept, oldest first.
export async function keptRecords(
  sourceId: string,
): Promise<readonly LaunchRecord[]> {
  const read = await readStore(storeFile());
  if (read.kind === "unreadable") {
    return [];
  }
  return withinRetention(read.records[sourceId] ?? [], Date.now());
}

// Adds one confirmed launch to its project's records.
export async function keepRecord(
  sourceId: string,
  record: LaunchRecord,
): Promise<void> {
  const file = storeFile();
  await mkdir(path.dirname(file), { recursive: true });
  const read = await readStore(file);
  let stored: StoredRecords = {};
  if (read.kind === "unreadable") {
    await rename(file, await unreadableCopy(file));
  } else {
    stored = read.records;
  }
  const now = Date.now();
  const next: StoredRecords = {};
  for (const [id, records] of Object.entries(stored)) {
    const kept = withinRetention(records, now);
    if (kept.length > 0) {
      next[id] = kept;
    }
  }
  next[sourceId] = [...(next[sourceId] ?? []), record];
  const temporary = `${file}.${randomUUID()}.tmp`;
  await writeFile(temporary, `${JSON.stringify(next, null, 2)}\n`);
  await rename(temporary, file);
}
