// Intent's CI status (`./IntentProjectView.tsx`, `./IntentStoryView.tsx`,
// `./IntentBrowser.tsx`): the selected check's judgment of the branch
// `./intentCiTarget.ts` names (in Project Intent the project's trunk, in the
// selected story's CI comparison its published story branch), as the scope's CI
// evidence owner reads it (`./IntentCiEvidence.tsx`), filling Project Intent's
// reading pane when nothing is selected and shown beside its location
// explanations when locations are absent or unreadable. It always names the
// branch and when it was checked, and shows the judgment as
// `./IntentCiJudgment.tsx` does, then the shown run's CI proof
// (`./IntentCiProof.tsx`). A selected done story shows its CI timing comparison
// (`./IntentCiComparison.tsx`), including entry rows in the homepage proof
// table, with Check again to read it again. A selected Taken Story Branch story
// keeps its live judgment and adds the provisional comparison. A selected Taken
// Trunk Mode story shows its provisional trunk comparison. A selected story
// without a branch to judge is named with why, and nothing is judged. Returning
// home shows what the owner already read; it asks CI nothing again.

import { IntentCiComparison } from "./IntentCiComparison.tsx";
import { useIntentCiEvidence } from "./IntentCiEvidence.tsx";
import { JudgedBranch } from "./IntentCiJudgedBranch.tsx";
import type { CiTarget } from "./intentCiTarget.ts";
import { suppressesComparisonBesideJudgment } from "./storyCiComparison.ts";
import type { ComparisonReading } from "./useIntentCiComparison.ts";
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

// Beside a live judgment, show a provisional comparison once it resolves,
// including while it is still reading. Board-only fixtures without a
// recoverable local claim stay on judgment alone.
function provisionalBesideJudgment(
  comparison: ComparisonReading | undefined,
): ComparisonReading | undefined {
  if (comparison === undefined) return undefined;
  if (comparison.shown?.kind === "comparison") return comparison;
  if (comparison.reading && comparison.shown === undefined) return comparison;
  if (comparison.shown?.kind === "unavailable") {
    if (suppressesComparisonBesideJudgment(comparison.shown.explanation))
      return undefined;
    return comparison;
  }
  if (comparison.failed !== undefined) return comparison;
  return undefined;
}

export function IntentCiStatus() {
  const evidence = useIntentCiEvidence();
  if (evidence.kind === "inactive") return null;
  if (evidence.kind === "gap") return <StoryGap target={evidence} />;
  if (evidence.kind === "comparison")
    return (
      <IntentCiComparison
        reading={evidence.comparison}
        {...(evidence.phase === "done"
          ? { checkAgain: evidence.comparison.checkAgain }
          : {})}
      />
    );
  const provisional = provisionalBesideJudgment(evidence.comparison);
  return (
    <>
      <JudgedBranch
        branch={evidence.branch}
        story={evidence.story}
        judged={evidence.judged}
        proof={evidence.proof}
      />
      {provisional !== undefined && evidence.comparisonStory !== undefined && (
        <IntentCiComparison reading={provisional} />
      )}
    </>
  );
}
