// This machine's launch records (`../src/agentLaunch.ts`), kept for the local
// launch boundary (`./agentLaunches.ts`) in one file outside every repository:
// `~/.open-dough/dashboard/agent-launches.json`, resolved through `HOME` like
// `./projectFolders.ts`. One JSON document holds each catalog project's
// records by project id. Every read and write consults the file, so each
// dashboard server on this machine -- dev and preview alike -- sees every
// launch. A write adds a launch, sets or clears a kept session's done time,
// or deletes a kept session.
// A record not marked done is kept however long ago it was launched. A record
// marked done more than `launchRetentionDays` before a read is not answered,
// and a write moves it into launch history (`./launchHistory.ts`) once that
// history holds it. The file is read, replaced atomically, and moved aside
// when unreadable as `./machineJsonStore.ts` describes.

import { z } from "zod";
import { creationSchema, type CreationRecord } from "../src/launchCreation.ts";
import {
  launchRecordSchema,
  launchRetentionDays,
  type LaunchRecord,
} from "../src/agentLaunch.ts";
import { sessionKey } from "../src/sessionReference.ts";
import {
  appendLaunchHistory,
  type LaunchHistoryEntry,
} from "./launchHistory.ts";
import {
  leaveMachineJson,
  readMachineJson,
  replaceMachineJson,
  type MachineJsonStore,
} from "./machineJsonStore.ts";
import { machineDashboardPath } from "./machineHome.ts";

const retentionMs = launchRetentionDays * 24 * 60 * 60 * 1000;

const storeSchema = z.record(
  z.string(),
  z.array(z.union([launchRecordSchema, creationSchema])),
);

type StoredRecords = z.infer<typeof storeSchema>;

type LeavingRecord = {
  readonly project: string;
  readonly record: LaunchRecord;
};

function launchStore(): MachineJsonStore<StoredRecords> {
  return {
    file: machineDashboardPath("agent-launches.json"),
    schema: storeSchema,
    empty: {},
  };
}

export function withinRetention(
  records: readonly (LaunchRecord | CreationRecord)[],
  now: number,
): (LaunchRecord | CreationRecord)[] {
  return records.filter(
    (record) =>
      !("session" in record) ||
      record.doneAt === undefined ||
      now - Date.parse(record.doneAt) <= retentionMs,
  );
}

// Reads the single shared document without changing retained evidence.
export function readStoredRecords() {
  return readMachineJson(launchStore());
}

// Session records a retention drop removed, surfaced to the listener the
// launch boundary installs (`./launchRecordRemoval.ts`), which retires
// each record's host-local state through the same dispatch an explicit
// record deletion uses. This store names no host: it only reports which
// records it dropped, and only once the rewrite that dropped them has
// actually landed -- a write left as it is or one that fails drops
// nothing, so no state is retired before its record is gone.
export type RecordsDroppedByRetention = (
  records: readonly LaunchRecord[],
) => Promise<void>;

let recordsDroppedByRetention: RecordsDroppedByRetention | undefined;

export function onRecordsDroppedByRetention(
  listener: RecordsDroppedByRetention,
): void {
  recordsDroppedByRetention = listener;
}

function sessionEntries(stored: StoredRecords): LeavingRecord[] {
  const entries: LeavingRecord[] = [];
  for (const [project, records] of Object.entries(stored)) {
    for (const record of records) {
      if ("session" in record) entries.push({ project, record });
    }
  }
  return entries;
}

function presentKeys(stored: StoredRecords): Set<string> {
  return new Set(
    sessionEntries(stored).map(
      ({ project, record }) => `${project}\0${sessionKey(record.session)}`,
    ),
  );
}

function withAgedOutRestored(
  next: StoredRecords,
  agedOut: readonly LeavingRecord[],
): StoredRecords {
  const restored: StoredRecords = { ...next };
  for (const { project, record } of agedOut) {
    restored[project] = [record, ...(restored[project] ?? [])];
  }
  return restored;
}

function historyEntries(
  leaving: readonly LeavingRecord[],
  reason: LaunchHistoryEntry["reason"],
  leftAt: string,
): LaunchHistoryEntry[] {
  return leaving.map(({ project, record }) => ({
    project,
    record,
    leftAt,
    reason,
  }));
}

// Rewrites the kept records with `change` applied to them. Records past
// retention leave for launch history first. `change` may return
// `leaveMachineJson` to leave the file as it is. A session key `change`
// drops moves into history as `removed`. History is appended before the
// document replaces; when retention history cannot be written, aged-out
// records stay in the document (still hidden on read) and the write's own
// change still applies. When a removal cannot be recorded in history, the
// write fails and the record stays.
export async function replaceRecords(
  change: (
    kept: StoredRecords,
  ) =>
    | StoredRecords
    | typeof leaveMachineJson
    | Promise<StoredRecords | typeof leaveMachineJson>,
): Promise<void> {
  const outcome: {
    dropped: LaunchRecord[];
    leftAsIs: boolean;
  } = {
    dropped: [],
    leftAsIs: false,
  };
  await replaceMachineJson(launchStore(), async (stored) => {
    const now = Date.now();
    const leftAt = new Date(now).toISOString();
    outcome.dropped = [];
    const kept: StoredRecords = {};
    const agedOut: LeavingRecord[] = [];
    for (const [id, records] of Object.entries(stored)) {
      const retained = withinRetention(records, now);
      for (const record of records) {
        if ("session" in record && !retained.includes(record)) {
          agedOut.push({ project: id, record });
        }
      }
      if (retained.length > 0) {
        kept[id] = retained;
      }
    }
    const next = await change(kept);
    outcome.leftAsIs = next === leaveMachineJson;
    if (next === leaveMachineJson) return leaveMachineJson;

    const nextKeys = presentKeys(next);
    const removed = sessionEntries(kept).filter(
      ({ project, record }) =>
        !nextKeys.has(`${project}\0${sessionKey(record.session)}`),
    );

    const toHistory = [
      ...historyEntries(agedOut, "aged-out", leftAt),
      ...historyEntries(removed, "removed", leftAt),
    ];
    if (toHistory.length === 0) {
      return next;
    }

    try {
      await appendLaunchHistory(toHistory);
    } catch (error) {
      if (removed.length > 0) throw error;
      // Retention-only: keep aged-out in the operational document; the write's
      // change still lands. Host-local retirement waits until they leave.
      return withAgedOutRestored(next, agedOut);
    }

    outcome.dropped = agedOut.map(({ record }) => record);
    return next;
  });
  if (!outcome.leftAsIs && outcome.dropped.length > 0) {
    await recordsDroppedByRetention?.(outcome.dropped);
  }
}
