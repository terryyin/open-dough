// Public launch/creation record operations use one machine document and retention rule.
import { sameLaunch } from "../src/launchRequest.ts";
import { type CreationRecord } from "../src/launchCreation.ts";
import { sessionKey, type SessionReference } from "../src/sessionReference.ts";
import type { LaunchRecord } from "../src/agentLaunch.ts";
import {
  readStoredRecords,
  replaceRecords,
  withinRetention,
} from "./launchRecordDocument.ts";

// Every project's records still kept, by project id, each oldest first.
export async function keptRecordsByProject(): Promise<
  ReadonlyMap<string, readonly LaunchRecord[]>
> {
  const read = await readStoredRecords();
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
  options: {
    readonly doneProblem?: string;
    readonly expectedDoneAt?: string;
  } = {},
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
        if (
          options.expectedDoneAt !== undefined &&
          record.doneAt !== options.expectedDoneAt
        ) {
          changed = record;
          return record;
        }
        const next: LaunchRecord = { ...record };
        delete next.doneAt;
        delete next.doneProblem;
        changed =
          doneAt === undefined
            ? next
            : {
                ...next,
                doneAt,
                ...(options.doneProblem === undefined
                  ? {}
                  : { doneProblem: options.doneProblem }),
              };
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
      // Native lifecycle evidence never clears newer local done/reopen intent.
      return {
        ...record,
        doneAt: entry.doneAt,
        doneProblem: entry.doneProblem,
      };
    }),
  }));
  return updated;
}

// A creation attempt has no session identity. Keep it in this existing document
// until a known conversation replaces it or native creation explicitly refuses.
export async function creationOf(
  request: LaunchRecord["request"],
): Promise<CreationRecord | "unreadable" | undefined> {
  const read = await readStoredRecords();
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
  const read = await readStoredRecords();
  return read.kind === "unreadable"
    ? []
    : Object.values(read.document)
        .flat()
        .filter((entry): entry is CreationRecord => !("session" in entry));
}
