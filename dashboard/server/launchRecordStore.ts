// Public launch/creation record operations use one machine document and retention rule.
import { doneAutomatically } from "../src/completionReport.ts";
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

export { bindRecord, keepRecord } from "./launchRecordBinding.ts";

// Changes one kept session's record by `change`, answering the record as it
// now is, or undefined when no such record is kept any more.
async function changeSessionRecord(
  sourceId: string,
  session: SessionReference,
  change: (record: LaunchRecord) => LaunchRecord,
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
        changed = change(record);
        return changed;
      }),
    };
  });
  return changed;
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
    readonly automatic?: boolean;
  } = {},
): Promise<LaunchRecord | undefined> {
  return changeSessionRecord(sourceId, session, (record) => {
    if (options.automatic && !doneAutomatically(record)) return record;
    if (
      options.expectedDoneAt !== undefined &&
      record.doneAt !== options.expectedDoneAt
    ) {
      return record;
    }
    const next: LaunchRecord = {
      ...record,
      dispositionChangedAt: options.automatic
        ? record.dispositionChangedAt
        : new Date().toISOString(),
    };
    delete next.doneAt;
    delete next.doneProblem;
    return doneAt === undefined
      ? next
      : {
          ...next,
          doneAt,
          ...(options.doneProblem === undefined
            ? {}
            : { doneProblem: options.doneProblem }),
        };
  });
}

// Marks one kept session's report with `receipt` read, changing nothing else:
// its done mark and disposition stay as they are. Answers the changed record,
// or undefined when no such record is kept any more.
export async function setRecordReportRead(
  sourceId: string,
  session: SessionReference,
  receipt: string,
): Promise<LaunchRecord | undefined> {
  return changeSessionRecord(sourceId, session, (record) => ({
    ...record,
    reportRead: receipt,
  }));
}

export { deleteRecord } from "./launchRecordDeletion.ts";

// Replaces one kept session's record, matching the previous session key so the
// native conversation id may change (Cursor cannot-load replacement).
export async function replaceKeptSession(
  sourceId: string,
  previous: SessionReference,
  next: LaunchRecord,
): Promise<LaunchRecord | undefined> {
  return changeSessionRecord(sourceId, previous, (record) => ({
    ...next,
    landing: record.landing ?? next.landing,
    landingReporting: record.landingReporting ?? next.landingReporting,
  }));
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
        completion: entry.completion ?? record.completion,
        landing: entry.landing ?? record.landing,
        landingReporting: entry.landingReporting ?? record.landingReporting,
        dispositionChangedAt: entry.dispositionChangedAt,
        doneAt: entry.doneAt,
        doneProblem: entry.doneProblem,
        reportRead: entry.reportRead,
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
