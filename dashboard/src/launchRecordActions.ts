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
import { readMachineSessions } from "./agentLaunchClient.ts";
import {
  requestDeleteRecord,
  requestMarkDone,
  requestMarkRead,
  requestRecoverSession,
  type DeleteRecordOutcome,
} from "./sessionRecordRequests.ts";
import type { RecoverSessionAnswer } from "./sessionRecovery.ts";

export type LaunchRecordActions = {
  // Marks a recorded session done, and answers whether the boundary marked
  // it.
  readonly markDone: (record: LaunchRecord) => Promise<boolean>;
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
  // Reads a recorded session again at once.
  readonly readSession: (record: LaunchRecord) => Promise<void>;
};

export function useLaunchRecordActions({
  setRecords,
  setFacts,
  deletedAt,
}: {
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
          sessionKey(record.session) === sessionKey(answered.session)
            ? answered
            : record,
        ),
      );
    },
    [setRecords],
  );

  const markDone = useCallback(
    async (record: LaunchRecord) => {
      const marked = await requestMarkDone(record);
      if (marked === undefined) return false;
      replaceRecord(marked);
      return true;
    },
    [replaceRecord],
  );

  const markRead = useCallback(
    async (record: LaunchRecord) => {
      const read = await requestMarkRead(record);
      if (read === undefined) return false;
      replaceRecord(read);
      return true;
    },
    [replaceRecord],
  );

  const deleteRecord = useCallback(
    async (record: LaunchRecord) => {
      const answer = await requestDeleteRecord(record);
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
    [replaceRecord, setRecords, deletedAt],
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

  const readSession = useCallback(
    async (record: LaunchRecord) => {
      const kept = await readMachineSessions();
      if (kept === undefined) return;
      const { records, ...facts } = kept;
      setFacts(facts);
      const answered = records.find(
        (known) => sessionKey(known.session) === sessionKey(record.session),
      );
      if (answered !== undefined) replaceRecord(answered);
    },
    [replaceRecord, setFacts],
  );

  return { markDone, markRead, deleteRecord, recoverSession, readSession };
}
