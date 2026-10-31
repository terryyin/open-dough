import { useProjects } from "./projectList.tsx";
import { sessionKey } from "./sessionReference.ts";
// Machine sessions and this page's launch attempts have one browser owner.

import { useCallback, useEffect, useRef, useState } from "react";
import type { Alerts, MachineAnswer, LaunchWithState } from "./agentLaunch.ts";
import { replaced } from "./sessionRecords.ts";
import { readMachineSessionsSince } from "./machineSessionsReads.ts";
import { useLaunchAttempts, type LaunchAttempts } from "./launchAttempts.ts";
import type { PublishedShown } from "./startupReconciliation.ts";
import {
  useLaunchRecordActions,
  type LaunchRecordActions,
} from "./launchRecordActions.ts";
import { launchOffers, type LaunchOffers } from "./launchOffers.ts";
import { usePageVisibility } from "./pageVisibility.ts";
import { checkIntervalMs } from "./revisionCheckSchedule.ts";
import type { ReadSessions } from "./readSessions.ts";

export type MachineSessions = ReadSessions &
  LaunchOffers &
  LaunchAttempts &
  LaunchRecordActions;

// What a read of the machine's sessions says besides their records.
type ReadFacts = Omit<MachineAnswer, "records">;

// `published` is what the page shows of published work, which settled
// launches reconcile with.
export function useAgentLaunches(published: PublishedShown): MachineSessions {
  const projects = useProjects();
  const lastProjects = useRef(projects);
  const [sessions, setSessions] = useState<
    {
      readonly known: readonly LaunchWithState[];
      readonly read: boolean;
      // Which read, counted as asked, answered latest.
      readonly answeredAsk: number;
      readonly alerts?: Alerts;
    } & Omit<ReadFacts, "alerts">
  >({
    known: [],
    answeredAsk: 0,
    attempts: [],
    attemptsReadable: true,
    hostOperations: {},
    creations: [],
    read: false,
    establishing: [],
    establishingPreparation: [],
    establishingHosts: [],
    keptStarts: [],
    starts: [],
    definitions: [],
    sessionPolicies: [],
    workspaces: [],
  });
  const {
    known,
    creations,
    read: readAnswered,
    alerts,
    keptStarts,
    starts,
    attempts: observed,
    attemptsReadable,
    answeredAsk,
  } = sessions;
  // Reads predating deletion must not restore the deleted record.
  const deletedAt = useRef(new Map<string, number>());
  const { visibility, settleRevealed } = usePageVisibility();
  const everRead = useRef(false);
  // The revision of the latest full answer this page's reads took.
  const heldRevision = useRef<string | undefined>(undefined);
  const setRecords = useCallback(
    (
      change: (known: readonly LaunchWithState[]) => readonly LaunchWithState[],
    ) => {
      // An action changed what the page shows outside the poll: the held
      // revision no longer matches this view, so the next poll asks in full.
      heldRevision.current = undefined;
      setSessions((current) => ({ ...current, known: change(current.known) }));
    },
    [],
  );
  // How many reads were asked so far.
  const asks = useRef(0);
  const [readsSettled, setReadsSettled] = useState(0);
  // The project list under which the latest ended read was asked.
  const [settledFor, setSettledFor] = useState<typeof projects>();
  const [offersReading, setOffersReading] = useState(false);
  const [requested, setRequested] = useState(0);
  const lastRequested = useRef(0);
  const reread = useCallback(() => {
    setRequested((value) => value + 1);
  }, []);
  const attempts = useLaunchAttempts({
    observed,
    keptStarts,
    hostOperations: sessions.hostOperations,
    attemptEvidence: !readAnswered
      ? readsSettled === 0
        ? "unread"
        : "unanswered"
      : attemptsReadable
        ? "read"
        : "unreadable",
    answeredAsk,
    asksSoFar: () => asks.current,
    records: known,
    reads: readsSettled,
    reread,
    published,
  });

  useEffect(() => {
    if (visibility === "hidden") return;
    let current = true;
    // A read this effect no longer wants, such as once the page is hidden,
    // stops waiting; other viewers' observation goes on.
    const unwanted = new AbortController();
    const read = () => {
      const askedAt = Date.now();
      asks.current += 1;
      const ask = asks.current;
      void readMachineSessionsSince(heldRevision.current, unwanted.signal).then(
        (answered) => {
          if (!current) return;
          if (answered !== undefined && "unchanged" in answered) {
            // What the page holds still stands: only this ask answered it.
            setSessions((current) => ({ ...current, answeredAsk: ask }));
          } else if (answered !== undefined) {
            const { records, revision, ...facts } = answered;
            heldRevision.current = revision;
            const kept = records.filter(
              (record) =>
                (deletedAt.current.get(sessionKey(record.session)) ?? -1) <
                askedAt,
            );
            setSessions((current) => ({
              known: replaced(kept, current.known, current.read ? askedAt : 0),
              read: true,
              answeredAsk: ask,
              ...facts,
            }));
          }
          setOffersReading(false);
          everRead.current = true;
          settleRevealed();
          setReadsSettled((settled) => settled + 1);
          setSettledFor(projects);
        },
      );
    };
    if (
      visibility === "revealed" ||
      !everRead.current ||
      lastRequested.current !== requested ||
      lastProjects.current !== projects
    ) {
      lastRequested.current = requested;
      lastProjects.current = projects;
      read();
      return () => {
        current = false;
        unwanted.abort();
      };
    }
    const waiting = setTimeout(read, checkIntervalMs);
    return () => {
      current = false;
      clearTimeout(waiting);
      unwanted.abort();
    };
  }, [visibility, readsSettled, settleRevealed, requested, projects]);

  const setFacts = useCallback((facts: ReadFacts) => {
    // Same as setRecords: facts from an action are not the poll's revision.
    heldRevision.current = undefined;
    setSessions((current) => ({ ...current, ...facts }));
  }, []);
  const recordActions = useLaunchRecordActions({
    setRecords,
    setFacts,
    deletedAt,
  });

  const configuredKnown = known.filter((record) =>
    projects.some((project) => project.id === record.request.source),
  );
  return {
    rereadOffers: () => {
      setOffersReading(true);
      reread();
    },
    records: readAnswered ? configuredKnown : undefined,
    workspaces: sessions.workspaces,
    sessionsSettled: settledFor === projects,
    creations,
    hostOperations: sessions.hostOperations,
    alerts,
    feedbackMaintenance: sessions.feedbackMaintenance,
    ...launchOffers(sessions, readAnswered && !offersReading),
    keptStartOf: (sourceId, identity, workflow) =>
      keptStarts.find(
        (kept) =>
          kept.workflow === workflow &&
          kept.source === sourceId &&
          kept.identity === identity,
      ),
    runningStartOf: (sourceId, identity, workflow) =>
      starts.find(
        (running) =>
          running.workflow === workflow &&
          running.source === sourceId &&
          running.identity === identity,
      ),
    launched: configuredKnown,
    ...attempts,
    ...recordActions,
  };
}
