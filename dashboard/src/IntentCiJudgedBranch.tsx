// One judged branch's CI status panel (`./IntentCiStatus.tsx`): asks for any
// kept answer and a fresh CI read together, labels a kept answer previously
// retrieved with a spinner until the fresh answer replaces it, or shows a
// failure beside it without presenting the kept answer as newly verified.
// Re-reads when the judged branch's observed head changes and on Check again;
// a judgment of another branch is never shown.

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  readIntentCiStatus,
  readKeptIntentCiStatus,
  type IntentCiStatus as Judgment,
} from "./authenticatedIntentCiStatusRead.ts";
import { IntentCiProof } from "./IntentCiProof.tsx";
import { ShownJudgment } from "./IntentCiJudgment.tsx";
import type { PublishedSource } from "./publishedSource.ts";

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
    reason:
      error instanceof Error && error.message !== ""
        ? error.message
        : "The CI status could not be read",
  };
}

type KeptResult = Judgment | { readonly none: true };
type FreshResult =
  | { readonly kind: "answer"; readonly answer: Judgment }
  | { readonly kind: "error"; readonly error: unknown };

export function JudgedBranch({
  source,
  branch,
  story,
  head,
}: {
  readonly source: PublishedSource;
  readonly branch: string;
  readonly story: string | undefined;
  // The branch's head as the page last observed it, once read: undefined
  // while the page observes none.
  readonly head: string | undefined;
}) {
  // The judgment shown, and the branch it was read for: a judgment of any
  // other branch than `branch` is never shown. While a fresh read is under
  // way, a shown answer is labelled previously retrieved until a fresh
  // keepable answer replaces it.
  const [judgment, setJudgment] = useState<Judgment | undefined>(undefined);
  const [reading, setReading] = useState(true);
  const [previouslyRetrieved, setPreviouslyRetrieved] = useState(false);
  const [refreshFailed, setRefreshFailed] = useState<string | undefined>(
    undefined,
  );
  const [check, setCheck] = useState(0);
  const judgmentRef = useRef(judgment);
  judgmentRef.current = judgment;
  // The head this judgment follows: the first one observed only records it,
  // since the judgment already reads the branch's head; a later one re-reads.
  const [followed, setFollowed] = useState(head);
  if (head !== undefined && head !== followed) {
    setFollowed(head);
    if (followed !== undefined) setCheck((n) => n + 1);
  }

  useEffect(() => {
    const controller = new AbortController();
    setReading(true);
    setRefreshFailed(undefined);
    if (
      judgmentRef.current !== undefined &&
      judgmentRef.current.branch === branch
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
          setRefreshFailed(
            result.error instanceof Error && result.error.message !== ""
              ? result.error.message
              : "The CI status could not be read",
          );
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
          setRefreshFailed(answer.reason ?? "The CI status could not be read");
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

  const shown = judgment?.branch === branch ? judgment : undefined;
  let status: ReactNode = "";
  if (
    shown !== undefined &&
    (previouslyRetrieved || shown.freshness === "kept")
  ) {
    const at = new Date(shown.checkedAt);
    status = (
      <>
        Previously retrieved at{" "}
        <time dateTime={shown.checkedAt}>{at.toLocaleTimeString()}</time>.
        {reading ? (
          <>
            {" "}
            <span className="intent-ci-checking">
              Checking the CI of {branch}…
            </span>
          </>
        ) : null}
      </>
    );
  } else if (reading) {
    status = (
      <span className="intent-ci-checking">Checking the CI of {branch}…</span>
    );
  } else if (shown !== undefined) {
    const at = new Date(shown.checkedAt);
    status = (
      <>
        Checked at{" "}
        <time dateTime={shown.checkedAt}>{at.toLocaleTimeString()}</time>.
      </>
    );
  }
  return (
    <section className="intent-ci-status" aria-label="CI status">
      <h3>
        CI status of <code>{branch}</code>
      </h3>
      {story !== undefined && (
        <p className="intent-ci-story">Story branch of {story}.</p>
      )}
      <p role="status" className="quiet">
        {status}
      </p>
      {refreshFailed !== undefined && (
        <p role="alert" className="intent-ci-refresh-failed">
          {refreshFailed}
        </p>
      )}
      {shown !== undefined && <ShownJudgment judgment={shown} story={story} />}
      {shown !== undefined && shown.unpublished !== true && (
        <IntentCiProof source={source} judgment={shown} />
      )}
      <p>
        <button
          type="button"
          disabled={reading}
          onClick={() => {
            setCheck((n) => n + 1);
          }}
        >
          Check again
        </button>
      </p>
    </section>
  );
}
