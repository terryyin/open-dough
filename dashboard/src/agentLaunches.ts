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
// reads them at once. A session marked done, or read again at once, replaces
// its record. Nothing here decides a story fact, which origin still
// publishes.

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  AgentLaunchRequest,
  LaunchRecord,
  LaunchWithState,
  LaunchWorkflow,
} from "./agentLaunch.ts";
import {
  readMachineSessions,
  requestAgentLaunch,
  requestDeleteRecord,
  requestMarkDone,
  type LaunchProblem,
} from "./agentLaunchClient.ts";
import { usePageVisibility } from "./pageVisibility.ts";
import { checkIntervalMs } from "./revisionCheckSchedule.ts";

// A launch the developer asked for that has no record: still starting, or
// answered without a confirmed session.
export type LaunchAttempt = { readonly kind: "starting" } | LaunchProblem;

// The work item a launch is for, as its request names it.
export type LaunchWorkItem = Pick<AgentLaunchRequest, "identity" | "title">;

export type MachineSessions = {
  // Every project's launch records, oldest first within a project, each with
  // its session's state when last read; undefined until first read.
  readonly records: readonly LaunchWithState[] | undefined;
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
    instruction: string,
  ): Promise<LaunchWithState | undefined>;
  // Marks a recorded session done, and answers whether the boundary marked
  // it.
  readonly markDone: (record: LaunchRecord) => Promise<boolean>;
  // Deletes a recorded session's record, and answers whether the boundary
  // deleted it; the page then lists the session nowhere.
  readonly deleteRecord: (record: LaunchRecord) => Promise<boolean>;
  // Reads a recorded session again at once.
  readonly readSession: (record: LaunchRecord) => Promise<void>;
};

const attemptKey = (
  sourceId: string,
  identity: string,
  workflow: LaunchWorkflow,
) => JSON.stringify([sourceId, identity, workflow]);

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
  const [{ known, read: readAnswered }, setSessions] = useState<{
    readonly known: readonly LaunchWithState[];
    readonly read: boolean;
  }>({ known: [], read: false });
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
      void readMachineSessions().then((kept) => {
        if (!current) return;
        if (kept !== undefined) {
          setSessions((current) => ({
            known: replaced(kept, current.known, current.read ? askedAt : 0),
            read: true,
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

  const start = useCallback(
    async (
      sourceId: string,
      work: LaunchWorkItem,
      workflow: LaunchWorkflow,
      instruction: string,
    ) => {
      const key = attemptKey(sourceId, work.identity, workflow);
      setAttempt(key, { kind: "starting" });
      const own = instruction.trim();
      const answer = await requestAgentLaunch({
        source: sourceId,
        identity: work.identity,
        title: work.title,
        workflow,
        host: "claude",
        ...(own === "" ? {} : { instruction: own }),
      });
      if (answer.kind === "launched") {
        setRecords((current) => [...current, answer.record]);
        setAttempt(key, undefined);
        return answer.record;
      }
      setAttempt(key, answer);
      return undefined;
    },
    [setAttempt, setRecords],
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
      if (answer?.kind !== "deleted") return false;
      setRecords((current) =>
        current.filter(
          (each) => each.session.sessionId !== record.session.sessionId,
        ),
      );
      return true;
    },
    [setRecords],
  );

  const readSession = useCallback(
    async (record: LaunchRecord) => {
      const kept = await readMachineSessions();
      const answered = kept?.find(
        (known) => known.session.sessionId === record.session.sessionId,
      );
      if (answered !== undefined) replaceRecord(answered);
    },
    [replaceRecord],
  );

  return {
    records: readAnswered ? known : undefined,
    launched: known,
    attemptOf: (sourceId, identity, workflow) =>
      attempts.get(attemptKey(sourceId, identity, workflow)),
    start,
    markDone,
    deleteRecord,
    readSession,
  };
}
