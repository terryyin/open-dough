// Serializes Default main commit capture and settles it against the current Done.
import { createHash } from "node:crypto";
import type { LaunchRecord } from "../src/agentLaunch.ts";
import {
  sessionCommitsAtDone,
  type SessionCommits,
} from "../src/sessionCommits.ts";
import { sessionKey, type SessionReference } from "../src/sessionReference.ts";
import { replaceRecords } from "./launchRecordDocument.ts";
import {
  keepSessionCommitRefs,
  releaseSessionCommitRefs,
} from "./launchRecordPins.ts";
import { keptSession } from "./launchRecordStore.ts";
import { machineDashboardPath } from "./machineHome.ts";
import { acquireWriteLock, releaseWriteLock } from "./machineJsonLock.ts";
import { leaveMachineJson } from "./machineJsonStore.ts";
import { checkoutSharedMeanwhile } from "./sessionCheckoutShared.ts";
import {
  defaultMainStart,
  readSessionCommits,
} from "./sessionCommitsCapture.ts";

// A capture answers the Done that led to its read. A failed read has no
// capture, so the Done time separately remembers that it was attempted.
function sessionCommitsStartForDone(record: LaunchRecord) {
  const { doneAt, sessionCommitsFailedAt } = record;
  if (
    doneAt === undefined ||
    sessionCommitsFailedAt === doneAt ||
    sessionCommitsAtDone(record) !== undefined
  )
    return undefined;
  return defaultMainStart(record);
}

export function doneCapturePending(record: LaunchRecord): boolean {
  return sessionCommitsStartForDone(record) !== undefined;
}

const sessionCaptures = new Map<string, Promise<LaunchRecord | undefined>>();

// Queue reads for the same session, even when a newer Done arrives while
// an earlier one is reading. The queue releases each settled session.
export async function keptWithDoneCapture(
  sourceId: string,
  marked: LaunchRecord,
): Promise<LaunchRecord | undefined> {
  const doneAt = marked.doneAt;
  if (doneAt === undefined || !doneCapturePending(marked)) return marked;
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
    return await keepCurrentSessionCommits(sourceId, key, doneAt, start, read);
  } finally {
    releaseWriteLock(lock);
  }
}

// Compare the Done again under the store lock before applying its Git pins
// and saved capture. A superseded or deleted mark can write neither.
async function keepCurrentSessionCommits(
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
    const settled = await settleSessionCommits(
      record,
      sessions,
      doneAt,
      start,
      read,
    );
    current = settled;
    return {
      ...kept,
      [sourceId]: records.map((entry) => (entry === record ? settled : entry)),
    };
  });
  return current;
}

async function settleSessionCommits(
  record: LaunchRecord,
  sessions: readonly LaunchRecord[],
  doneAt: string,
  start: NonNullable<ReturnType<typeof defaultMainStart>>,
  read: SessionCommits | undefined,
): Promise<LaunchRecord> {
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
  const previousRepository = record.sessionCommits?.repository;
  const repository = read?.repository ?? previousRepository;
  if (captured === undefined)
    await releaseSessionCommitRefs(settled, repository);
  if (previousRepository !== undefined && previousRepository !== repository)
    await releaseSessionCommitRefs(
      settled,
      previousRepository,
      captured?.repository,
    );
  return settled;
}
