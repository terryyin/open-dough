// A continuation settles its own durable session before pre-launch checks.
// Both that answer and readmission select fresh machine evidence under the
// attempt lock, so another server's run or settlement cannot be overwritten.
import type {
  Acceptance,
  AgentLaunchRequest,
  LaunchAttemptRecord,
  LaunchRecord,
} from "../src/agentLaunch.ts";
import {
  notContinued,
  recheckRunning,
  unknownAttempt,
  unreadableEvidence,
  unreadableLaunchRecords,
  unrecordedAcceptance,
  type Unaccepted,
} from "./launchAttemptConflicts.ts";
import { keepAttemptIf, keptAttempts } from "./launchAttemptStore.ts";
import {
  pendingInputRecord,
  readableRecordsByProject,
} from "./launchRecordStore.ts";
import type { OwnedAttempts } from "./ownedAttempts.ts";
import { attemptWorkerRunning } from "./launchAttemptWorker.ts";
import { ownLaunchRecord } from "./ownLaunchRecord.ts";

type Continuation = {
  readonly attempt: LaunchAttemptRecord;
  readonly ownLaunch: boolean;
};

export function continuationRecord(
  owned: OwnedAttempts,
  verifying: ReadonlySet<string>,
  sourceId: string,
  id: string,
  attempts: readonly LaunchAttemptRecord[],
  records: ReadonlyMap<string, readonly LaunchRecord[]> | undefined,
): Continuation | Unaccepted {
  const found = attempts.find(
    (entry) => entry.id === id && entry.request.source === sourceId,
  );
  if (found === undefined) return unknownAttempt;
  const held = owned.get(id)?.attempt;
  const supersededWorker =
    held?.outcome !== undefined && found.worker?.serverPid === process.pid;
  const machineRunning = !supersededWorker && attemptWorkerRunning(found);
  const unneeded =
    notContinued({ ...found, owned: false, running: machineRunning }) ??
    notContinued(owned.observed(found));
  if (unneeded !== undefined) return unneeded;
  if (verifying.has(id)) return recheckRunning;
  if (found.request.workflow === "ad-hoc")
    return { attempt: found, ownLaunch: false };
  if (records === undefined) return unreadableLaunchRecords;
  if (
    pendingInputRecord(records.get(sourceId) ?? [], found.request) !== undefined
  )
    return { attempt: found, ownLaunch: false };
  const own = ownLaunchRecord(records, found);
  return own === undefined
    ? { attempt: found, ownLaunch: false }
    : {
        ownLaunch: true,
        attempt: {
          ...found,
          worker: undefined,
          slowSince: undefined,
          outcome: {
            kind: "launched",
            session: {
              host: own.session.host,
              sessionId: own.session.sessionId,
            },
          },
          settledAt: new Date().toISOString(),
        },
      };
}

export async function continueAttempt(
  owned: OwnedAttempts,
  verifying: ReadonlySet<string>,
  sourceId: string,
  id: string,
  before: (request: AgentLaunchRequest) => Promise<Unaccepted | undefined>,
  admit: (attempt: LaunchAttemptRecord) => Promise<Acceptance>,
): Promise<Acceptance> {
  const read = await keptAttempts();
  if (read === undefined) return unreadableEvidence;
  const found = read.find(
    (entry) => entry.id === id && entry.request.source === sourceId,
  );
  if (found === undefined) return unknownAttempt;
  const unneeded = notContinued(owned.observed(found));
  if (unneeded !== undefined) return unneeded;
  if (verifying.has(id)) return recheckRunning;
  let selected: Continuation | Unaccepted = {
    attempt: found,
    ownLaunch: false,
  };
  let recorded: boolean;
  try {
    recorded = await keepAttemptIf(found, async (machine) => {
      selected = continuationRecord(
        owned,
        verifying,
        sourceId,
        id,
        machine,
        await readableRecordsByProject(),
      );
      // No own record leaves the attempt untouched; only readmission may run it.
      return "attempt" in selected && selected.ownLaunch
        ? selected.attempt
        : false;
    });
  } catch {
    return unrecordedAcceptance;
  }
  if (!("attempt" in selected)) return selected;
  if (recorded) {
    owned.release(id);
    return { kind: "accepted", attempt: owned.observed(selected.attempt) };
  }
  const answer = await before(selected.attempt.request);
  return answer ?? admit(selected.attempt);
}
