// The browser's side of agent launches (`./agentLaunch.ts`): each project's
// launch records, and each work item's launch of a workflow in flight or its
// last failed or uncertain answer. Records are kept per project, so an answer
// arriving after another project was selected lands with the project it was
// asked for.
// Selecting a project, a page load included, reads that project's records
// again from the local server, which keeps them on this machine across reloads
// and restarts; a launched answer joins the same record list. While the page
// is visible, the records are read again at the revision checks' steady pace
// (`./revisionCheckSchedule.ts`), so each session's state as Claude Code lists
// it stays current; a page seen again reads them at once. Nothing here
// decides a story fact, which origin still publishes.

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  AgentLaunchRequest,
  LaunchWithState,
  LaunchWorkflow,
} from "./agentLaunch.ts";
import {
  readLaunchRecords,
  requestAgentLaunch,
  type LaunchProblem,
} from "./agentLaunchClient.ts";
import { usePageVisibility } from "./pageVisibility.ts";
import type { PublishedSource } from "./publishedSource.ts";
import { checkIntervalMs } from "./revisionCheckSchedule.ts";

// A launch the developer asked for that has no record: still starting, or
// answered without a confirmed session.
export type LaunchAttempt = { readonly kind: "starting" } | LaunchProblem;

// The work item a launch is for, as its request names it.
export type LaunchWorkItem = Pick<AgentLaunchRequest, "identity" | "title">;

export type ProjectLaunches = {
  // The selected project's launch records, oldest first, each with its
  // session's state when last read.
  readonly records: readonly LaunchWithState[];
  attemptOf(
    identity: string,
    workflow: LaunchWorkflow,
  ): LaunchAttempt | undefined;
  // Starts the workflow on the work item in Claude Code, with the developer's
  // optional instruction, and settles once the boundary answers.
  start(
    work: LaunchWorkItem,
    workflow: LaunchWorkflow,
    instruction: string,
  ): Promise<void>;
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

export function useAgentLaunches(source: PublishedSource): ProjectLaunches {
  const [records, setRecords] = useState<
    ReadonlyMap<string, readonly LaunchWithState[]>
  >(new Map());
  const [attempts, setAttempts] = useState<ReadonlyMap<string, LaunchAttempt>>(
    new Map(),
  );
  const { visibility, settleRevealed } = usePageVisibility();
  // The project whose records were last read, and how many reads have
  // settled: each settled read schedules the next one.
  const lastRead = useRef<string | undefined>(undefined);
  const [readsSettled, setReadsSettled] = useState(0);

  useEffect(() => {
    if (visibility === "hidden") return;
    let current = true;
    const read = () => {
      const askedAt = Date.now();
      void readLaunchRecords(source.id).then((kept) => {
        if (!current) return;
        if (kept !== undefined) {
          setRecords((known) =>
            new Map(known).set(
              source.id,
              replaced(kept, known.get(source.id) ?? [], askedAt),
            ),
          );
        }
        lastRead.current = source.id;
        settleRevealed();
        setReadsSettled((settled) => settled + 1);
      });
    };
    // A newly selected project, or a page seen again, is read at once.
    if (visibility === "revealed" || lastRead.current !== source.id) {
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
  }, [source.id, visibility, readsSettled, settleRevealed]);

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
      work: LaunchWorkItem,
      workflow: LaunchWorkflow,
      instruction: string,
    ) => {
      const key = attemptKey(source.id, work.identity, workflow);
      setAttempt(key, { kind: "starting" });
      const own = instruction.trim();
      const answer = await requestAgentLaunch({
        source: source.id,
        identity: work.identity,
        title: work.title,
        workflow,
        host: "claude",
        ...(own === "" ? {} : { instruction: own }),
      });
      if (answer.kind === "launched") {
        setRecords((current) =>
          new Map(current).set(source.id, [
            ...(current.get(source.id) ?? []),
            answer.record,
          ]),
        );
        setAttempt(key, undefined);
      } else {
        setAttempt(key, answer);
      }
    },
    [source.id, setAttempt],
  );

  return {
    records: records.get(source.id) ?? [],
    attemptOf: (identity, workflow) =>
      attempts.get(attemptKey(source.id, identity, workflow)),
    start,
  };
}
