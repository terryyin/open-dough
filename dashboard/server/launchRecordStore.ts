// Public launch/creation record operations use one machine document and retention rule.
import { sameLaunch } from "../src/launchRequest.ts";
import { sessionKey, type SessionReference } from "../src/sessionReference.ts";
import type { AgentLaunchRequest, LaunchRecord } from "../src/agentLaunch.ts";
import {
  readStoredRecords,
  replaceRecords,
  withinRetention,
} from "./launchRecordDocument.ts";

// Every project's records still kept, by project id, each oldest first.
export async function keptRecordsByProject(): Promise<
  ReadonlyMap<string, readonly LaunchRecord[]>
> {
  return (await readableRecordsByProject()) ?? new Map();
}

// The same, or undefined when the record file could not be read.
export async function readableRecordsByProject(): Promise<
  ReadonlyMap<string, readonly LaunchRecord[]> | undefined
> {
  const read = await readStoredRecords();
  if (read.kind === "unreadable") {
    return undefined;
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

// One retained host-qualified conversation for a catalog project.
export async function keptSession(
  sourceId: string,
  session: SessionReference,
): Promise<LaunchRecord | undefined> {
  return (await keptRecords(sourceId)).find(
    (record) => sessionKey(record.session) === sessionKey(session),
  );
}

// A kept conversation of this launch whose first input is unconfirmed.
export async function pendingInputOf(
  sourceId: string,
  request: AgentLaunchRequest,
): Promise<LaunchRecord | undefined> {
  return (await keptRecords(sourceId)).find(
    (record) =>
      sameLaunch(record.request, request) &&
      record.firstInput !== undefined &&
      record.firstInput.state !== "confirmed" &&
      record.firstInput.state !== "not-requested",
  );
}

export { keepRecord } from "./launchRecordBinding.ts";

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
        const next: LaunchRecord = {
          ...record,
          dispositionChangedAt: new Date().toISOString(),
        };
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

export { deleteRecord } from "./launchRecordDeletion.ts";

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
        completion: entry.completion ?? record.completion,
        dispositionChangedAt: entry.dispositionChangedAt,
        doneAt: entry.doneAt,
        doneProblem: entry.doneProblem,
      };
    }),
  }));
  return updated;
}

export {
  creationOf,
  keepCreation,
  removeCreation,
  keptCreations,
} from "./launchCreationStore.ts";
