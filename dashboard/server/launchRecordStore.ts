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

import { sameLaunch } from "../src/launchRequest.ts";
import { creationSchema, type CreationRecord } from "../src/launchCreation.ts";
import { sessionKey, type SessionReference } from "../src/sessionReference.ts";
import { homedir } from "node:os";
import path from "node:path";
import { z } from "zod";
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

function withinRetention(
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

// Every project's records still kept, by project id, each oldest first.
export async function keptRecordsByProject(): Promise<
  ReadonlyMap<string, readonly LaunchRecord[]>
> {
  const read = await readMachineJson(launchStore());
  if (read.kind === "unreadable") {
    return new Map();
  }
  const now = Date.now();
  return new Map(
    Object.entries(read.document).map(([id, records]) => [
      id,
      withinRetention(records, now).filter(
        (entry): entry is LaunchRecord => "session" in entry,
      ),
    ]),
  );
}

// One project's records still kept, oldest first.
export async function keptRecords(
  sourceId: string,
): Promise<readonly LaunchRecord[]> {
  return (await keptRecordsByProject()).get(sourceId) ?? [];
}

// Rewrites the kept records with `change` applied to them. Records past
// retention are dropped first.
async function replaceRecords(
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

// Keeps one known conversation and its first-input evidence, replacing any
// unresolved creation of that launch.
export async function keepRecord(
  sourceId: string,
  record: LaunchRecord,
): Promise<void> {
  await replaceRecords((kept) => ({
    ...kept,
    [sourceId]: [
      ...(kept[sourceId] ?? []).filter((entry) =>
        !("session" in entry)
          ? !sameLaunch(entry.request, record.request)
          : sessionKey(entry.session) !== sessionKey(record.session),
      ),
      record,
    ],
  }));
}

// Sets one kept session's done time to `doneAt`, marking it done, or clears
// it when `doneAt` is undefined, keeping the session like any unclosed one.
// Answers the changed record, or undefined when no such record is kept any
// more.
export async function setRecordDoneAt(
  sourceId: string,
  session: SessionReference,
  doneAt: string | undefined,
): Promise<LaunchRecord | undefined> {
  let changed: LaunchRecord | undefined;
  await replaceRecords((kept) => {
    const records = kept[sourceId];
    if (records === undefined) {
      return kept;
    }
    return {
      ...kept,
      [sourceId]: records.map((record) => {
        if (
          !("session" in record) ||
          sessionKey(record.session) !== sessionKey(session)
        ) {
          return record;
        }
        const next: LaunchRecord = { ...record };
        delete next.doneAt;
        changed = doneAt === undefined ? next : { ...next, doneAt };
        return changed;
      }),
    };
  });
  return changed;
}

// Removes one kept session's record, leaving the project's other records as
// they are. Answers whether such a record was kept.
export async function deleteRecord(
  sourceId: string,
  session: SessionReference,
): Promise<boolean> {
  let deleted = false;
  await replaceRecords((kept) => {
    const records = kept[sourceId];
    if (records === undefined) {
      return kept;
    }
    const remaining = records.filter(
      (record) =>
        !("session" in record) ||
        sessionKey(record.session) !== sessionKey(session),
    );
    deleted = remaining.length < records.length;
    return { ...kept, [sourceId]: remaining };
  });
  return deleted;
}

// Lifecycle updates never recreate evidence the developer has deleted.
export async function updateRecord(
  sourceId: string,
  record: LaunchRecord,
): Promise<boolean> {
  let updated = false;
  await replaceRecords((kept) => ({
    ...kept,
    [sourceId]: (kept[sourceId] ?? []).map((entry) => {
      if (
        !("session" in entry) ||
        sessionKey(entry.session) !== sessionKey(record.session)
      )
        return entry;
      updated = true;
      return record;
    }),
  }));
  return updated;
}

// A creation attempt has no session identity. Keep it in this existing document
// until a known conversation replaces it or native creation explicitly refuses.
export async function creationOf(
  request: LaunchRecord["request"],
): Promise<CreationRecord | "unreadable" | undefined> {
  const read = await readMachineJson(launchStore());
  if (read.kind === "unreadable") return "unreadable";
  return read.document[request.source]?.find(
    (entry): entry is CreationRecord =>
      !("session" in entry) && sameLaunch(entry.request, request),
  );
}
export async function keepCreation(record: CreationRecord): Promise<void> {
  await replaceRecords((kept) => ({
    ...kept,
    [record.request.source]: [
      ...(kept[record.request.source] ?? []).filter(
        (entry) =>
          "session" in entry || !sameLaunch(entry.request, record.request),
      ),
      record,
    ],
  }));
}
export async function removeCreation(
  request: LaunchRecord["request"],
): Promise<void> {
  await replaceRecords((kept) => ({
    ...kept,
    [request.source]: (kept[request.source] ?? []).filter(
      (entry) => "session" in entry || !sameLaunch(entry.request, request),
    ),
  }));
}

export async function keptCreations(): Promise<CreationRecord[]> {
  const read = await readMachineJson(launchStore());
  return read.kind === "unreadable"
    ? []
    : Object.values(read.document)
        .flat()
        .filter((entry): entry is CreationRecord => !("session" in entry));
}
