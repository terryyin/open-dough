// What the developer does to a recorded session from this page: mark it
// done, delete its record, or read it again at once. Each answer replaces or
// removes the record among the machine's sessions (`./agentLaunches.ts`).

import { useCallback, type RefObject } from "react";
import type {
  LaunchRecord,
  LaunchWithState,
  MachineAnswer,
} from "./agentLaunch.ts";
import {
  readMachineSessions,
  requestDeleteRecord,
  requestMarkDone,
  type DeleteRecordOutcome,
} from "./agentLaunchClient.ts";

export type LaunchRecordActions = {
  // Marks a recorded session done, and answers whether the boundary marked
  // it.
  readonly markDone: (record: LaunchRecord) => Promise<boolean>;
  // Deletes a recorded session's record, and answers what came of it. A
  // deleted session is listed nowhere on the page, not even by a read asked
  // before the deletion; a session the boundary finds known keeps its record,
  // now with that state.
  readonly deleteRecord: (record: LaunchRecord) => Promise<DeleteRecordOutcome>;
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
          record.session.sessionId === answered.session.sessionId
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

  const deleteRecord = useCallback(
    async (record: LaunchRecord) => {
      const answer = await requestDeleteRecord(record);
      if (answer.kind === "state-known") {
        replaceRecord(answer.record);
      } else if (answer.kind === "deleted") {
        deletedAt.current.set(record.session.sessionId, Date.now());
        setRecords((current) =>
          current.filter(
            (each) => each.session.sessionId !== record.session.sessionId,
          ),
        );
      }
      return answer;
    },
    [replaceRecord, setRecords, deletedAt],
  );

  const readSession = useCallback(
    async (record: LaunchRecord) => {
      const kept = await readMachineSessions();
      if (kept === undefined) return;
      const { records, ...facts } = kept;
      setFacts(facts);
      const answered = records.find(
        (known) => known.session.sessionId === record.session.sessionId,
      );
      if (answered !== undefined) replaceRecord(answered);
    },
    [replaceRecord, setFacts],
  );

  return { markDone, deleteRecord, readSession };
}
