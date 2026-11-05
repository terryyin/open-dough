// Intent's CI status homepage (`./IntentPerspective.tsx`,
// `./IntentBrowser.tsx`): the selected check's judgment of the branch
// `./intentCiTarget.ts` names (the project's trunk, or the selected story's
// published story branch) through `./authenticatedIntentCiStatusRead.ts`,
// filling the Intent reading pane when nothing is selected and shown beside
// Intent's location explanations when locations are absent or unreadable. It
// always names the branch and when it was checked, and shows the judgment as
// `./IntentCiJudgment.tsx` does, then the shown run's CI proof as
// `./IntentCiProof.tsx` reads it. A selected story without a branch to judge
// is named with why, and nothing is judged. It is read each time it is
// shown, when the judged branch changes, again when the page's revision
// check finds the judged branch at a new head while it is shown (the head
// `./intentCiTarget.ts` gives the judged branch), and on Check again; a
// re-read of the same branch keeps the shown judgment until its answer
// replaces it, and a judgment of another branch is never shown. Nothing is
// read on time alone.

import { useEffect, useState } from "react";
import {
  readIntentCiStatus,
  type IntentCiStatus as Judgment,
} from "./authenticatedIntentCiStatusRead.ts";
import { ciTargetOf, type CiTarget } from "./intentCiTarget.ts";
import { IntentCiProof } from "./IntentCiProof.tsx";
import { ShownJudgment } from "./IntentCiJudgment.tsx";
import type { PublishedSource } from "./publishedSource.ts";
import type { PublishedWork } from "./publishedWork.ts";
import "./intent-ci-status.css";

// A judgment the boundary could not answer at all still names the branch and
// says why, never reading as passed.
function boundaryUnread(branch: string, error: unknown): Judgment {
  return {
    branch,
    checkedAt: new Date().toISOString(),
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

// The selected story's gap: named, with why, and no status.
function StoryGap({
  target,
}: {
  readonly target: Extract<CiTarget, { kind: "gap" }>;
}) {
  return (
    <section className="intent-ci-status" aria-label="CI status">
      <h3>CI status of {target.story}</h3>
      <p className="intent-ci-gap">{target.why}</p>
    </section>
  );
}

function JudgedBranch({
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
  // other branch than `branch` is never shown.
  const [judgment, setJudgment] = useState<Judgment | undefined>(undefined);
  const [reading, setReading] = useState(true);
  const [check, setCheck] = useState(0);
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
    void readIntentCiStatus(source, branch, controller.signal)
      .then((answer) => {
        if (!controller.signal.aborted) setJudgment(answer);
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted)
          setJudgment(boundaryUnread(branch, error));
      })
      .finally(() => {
        if (!controller.signal.aborted) setReading(false);
      });
    return () => {
      controller.abort();
    };
  }, [source, branch, check]);

  const shown = judgment?.branch === branch ? judgment : undefined;
  const checkedAt = shown === undefined ? undefined : new Date(shown.checkedAt);
  return (
    <section className="intent-ci-status" aria-label="CI status">
      <h3>
        CI status of <code>{branch}</code>
      </h3>
      {story !== undefined && (
        <p className="intent-ci-story">Story branch of {story}.</p>
      )}
      <p role="status" className="quiet">
        {reading ? (
          `Checking the CI of ${branch}…`
        ) : checkedAt === undefined || shown === undefined ? (
          ""
        ) : (
          <>
            Checked at{" "}
            <time dateTime={shown.checkedAt}>
              {checkedAt.toLocaleTimeString()}
            </time>
            .
          </>
        )}
      </p>
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

export function IntentCiStatus({
  source,
  work,
  selectedIdentity,
}: {
  readonly source: PublishedSource;
  readonly work: PublishedWork | undefined;
  // The page's selected story, if any.
  readonly selectedIdentity: string | undefined;
}) {
  const target = ciTargetOf(source, work, selectedIdentity);
  if (target.kind === "gap") return <StoryGap target={target} />;
  // Keyed by branch, so a changed branch starts with nothing shown.
  return (
    <JudgedBranch
      key={target.branch}
      source={source}
      branch={target.branch}
      story={target.story}
      head={target.head}
    />
  );
}
