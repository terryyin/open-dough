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
// and a write drops it. The file is read, replaced atomically, and
// moved aside when unreadable as `./machineJsonStore.ts` describes.

import { z } from "zod";
import { creationSchema, type CreationRecord } from "../src/launchCreation.ts";
import {
  launchRecordSchema,
  launchRetentionDays,
  type LaunchRecord,
} from "../src/agentLaunch.ts";
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

// Rewrites the kept records with `change` applied to them. Records past
// retention are dropped first. `change` may return `leaveMachineJson` to
// leave the file as it is.
export async function replaceRecords(
  change: (kept: StoredRecords) => StoredRecords | typeof leaveMachineJson,
): Promise<void> {
  const outcome: { dropped: LaunchRecord[]; leftAsIs: boolean } = {
    dropped: [],
    leftAsIs: false,
  };
  await replaceMachineJson(launchStore(), (stored) => {
    const now = Date.now();
    outcome.dropped = [];
    const kept: StoredRecords = {};
    for (const [id, records] of Object.entries(stored)) {
      const retained = withinRetention(records, now);
      outcome.dropped.push(
        ...records.filter(
          (record): record is LaunchRecord =>
            "session" in record && !retained.includes(record),
        ),
      );
      if (retained.length > 0) {
        kept[id] = retained;
      }
    }
    const next = change(kept);
    outcome.leftAsIs = next === leaveMachineJson;
    return next;
  });
  if (!outcome.leftAsIs && outcome.dropped.length > 0) {
    await recordsDroppedByRetention?.(outcome.dropped);
  }
}
