// The judged branch's CI judgment as Intent's one CI evidence owner reads it
// (`./IntentCiEvidence.tsx`), through `./authenticatedIntentCiStatusRead.ts`.
// Each show asks for any kept answer and a fresh CI read together: a kept
// answer appears at once labelled previously retrieved until the fresh
// answer replaces it, or a failure is shown beside it without presenting the
// kept answer as newly verified. It is read again when the branch changes,
// when the branch is observed at a new head, and on Check again; nothing is
// read on time alone, and nothing without a branch. A judgment of another
// branch is never given as this one's.

import { useEffect, useRef, useState } from "react";
import {
  readIntentCiStatus,
  readKeptIntentCiStatus,
  type IntentCiStatus as Judgment,
} from "./authenticatedIntentCiStatusRead.ts";
import type { PublishedSource } from "./publishedSource.ts";

export const unreadReason = "The CI status could not be read";

// Why a read failed, in the boundary's own words when it gave any.
const failureOf = (error: unknown): string =>
  error instanceof Error && error.message !== "" ? error.message : unreadReason;

// A judgment the boundary could not answer at all still names the branch and
// says why, never reading as passed.
function boundaryUnread(branch: string, error: unknown): Judgment {
  return {
    branch,
    checkedAt: new Date().toISOString(),
    freshness: "fresh",
    state: "unread",
    revision: "unavailable",
    subject: "(unavailable)",
    laterWithoutResult: 0,
    reason: failureOf(error),
  };
}

type KeptResult = Judgment | { readonly none: true };
type FreshResult =
  | { readonly kind: "answer"; readonly answer: Judgment }
  | { readonly kind: "error"; readonly error: unknown };

// The judged branch's reading: the judgment shown (only ever one of
// `branch`), whether a read is under way, whether the shown judgment is a
// previously retrieved one, a failed refresh beside it, Check again, and
// which read of the branch this is, which changes each time the branch is
// read and is undefined while there is no branch, so evidence read beside
// the judgment (`./useIntentCiHistory.ts`) is read again with it.
export type JudgedReading = {
  readonly shown: Judgment | undefined;
  readonly reading: boolean;
  readonly previouslyRetrieved: boolean;
  readonly refreshFailed: string | undefined;
  readonly checkAgain: () => void;
  readonly round: string | undefined;
};

// BRANCH's judgment, read while BRANCH is given; HEAD is the branch's head
// as last observed.
export function useIntentCiJudgment(
  source: PublishedSource,
  branch: string | undefined,
  head: string | undefined,
): JudgedReading {
  const key = branch === undefined ? undefined : `${source.id}#${branch}`;
  const [judgment, setJudgment] = useState<Judgment | undefined>(undefined);
  const [reading, setReading] = useState(true);
  const [previouslyRetrieved, setPreviouslyRetrieved] = useState(false);
  const [refreshFailed, setRefreshFailed] = useState<string | undefined>(
    undefined,
  );
  const [check, setCheck] = useState(0);
  // The head this judgment follows: the first one observed only records it,
  // since the judgment already reads the branch's head; a later one re-reads.
  const [followed, setFollowed] = useState(head);
  // A changed source or branch starts with nothing shown, as a new show does.
  const [readFor, setReadFor] = useState(key);
  if (readFor !== key) {
    setReadFor(key);
    setJudgment(undefined);
    setReading(true);
    setPreviouslyRetrieved(false);
    setRefreshFailed(undefined);
    setFollowed(head);
  } else if (head !== undefined && head !== followed) {
    setFollowed(head);
    if (followed !== undefined) setCheck((n) => n + 1);
  }
  const judgmentRef = useRef(judgment);
  judgmentRef.current = judgment;

  useEffect(() => {
    if (branch === undefined) return;
    const controller = new AbortController();
    setReading(true);
    setRefreshFailed(undefined);
    if (
      judgmentRef.current !== undefined &&
      judgmentRef.current.branch === branch &&
      judgmentRef.current.state !== "unread"
    ) {
      setPreviouslyRetrieved(true);
    }

    let kept: KeptResult | undefined;
    let fresh: FreshResult | undefined;
    let keptShown = false;

    const showKept = (answer: Judgment) => {
      if (keptShown || controller.signal.aborted) return;
      keptShown = true;
      setJudgment(answer);
      setPreviouslyRetrieved(true);
    };

    const keptJudgmentOf = (keptAnswer: KeptResult): Judgment | undefined =>
      "none" in keptAnswer || keptAnswer.branch !== branch
        ? undefined
        : keptAnswer;

    const applyFresh = (result: FreshResult, keptAnswer: KeptResult) => {
      if (controller.signal.aborted) return;
      const keptJudgment = keptJudgmentOf(keptAnswer);
      if (result.kind === "error") {
        if (keptJudgment !== undefined) {
          setJudgment(keptJudgment);
          setPreviouslyRetrieved(true);
          setRefreshFailed(failureOf(result.error));
          return;
        }
        setPreviouslyRetrieved(false);
        setRefreshFailed(undefined);
        setJudgment(boundaryUnread(branch, result.error));
        return;
      }
      const { answer } = result;
      if (answer.state === "unread") {
        if (keptJudgment !== undefined) {
          setJudgment(keptJudgment);
          setPreviouslyRetrieved(true);
          setRefreshFailed(answer.reason ?? unreadReason);
          return;
        }
        setPreviouslyRetrieved(false);
        setRefreshFailed(undefined);
        setJudgment(answer);
        return;
      }
      setPreviouslyRetrieved(false);
      setRefreshFailed(undefined);
      setJudgment(answer);
    };

    const settleFresh = () => {
      if (fresh === undefined || kept === undefined) return;
      applyFresh(fresh, kept);
      if (!controller.signal.aborted) setReading(false);
    };

    void readKeptIntentCiStatus(source, branch, controller.signal)
      .then((answer) => {
        if (controller.signal.aborted) return;
        kept = answer;
        if (!("none" in answer) && fresh === undefined) showKept(answer);
        settleFresh();
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        // A failed kept read is a cold show; the fresh read still answers.
        kept = { none: true };
        settleFresh();
      });

    void readIntentCiStatus(source, branch, controller.signal)
      .then((answer) => {
        if (controller.signal.aborted) return;
        fresh = { kind: "answer", answer };
        settleFresh();
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        fresh = { kind: "error", error };
        settleFresh();
      });

    return () => {
      controller.abort();
    };
  }, [source, branch, check]);

  const current = readFor === key;
  return {
    shown:
      current && judgment?.branch === branch && branch !== undefined
        ? judgment
        : undefined,
    reading: current ? reading : true,
    previouslyRetrieved: current && previouslyRetrieved,
    refreshFailed: current ? refreshFailed : undefined,
    checkAgain: () => {
      setCheck((n) => n + 1);
    },
    round: key === undefined ? undefined : `${key}@${String(check)}`,
  };
}
