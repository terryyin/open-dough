// The browser's side of agent launches (`./agentLaunch.ts`): each project's
// launch records, and each work item's launch in flight or its last failed or
// uncertain answer. Records are kept per project, so an answer arriving after
// another project was selected lands with the project it was asked for. A
// launched answer joins the same record list the boundary keeps; nothing here
// decides a story fact, which origin still publishes.

import { useCallback, useState } from "react";
import type { AgentLaunchRequest, LaunchRecord } from "./agentLaunch.ts";
import { requestAgentLaunch, type LaunchProblem } from "./agentLaunchClient.ts";
import type { PublishedSource } from "./publishedSource.ts";

// A launch the developer asked for that has no record: still starting, or
// answered without a confirmed session.
export type LaunchAttempt = { readonly kind: "starting" } | LaunchProblem;

// The work item a launch is for, as its request names it.
export type LaunchWorkItem = Pick<AgentLaunchRequest, "identity" | "title">;

export type ProjectLaunches = {
  // The selected project's launch records, oldest first.
  readonly records: readonly LaunchRecord[];
  attemptOf(identity: string): LaunchAttempt | undefined;
  // Starts execution of the work item in Claude Code, with the developer's
  // optional instruction, and settles once the boundary answers.
  startExecution(work: LaunchWorkItem, instruction: string): Promise<void>;
};

const attemptKey = (sourceId: string, identity: string) =>
  JSON.stringify([sourceId, identity]);

export function useAgentLaunches(source: PublishedSource): ProjectLaunches {
  const [records, setRecords] = useState<
    ReadonlyMap<string, readonly LaunchRecord[]>
  >(new Map());
  const [attempts, setAttempts] = useState<ReadonlyMap<string, LaunchAttempt>>(
    new Map(),
  );

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

  const startExecution = useCallback(
    async (work: LaunchWorkItem, instruction: string) => {
      const key = attemptKey(source.id, work.identity);
      setAttempt(key, { kind: "starting" });
      const own = instruction.trim();
      const answer = await requestAgentLaunch({
        source: source.id,
        identity: work.identity,
        title: work.title,
        activity: "execution",
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
    attemptOf: (identity) => attempts.get(attemptKey(source.id, identity)),
    startExecution,
  };
}
