// The files that hold this user's incident record (`./incidentRecord.ts`),
// under the machine's dashboard home (`./machineHome.ts`) in `incidents/`,
// readable only by this user. Every dashboard process of this user appends
// to them. They are an append-and-prune file set, not a document several
// processes edit:
//
// - `entries.jsonl`: one entry per line, appended in one write each.
// - `record.json`: when the record began and how many entries pruning dropped.
// - `pruning/`: present while one process prunes; held only by pruning, so an
//   append never waits for it, and left by a process that died while
//   pruning only until it is older than `stalePruningMs`.
//
// Pruning keeps the newest lines within the entry and byte bounds
// (`incidentRecordBounds`). A line another process appends while a prune
// rewrites the file can be lost uncounted; appends are sparse, so that window
// rarely holds one.

import {
  appendFile,
  chmod,
  mkdir,
  readFile,
  rename,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { z } from "zod";
import { configuredLimit } from "./configuredLimit.ts";
import { safeCount } from "./incidentEntry.ts";
import { machineDashboardPath } from "./machineHome.ts";

const metaSchema = z.object({
  startedAt: z.iso.datetime(),
  dropped: safeCount,
});

type IncidentRecordMeta = z.infer<typeof metaSchema>;

type IncidentRecordBounds = {
  readonly entries: number;
  readonly bytes: number;
};

// The newest entries and bytes of `entries.jsonl` pruning keeps; a test
// lowers them through the environment.
function incidentRecordBounds(): IncidentRecordBounds {
  return {
    entries: configuredLimit("DOUGH_INCIDENT_RECORD_ENTRIES", 1_000),
    bytes: configuredLimit("DOUGH_INCIDENT_RECORD_BYTES", 512 * 1024),
  };
}

const stalePruningMs = 10_000;

const directory = () => machineDashboardPath("incidents");
const entriesFile = () => machineDashboardPath("incidents", "entries.jsonl");
const metaFile = () => machineDashboardPath("incidents", "record.json");
const pruningLock = () => machineDashboardPath("incidents", "pruning");

// Appends one entry `line` to the record, which begins at `at` when this is
// its first line, and prunes the record to its bounds when it exceeds them.
export async function appendIncidentLine(
  line: string,
  at: string,
): Promise<void> {
  await mkdir(directory(), { recursive: true, mode: 0o700 });
  await chmod(directory(), 0o700);
  // The record begins with the time of the first entry written to it.
  await writeFile(metaFile(), JSON.stringify({ startedAt: at, dropped: 0 }), {
    flag: "wx",
    mode: 0o600,
  }).catch((error: unknown) => {
    if (!isCode(error, "EEXIST")) throw error;
  });
  await appendFile(entriesFile(), `${line}\n`, { mode: 0o600 });
  const bounds = incidentRecordBounds();
  const lines = await incidentLines();
  if (lines.length > bounds.entries || byteLength(lines) > bounds.bytes) {
    await pruned(bounds);
  }
}

// Rewrites `entries.jsonl` to its newest lines within `bounds`, counting the
// rest in `record.json`, unless another process is pruning now.
async function pruned(bounds: IncidentRecordBounds): Promise<void> {
  if (!(await lockedForPruning())) return;
  try {
    const lines = await incidentLines();
    const kept: string[] = [];
    let bytes = 0;
    for (let at = lines.length - 1; at >= 0; at -= 1) {
      const line = lines[at] ?? "";
      const size = lineBytes(line);
      if (kept.length >= bounds.entries || bytes + size > bounds.bytes) break;
      kept.unshift(line);
      bytes += size;
    }
    const removed = lines.length - kept.length;
    if (removed === 0) return;
    await replaced(entriesFile(), kept.map((line) => `${line}\n`).join(""));
    const meta = await incidentRecordMeta();
    await replaced(
      metaFile(),
      JSON.stringify({
        startedAt: meta?.startedAt ?? new Date().toISOString(),
        dropped: (meta?.dropped ?? 0) + removed,
      }),
    );
  } finally {
    await rm(pruningLock(), { recursive: true, force: true });
  }
}

async function lockedForPruning(): Promise<boolean> {
  try {
    await mkdir(pruningLock(), { mode: 0o700 });
    return true;
  } catch (error) {
    if (!isCode(error, "EEXIST")) throw error;
  }
  const held = await stat(pruningLock()).catch(() => undefined);
  if (held !== undefined && Date.now() - held.mtimeMs > stalePruningMs) {
    await rm(pruningLock(), { recursive: true, force: true });
  }
  return false;
}

async function replaced(file: string, text: string): Promise<void> {
  const draft = `${file}.${String(process.pid)}.tmp`;
  await writeFile(draft, text, { mode: 0o600 });
  await rename(draft, file);
}

// The entry lines the record holds now, oldest first; none before it exists.
export async function incidentLines(): Promise<string[]> {
  const text = await readFile(entriesFile(), "utf8").catch((error: unknown) => {
    if (isCode(error, "ENOENT")) return "";
    throw error;
  });
  return text.split("\n").filter((line) => line.length > 0);
}

// When the record began and how many lines pruning dropped; undefined before
// the record exists or while `record.json` cannot be read.
export async function incidentRecordMeta(): Promise<
  IncidentRecordMeta | undefined
> {
  const text = await readFile(metaFile(), "utf8").catch(() => undefined);
  if (text === undefined) return undefined;
  try {
    const parsed = metaSchema.safeParse(JSON.parse(text));
    return parsed.success ? parsed.data : undefined;
  } catch {
    return undefined;
  }
}

// What one entry line takes in `entries.jsonl`, its newline included.
const lineBytes = (line: string) => Buffer.byteLength(line) + 1;

const byteLength = (lines: readonly string[]) =>
  lines.reduce((total, line) => total + lineBytes(line), 0);

function isCode(error: unknown, code: string): boolean {
  return error instanceof Error && "code" in error && error.code === code;
}
