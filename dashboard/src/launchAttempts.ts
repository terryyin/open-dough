// The launches the developer asked for from this page, and the startup of
// each story and project as the machine's launch attempts show it
// (`./agentLaunches.ts`). Asking sends the request to the local launch owner,
// which answers once it accepted the exact request; the page then follows
// that accepted attempt through the machine's sessions until its outcome
// settles (`./askedLaunches.ts`, `./attemptChangeWaits.ts`). Each story's
// startup, from whichever page, is told from the same attempts
// (`./storyStartup.ts`) and, once settled, from the published snapshot shown
// (`./startupReconciliation.ts`). A lost answer keeps its story protected
// until a read asked afterwards shows whether it was accepted; startups in
// need of reconciliation are rechecked and continued outside their frames
// (`./startupRecoveries.ts`).

import type { HostOperations } from "./sessionCapabilities.ts";
import { useCallback } from "react";
import {
  requestedChoices,
  type AttemptObservation,
  type LaunchChoices,
  type LaunchWithState,
  type LaunchWorkflow,
  type StoryLaunchRequest,
} from "./agentLaunch.ts";
import { useAskedLaunches } from "./askedLaunches.ts";
import { useAttemptChangeWaits } from "./attemptChangeWaits.ts";
import type { StartAnswer } from "./LaunchExistingChanges.tsx";
import {
  adHocKey,
  askedRequests,
  attemptKey,
  shownAttempt,
  type LaunchAttempt,
  type OnLaunched,
} from "./pageAttempt.ts";
import {
  storiesAsked,
  storyStartup,
  type StoryStartup,
} from "./storyStartup.ts";
import {
  useStartupReconciliation,
  type PublishedShown,
} from "./startupReconciliation.ts";
import {
  useStartupRecovery,
  type AttemptEvidence,
  type StartupRecoveries,
} from "./startupRecoveries.ts";

export type { LaunchAttempt, OnLaunched } from "./pageAttempt.ts";

// The work item a launch is for, as its request names it.
export type LaunchWorkItem = Pick<StoryLaunchRequest, "identity" | "title">;

export type LaunchAttempts = StartupRecoveries & {
  attemptOf(
    sourceId: string,
    identity: string,
    workflow: LaunchWorkflow,
  ): LaunchAttempt | undefined;
  // The story's startup, from whichever page it was asked.
  storyStartupOf(sourceId: string, identity: string): StoryStartup | undefined;
  // The startups of the project's stories, from whichever page asked them.
  storyStartupsOf(sourceId: string): readonly StoryStartup[];
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
  hostOperations,
  attemptEvidence,
  answeredAsk,
  asksSoFar,
  records,
  reads,
  reread,
  published,
}: {
  readonly observed: readonly AttemptObservation[];
  readonly hostOperations: HostOperations;
  readonly attemptEvidence: AttemptEvidence;
  // Which read of the machine's sessions, counted as asked, answered
  // latest, and how many were asked so far.
  readonly answeredAsk: number;
  readonly asksSoFar: () => number;
  readonly records: readonly LaunchWithState[];
  readonly reads: number;
  readonly reread: () => void;
  readonly published: PublishedShown;
}): LaunchAttempts {
  const {
    pages: attempts,
    latest,
    launch,
  } = useAskedLaunches({ observed, records, answeredAsk, asksSoFar, reread });

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
  const known: readonly AttemptObservation[] = [
    ...observed,
    ...[...attempts.values()].flatMap((page) =>
      page.kind === "accepted" &&
      !observed.some((read) => read.id === page.attempt.id)
        ? [page.attempt]
        : [],
    ),
  ];

  const reconciled = useStartupReconciliation({
    known,
    ...published,
  });

  useAttemptChangeWaits(
    known
      .filter((attempt) => attempt.owned && attempt.outcome === undefined)
      .map((attempt) => attempt.id),
    reads,
    reread,
  );

  const asked = askedRequests([...attempts.values()]);
  const storyStartupOf = (sourceId: string, identity: string) =>
    storyStartup(asked, known, sourceId, identity, reconciled);
  const recoveries = useStartupRecovery({
    known,
    hostOperations,
    unacknowledged: asked.unacknowledged,
    attemptEvidence,
    answeredAsk,
    asksSoFar,
    shown: published.shown,
    storyStartupOf,
    reread,
    readAfresh: published.readAfresh,
  });

  return {
    storyStartupsOf: (sourceId) =>
      storiesAsked(
        [
          ...known.map(({ request }) => request),
          ...asked.submitting,
          ...asked.unacknowledged.map(({ request }) => request),
        ],
        sourceId,
      ).flatMap((identity) => storyStartupOf(sourceId, identity) ?? []),
    attemptOf: (sourceId, identity, workflow) =>
      shownAttempt(
        attempts.get(attemptKey(sourceId, identity, workflow)),
        latest,
      ),
    storyStartupOf,
    start,
    startAdHoc,
    adHocAttemptOf: (sourceId) =>
      shownAttempt(attempts.get(adHocKey(sourceId)), latest),
    ...recoveries,
  };
}
