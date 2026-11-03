// This user's incident record: bounded, sanitized evidence that outlives the
// dashboard process that wrote it. Every dashboard process of this user
// appends its entries (`./incidentEntry.ts`) to the record's files
// (`./incidentRecordFiles.ts`), and the local diagnostics read
// (`./readDiagnostics.ts`) lists it across processes. Writing is asynchronous
// and serialized within this process, never awaited by a request, and a
// failed write leaves the record as it was. Nothing here asks GitHub. Entries
// are built from already sanitized fields and validated again when read
// back, so a damaged or foreign line is skipped, never repeated.

import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";
import { commitShaPattern } from "../src/authenticatedReadRules.ts";
import {
  incidentEntrySchema,
  incidentIdentity,
  type IncidentEntry,
  type IncidentFacts,
} from "./incidentEntry.ts";
import {
  appendIncidentLine,
  incidentLines,
  incidentRecordMeta,
} from "./incidentRecordFiles.ts";

export type IncidentRecord = {
  // When this record began: the time of the first entry any process wrote.
  readonly startedAt?: string;
  // How many entries pruning dropped at its bounds since then.
  readonly dropped: number;
  // Oldest first, as appended.
  readonly entries: readonly IncidentEntry[];
};

const processStartedAt = new Date(
  Date.now() - Math.round(process.uptime() * 1000),
).toISOString();

// The commit this dashboard's own checkout is at, asked of local Git once
// when this module loads; absent when it cannot say.
let knownRevision: string | undefined;
const revision = new Promise<string | undefined>((resolve) => {
  execFile(
    "git",
    ["rev-parse", "HEAD"],
    { cwd: fileURLToPath(new URL("..", import.meta.url)), encoding: "utf8" },
    (error, stdout) => {
      const sha = stdout.trim();
      knownRevision =
        error === null && commitShaPattern.test(sha) ? sha : undefined;
      resolve(knownRevision);
    },
  );
});

let sequence = 0;
let pending: Promise<void> = Promise.resolve();
// This process's entries not yet in the record: still queued, or their
// write failed.
const unwritten = new Set<string>();

// Writes in this process run one at a time, in the order asked.
function queued(write: () => Promise<void>): void {
  pending = pending.then(write).catch(() => undefined);
}

// Builds `facts` into an entry of this process, now, and appends it to the
// record later; returns the entry at once, or undefined when the facts make
// no valid entry. Never throws and never waits.
export function appendIncident<Facts extends IncidentFacts>(
  facts: Facts,
): Extract<IncidentEntry, { readonly kind: Facts["kind"] }> | undefined {
  sequence += 1;
  const parsed = incidentEntrySchema.safeParse({
    ...facts,
    at: facts.at ?? new Date().toISOString(),
    pid: process.pid,
    processStartedAt,
    seq: sequence,
    processAgeMs: Math.round(process.uptime() * 1000),
    ...(knownRevision !== undefined && { revision: knownRevision }),
  });
  if (!parsed.success) return undefined;
  // The schema keeps the kind it was given.
  const entry = parsed.data as Extract<
    IncidentEntry,
    { readonly kind: Facts["kind"] }
  >;
  const identity = incidentIdentity(entry);
  unwritten.add(identity);
  queued(async () => {
    const sha = await revision;
    await appendIncidentLine(
      JSON.stringify(
        sha === undefined || entry.revision !== undefined
          ? entry
          : { ...entry, revision: sha },
      ),
      entry.at,
    );
    unwritten.delete(identity);
  });
  return entry;
}

// Whether this process's `entry` is not in the record yet. One already
// written there and pruned since is not.
export function notYetRecorded(entry: IncidentEntry): boolean {
  return unwritten.has(incidentIdentity(entry));
}

// The record as every process left it, oldest entry first: lines that are
// not a valid entry of a known kind are skipped.
export async function readIncidentRecord(): Promise<IncidentRecord> {
  const [lines, meta] = await Promise.all([
    incidentLines().catch(() => []),
    incidentRecordMeta(),
  ]);
  const entries: IncidentEntry[] = [];
  for (const line of lines) {
    try {
      const parsed = incidentEntrySchema.safeParse(JSON.parse(line));
      if (parsed.success) entries.push(parsed.data);
    } catch {
      // A line cut short or damaged is no entry.
    }
  }
  return {
    ...(meta !== undefined && { startedAt: meta.startedAt }),
    dropped: meta?.dropped ?? 0,
    entries,
  };
}
