// Shared helpers for local authenticated-read diagnostics inspection
// (`../boundary/authenticated-read-diagnostics.spec.ts` and
// `../boundary/authenticated-read-diagnostics-bounds.spec.ts`), and the
// incident record a machine directory holds (`../../server/incidentRecord.ts`,
// `../boundary/authenticated-read-incident-record*.spec.ts`).

import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import {
  developmentBoundary,
  startDashboardServer,
  type DashboardServer,
} from "./dashboardServer.ts";
import { incidentRecordInHome } from "./machineRecordNames.ts";
import { rawRequest } from "./rawHttp.ts";

export const knownSourceId = "open-dough";
export const secretMarker = "gho_should-never-reach-a-browser-1234567890";
export const oversized = "x".repeat(257);

export type DiagnosticFailure = {
  readonly at: string;
  readonly source: string;
  readonly category: string;
  readonly pin?: string;
  readonly cause: string;
  readonly ownerCause?: string;
  readonly failureCategory: "local" | "upstream" | "unknown";
  readonly dispatched: boolean;
  readonly queueWaitMs?: number;
  readonly ownerPid?: number;
  readonly ownerGeneration?: number;
  readonly ownerProtocol?: number;
  readonly elapsedMs: number;
  readonly status?: number;
  readonly requestId?: string;
  readonly rateLimit?: {
    readonly limit?: number;
    readonly remaining?: number;
    readonly reset?: number;
    readonly resource?: string;
    readonly retryAfterSeconds?: number;
  };
};

// Fields every entry of the incident record carries: the process that
// wrote it.
type WrittenBy = {
  readonly at: string;
  readonly pid: number;
  readonly processStartedAt: string;
  readonly serverInstance?: string;
  readonly seq: number;
  readonly revision?: string;
  readonly processAgeMs: number;
};

// Any entry of the incident record, of whichever kind.
export type RecordedEntry = WrittenBy & { readonly kind: string };

// A failure as the incident record holds it: with the process that wrote it.
export type RecordedFailure = DiagnosticFailure &
  WrittenBy & { readonly kind: "failed-read" };

export type RecordedStall = WrittenBy & {
  readonly kind: "stall";
  readonly delayMs: number;
  readonly loadAverage: [number, number, number];
  readonly stalls: number;
};

export type RecordedProcess = {
  readonly pid: number;
  readonly processStartedAt: string;
  readonly serverInstance?: string;
  readonly revision?: string;
  readonly startedAt: string;
  readonly lastAt: string;
  readonly endedAt?: string;
  readonly state: "current" | "running" | "ended" | "lost";
};

export type DiagnosticRecord = {
  readonly startedAt?: string;
  readonly dropped: number;
  readonly failures: RecordedFailure[];
  readonly stalls: RecordedStall[];
  readonly processes: RecordedProcess[];
};

export function diagnosticsUrl(
  server: DashboardServer,
  source = knownSourceId,
) {
  return `${server.baseURL}/__authenticated-read-diagnostics?source=${source}`;
}

export async function inspect(
  server: DashboardServer,
  source = knownSourceId,
): Promise<{
  readonly status: number;
  readonly body: string;
  readonly failures: DiagnosticFailure[];
  readonly record: DiagnosticRecord;
}> {
  const response = await rawRequest({
    url: diagnosticsUrl(server, source),
    headers: { Origin: server.origin },
  });
  const parsed = JSON.parse(response.body) as {
    failures?: DiagnosticFailure[];
    record?: DiagnosticRecord;
    error?: string;
  };
  return {
    status: response.status,
    body: response.body,
    failures: parsed.failures ?? [],
    record: parsed.record ?? {
      dropped: 0,
      failures: [],
      stalls: [],
      processes: [],
    },
  };
}

// The incident record's folder in a machine directory's HOME.
const incidentsOn = (machine: string) =>
  path.join(machine, "home", incidentRecordInHome);

// Every file the incident record keeps there, with its permission bits and
// text, and the folder's own permission bits. A file a prune replaced while
// this looked is not listed.
export function incidentFiles(machine: string) {
  const folder = incidentsOn(machine);
  return {
    mode: statSync(folder).mode & 0o777,
    files: readdirSync(folder, { withFileTypes: true })
      .filter((entry) => entry.isFile())
      .flatMap(({ name }) => {
        const file = path.join(folder, name);
        try {
          return [
            {
              name,
              mode: statSync(file).mode & 0o777,
              text: readFileSync(file, "utf8"),
            },
          ];
        } catch (error) {
          if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
          throw error;
        }
      }),
  };
}

// The entry lines the incident record holds now; none before it exists.
export function incidentEntryLines(machine: string): string[] {
  try {
    return readFileSync(
      path.join(incidentsOn(machine), "entries.jsonl"),
      "utf8",
    )
      .split("\n")
      .filter((line) => line.length > 0);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

// The entries the incident record holds now, oldest first, as written.
export function incidentEntries(machine: string): RecordedEntry[] {
  return incidentEntryLines(machine).map(
    (line) => JSON.parse(line) as RecordedEntry,
  );
}

export { developmentBoundary, startDashboardServer, type DashboardServer };
