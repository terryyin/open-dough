// The startups of a project that need the developer outside their story's
// protected frame (`./StartupRecovery.tsx`): each story whose startup needs
// reconciliation, or still waits for published state after its last check
// failed or while its story is not shown; and the project's latest ad hoc
// launch when it needs reconciliation, or whose answer this page lost. Each
// can be rechecked -- this machine's attempts and sessions and the
// published state read afresh -- and an accepted attempt that needs
// reconciliation continued: the local service runs its kept request again
// under the same attempt and the existing recovery rules
// (`requestAttemptContinuation`), or answers why not, the attempt kept.

import { useCallback, useEffect } from "react";
import {
  needsReconciliation,
  type AgentLaunchRequest,
  type AttemptObservation,
} from "./agentLaunch.ts";
import {
  requestAttemptContinuation,
  type LaunchProblem,
} from "./agentLaunchClient.ts";
import { useKeyedState } from "./keyedState.ts";
import type { Unacknowledged } from "./pageAttempt.ts";
import { laterAttempt, type ShownSnapshot } from "./startupReconciliation.ts";
import {
  storiesAsked,
  type ReconciliationCause,
  type StoryStartup,
} from "./storyStartup.ts";

// A startup to recover: its request, why (or `waiting` for published
// state), what is known of it, and its continuation from this page.
export type StartupRecoveryItem = {
  readonly key: string;
  readonly request: AgentLaunchRequest;
  readonly cause: ReconciliationCause | "waiting";
  // The accepted attempt, when one is known.
  readonly attempt?: AttemptObservation;
  // Why the last check of published state failed, or the lost answer.
  readonly problem?: string;
  // The continuation's answer when it was not accepted.
  readonly answer?: LaunchProblem;
  readonly continuing: boolean;
};

// What this page knows of this machine's kept attempts: no read has
// answered yet (`unread`), or none answered although reads ended
// (`unanswered`: the local service did not answer), the latest answer could
// not read them (`unreadable`), or they were read (`read`). Only once read
// does the absence of an attempt mean no startup is unresolved.
export type AttemptEvidence = "unread" | "unanswered" | "unreadable" | "read";

export type StartupRecoveries = {
  recoveriesOf(sourceId: string): readonly StartupRecoveryItem[];
  readonly attemptEvidence: AttemptEvidence;
  readonly continueStartup: (attempt: AttemptObservation) => void;
  readonly recheckStartups: () => void;
};

type Continuation =
  // Under way until a read asked after the first `after` reads answers.
  { readonly kind: "continuing"; readonly after: number } | LaunchProblem;

const existingChanges: LaunchProblem = {
  kind: "failed",
  explanation:
    "The default checkout holds changes this start did not confirm, so it was not continued. Review them in the default checkout, then continue again.",
};

export function useStartupRecovery({
  known,
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
  readonly unacknowledged: readonly Unacknowledged[];
  readonly attemptEvidence: AttemptEvidence;
  // Which read of the machine's attempts, counted as asked, answered
  // latest, and how many were asked so far.
  readonly answeredAsk: number;
  readonly asksSoFar: () => number;
  // The published snapshot shown, if any.
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

  // A continuation stays under way until a read asked after it answered.
  useEffect(() => {
    for (const [id, continuation] of continuations)
      if (
        continuation.kind === "continuing" &&
        continuation.after < answeredAsk
      )
        settle(id, undefined);
  }, [continuations, answeredAsk, settle]);

  const continueStartup = useCallback(
    (attempt: AttemptObservation) => {
      // Under way until answered, then until a read shows it.
      settle(attempt.id, {
        kind: "continuing",
        after: Number.POSITIVE_INFINITY,
      });
      void requestAttemptContinuation(attempt).then((answer) => {
        if (answer.kind !== "accepted")
          settle(
            attempt.id,
            answer.kind === "existing-changes"
              ? existingChanges
              : { kind: answer.kind, explanation: answer.explanation },
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
          itemOf(
            "ad-hoc",
            adHoc.outcome === undefined ? "interrupted" : "uncertain",
            { request: adHoc.request, attempt: adHoc },
          ),
        ]
      : items;
  };

  return {
    recoveriesOf,
    attemptEvidence,
    continueStartup,
    recheckStartups: () => {
      clearContinuations();
      reread();
      readAfresh();
    },
  };
}
