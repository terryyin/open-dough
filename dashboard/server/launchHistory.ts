// Append-only launch history beside the operational record document
// (`./launchRecordDocument.ts`): when a session record leaves that document,
// either past retention or by explicit removal, one entry is appended under
// `~/.open-dough/dashboard/launch-history/` as JSON Lines, one file per month
// the record left (for example `2026-11.jsonl`). Routine reads and writes of
// the operational document do not open these files. A reader yields at most
// one entry per project and session key, so a repeated append after a failed
// document replacement adds no second entry. History is readable without
// native session files and uses no application database (ADR 0008).

import { appendFile, mkdir, readdir, readFile } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";
import { z } from "zod";
import { launchRecordSchema, type LaunchRecord } from "../src/agentLaunch.ts";
import { sessionKey } from "../src/sessionReference.ts";
import { machineDashboardDirectory } from "./machineHome.ts";

export const launchHistoryReasonSchema = z.enum(["aged-out", "removed"]);

export const launchHistoryEntrySchema = z.object({
  project: z.string().min(1),
  record: launchRecordSchema,
  leftAt: z.iso.datetime(),
  reason: launchHistoryReasonSchema,
});

export type LaunchHistoryEntry = z.infer<typeof launchHistoryEntrySchema>;
export type LaunchHistoryReason = z.infer<typeof launchHistoryReasonSchema>;

export function launchHistoryDirectory(home = homedir()): string {
  return path.join(machineDashboardDirectory(home), "launch-history");
}

function historyKey(project: string, record: LaunchRecord): string {
  return `${project}\0${sessionKey(record.session)}`;
}

function monthFileName(leftAt: string): string {
  return `${leftAt.slice(0, 7)}.jsonl`;
}

async function historyFiles(directory: string): Promise<string[]> {
  try {
    return (await readdir(directory))
      .filter((name) => name.endsWith(".jsonl"))
      .map((name) => path.join(directory, name))
      .toSorted();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

async function parseHistoryFile(file: string): Promise<LaunchHistoryEntry[]> {
  let text: string;
  try {
    text = await readFile(file, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
  const entries: LaunchHistoryEntry[] = [];
  for (const line of text.split("\n")) {
    if (line.length === 0) continue;
    const parsed = launchHistoryEntrySchema.safeParse(JSON.parse(line));
    if (parsed.success) entries.push(parsed.data);
  }
  return entries;
}

// Every history entry for this machine's HOME (or `home`), one per project
// and session key. Earlier lines win when the same key appears more than once.
export async function readLaunchHistory(
  home = homedir(),
): Promise<LaunchHistoryEntry[]> {
  const seen = new Set<string>();
  const unique: LaunchHistoryEntry[] = [];
  for (const file of await historyFiles(launchHistoryDirectory(home))) {
    for (const entry of await parseHistoryFile(file)) {
      const key = historyKey(entry.project, entry.record);
      if (seen.has(key)) continue;
      seen.add(key);
      unique.push(entry);
    }
  }
  return unique;
}

async function knownHistoryKeys(directory: string): Promise<Set<string>> {
  const known = new Set<string>();
  for (const file of await historyFiles(directory)) {
    for (const entry of await parseHistoryFile(file)) {
      known.add(historyKey(entry.project, entry.record));
    }
  }
  return known;
}

// Appends each entry that history does not already hold for its project and
// session key. Creates the history directory when needed. Throws when the
// directory or a monthly file cannot be written.
export async function appendLaunchHistory(
  entries: readonly LaunchHistoryEntry[],
  home = homedir(),
): Promise<void> {
  if (entries.length === 0) return;
  const directory = launchHistoryDirectory(home);
  await mkdir(directory, { recursive: true });
  const known = await knownHistoryKeys(directory);
  const fresh = entries.filter((entry) => {
    const key = historyKey(entry.project, entry.record);
    if (known.has(key)) return false;
    known.add(key);
    return true;
  });
  if (fresh.length === 0) return;
  const byFile = new Map<string, LaunchHistoryEntry[]>();
  for (const entry of fresh) {
    const file = path.join(directory, monthFileName(entry.leftAt));
    const list = byFile.get(file) ?? [];
    list.push(entry);
    byFile.set(file, list);
  }
  for (const [file, list] of byFile) {
    const text = `${list.map((entry) => JSON.stringify(entry)).join("\n")}\n`;
    await appendFile(file, text);
  }
}
