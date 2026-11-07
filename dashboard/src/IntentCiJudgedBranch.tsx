// One judged branch's CI status panel (`./IntentCiStatus.tsx`) as Intent's
// one CI evidence owner reads it (`./IntentCiEvidence.tsx`): labels a kept
// answer previously retrieved with a spinner until the fresh answer replaces
// it, or shows a failure beside it without presenting the kept answer as
// newly verified, then the shown judgment and its attempt's proof. A
// judgment of another branch is never shown. A selected entry's or folder's
// Summary qualifies its evidence in the same words
// (`./IntentScopeEvidenceLabels.tsx`).

import type { ReactNode } from "react";
import { IntentCiProof } from "./IntentCiProof.tsx";
import { ShownJudgment } from "./IntentCiJudgment.tsx";
import type { JudgedReading } from "./useIntentCiJudgment.ts";
import type { ShownProof } from "./useIntentCiShownProof.ts";

// The shown judgment's check time when it is a previously retrieved answer,
// not one newly verified; undefined otherwise.
export function previouslyRetrievedAt(
  judged: JudgedReading,
): string | undefined {
  const { shown, previouslyRetrieved } = judged;
  return shown !== undefined &&
    (previouslyRetrieved || shown.freshness === "kept")
    ? shown.checkedAt
    : undefined;
}

export function PreviouslyRetrieved({
  checkedAt,
}: {
  readonly checkedAt: string;
}) {
  return (
    <>
      Previously retrieved at{" "}
      <time dateTime={checkedAt}>
        {new Date(checkedAt).toLocaleTimeString()}
      </time>
      .
    </>
  );
}

// A failed refresh beside the kept answer it leaves shown.
export function RefreshFailed({ failure }: { readonly failure: string }) {
  return (
    <p role="alert" className="intent-ci-refresh-failed">
      {failure}
    </p>
  );
}

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
  const { shown, reading, refreshFailed } = judged;
  const keptAt = previouslyRetrievedAt(judged);
  let status: ReactNode = "";
  if (keptAt !== undefined) {
    status = (
      <>
        <PreviouslyRetrieved checkedAt={keptAt} />
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
      {refreshFailed !== undefined && <RefreshFailed failure={refreshFailed} />}
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
