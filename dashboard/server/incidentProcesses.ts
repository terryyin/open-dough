// The dashboard processes this user's incident record (`./incidentRecord.ts`)
// names, as the local diagnostics read (`./readDiagnostics.ts`) lists them:
// each process that recorded its start (`./incidentLifecycle.ts`), with how
// its record ends. A record that ends without a `process-ended` entry, of a
// process that no longer runs, is a process lost: killed or crashed, never
// a quiet period. Reads no file and asks nothing of GitHub.

import type { IncidentEntry } from "./incidentEntry.ts";

// `current` is the process answering; `running` another whose pid still
// answers (it may, rarely, be a later process given the same pid); `ended`
// one that closed its record; `lost` one that did not and is gone.
export type IncidentProcessState = "current" | "running" | "ended" | "lost";

export type IncidentProcess = {
  readonly pid: number;
  readonly processStartedAt: string;
  readonly revision?: string;
  // When it recorded its start, and its last entry: for a lost process, the
  // last time it is known to have run.
  readonly startedAt: string;
  readonly lastAt: string;
  readonly endedAt?: string;
  readonly state: IncidentProcessState;
};

type ProcessOf = Pick<IncidentEntry, "pid" | "processStartedAt">;

const processKey = ({ pid, processStartedAt }: ProcessOf) =>
  `${String(pid)}@${processStartedAt}`;

// Each process with a `process-started` entry among `entries` (oldest
// first), newest start first. One whose start was pruned away is not
// listed, since nothing then says where its record began.
export function incidentProcesses(
  entries: readonly IncidentEntry[],
  current: ProcessOf,
): IncidentProcess[] {
  const seen = new Map<
    string,
    { started?: IncidentEntry; ended?: IncidentEntry; last: IncidentEntry }
  >();
  for (const entry of entries) {
    const key = processKey(entry);
    const known = seen.get(key) ?? { last: entry };
    // A server restarted within one process starts its record again.
    if (entry.kind === "process-started") {
      known.started = entry;
      delete known.ended;
    }
    if (entry.kind === "process-ended") known.ended = entry;
    if (Date.parse(entry.at) >= Date.parse(known.last.at)) known.last = entry;
    seen.set(key, known);
  }
  const listed: IncidentProcess[] = [];
  for (const [key, { started, ended, last }] of seen) {
    if (started === undefined) continue;
    const state: IncidentProcessState =
      key === processKey(current)
        ? "current"
        : ended !== undefined
          ? "ended"
          : pidAnswers(started.pid)
            ? "running"
            : "lost";
    const revision = last.revision ?? started.revision;
    listed.push({
      pid: started.pid,
      processStartedAt: started.processStartedAt,
      ...(revision !== undefined && { revision }),
      startedAt: started.at,
      lastAt: last.at,
      ...(ended !== undefined && { endedAt: ended.at }),
      state,
    });
  }
  return listed.sort(
    (a, b) => Date.parse(b.startedAt) - Date.parse(a.startedAt),
  );
}

function pidAnswers(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    // Another user's process answers EPERM: it runs.
    return (error as NodeJS.ErrnoException).code === "EPERM";
  }
}
