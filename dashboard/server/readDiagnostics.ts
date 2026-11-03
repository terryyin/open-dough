// Bounded history of failed upstream reads for the local authenticated read
// boundary (`./authenticatedRead.ts`): one entry per shared `gh` invocation
// that failed (`./ghRead.ts`), attributed to the admitted reader that
// started it, never to every waiter. This process keeps its newest 100
// failures in memory and appends each to this user's incident record
// (`./incidentRecord.ts`), which outlives the process. A maintainer
// inspects both through `GET /__authenticated-read-diagnostics`. Held-back
// reads and ordinary waiter departures are not recorded here.
// Attribution context: `./readDiagnosticContext.ts`. Field sanitization:
// `./readDiagnosticSanitize.ts`.

import type { FailedGhRequest } from "../../src/skills/dough-execute-plan/scripts/github-requests.mjs";
import {
  safeOwnerCause,
  type OwnerUnavailableCause,
} from "../../src/skills/dough-execute-plan/scripts/github-request-owner-failure.mjs";
import type { GhFailureReason } from "./ghFailure.ts";
import { incidentIdentity, type FailedReadIncident } from "./incidentEntry.ts";
import {
  appendIncident,
  notYetRecorded,
  readIncidentRecord,
} from "./incidentRecord.ts";
import {
  currentReadDiagnosticContext,
  type DiagnosticCategory,
} from "./readDiagnosticContext.ts";
import {
  isSafeCount,
  rateLimitEvidence,
  safeText,
  upstreamStatus,
  type RateLimitEvidence,
} from "./readDiagnosticSanitize.ts";

export type {
  DiagnosticCategory,
  ReadDiagnosticContext,
} from "./readDiagnosticContext.ts";
export {
  contextForAdmittedRead,
  contextForAvatarRead,
  withReadDiagnosticContext,
} from "./readDiagnosticContext.ts";
export type { RateLimitEvidence } from "./readDiagnosticSanitize.ts";

const historyLimit = 100;

// Where a failed read failed: on this machine before GitHub could answer
// (`local`), at GitHub, which answered with a refusal (`upstream`), or
// where this process cannot tell (`unknown`).
export type FailureCategory = "local" | "upstream" | "unknown";

export type ReadDiagnosticEntry = {
  readonly at: string;
  readonly source: string;
  readonly category: DiagnosticCategory;
  readonly pin?: string;
  readonly cause: GhFailureReason["kind"];
  readonly ownerCause?: OwnerUnavailableCause;
  readonly failureCategory: FailureCategory;
  // Whether the request owner asked GitHub, and how long this process's
  // wait lasted before it did.
  readonly dispatched: boolean;
  readonly queueWaitMs?: number;
  // The request owner the read was sent to: its process, generation, and
  // the protocol version it reported.
  readonly ownerPid?: number;
  readonly ownerGeneration?: number;
  readonly ownerProtocol?: number;
  readonly elapsedMs: number;
  readonly status?: number;
  readonly requestId?: string;
  readonly rateLimit?: RateLimitEvidence;
};

export type DiagnosticOutcome = {
  readonly kind: "diagnostics";
  // This process's failures, oldest first.
  readonly failures: readonly ReadDiagnosticEntry[];
  // The incident record's failures of this source across processes, this
  // process's included, newest first, with when the record began and how
  // many entries it dropped at its bounds.
  readonly record: {
    readonly startedAt?: string;
    readonly dropped: number;
    readonly failures: readonly FailedReadIncident[];
  };
};

// Newest last; oldest are dropped once size exceeds `historyLimit`. Each
// failure as this process reports it and as its incident record holds it.
const failures: {
  readonly entry: ReadDiagnosticEntry;
  readonly incident?: FailedReadIncident;
}[] = [];

// That source's entries among the newest failures kept in this process and
// in the incident record. Reads only local files.
export async function diagnosticsForSource(
  sourceId: string,
): Promise<Omit<DiagnosticOutcome, "kind">> {
  const own = failures.filter(({ entry }) => entry.source === sourceId);
  // Taken before the record is read, so an entry written meanwhile is in
  // one or the other.
  const unwritten = own.flatMap(({ incident }) =>
    incident !== undefined && notYetRecorded(incident) ? [incident] : [],
  );
  const record = await readIncidentRecord();
  const merged = new Map<string, FailedReadIncident>();
  for (const entry of [...record.entries, ...unwritten]) {
    if (entry.source === sourceId) merged.set(incidentIdentity(entry), entry);
  }
  return {
    failures: own.map(({ entry }) => entry),
    record: {
      ...(record.startedAt !== undefined && { startedAt: record.startedAt }),
      dropped: record.dropped,
      failures: [...merged.values()].sort(newestFirst),
    },
  };
}

function newestFirst(a: FailedReadIncident, b: FailedReadIncident): number {
  return Date.parse(b.at) - Date.parse(a.at) || b.seq - a.seq;
}

function failureCategoryOf(
  cause: GhFailureReason["kind"],
  dispatched: boolean,
): FailureCategory {
  switch (cause) {
    case "http":
    case "rate-limited":
      return "upstream";
    case "owner-unavailable":
    case "not-installed":
    case "not-logged-in":
    case "output-bound":
      return "local";
    default:
      // A call the owner never asked of GitHub failed here, unless its wait
      // ended at its bound, which says nothing of whether it was asked.
      return dispatched || cause === "timed-out" ? "unknown" : "local";
  }
}

// Records one failed shared invocation, as the installed request source
// tells it (`github-requests.mjs`), when an admitted reader started it.
// Omits held-back answers, successful or unchanged (`304`) answers,
// and calls with no admitted context.
export function recordFailedRead(input: FailedGhRequest): void {
  const carried = currentReadDiagnosticContext();
  if (carried === undefined) {
    return;
  }
  // Conditional success: `gh` exits non-zero for `304`, but the heads check
  // treats it as unchanged — not a failure to retain.
  if (input.answer?.status === 304) {
    return;
  }
  const elapsedMs = Math.max(0, Date.now() - input.startedAtMs);
  const status = upstreamStatus(input.cause, input.answer);
  const headers = input.answer?.headers;
  const requestId =
    headers === undefined
      ? undefined
      : safeText(headers.get("x-github-request-id"));
  const rateLimit =
    headers === undefined ? undefined : rateLimitEvidence(headers, Date.now());
  const askedAtMs =
    input.askedAt === undefined ? undefined : Date.parse(input.askedAt);
  const dispatched = askedAtMs !== undefined && Number.isFinite(askedAtMs);
  const owner = input.owner;
  const entry: ReadDiagnosticEntry = {
    at: new Date(dispatched ? askedAtMs : Date.now()).toISOString(),
    source: carried.source,
    category: carried.category,
    ...(carried.pin !== undefined && { pin: carried.pin }),
    cause: input.cause,
    ...(input.answer?.failure?.kind === "owner-unavailable" && {
      ownerCause: safeOwnerCause(input.answer.failure.cause),
    }),
    failureCategory: failureCategoryOf(input.cause, dispatched),
    dispatched,
    ...(dispatched && {
      queueWaitMs: Math.max(0, Math.round(askedAtMs - input.startedAtMs)),
    }),
    ...(owner?.pid !== undefined &&
      isSafeCount(owner.pid) && { ownerPid: owner.pid }),
    ...(owner !== undefined &&
      isSafeCount(owner.generation) && { ownerGeneration: owner.generation }),
    ...(owner?.protocol !== undefined &&
      isSafeCount(owner.protocol) && { ownerProtocol: owner.protocol }),
    elapsedMs,
    ...(status !== undefined && { status }),
    ...(requestId !== undefined && { requestId }),
    ...(rateLimit !== undefined && { rateLimit }),
  };
  const incident = appendIncident({ kind: "failed-read", ...entry });
  failures.push({
    entry,
    ...(incident !== undefined && { incident }),
  });
  while (failures.length > historyLimit) {
    failures.shift();
  }
}
