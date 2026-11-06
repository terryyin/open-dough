// Intent's CI status homepage (`./IntentPerspective.tsx`,
// `./IntentBrowser.tsx`): the selected check's judgment of the branch
// `./intentCiTarget.ts` names (the project's trunk, or the selected story's
// published story branch), as Intent's one CI evidence owner reads it
// (`./IntentCiEvidence.tsx`), filling the Intent reading pane when nothing is
// selected and shown beside Intent's location explanations when locations
// are absent or unreadable. It always names the branch and when it was
// checked, and shows the judgment as `./IntentCiJudgment.tsx` does, then the
// shown run's CI proof (`./IntentCiProof.tsx`). A selected done story shows
// its CI timing comparison (`./IntentCiComparison.tsx`), including entry rows
// in the homepage proof table. A selected story without a branch to judge is
// named with why, and nothing is judged. Returning home shows what the owner
// already read; it asks CI nothing again.

import { IntentCiComparison } from "./IntentCiComparison.tsx";
import { useIntentCiEvidence } from "./IntentCiEvidence.tsx";
import { JudgedBranch } from "./IntentCiJudgedBranch.tsx";
import type { CiTarget } from "./intentCiTarget.ts";
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

export function IntentCiStatus() {
  const evidence = useIntentCiEvidence();
  if (evidence.kind === "inactive") return null;
  if (evidence.kind === "gap") return <StoryGap target={evidence} />;
  if (evidence.kind === "comparison")
    return (
      <IntentCiComparison
        source={evidence.source}
        story={evidence.story}
        reading={evidence.comparison}
      />
    );
  return (
    <JudgedBranch
      branch={evidence.branch}
      story={evidence.story}
      judged={evidence.judged}
      proof={evidence.proof}
    />
  );
}
