// The launches the developer asked for from this page until the boundary
// answers: each work item's launch of a workflow in flight or its last failed
// or uncertain answer, and the project's ad hoc launch likewise. A confirmed
// launch keeps no attempt; its record joins the machine's sessions
// (`./agentLaunches.ts`).

import { useCallback, useState } from "react";
import type {
  AgentLaunchRequest,
  LaunchChoices,
  LaunchWithState,
  LaunchWorkflow,
  StoryLaunchRequest,
} from "./agentLaunch.ts";
import { requestAgentLaunch, type LaunchProblem } from "./agentLaunchClient.ts";

// A launch the developer asked for that has no record: still starting, or
// answered without a confirmed session.
export type LaunchAttempt = { readonly kind: "starting" } | LaunchProblem;

// The work item a launch is for, as its request names it.
export type LaunchWorkItem = Pick<StoryLaunchRequest, "identity" | "title">;

export type LaunchAttempts = {
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
};

const attemptKey = (
  sourceId: string,
  identity: string,
  workflow: LaunchWorkflow | "ad-hoc",
) => JSON.stringify([sourceId, identity, workflow]);

// An ad hoc launch has no work item, so its attempt is the project's alone.
const adHocKey = (sourceId: string) => attemptKey(sourceId, "", "ad-hoc");

// The choices as the boundary takes them: trimmed text, omitted when empty,
// and the model and options only when chosen.
const optionsOf = ({ instruction, model, options }: LaunchChoices) => {
  const own = instruction.trim();
  return {
    ...(own === "" ? {} : { instruction: own }),
    ...(model === undefined ? {} : { model }),
    ...(options === undefined || options.length === 0
      ? {}
      : { options: [...options] }),
  };
};

// Keeps each launch's attempt under its key, and tells `ended` of each
// answered launch with its record when the boundary confirmed one.
export function useLaunchAttempts(
  ended: (
    request: AgentLaunchRequest,
    record: LaunchWithState | undefined,
  ) => void,
): LaunchAttempts {
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

  const launch = useCallback(
    async (key: string, request: AgentLaunchRequest) => {
      setAttempt(key, { kind: "starting" });
      const answer = await requestAgentLaunch(request);
      if (answer.kind === "launched") {
        ended(request, answer.record);
        setAttempt(key, undefined);
        return answer.record;
      }
      ended(request, undefined);
      setAttempt(key, answer);
      return undefined;
    },
    [setAttempt, ended],
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
        host: choices.host ?? "claude",
        ...optionsOf(choices),
      }),
    [launch],
  );

  const startAdHoc = useCallback(
    (sourceId: string, choices: LaunchChoices) =>
      launch(adHocKey(sourceId), {
        source: sourceId,
        workflow: "ad-hoc",
        host: choices.host ?? "claude",
        ...optionsOf(choices),
      }),
    [launch],
  );

  return {
    attemptOf: (sourceId, identity, workflow) =>
      attempts.get(attemptKey(sourceId, identity, workflow)),
    start,
    startAdHoc,
    adHocAttemptOf: (sourceId) => attempts.get(adHocKey(sourceId)),
  };
}
