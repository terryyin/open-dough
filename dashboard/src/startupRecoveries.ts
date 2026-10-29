// Startups needing the developer outside the story frame (`./StartupRecovery.tsx`):
// recheck, Continue, and Update worktree and retry for incomplete installs.

import type { HostOperations } from "./sessionCapabilities.ts";
import { useCallback, useEffect } from "react";
import {
  laterAttempt,
  launchVerifiable,
  needsReconciliation,
  worktreeUpdateNeeded,
  type AgentLaunchRequest,
  type AttemptObservation,
} from "./agentLaunch.ts";
import {
  requestAttemptContinuation,
  requestLaunchVerification,
  requestUpdateWorktreeAndRetry,
  type AcceptanceAnswer,
  type LaunchProblem,
} from "./agentLaunchClient.ts";
import { useKeyedState } from "./keyedState.ts";
import type { Unacknowledged } from "./pageAttempt.ts";
import type { ShownSnapshot } from "./startupReconciliation.ts";
import {
  attemptCause,
  storiesAsked,
  type ReconciliationCause,
  type StoryStartup,
} from "./storyStartup.ts";

export type StartupRecoveryItem = {
  readonly key: string;
  readonly request: AgentLaunchRequest;
  readonly cause: ReconciliationCause | "waiting";
  readonly attempt?: AttemptObservation;
  readonly problem?: string;
  readonly answer?: LaunchProblem;
  readonly continuing: boolean;
  readonly offersWorktreeUpdate: boolean;
};

export type AttemptEvidence = "unread" | "unanswered" | "unreadable" | "read";

export type StartupRecoveries = {
  recoveriesOf(sourceId: string): readonly StartupRecoveryItem[];
  readonly attemptEvidence: AttemptEvidence;
  readonly continueStartup: (attempt: AttemptObservation) => void;
  readonly updateWorktreeAndRetry: (attempt: AttemptObservation) => void;
  readonly recheckStartups: (attempt?: AttemptObservation) => void;
};

type Continuation =
  { readonly kind: "continuing"; readonly after: number } | LaunchProblem;

const existingChanges: LaunchProblem = {
  kind: "failed",
  explanation:
    "The default checkout holds changes this start did not confirm, so it was not continued. Review them in the default checkout, then continue again.",
};

export function useStartupRecovery({
  known,
  hostOperations,
  unacknowledged,
  attemptEvidence,
  answeredAsk,
  asksSoFar,
  shown,
  storyStartupOf,
  reread,
  readAfresh,
}: {
  readonly known: readonly AttemptObservation[];
  readonly hostOperations: HostOperations;
  readonly unacknowledged: readonly Unacknowledged[];
  readonly attemptEvidence: AttemptEvidence;
  readonly answeredAsk: number;
  readonly asksSoFar: () => number;
  readonly shown: ShownSnapshot | undefined;
  readonly storyStartupOf: (
    sourceId: string,
    identity: string,
  ) => StoryStartup | undefined;
  readonly reread: () => void;
  readonly readAfresh: () => void;
}): StartupRecoveries {
  const {
    values: continuations,
    set: settle,
    clear: clearContinuations,
  } = useKeyedState<Continuation>();

  useEffect(() => {
    for (const [id, continuation] of continuations)
      if (
        continuation.kind === "continuing" &&
        continuation.after < answeredAsk
      )
        settle(id, undefined);
  }, [continuations, answeredAsk, settle]);

  const beginRecovery = useCallback(
    (
      attempt: AttemptObservation,
      ask: (attempt: AttemptObservation) => Promise<AcceptanceAnswer>,
    ) => {
      settle(attempt.id, {
        kind: "continuing",
        after: Number.POSITIVE_INFINITY,
      });
      void ask(attempt).then((answer) => {
        if (answer.kind !== "accepted")
          settle(
            attempt.id,
            answer.kind === "existing-changes"
              ? existingChanges
              : {
                  kind:
                    answer.kind === "stop-unconfirmed" ? "failed" : answer.kind,
                  explanation: answer.explanation,
                },
          );
        else settle(attempt.id, { kind: "continuing", after: asksSoFar() });
        reread();
      });
    },
    [reread, settle, asksSoFar],
  );

  const itemOf = (
    key: string,
    cause: StartupRecoveryItem["cause"],
    {
      request,
      attempt,
      problem,
    }: Pick<StartupRecoveryItem, "request" | "attempt" | "problem">,
  ): StartupRecoveryItem => {
    const continuation = attempt && continuations.get(attempt.id);
    return {
      key,
      request,
      cause,
      ...(attempt === undefined ? {} : { attempt }),
      ...(problem === undefined ? {} : { problem }),
      ...(continuation === undefined || continuation.kind === "continuing"
        ? {}
        : { answer: continuation }),
      continuing: continuation?.kind === "continuing",
      offersWorktreeUpdate: worktreeUpdateNeeded(attempt),
    };
  };

  const recoveriesOf = (sourceId: string): readonly StartupRecoveryItem[] => {
    const listed = shown?.sourceId === sourceId ? shown.identities : undefined;
    const stories = storiesAsked(
      [
        ...known.map(({ request }) => request),
        ...unacknowledged.map(({ request }) => request),
      ],
      sourceId,
    );
    const items = stories.flatMap((identity) => {
      const startup = storyStartupOf(sourceId, identity);
      if (startup?.state === "needs-reconciliation")
        return [itemOf(identity, startup.cause ?? "uncertain", startup)];
      return startup?.state === "reconciling" &&
        (startup.problem !== undefined ||
          (listed !== undefined && !listed.includes(identity)))
        ? [itemOf(identity, "waiting", startup)]
        : [];
    });
    const lostAdHoc = unacknowledged.find(
      ({ request }) =>
        request.source === sourceId && request.workflow === "ad-hoc",
    );
    if (lostAdHoc !== undefined)
      return [
        ...items,
        itemOf("ad-hoc", "unacknowledged", {
          request: lostAdHoc.request,
          problem: lostAdHoc.problem.explanation,
        }),
      ];
    const adHoc = known
      .filter(
        ({ request }) =>
          request.source === sourceId && request.workflow === "ad-hoc",
      )
      .reduce<AttemptObservation | undefined>(laterAttempt, undefined);
    return adHoc !== undefined && needsReconciliation(adHoc)
      ? [
          ...items,
          itemOf("ad-hoc", attemptCause(adHoc), {
            request: adHoc.request,
            attempt: adHoc,
          }),
        ]
      : items;
  };

  return {
    recoveriesOf,
    attemptEvidence,
    continueStartup: (attempt) => {
      beginRecovery(attempt, requestAttemptContinuation);
    },
    updateWorktreeAndRetry: (attempt) => {
      beginRecovery(attempt, requestUpdateWorktreeAndRetry);
    },
    recheckStartups: (attempt) => {
      clearContinuations();
      if (attempt === undefined || !launchVerifiable(attempt, hostOperations)) {
        reread();
        readAfresh();
        return;
      }
      void requestLaunchVerification(attempt).then((answer) => {
        if (answer.kind === "unresolved")
          settle(attempt.id, {
            kind: "uncertain",
            explanation: answer.explanation,
          });
        reread();
        readAfresh();
      });
    },
  };
}
