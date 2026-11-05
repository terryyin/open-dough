// Intent's CI status homepage (`./IntentPerspective.tsx`,
// `./IntentBrowser.tsx`): the selected check's judgment of the branch
// `./intentCiTarget.ts` names (the project's trunk, or the selected story's
// published story branch) through `./authenticatedIntentCiStatusRead.ts`,
// filling the Intent reading pane when nothing is selected and shown beside
// Intent's location explanations when locations are absent or unreadable. It
// always names the branch and when it was checked, and shows the judgment as
// `./IntentCiJudgment.tsx` does, then the shown run's CI proof as
// `./IntentCiProof.tsx` reads it. A selected story without a branch to judge
// is named with why, and nothing is judged. Each show asks for any kept
// answer and a fresh CI read together (`./IntentCiJudgedBranch.tsx`): a kept
// answer appears at once labelled previously retrieved with a spinner until
// the fresh answer replaces it, or a failure is shown beside it without
// presenting the kept answer as newly verified. It is read again when the
// judged branch changes, when the page's revision check finds the judged
// branch at a new head while it is shown (the head `./intentCiTarget.ts`
// gives the judged branch), and on Check again; a judgment of another branch
// is never shown. Nothing is read on time alone.

import { JudgedBranch } from "./IntentCiJudgedBranch.tsx";
import { ciTargetOf, type CiTarget } from "./intentCiTarget.ts";
import type { PublishedSource } from "./publishedSource.ts";
import type { PublishedWork } from "./publishedWork.ts";
import "./intent-ci-status.css";

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
