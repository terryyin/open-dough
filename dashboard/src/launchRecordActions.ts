import { sessionKey } from "./sessionReference.ts";
// What the developer does to a recorded session from this page: mark it
// done, mark its report read, delete its record, or read it again at once.
// Each answer replaces or removes the record among the machine's sessions
// (`./agentLaunches.ts`).

import { useCallback, type RefObject } from "react";
import type {
  LaunchRecord,
  LaunchWithState,
  MachineAnswer,
} from "./agentLaunch.ts";
import { readMachineSessions } from "./machineSessionsReads.ts";
import type { MachineReadSource } from "./machineReadSource.ts";
import {
  requestRecoverSession,
  requestStopSession,
  type DeleteRecordOutcome,
  type MarkDoneOutcome,
} from "./sessionRecordRequests.ts";
import type { RecoverSessionAnswer } from "./sessionRecovery.ts";
import type { StopSessionAnswer } from "./sessionStop.ts";

export type LaunchRecordActions = {
  // Marks a recorded session done, and answers whether the boundary marked
  // it, refused, or left the operation unresolved.
  readonly markDone: (record: LaunchRecord) => Promise<MarkDoneOutcome>;
  // Marks a recorded session's report read, and answers whether the boundary
  // marked it.
  readonly markRead: (record: LaunchRecord) => Promise<boolean>;
  // Deletes a recorded session's record, and answers what came of it. A
  // deleted session is listed nowhere on the page, not even by a read asked
  // before the deletion; a session the boundary finds known keeps its record,
  // now with that state.
  readonly deleteRecord: (record: LaunchRecord) => Promise<DeleteRecordOutcome>;
  // Recovers an unfinished Cursor session the runner does not hold.
  readonly recoverSession: (
    record: LaunchRecord,
  ) => Promise<RecoverSessionAnswer | undefined>;
  // Stops a recorded session through its host, separate from Mark as done.
  readonly stopSession: (
    record: LaunchRecord,
  ) => Promise<StopSessionAnswer | undefined>;
  // Reads a recorded session again at once.
  readonly readSession: (record: LaunchRecord) => Promise<void>;
};

export function useLaunchRecordActions({
  requests,
  setRecords,
  setFacts,
  deletedAt,
}: {
  readonly requests: Pick<
    MachineReadSource,
    "deleteRecord" | "markDone" | "markRead"
  >;
  readonly setRecords: (
    change: (known: readonly LaunchWithState[]) => readonly LaunchWithState[],
  ) => void;
  // Keeps what a read says besides its records.
  readonly setFacts: (facts: Omit<MachineAnswer, "records">) => void;
  // When each deleted session's deletion was answered.
  readonly deletedAt: RefObject<Map<string, number>>;
}): LaunchRecordActions {
  const replaceRecord = useCallback(
    (answered: LaunchWithState) => {
      setRecords((current) =>
        current.map((record) =>
          record.request.source === answered.request.source &&
          sessionKey(record.session) === sessionKey(answered.session)
            ? answered
            : record,
        ),
      );
    },
    [setRecords],
  );

  const markDone = useCallback(
    async (record: LaunchRecord): Promise<MarkDoneOutcome> => {
      const marked = await requests.markDone(record);
      if (marked.kind === "marked") {
        replaceRecord(marked.record);
        return "marked";
      }
      return marked.kind;
    },
    [replaceRecord, requests],
  );

  const markRead = useCallback(
    async (record: LaunchRecord) => {
      const read = await requests.markRead(record);
      if (read === undefined) return false;
      replaceRecord(read);
      return true;
    },
    [replaceRecord, requests],
  );

  const deleteRecord = useCallback(
    async (record: LaunchRecord) => {
      const answer = await requests.deleteRecord(record);
      if (answer.kind === "state-known") {
        replaceRecord(answer.record);
      } else if (answer.kind === "deleted") {
        deletedAt.current.set(sessionKey(record.session), Date.now());
        setRecords((current) =>
          current.filter(
            (each) => sessionKey(each.session) !== sessionKey(record.session),
          ),
        );
      }
      return answer;
    },
    [replaceRecord, setRecords, deletedAt, requests],
  );

  const recoverSession = useCallback(
    async (record: LaunchRecord) => {
      const answer = await requestRecoverSession(record);
      if (answer?.record !== undefined) {
        // Cannot-load replacement changes the native session id. Match the
        // entry the developer recovered, not only the answered key.
        const previousKey = sessionKey(record.session);
        const answered = answer.record;
        setRecords((current) =>
          current.map((entry) =>
            sessionKey(entry.session) === previousKey ||
            sessionKey(entry.session) === sessionKey(answered.session)
              ? answered
              : entry,
          ),
        );
      }
      return answer;
    },
    [setRecords],
  );

  const stopSession = useCallback(
    async (record: LaunchRecord) => {
      const answer = await requestStopSession(record);
      if (answer !== undefined) replaceRecord(answer.record);
      return answer;
    },
    [replaceRecord],
  );

  const readSession = useCallback(
    async (record: LaunchRecord) => {
      const kept = await readMachineSessions();
      if (kept === undefined) return;
      const { records, ...facts } = kept;
      setFacts(facts);
      const answered = records.find(
        (known) =>
          known.request.source === record.request.source &&
          sessionKey(known.session) === sessionKey(record.session),
      );
      if (answered !== undefined) replaceRecord(answered);
    },
    [replaceRecord, setFacts],
  );

  return {
    markDone,
    markRead,
    deleteRecord,
    recoverSession,
    stopSession,
    readSession,
  };
}
