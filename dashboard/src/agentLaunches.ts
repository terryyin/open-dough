import { sessionKey } from "./sessionReference.ts";
// Machine sessions and this page's launch attempts have one browser owner.

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  Alerts,
  KeptStart,
  MachineAnswer,
  StartPhase,
  LaunchWithState,
  LaunchWorkflow,
} from "./agentLaunch.ts";
import { replaced } from "./sessionRecords.ts";
import { readMachineSessions } from "./agentLaunchClient.ts";
import { useLaunchAttempts, type LaunchAttempts } from "./launchAttempts.ts";
import {
  useLaunchRecordActions,
  type LaunchRecordActions,
} from "./launchRecordActions.ts";
import { launchOffers, type LaunchOffers } from "./launchOffers.ts";
import { usePageVisibility } from "./pageVisibility.ts";
import { checkIntervalMs } from "./revisionCheckSchedule.ts";

export type MachineSessions = ReadSessions &
  LaunchOffers &
  LaunchAttempts &
  LaunchRecordActions;

// The machine's sessions and what their latest read said.
type ReadSessions = {
  readonly rereadOffers: () => void;
  readonly creations: MachineAnswer["creations"];
  // Records oldest first per project, with latest observations; unread until supplied.
  readonly records: readonly LaunchWithState[] | undefined;
  // Alert capability at the latest read; unread until supplied.
  readonly alerts: Alerts | undefined;
  // A kept start without a session, if present at the latest read.
  keptStartOf(
    sourceId: string,
    identity: string,
    workflow: LaunchWorkflow,
  ): KeptStart | undefined;
  // The currently running start phase, whichever page requested it.
  startPhaseOf(
    sourceId: string,
    identity: string,
    workflow: LaunchWorkflow,
  ): StartPhase | undefined;
  // Records shown on cards, including this page’s launches before the first read.
  readonly launched: readonly LaunchWithState[];
};

// What a read of the machine's sessions says besides their records.
type ReadFacts = Omit<MachineAnswer, "records">;

export function useAgentLaunches(): MachineSessions {
  const [sessions, setSessions] = useState<
    {
      readonly known: readonly LaunchWithState[];
      readonly read: boolean;
      readonly alerts?: Alerts;
    } & Omit<ReadFacts, "alerts">
  >({
    known: [],
    attempts: [],
    creations: [],
    read: false,
    establishing: [],
    establishingPreparation: [],
    establishingHosts: [],
    keptStarts: [],
    starts: [],
    definitions: [],
    sessionPolicies: [],
  });
  const {
    known,
    creations,
    read: readAnswered,
    alerts,
    keptStarts,
    starts,
    attempts: observed,
  } = sessions;
  const setRecords = useCallback(
    (
      change: (known: readonly LaunchWithState[]) => readonly LaunchWithState[],
    ) => {
      setSessions((current) => ({ ...current, known: change(current.known) }));
    },
    [],
  );
  // Reads predating deletion must not restore the deleted record.
  const deletedAt = useRef(new Map<string, number>());
  const { visibility, settleRevealed } = usePageVisibility();
  const everRead = useRef(false);
  const [readsSettled, setReadsSettled] = useState(0);
  const [offersReading, setOffersReading] = useState(false);
  const [requested, setRequested] = useState(0);
  const lastRequested = useRef(0);
  const reread = useCallback(() => {
    setRequested((value) => value + 1);
  }, []);
  const attempts = useLaunchAttempts({
    observed,
    records: known,
    reads: readsSettled,
    reread,
  });

  useEffect(() => {
    if (visibility === "hidden") return;
    let current = true;
    const read = () => {
      const askedAt = Date.now();
      void readMachineSessions().then((answered) => {
        if (!current) return;
        if (answered !== undefined) {
          const { records, ...facts } = answered;
          const kept = records.filter(
            (record) =>
              (deletedAt.current.get(sessionKey(record.session)) ?? -1) <
              askedAt,
          );
          setSessions((current) => ({
            known: replaced(kept, current.known, current.read ? askedAt : 0),
            read: true,
            ...facts,
          }));
        }
        setOffersReading(false);
        everRead.current = true;
        settleRevealed();
        setReadsSettled((settled) => settled + 1);
      });
    };
    if (
      visibility === "revealed" ||
      !everRead.current ||
      lastRequested.current !== requested
    ) {
      lastRequested.current = requested;
      read();
      return () => {
        current = false;
      };
    }
    const waiting = setTimeout(read, checkIntervalMs);
    return () => {
      current = false;
      clearTimeout(waiting);
    };
  }, [visibility, readsSettled, settleRevealed, requested]);

  const setFacts = useCallback((facts: ReadFacts) => {
    setSessions((current) => ({ ...current, ...facts }));
  }, []);
  const recordActions = useLaunchRecordActions({
    setRecords,
    setFacts,
    deletedAt,
  });

  return {
    rereadOffers: () => {
      setOffersReading(true);
      reread();
    },
    records: readAnswered ? known : undefined,
    creations,
    alerts,
    ...launchOffers(sessions, readAnswered && !offersReading),
    keptStartOf: (sourceId, identity, workflow) =>
      keptStarts.find(
        (kept) =>
          kept.workflow === workflow &&
          kept.source === sourceId &&
          kept.identity === identity,
      ),
    startPhaseOf: (sourceId, identity, workflow) =>
      starts.find(
        (running) =>
          running.workflow === workflow &&
          running.source === sourceId &&
          running.identity === identity,
      )?.phase,
    launched: known,
    ...attempts,
    ...recordActions,
  };
}
