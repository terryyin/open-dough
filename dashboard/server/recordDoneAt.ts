// Done owns what a session's record keeps at Done: the mark itself and, for
// a Default main session, the commits it made in its checkout
// (`./sessionCommitsCapture.ts`).
import { createHash } from "node:crypto";
import type { LaunchRecord } from "../src/agentLaunch.ts";
import { doneAutomatically } from "../src/completionReport.ts";
import {
  sessionCommitsAtDone,
  type SessionCommits,
} from "../src/sessionCommits.ts";
import { sessionKey, type SessionReference } from "../src/sessionReference.ts";
import { replaceRecords } from "./launchRecordDocument.ts";
import { changeSessionRecord, keptSession } from "./launchRecordStore.ts";
import { machineDashboardPath } from "./machineHome.ts";
import { acquireWriteLock, releaseWriteLock } from "./machineJsonLock.ts";
import { leaveMachineJson } from "./machineJsonStore.ts";
import { checkoutSharedMeanwhile } from "./sessionCheckoutShared.ts";
import {
  defaultMainStart,
  keepSessionCommitRefs,
  readSessionCommits,
} from "./sessionCommitsCapture.ts";

// A capture answers the Done that led to its read. A failed read has no
// capture, so the Done time separately remembers that it was attempted.
export function sessionCommitsStartForDone(record: LaunchRecord) {
  const { doneAt, sessionCommitsFailedAt } = record;
  if (
    doneAt === undefined ||
    sessionCommitsFailedAt === doneAt ||
    sessionCommitsAtDone(record) !== undefined
  )
    return undefined;
  return defaultMainStart(record);
}

const sessionCaptures = new Map<string, Promise<LaunchRecord | undefined>>();

// Queue reads for the same session, even when a newer Done arrives while
// an earlier one is reading. The queue releases each settled session.
export async function keptWithSessionCommits(
  sourceId: string,
  marked: LaunchRecord,
): Promise<LaunchRecord | undefined> {
  const doneAt = marked.doneAt;
  if (doneAt === undefined || sessionCommitsStartForDone(marked) === undefined)
    return marked;
  const key = sessionKey(marked.session);
  const capture = (sessionCaptures.get(key) ?? Promise.resolve())
    .catch(() => undefined)
    .then(() => captureCurrentDone(sourceId, marked.session, key, doneAt));
  sessionCaptures.set(key, capture);
  try {
    return await capture;
  } finally {
    if (sessionCaptures.get(key) === capture) sessionCaptures.delete(key);
  }
}

// Serialize across dashboard processes too. The machine-wide launch store
// stays writable through the checkout log read.
async function captureCurrentDone(
  sourceId: string,
  session: SessionReference,
  key: string,
  doneAt: string,
): Promise<LaunchRecord | undefined> {
  const lockKey = createHash("sha256").update(key).digest("hex");
  const lock = machineDashboardPath(`session-commits-${lockKey}.lock`);
  await acquireWriteLock(lock);
  try {
    const current = await keptSession(sourceId, session);
    if (current?.doneAt !== doneAt) return current;
    const start = sessionCommitsStartForDone(current);
    if (start === undefined) return current;
    const read = await readSessionCommits(current, start).catch(
      () => undefined,
    );
    return await keepCurrentCapture(sourceId, key, doneAt, start, read);
  } finally {
    releaseWriteLock(lock);
  }
}

// Compare the Done again under the store lock before applying its Git pins
// and saved capture. A superseded or deleted mark can write neither.
async function keepCurrentCapture(
  sourceId: string,
  key: string,
  doneAt: string,
  start: NonNullable<ReturnType<typeof defaultMainStart>>,
  read: SessionCommits | undefined,
): Promise<LaunchRecord | undefined> {
  let current: LaunchRecord | undefined;
  await replaceRecords(async (kept) => {
    const records = kept[sourceId] ?? [];
    const sessions = records.filter((entry) => "session" in entry);
    const record = sessions.find((entry) => sessionKey(entry.session) === key);
    current = record;
    if (record?.doneAt !== doneAt) return leaveMachineJson;
    let captured: SessionCommits | undefined;
    if (read !== undefined) {
      try {
        const shared = checkoutSharedMeanwhile(record, start, sessions);
        await keepSessionCommitRefs(record.session, read);
        captured = { ...read, shared };
      } catch {
        // An unavailable checkout or unsuccessful pin leaves no capture.
      }
    }
    const next: LaunchRecord = { ...record };
    delete next.sessionCommits;
    delete next.sessionCommitsFailedAt;
    const settled =
      captured === undefined
        ? { ...next, sessionCommitsFailedAt: doneAt }
        : { ...next, sessionCommits: captured };
    current = settled;
    return {
      ...kept,
      [sourceId]: records.map((entry) => (entry === record ? settled : entry)),
    };
  });
  return current;
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
  const marked = await changeSessionRecord(sourceId, session, (record) => {
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
  // A write that keeps the Done time it expects finishes that Done.
  const finishing = options.expectedDoneAt === doneAt;
  if (doneAt === undefined || marked?.doneAt !== doneAt || finishing)
    return marked;
  return keptWithSessionCommits(sourceId, marked);
}
