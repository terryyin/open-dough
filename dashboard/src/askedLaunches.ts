// The launches this page asked for (`./launchAttempts.ts`), each kept under
// its key (`./pageAttempt.ts`) from asking until its answer settles: the
// local service's acceptance answer, then the accepted attempt followed
// through the machine's attempts and sessions. A launched outcome is
// presented by the action that asked for it (`onLaunched`) once its record is
// listed; a failed or uncertain one stays beside that action. A lost answer
// is only a problem once a read asked after it answered, which shows any
// attempt the service accepted.

import { useCallback, useEffect } from "react";
import type {
  AgentLaunchRequest,
  AttemptObservation,
  LaunchWithState,
} from "./agentLaunch.ts";
import { requestAgentAcceptance } from "./agentLaunchClient.ts";
import { useKeyedState } from "./keyedState.ts";
import type { StartAnswer } from "./LaunchExistingChanges.tsx";
import {
  answeredAttempt,
  problemOf,
  type OnLaunched,
  type PageAttempt,
} from "./pageAttempt.ts";
import { sessionKey } from "./sessionReference.ts";

export function useAskedLaunches({
  observed,
  records,
  answeredAsk,
  asksSoFar,
  reread,
}: {
  readonly observed: readonly AttemptObservation[];
  readonly records: readonly LaunchWithState[];
  // Which read of the machine's sessions, counted as asked, answered
  // latest, and how many were asked so far.
  readonly answeredAsk: number;
  readonly asksSoFar: () => number;
  readonly reread: () => void;
}) {
  const { values: pages, set: setPage } = useKeyedState<PageAttempt>();

  // The latest observation of an attempt: as the machine's sessions last
  // answered it, or as accepted when no read has named it yet.
  const latest = useCallback(
    (attempt: AttemptObservation) =>
      observed.find((read) => read.id === attempt.id) ?? attempt,
    [observed],
  );

  useEffect(() => {
    for (const [key, page] of pages) {
      if (page.kind === "unacknowledged" && page.lostAfter < answeredAsk)
        setPage(key, page.problem);
      if (page.kind !== "accepted") continue;
      const { outcome } = latest(page.attempt);
      if (outcome === undefined) continue;
      if (outcome.kind !== "launched") {
        setPage(key, problemOf(outcome));
        continue;
      }
      const record = records.find(
        (listed) => sessionKey(listed.session) === sessionKey(outcome.session),
      );
      if (record === undefined) continue;
      setPage(key, undefined);
      page.onLaunched(record);
    }
  }, [pages, latest, records, setPage, answeredAsk]);

  // Asks the local service to accept `request`, kept under `key`.
  const launch = useCallback(
    async (
      key: string,
      request: AgentLaunchRequest,
      onLaunched: OnLaunched,
    ): Promise<StartAnswer> => {
      setPage(key, { kind: "submitting", request });
      const answer = await requestAgentAcceptance(request);
      // Nothing started: the dialog asks the developer about the changes.
      if (answer.kind === "existing-changes") {
        setPage(key, undefined);
        return answer;
      }
      reread();
      setPage(key, answeredAttempt(answer, request, onLaunched, asksSoFar()));
      return answer.kind === "accepted";
    },
    [setPage, reread, asksSoFar],
  );

  return { pages, latest, launch };
}
