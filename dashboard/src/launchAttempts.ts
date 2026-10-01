// The launches the developer asked for from this page, and the startup of
// each story and project as the machine's launch attempts show it
// (`./agentLaunches.ts`). Asking sends the request to the local launch owner,
// which answers once it accepted the exact request; the page then follows
// that accepted attempt through the machine's sessions until its outcome
// settles (`./attemptChangeWaits.ts`). A launched outcome lists its record
// with the machine's sessions and is presented by the action that asked for
// it (`onLaunched`); a failed or uncertain one stays beside that action. Each
// story's startup, from whichever page, is told from the same attempts
// (`./storyStartup.ts`).

import { useCallback, useEffect, useState } from "react";
import {
  requestedChoices,
  type AgentLaunchRequest,
  type AttemptObservation,
  type LaunchChoices,
  type LaunchWithState,
  type LaunchWorkflow,
  type StoryLaunchRequest,
} from "./agentLaunch.ts";
import { requestAgentAcceptance } from "./agentLaunchClient.ts";
import { useAttemptChangeWaits } from "./attemptChangeWaits.ts";
import type { StartAnswer } from "./LaunchExistingChanges.tsx";
import {
  adHocKey,
  attemptKey,
  problemOf,
  shownAttempt,
  type LaunchAttempt,
  type OnLaunched,
  type PageAttempt,
} from "./pageAttempt.ts";
import { sessionKey } from "./sessionReference.ts";
import { storyStartup, type StoryStartup } from "./storyStartup.ts";

export type { LaunchAttempt, OnLaunched } from "./pageAttempt.ts";

// The work item a launch is for, as its request names it.
export type LaunchWorkItem = Pick<StoryLaunchRequest, "identity" | "title">;

export type LaunchAttempts = {
  attemptOf(
    sourceId: string,
    identity: string,
    workflow: LaunchWorkflow,
  ): LaunchAttempt | undefined;
  // The story's startup, from whichever page it was asked.
  storyStartupOf(sourceId: string, identity: string): StoryStartup | undefined;
  // Asks the local service to start the workflow on the project's work item
  // in the chosen host, with the developer's optional instruction, and
  // answers whether it was accepted, or the default checkout's existing
  // changes the developer has yet to confirm, with nothing started.
  start(
    sourceId: string,
    work: LaunchWorkItem,
    workflow: LaunchWorkflow,
    choices: LaunchChoices,
    onLaunched: OnLaunched,
  ): Promise<StartAnswer>;
  // Asks for an ad hoc session in the project, with the developer's optional
  // first message, and answers whether it was accepted.
  startAdHoc(
    sourceId: string,
    choices: LaunchChoices,
    onLaunched: OnLaunched,
  ): Promise<boolean>;
  // The project's ad hoc launch from this page in flight, or its last failed
  // or uncertain answer.
  adHocAttemptOf(sourceId: string): LaunchAttempt | undefined;
};

// Keeps each launch this page asked for under its key and follows accepted
// ones through the machine's attempts (`observed`) and sessions (`records`);
// `reread` asks for a prompt read of them, which every attempt the server
// runs gets once it changes. `reads` counts the reads answered so far.
export function useLaunchAttempts({
  observed,
  records,
  reads,
  reread,
}: {
  readonly observed: readonly AttemptObservation[];
  readonly records: readonly LaunchWithState[];
  readonly reads: number;
  readonly reread: () => void;
}): LaunchAttempts {
  const [attempts, setAttempts] = useState<ReadonlyMap<string, PageAttempt>>(
    new Map(),
  );
  const setAttempt = useCallback(
    (key: string, attempt: PageAttempt | undefined) => {
      setAttempts((now) => {
        const next = new Map(now);
        if (attempt === undefined) next.delete(key);
        else next.set(key, attempt);
        return next;
      });
    },
    [],
  );

  // The latest observation of an attempt: as the machine's sessions last
  // answered it, or as accepted when no read has named it yet.
  const latest = useCallback(
    (attempt: AttemptObservation) =>
      observed.find((read) => read.id === attempt.id) ?? attempt,
    [observed],
  );

  // An accepted attempt that settled: a launched one is presented once its
  // record is listed, any other is kept as the action's problem.
  useEffect(() => {
    for (const [key, page] of attempts) {
      if (page.kind !== "accepted") continue;
      const { outcome } = latest(page.attempt);
      if (outcome === undefined) continue;
      if (outcome.kind !== "launched") {
        setAttempt(key, problemOf(outcome));
        continue;
      }
      const record = records.find(
        (listed) => sessionKey(listed.session) === sessionKey(outcome.session),
      );
      if (record === undefined) continue;
      setAttempt(key, undefined);
      page.onLaunched(record);
    }
  }, [attempts, latest, records, setAttempt]);

  const launch = useCallback(
    async (
      key: string,
      request: AgentLaunchRequest,
      onLaunched: OnLaunched,
    ): Promise<StartAnswer> => {
      setAttempt(key, { kind: "submitting", request });
      const answer = await requestAgentAcceptance(request);
      // Nothing started: the dialog asks the developer about the changes.
      if (answer.kind === "existing-changes") {
        setAttempt(key, undefined);
        return answer;
      }
      reread();
      if (answer.kind === "accepted") {
        setAttempt(key, {
          kind: "accepted",
          attempt: answer.attempt,
          onLaunched,
        });
        return true;
      }
      setAttempt(key, answer);
      return false;
    },
    [setAttempt, reread],
  );

  const start = useCallback(
    (
      sourceId: string,
      work: LaunchWorkItem,
      workflow: LaunchWorkflow,
      choices: LaunchChoices,
      onLaunched: OnLaunched,
    ) =>
      launch(
        attemptKey(sourceId, work.identity, workflow),
        {
          source: sourceId,
          identity: work.identity,
          title: work.title,
          workflow,
          ...requestedChoices(choices),
        },
        onLaunched,
      ),
    [launch],
  );

  // An ad hoc session selects no default checkout, so it has no changes to
  // confirm.
  const startAdHoc = useCallback(
    async (sourceId: string, choices: LaunchChoices, onLaunched: OnLaunched) =>
      (await launch(
        adHocKey(sourceId),
        {
          source: sourceId,
          workflow: "ad-hoc",
          ...requestedChoices(choices),
        },
        onLaunched,
      )) === true,
    [launch],
  );

  // Every attempt the machine's sessions name, and those this page had
  // accepted that no read has named yet.
  const known = (): readonly AttemptObservation[] => {
    const accepted = [...attempts.values()].flatMap((page) =>
      page.kind === "accepted" &&
      !observed.some((read) => read.id === page.attempt.id)
        ? [page.attempt]
        : [],
    );
    return [...observed, ...accepted];
  };

  useAttemptChangeWaits(
    known()
      .filter((attempt) => attempt.owned && attempt.outcome === undefined)
      .map((attempt) => attempt.id),
    reads,
    reread,
  );

  return {
    attemptOf: (sourceId, identity, workflow) =>
      shownAttempt(
        attempts.get(attemptKey(sourceId, identity, workflow)),
        latest,
      ),
    storyStartupOf: (sourceId, identity) =>
      storyStartup(
        [...attempts.values()].flatMap((page) =>
          page.kind === "submitting" ? [page.request] : [],
        ),
        known(),
        sourceId,
        identity,
      ),
    start,
    startAdHoc,
    adHocAttemptOf: (sourceId) =>
      shownAttempt(attempts.get(adHocKey(sourceId)), latest),
  };
}
