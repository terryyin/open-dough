// The browser's side of agent launches (`./agentLaunch.ts`): the machine's
// sessions -- every project's launch records, each naming its project -- and
// each work item's launch of a workflow in flight or its last failed or
// uncertain answer. One session state is held for the machine, apart from
// the selected project: undefined until the first read answers, so "not yet
// read" is never taken for "none kept". Cards and Recent sessions derive
// their project's view from it by project and identity.
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
  StoryLaunchRequest,
  KeptStart,
  RunningStart,
  StartPhase,
  LaunchChoices,
  LaunchRecord,
  LaunchWithState,
  LaunchWorkflow,
} from "./agentLaunch.ts";
import {
  readMachineSessions,
  requestAgentLaunch,
  requestDeleteRecord,
  requestMarkDone,
  type DeleteRecordOutcome,
  type LaunchProblem,
} from "./agentLaunchClient.ts";
import { usePageVisibility } from "./pageVisibility.ts";
import { checkIntervalMs } from "./revisionCheckSchedule.ts";

// A launch the developer asked for that has no record: still starting, or
// answered without a confirmed session.
export type LaunchAttempt = { readonly kind: "starting" } | LaunchProblem;

// The work item a launch is for, as its request names it.
export type LaunchWorkItem = Pick<StoryLaunchRequest, "identity" | "title">;

export type MachineSessions = {
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
  attemptOf(
    sourceId: string,
    identity: string,
    workflow: LaunchWorkflow,
  ): LaunchAttempt | undefined;
  // Starts the workflow on the project's work item in Claude Code, with the
  // developer's optional instruction, and answers the launched record once
  // the boundary confirms one.
  start(
    sourceId: string,
    work: LaunchWorkItem,
    workflow: LaunchWorkflow,
    choices: LaunchChoices,
  ): Promise<LaunchWithState | undefined>;
  // Starts an ad hoc session in the project, with the developer's optional
  // first message, and answers the launched record once the boundary confirms
  // one. A problem is kept nowhere yet.
  startAdHoc(
    sourceId: string,
    choices: LaunchChoices,
  ): Promise<LaunchWithState | undefined>;
  // The project's ad hoc launch in flight or its last failed or uncertain
  // answer.
  adHocAttemptOf(sourceId: string): LaunchAttempt | undefined;
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

const attemptKey = (
  sourceId: string,
  identity: string,
  workflow: LaunchWorkflow | "ad-hoc",
) => JSON.stringify([sourceId, identity, workflow]);

// An ad hoc launch has no work item, so its attempt is the project's alone.
const adHocKey = (sourceId: string) => attemptKey(sourceId, "", "ad-hoc");

// The choices as the boundary takes them: trimmed text, omitted when empty,
// and the model only when one was chosen.
const optionsOf = ({ instruction, model }: LaunchChoices) => {
  const own = instruction.trim();
  return {
    ...(own === "" ? {} : { instruction: own }),
    ...(model === undefined ? {} : { model }),
  };
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
    },
    setSessions,
  ] = useState<{
    readonly known: readonly LaunchWithState[];
    readonly read: boolean;
    readonly alerts?: Alerts;
    readonly establishing: readonly string[];
    readonly establishingPreparation: readonly string[];
    readonly keptStarts: readonly KeptStart[];
    readonly starts: readonly RunningStart[];
  }>({
    known: [],
    read: false,
    establishing: [],
    establishingPreparation: [],
    keptStarts: [],
    starts: [],
  });
  const setRecords = useCallback(
    (
      change: (known: readonly LaunchWithState[]) => readonly LaunchWithState[],
    ) => {
      setSessions((current) => ({ ...current, known: change(current.known) }));
    },
    [],
  );
  const [attempts, setAttempts] = useState<ReadonlyMap<string, LaunchAttempt>>(
    new Map(),
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
          const kept = answered.records.filter(
            (record) =>
              (deletedAt.current.get(record.session.sessionId) ?? -1) < askedAt,
          );
          setSessions((current) => ({
            known: replaced(kept, current.known, current.read ? askedAt : 0),
            read: true,
            alerts: answered.alerts,
            establishing: answered.establishing,
            establishingPreparation: answered.establishingPreparation,
            keptStarts: answered.keptStarts,
            starts: answered.starts,
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

  const setAttempt = useCallback(
    (key: string, attempt: LaunchAttempt | undefined) => {
      setAttempts((current) => {
        const next = new Map(current);
        if (attempt === undefined) next.delete(key);
        else next.set(key, attempt);
        return next;
      });
    },
    [],
  );

  // Asks the boundary to launch, keeping the attempt under its key and the
  // record once launched.
  const launch = useCallback(
    async (key: string, request: AgentLaunchRequest) => {
      setAttempt(key, { kind: "starting" });
      const answer = await requestAgentLaunch(request);
      // The launch ended, so the start it ran no longer runs.
      setSessions((current) => ({
        ...current,
        starts: current.starts.filter(
          (running) =>
            running.source !== request.source ||
            request.workflow === "ad-hoc" ||
            running.identity !== request.identity,
        ),
      }));
      if (answer.kind === "launched") {
        setRecords((current) => [...current, answer.record]);
        // The session carries the start now: the server removed the kept one.
        setSessions((current) => ({
          ...current,
          keptStarts: current.keptStarts.filter(
            (kept) =>
              kept.source !== request.source ||
              request.workflow === "ad-hoc" ||
              kept.workflow !== request.workflow ||
              kept.identity !== request.identity,
          ),
        }));
        setAttempt(key, undefined);
        return answer.record;
      }
      setAttempt(key, answer);
      return undefined;
    },
    [setAttempt, setRecords],
  );

  const start = useCallback(
    (
      sourceId: string,
      work: LaunchWorkItem,
      workflow: LaunchWorkflow,
      choices: LaunchChoices,
    ) =>
      launch(attemptKey(sourceId, work.identity, workflow), {
        source: sourceId,
        identity: work.identity,
        title: work.title,
        workflow,
        host: "claude",
        ...optionsOf(choices),
      }),
    [launch],
  );

  const startAdHoc = useCallback(
    (sourceId: string, choices: LaunchChoices) =>
      launch(adHocKey(sourceId), {
        source: sourceId,
        workflow: "ad-hoc",
        host: "claude",
        ...optionsOf(choices),
      }),
    [launch],
  );

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
    [replaceRecord, setRecords],
  );

  const readSession = useCallback(
    async (record: LaunchRecord) => {
      const kept = await readMachineSessions();
      const answered = kept?.records.find(
        (known) => known.session.sessionId === record.session.sessionId,
      );
      if (kept !== undefined) {
        setSessions((current) => ({
          ...current,
          alerts: kept.alerts,
          establishing: kept.establishing,
          establishingPreparation: kept.establishingPreparation,
          keptStarts: kept.keptStarts,
          starts: kept.starts,
        }));
      }
      if (answered !== undefined) replaceRecord(answered);
    },
    [replaceRecord],
  );

  return {
    records: readAnswered ? known : undefined,
    alerts,
    establishesStart: (sourceId, workflow) =>
      (workflow === "execution"
        ? establishing
        : establishingPreparation
      ).includes(sourceId),
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
    attemptOf: (sourceId, identity, workflow) =>
      attempts.get(attemptKey(sourceId, identity, workflow)),
    start,
    startAdHoc,
    adHocAttemptOf: (sourceId) => attempts.get(adHocKey(sourceId)),
    markDone,
    deleteRecord,
    readSession,
  };
}
