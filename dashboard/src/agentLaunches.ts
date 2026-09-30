// The browser's side of agent launches (`./agentLaunch.ts`): the machine's
// sessions -- every project's launch records, each naming its project -- and
// the launches asked for from this page (`./launchAttempts.ts`). One session
// state is held for the machine, apart from the selected project: undefined
// until the first read answers, so "not yet read" is never taken for "none
// kept". Cards and Recent sessions derive their project's view from it by
// project and identity.
// A page load reads the machine's sessions from the local server, which
// keeps them on this machine across reloads and restarts; a launched answer
// joins the same records. While the page is visible, they are read again at
// the revision checks' steady pace (`./revisionCheckSchedule.ts`), so each
// session's state as Claude Code lists it stays current; a page seen again
// reads them at once, and each read also says whether the server can alert.
// A session marked done, or read again at once, replaces
// its record. Nothing here decides a story fact, which origin still
// publishes.

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  Alerts,
  AgentLaunchRequest,
  KeptStart,
  MachineAnswer,
  StartPhase,
  LaunchWithState,
  LaunchWorkflow,
} from "./agentLaunch.ts";
import { readMachineSessions } from "./agentLaunchClient.ts";
import { useLaunchAttempts, type LaunchAttempts } from "./launchAttempts.ts";
import {
  useLaunchRecordActions,
  type LaunchRecordActions,
} from "./launchRecordActions.ts";
import { optionsOfferOf, type OptionsOffer } from "./optionsOffer.ts";
import { usePageVisibility } from "./pageVisibility.ts";
import { checkIntervalMs } from "./revisionCheckSchedule.ts";

export type MachineSessions = ReadSessions &
  LaunchAttempts &
  LaunchRecordActions;

// The machine's sessions and what their latest read said.
type ReadSessions = {
  // Every project's launch records, oldest first within a project, each with
  // its session's state when last read; undefined until first read.
  readonly records: readonly LaunchWithState[] | undefined;
  // Whether the server can raise its macOS alerts, as of the latest read of
  // the machine's sessions; undefined until first read.
  readonly alerts: Alerts | undefined;
  // Whether the project's installed skill establishes a start when Start
  // execution or refinement is pressed, as of the latest read; false until
  // read, so the page never says a claim will be published before the server
  // said so.
  establishesStart(sourceId: string, workflow: LaunchWorkflow): boolean;
  // What the project's installed skill offers for the workflow's launch, as
  // of the latest read; undefined when the workflow defines no options.
  optionsOffer(
    sourceId: string,
    workflow: LaunchWorkflow,
  ): OptionsOffer | undefined;
  // The start this machine keeps for the project's story with no session
  // started from it, as of the latest read; undefined when none is kept.
  keptStartOf(
    sourceId: string,
    identity: string,
    workflow: LaunchWorkflow,
  ): KeptStart | undefined;
  // The phase of the start the server is running now for the project's story,
  // as of the latest read, whichever page asked for it; undefined when none
  // runs. A start merely kept is never running.
  startPhaseOf(
    sourceId: string,
    identity: string,
    workflow: LaunchWorkflow,
  ): StartPhase | undefined;
  // The sessions to show on cards: `records` once read, and until then only
  // those launched from this page.
  readonly launched: readonly LaunchWithState[];
};

// The server's records replace what the page knew, except a launch recorded
// after the read was asked, which the answer may not include yet. The server
// runs on this machine, so both sides read the same clock.
function replaced(
  kept: readonly LaunchWithState[],
  known: readonly LaunchWithState[],
  askedAt: number,
): readonly LaunchWithState[] {
  const sessions = new Set(kept.map((record) => record.session.sessionId));
  return [
    ...kept,
    ...known.filter(
      (record) =>
        !sessions.has(record.session.sessionId) &&
        Date.parse(record.launchedAt) >= askedAt,
    ),
  ];
}

// What a read of the machine's sessions says besides their records.
type ReadFacts = Omit<MachineAnswer, "records">;

export function useAgentLaunches(): MachineSessions {
  // The sessions the page knows, and whether a read has answered them: a
  // launch answered before the first read is kept in `known`, and joins the
  // first read's answer.
  const [
    {
      known,
      read: readAnswered,
      alerts,
      establishing,
      establishingPreparation,
      keptStarts,
      starts,
      definitions,
    },
    setSessions,
  ] = useState<
    {
      readonly known: readonly LaunchWithState[];
      readonly read: boolean;
      readonly alerts?: Alerts;
    } & Omit<ReadFacts, "alerts">
  >({
    known: [],
    read: false,
    establishing: [],
    establishingPreparation: [],
    keptStarts: [],
    starts: [],
    definitions: [],
  });
  const setRecords = useCallback(
    (
      change: (known: readonly LaunchWithState[]) => readonly LaunchWithState[],
    ) => {
      setSessions((current) => ({ ...current, known: change(current.known) }));
    },
    [],
  );
  // When each deleted session's deletion was answered: a read asked before
  // then may still carry its record.
  const deletedAt = useRef(new Map<string, number>());
  const { visibility, settleRevealed } = usePageVisibility();
  // Whether a read has settled, and how many have: each settled read
  // schedules the next one.
  const everRead = useRef(false);
  const [readsSettled, setReadsSettled] = useState(0);

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
              (deletedAt.current.get(record.session.sessionId) ?? -1) < askedAt,
          );
          setSessions((current) => ({
            known: replaced(kept, current.known, current.read ? askedAt : 0),
            read: true,
            ...facts,
          }));
        }
        everRead.current = true;
        settleRevealed();
        setReadsSettled((settled) => settled + 1);
      });
    };
    // A page loaded, or seen again, is read at once.
    if (visibility === "revealed" || !everRead.current) {
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
  }, [visibility, readsSettled, settleRevealed]);

  // A launch that ended no longer runs its start, and a launched session
  // carries it: the server removed the kept one.
  const launchEnded = useCallback(
    (request: AgentLaunchRequest, record: LaunchWithState | undefined) => {
      setSessions((current) => ({
        ...current,
        known:
          record === undefined ? current.known : [...current.known, record],
        starts: current.starts.filter(
          (running) =>
            running.source !== request.source ||
            request.workflow === "ad-hoc" ||
            running.identity !== request.identity,
        ),
        keptStarts:
          record === undefined
            ? current.keptStarts
            : current.keptStarts.filter(
                (kept) =>
                  kept.source !== request.source ||
                  request.workflow === "ad-hoc" ||
                  kept.workflow !== request.workflow ||
                  kept.identity !== request.identity,
              ),
      }));
    },
    [],
  );
  const attempts = useLaunchAttempts(launchEnded);

  const setFacts = useCallback((facts: ReadFacts) => {
    setSessions((current) => ({ ...current, ...facts }));
  }, []);
  const recordActions = useLaunchRecordActions({
    setRecords,
    setFacts,
    deletedAt,
  });

  return {
    records: readAnswered ? known : undefined,
    alerts,
    establishesStart: (sourceId, workflow) =>
      (workflow === "execution"
        ? establishing
        : establishingPreparation
      ).includes(sourceId),
    optionsOffer: (sourceId, workflow) =>
      optionsOfferOf(
        readAnswered ? definitions : undefined,
        sourceId,
        workflow,
      ),
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
