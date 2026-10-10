// This machine's accepted launch attempts (`../src/agentLaunch.ts`), kept by
// the launch owner (`./agentLaunches.ts`) in one file beside the launch
// records: `~/.open-dough/dashboard/launch-attempts.json`, resolved through
// `HOME`. Each catalog project's attempts are kept by project id. An attempt
// is written with its exact request before the launch has any side effect,
// then updated with its publication receipt, its outcome, and when a page
// found it reconciled with published state. It references the kept start,
// creation, or launch record that holds the native evidence; it never copies
// that evidence and is never a story fact. A settled attempt
// is dropped `launchRetentionDays` after it settled; an unsettled one is kept
// until it settles. A continued attempt is the same attempt run again. This
// server's writes are made one at a time, so attempts accepted together are
// all kept; the file is read afresh, replaced atomically, and moved aside when
// unreadable as `./machineJsonStore.ts` describes.

import { z } from "zod";
import {
  launchAttemptSchema,
  launchRetentionDays,
  type AttemptOutcome,
  type LaunchAttemptRecord,
  type LaunchResult,
} from "../src/agentLaunch.ts";
import {
  leaveMachineJson,
  readMachineJson,
  readMachineJsonLocked,
  replaceMachineJson,
  type MachineJsonStore,
} from "./machineJsonStore.ts";
import { machineDashboardPath } from "./machineHome.ts";
import { retainLandingSettlement } from "./launchLandingRecord.ts";

const retentionMs = launchRetentionDays * 24 * 60 * 60 * 1000;

function attemptWithinRetention(
  attempt: LaunchAttemptRecord,
  now: number,
): boolean {
  return (
    attempt.settledAt === undefined ||
    now - Date.parse(attempt.settledAt) <= retentionMs
  );
}

const storeSchema = z.record(z.string(), z.array(launchAttemptSchema));

type StoredAttempts = z.infer<typeof storeSchema>;

function attemptStore(): MachineJsonStore<StoredAttempts> {
  return {
    file: machineDashboardPath("launch-attempts.json"),
    schema: storeSchema,
    empty: {},
  };
}

// The outcome an attempt keeps: a launched session by reference to its
// record, or the answer itself.
export function attemptOutcome(result: LaunchResult): AttemptOutcome {
  return result.kind === "launched"
    ? {
        kind: "launched",
        session: {
          host: result.record.session.host,
          sessionId: result.record.session.sessionId,
        },
      }
    : result;
}

let writing: Promise<unknown> = Promise.resolve();

// Applies `change` after every earlier write of this server, dropping settled
// attempts past retention first. `change` may be async so a caller can read
// launch records under the same write lock that keeps a new attempt, and may
// return `leaveMachineJson` so a refusal writes nothing.
export function replaceAttempts(
  change: (
    kept: StoredAttempts,
  ) =>
    | StoredAttempts
    | typeof leaveMachineJson
    | Promise<StoredAttempts | typeof leaveMachineJson>,
): Promise<void> {
  const write = writing.then(() =>
    replaceMachineJson(attemptStore(), async (stored) => {
      const now = Date.now();
      const kept: StoredAttempts = {};
      for (const [id, attempts] of Object.entries(stored)) {
        kept[id] = attempts.filter((attempt) =>
          attemptWithinRetention(attempt, now),
        );
      }
      return change(kept);
    }),
  );
  writing = write.catch(() => undefined);
  return write;
}

// Every kept attempt across projects, oldest first within each project's list.
function listedAttempts(stored: StoredAttempts): LaunchAttemptRecord[] {
  return Object.values(stored).flat();
}

// Every kept attempt, oldest first, or undefined when the file is unreadable.
export async function keptAttempts(): Promise<
  readonly LaunchAttemptRecord[] | undefined
> {
  const read = await readMachineJson(attemptStore());
  return read.kind === "document" ? listedAttempts(read.document) : undefined;
}

// Places `attempt` among the kept attempts under the write lock.
function withAttempt(
  kept: StoredAttempts,
  attempt: LaunchAttemptRecord,
): StoredAttempts {
  const sourceId = attempt.request.source;
  const attempts = kept[sourceId] ?? [];
  return {
    ...kept,
    [sourceId]: attempts.some((entry) => entry.id === attempt.id)
      ? attempts.map((entry) =>
          entry.id === attempt.id
            ? {
                ...attempt,
                reporting: entry.reporting ?? attempt.reporting,
                reportingDeletedAt:
                  entry.reportingDeletedAt ?? attempt.reportingDeletedAt,
                reportingDeletedSession:
                  entry.reportingDeletedSession ??
                  attempt.reportingDeletedSession,
                completion: entry.completion ?? attempt.completion,
                landingRepository:
                  entry.landingRepository ?? attempt.landingRepository,
                landing: entry.landing ?? attempt.landing,
                landingPreparations:
                  entry.landingPreparations ?? attempt.landingPreparations,
                completionReceipts:
                  entry.completionReceipts ?? attempt.completionReceipts,
              }
            : entry,
        )
      : [...attempts, attempt],
  };
}

// Keeps an attempt's latest state in place of what is kept of it, or adds it
// when none is: a newly accepted attempt, or one whose earlier state was lost
// when an unreadable file was moved aside. A failed write keeps nothing.
export function keepAttempt(attempt: LaunchAttemptRecord): Promise<void> {
  return replaceAttempts(async (kept) => {
    const next = withAttempt(kept, attempt);
    const saved = next[attempt.request.source]?.find(
      (entry) => entry.id === attempt.id,
    );
    if (saved !== undefined) await retainLandingSettlement(saved);
    return next;
  });
}

// Under the attempt store's write lock, lets `allow` decide from the freshly
// read attempts whether to keep `attempt`. When `allow` is false, the
// document is left unchanged (no new attempt). `allow` may await another
// machine read while the lock is held.
export async function keepAttemptIf(
  attempt: LaunchAttemptRecord,
  allow: (kept: readonly LaunchAttemptRecord[]) => boolean | Promise<boolean>,
): Promise<boolean> {
  let recorded = false;
  await replaceAttempts(async (stored) => {
    const allowed = await allow(listedAttempts(stored));
    if (!allowed) return leaveMachineJson;
    recorded = true;
    return withAttempt(stored, attempt);
  });
  return recorded;
}

// Native binding and reporting share this lock before taking the records lock.
// Never acquire these locks in the opposite order.
export async function withKeptAttempts<R>(
  observe: (attempts: readonly LaunchAttemptRecord[] | undefined) => Promise<R>,
): Promise<R> {
  return readMachineJsonLocked(attemptStore(), async (read) =>
    observe(
      read.kind === "document"
        ? Object.values(read.document)
            .flat()
            .filter((entry) => attemptWithinRetention(entry, Date.now()))
        : undefined,
    ),
  );
}
