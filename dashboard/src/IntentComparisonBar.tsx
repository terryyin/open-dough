// The selected story's comparison bar under its title: what `leading` holds
// (the files toggle and the comparison choice), then a one-line summary
// naming the active comparison, or its reading, unavailable or failed state
// with Retry, beside the eye that reveals the comparison details. The details
// reuse Review changes' disclosure (`./StoryReviewDetailsSection.tsx`): they
// start collapsed for each story, stay open across a new read, and hold
// Refresh, which re-reads the comparison while keeping the choice.

import { useId, type ReactNode } from "react";
import { RefreshCw } from "lucide-react";
import { IconButton } from "./Icon.tsx";
import { comparisonName } from "./StoryReviewComparison.tsx";
import {
  ReviewDetails,
  useReviewDetailsPlace,
} from "./StoryReviewDetailsSection.tsx";
import { ReviewDetailsEye } from "./StoryReviewToolbar.tsx";
import { landedRunName, type StoryCompare } from "./IntentStoryCompare.tsx";
import {
  CompactComparisonState,
  ComparisonDetail,
  type LensComparison,
} from "./IntentStoryComparison.tsx";
import type { StorySummary } from "./IntentStorySummary.tsx";
import "./intent-comparison-bar.css";

// The active comparison's name: the chosen landed run, or the comparison
// the review read answered with, and how many files it changes.
export function comparisonSummaryName(
  comparison: Extract<LensComparison, { state: "compared" }>,
) {
  const run = comparison.compare?.selectedRun;
  const name =
    run !== undefined
      ? landedRunName(run)
      : comparisonName(
          comparison.compare?.shown ??
            (comparison.review?.kind === "landed" ? "landed" : "published"),
        );
  const count = comparison.shown.comparison.files.length;
  return `${name} — ${count} changed file${count === 1 ? "" : "s"}`;
}

function RefreshComparison({ compare }: { readonly compare: StoryCompare }) {
  return (
    <IconButton
      label="Refresh"
      icon={RefreshCw}
      aria-disabled={compare.reading}
      onClick={() => {
        if (!compare.reading) compare.onRefresh();
      }}
    />
  );
}

export function IntentComparisonBar({
  summary,
  compare,
  leading,
}: {
  readonly summary: StorySummary;
  readonly compare: StoryCompare | undefined;
  readonly leading: ReactNode;
}) {
  const { comparison } = summary;
  const details = useReviewDetailsPlace(useId());
  const named = comparison.state === "compared" && comparison.reading !== true;
  return (
    <>
      <div className="intent-comparison-row">
        {leading}
        <div
          className="intent-comparison-bar"
          role="group"
          aria-label="Comparison summary"
        >
          {named && (
            <span className="intent-comparison-bar-name">
              {comparisonSummaryName(comparison)}
            </span>
          )}
          <CompactComparisonState
            comparison={comparison}
            onRetry={summary.onRetry}
          />
          <ReviewDetailsEye details={details} />
        </div>
      </div>
      <ReviewDetails details={details}>
        <div className="intent-story-detail">
          <ComparisonDetail
            comparison={comparison}
            completed={summary.story.completed}
          />
          {compare !== undefined && <RefreshComparison compare={compare} />}
        </div>
      </ReviewDetails>
    </>
  );
}
