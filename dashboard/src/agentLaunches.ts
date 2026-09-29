// The browser's side of agent launches (`./agentLaunch.ts`): each project's
// launch records, and each work item's launch of a workflow in flight or its
// last failed or uncertain answer. Records are kept per project, so an answer
// arriving after another project was selected lands with the project it was
// asked for.
// Selecting a project, a page load included, reads that project's records
// again from the running server, which keeps them across reloads; a launched
// answer joins the same record list. Nothing here decides a story fact, which
// origin still publishes.

import { useCallback, useEffect, useState } from "react";
import type {
  AgentLaunchRequest,
  LaunchRecord,
  LaunchWorkflow,
} from "./agentLaunch.ts";
import {
  readLaunchRecords,
  requestAgentLaunch,
  type LaunchProblem,
} from "./agentLaunchClient.ts";
import type { PublishedSource } from "./publishedSource.ts";

// A launch the developer asked for that has no record: still starting, or
// answered without a confirmed session.
export type LaunchAttempt = { readonly kind: "starting" } | LaunchProblem;

// The work item a launch is for, as its request names it.
export type LaunchWorkItem = Pick<AgentLaunchRequest, "identity" | "title">;

export type ProjectLaunches = {
  // The selected project's launch records, oldest first.
  readonly records: readonly LaunchRecord[];
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
  kept: readonly LaunchRecord[],
  known: readonly LaunchRecord[],
  askedAt: number,
): readonly LaunchRecord[] {
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
    ReadonlyMap<string, readonly LaunchRecord[]>
  >(new Map());
  const [attempts, setAttempts] = useState<ReadonlyMap<string, LaunchAttempt>>(
    new Map(),
  );

  useEffect(() => {
    let current = true;
    const askedAt = Date.now();
    void readLaunchRecords(source.id).then((kept) => {
      if (!current || kept === undefined) return;
      setRecords((known) =>
        new Map(known).set(
          source.id,
          replaced(kept, known.get(source.id) ?? [], askedAt),
        ),
      );
    });
    return () => {
      current = false;
    };
  }, [source.id]);

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
