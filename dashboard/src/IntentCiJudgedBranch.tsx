// One judged branch's CI status panel (`./IntentCiStatus.tsx`) as Intent's
// one CI evidence owner reads it (`./IntentCiEvidence.tsx`): labels a kept
// answer previously retrieved with a spinner until the fresh answer replaces
// it, or shows a failure beside it without presenting the kept answer as
// newly verified, then the shown judgment and its attempt's proof. A
// judgment of another branch is never shown.

import type { ReactNode } from "react";
import { IntentCiProof } from "./IntentCiProof.tsx";
import { ShownJudgment } from "./IntentCiJudgment.tsx";
import type { JudgedReading } from "./useIntentCiJudgment.ts";
import type { ShownProof } from "./useIntentCiShownProof.ts";

export function JudgedBranch({
  branch,
  story,
  judged,
  proof,
}: {
  readonly branch: string;
  readonly story: string | undefined;
  readonly judged: JudgedReading;
  readonly proof: ShownProof | undefined;
}) {
  const { shown, reading, previouslyRetrieved, refreshFailed } = judged;
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
      {shown !== undefined && proof !== undefined && (
        <IntentCiProof judgment={shown} proof={proof} />
      )}
      <p>
        <button type="button" disabled={reading} onClick={judged.checkAgain}>
          Check again
        </button>
      </p>
    </section>
  );
}
