// This user's incident record: bounded, sanitized evidence that outlives the
// dashboard process that wrote it. Every dashboard process of this user
// appends its entries (`./incidentEntry.ts`) to the record's files
// (`./incidentRecordFiles.ts`), and the local diagnostics read
// (`./readDiagnostics.ts`) lists it across processes. Writing is asynchronous
// and serialized within this process, never awaited by a request, and a
// failed write leaves the record as it was. A clean close waits for the
// queue (`flushIncidents`); a process killed outright loses what it had
// queued, milliseconds of entries, rather than write on the event loop.
// Nothing here asks GitHub. Entries are built from already sanitized fields
// and validated again when read back, so a damaged or foreign line is
// skipped, never repeated.

import { execFile } from "node:child_process";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import { commitShaPattern } from "../src/authenticatedReadRules.ts";
import {
  incidentEntrySchema,
  incidentIdentity,
  type IncidentEntry,
  type IncidentFacts,
  type IncidentWriter,
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
  // Oldest first, as appended, then this process's entries not written yet.
  readonly entries: readonly IncidentEntry[];
};

// The server instance this module serves, which writes this module's
// entries. A dev server restarted in place loads this module again in the
// same process (`../vite.config.mts` imports the boundaries), so each load is
// an instance of its own, with its own sequence and lifecycle.
export const incidentWriter: IncidentWriter = {
  pid: process.pid,
  processStartedAt: new Date(
    Date.now() - Math.round(process.uptime() * 1000),
  ).toISOString(),
  serverInstance: randomUUID(),
};

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
// This process's entries not yet in the record, by identity: still queued,
// or their write failed.
const unwritten = new Map<string, IncidentEntry>();
const unwrittenLimit = 1_000;

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
    ...incidentWriter,
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
  unwritten.set(identity, entry);
  // Entries whose writes keep failing are held as far as the record's own
  // default entry bound, oldest let go first.
  for (const oldest of unwritten.keys()) {
    if (unwritten.size <= unwrittenLimit) break;
    unwritten.delete(oldest);
  }
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

// Settles once every entry this process asked to append so far has been
// written or has failed to be.
export function flushIncidents(): Promise<void> {
  return pending;
}

// The record as every process left it, oldest entry first, with this
// process's entries not written yet after them: lines that are not a valid
// entry of a known kind are skipped.
export async function readIncidentRecord(): Promise<IncidentRecord> {
  // Taken before the files are read, so an entry written meanwhile is in one
  // or the other.
  const own = [...unwritten.values()];
  const [lines, meta] = await Promise.all([
    incidentLines().catch(() => []),
    incidentRecordMeta(),
  ]);
  const entries = new Map<string, IncidentEntry>();
  for (const line of lines) {
    try {
      const parsed = incidentEntrySchema.safeParse(JSON.parse(line));
      if (parsed.success)
        entries.set(incidentIdentity(parsed.data), parsed.data);
    } catch {
      // A line cut short or damaged is no entry.
    }
  }
  for (const entry of own) {
    const identity = incidentIdentity(entry);
    if (!entries.has(identity)) entries.set(identity, entry);
  }
  return {
    ...(meta !== undefined && { startedAt: meta.startedAt }),
    dropped: meta?.dropped ?? 0,
    entries: [...entries.values()],
  };
}
