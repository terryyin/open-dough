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
import {
  attemptWorkerRunning,
  workedByThisServer,
} from "./launchAttemptWorker.ts";
import { ownLaunchRecord } from "./ownLaunchRecord.ts";
import {
  availableUnboundRecovery,
  retainedUnboundLaunches,
  verifiesUnboundLaunch,
} from "./unboundLaunchRecovery.ts";

type Continuation = {
  readonly attempt: LaunchAttemptRecord;
  readonly ownLaunch: boolean;
  readonly recoveredSession?: LaunchRecord;
};

export async function continuationRecord(
  owned: OwnedAttempts,
  verifying: ReadonlySet<string>,
  sourceId: string,
  id: string,
  attempts: readonly LaunchAttemptRecord[],
  records: ReadonlyMap<string, readonly LaunchRecord[]> | undefined,
): Promise<Continuation | Unaccepted> {
  const found = attempts.find(
    (entry) => entry.id === id && entry.request.source === sourceId,
  );
  if (found === undefined) return unknownAttempt;
  const held = owned.get(id)?.attempt;
  const supersededWorker =
    held?.outcome !== undefined && workedByThisServer(found);
  const machineRunning = !supersededWorker && attemptWorkerRunning(found);
  const projectRecords = records?.get(sourceId) ?? [];
  const historical = availableUnboundRecovery(found, projectRecords);
  const unneeded =
    notContinued({ ...found, owned: false, running: machineRunning }) ??
    notContinued(owned.observed(found));
  if (
    unneeded !== undefined &&
    (historical === undefined ||
      machineRunning ||
      owned.observed(found).running)
  )
    return unneeded;
  if (verifying.has(id)) return recheckRunning;
  if (records === undefined) return unreadableLaunchRecords;
  let own: LaunchRecord | undefined;
  let recoveredSession: LaunchRecord | undefined;
  if (
    found.request.workflow === "ad-hoc" &&
    found.publication.kind !== "published"
  ) {
    const retained = retainedUnboundLaunches(found, projectRecords);
    if (retained.length === 0) return { attempt: found, ownLaunch: false };
    if (
      historical === undefined ||
      !(await verifiesUnboundLaunch(found, historical))
    )
      return {
        kind: "uncertain",
        reason: "unconfirmed",
        explanation:
          "The earlier session could not be verified in its saved workspace. Nothing was started.",
      };
    own = historical;
    recoveredSession = historical;
  } else if (pendingInputRecord(projectRecords, found.request) === undefined) {
    own = ownLaunchRecord(records, found);
  }
  return own === undefined
    ? { attempt: found, ownLaunch: false }
    : {
        ownLaunch: true,
        ...(recoveredSession === undefined ? {} : { recoveredSession }),
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
          settledAt:
            recoveredSession !== undefined && found.outcome?.kind === "launched"
              ? found.settledAt
              : new Date().toISOString(),
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
  const observed = owned.observed(found);
  const running = notContinued(observed);
  if (observed.running && running !== undefined) return running;
  if (verifying.has(id)) return recheckRunning;
  let selected: Continuation | Unaccepted = {
    attempt: found,
    ownLaunch: false,
  };
  let recorded: boolean;
  try {
    recorded = await keepAttemptIf(found, async (machine) => {
      selected = await continuationRecord(
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
    return {
      kind: "accepted",
      attempt: owned.observed(selected.attempt),
      ...(selected.recoveredSession === undefined
        ? {}
        : { recoveredSession: selected.recoveredSession }),
    };
  }
  const answer = await before(selected.attempt.request);
  return answer ?? admit(selected.attempt);
}
