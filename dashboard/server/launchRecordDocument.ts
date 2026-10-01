// This machine's launch records (`../src/agentLaunch.ts`), kept for the local
// launch boundary (`./agentLaunches.ts`) in one file outside every repository:
// `~/.open-dough/dashboard/agent-launches.json`, resolved through `HOME` like
// `./projectFolders.ts`. One JSON document holds each catalog project's
// records by project id. Every read and write reads the file afresh, so each
// dashboard server on this machine -- dev and preview alike -- sees every
// launch. A write adds a launch, sets or clears a kept session's done time,
// or deletes a kept session.
// A record not marked done is kept however long ago it was launched. A record
// marked done more than `launchRetentionDays` before a read is not answered,
// and a write drops it. The file is read afresh, replaced atomically, and
// moved aside when unreadable as `./machineJsonStore.ts` describes.

import { homedir } from "node:os";
import path from "node:path";
import { z } from "zod";
import { creationSchema, type CreationRecord } from "../src/launchCreation.ts";
import {
  launchRecordSchema,
  launchRetentionDays,
  type LaunchRecord,
} from "../src/agentLaunch.ts";
import {
  readMachineJson,
  replaceMachineJson,
  type MachineJsonStore,
} from "./machineJsonStore.ts";

const retentionMs = launchRetentionDays * 24 * 60 * 60 * 1000;

const storeSchema = z.record(
  z.string(),
  z.array(z.union([launchRecordSchema, creationSchema])),
);

type StoredRecords = z.infer<typeof storeSchema>;

function launchStore(): MachineJsonStore<StoredRecords> {
  return {
    file: path.join(
      homedir(),
      ".open-dough",
      "dashboard",
      "agent-launches.json",
    ),
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

// Rewrites the kept records with `change` applied to them. Records past
// retention are dropped first.
export async function replaceRecords(
  change: (kept: StoredRecords) => StoredRecords,
): Promise<void> {
  await replaceMachineJson(launchStore(), (stored) => {
    const now = Date.now();
    const kept: StoredRecords = {};
    for (const [id, records] of Object.entries(stored)) {
      const retained = withinRetention(records, now);
      if (retained.length > 0) {
        kept[id] = retained;
      }
    }
    return change(kept);
  });
}
