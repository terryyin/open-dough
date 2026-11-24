// The selected story and comparison retained by Intent's evidence/reading
// owners, plus the story-only tree scope choice. The shared persistent
// header lives in IntentHeader; the page layout lives in IntentPage.

import {
  defaultReviewOf,
  otherThanDefaultChosen,
  type LensComparison,
} from "./IntentStoryComparison.tsx";
import type { IntentDoneRecord } from "./IntentStoryCoverage.tsx";
import { commitShaPattern } from "./authenticatedReadRules.ts";
import type { CiComparisonRange } from "./selectedCiComparison.ts";
import type { ShownStoryComparison } from "./storyComparisonShown.ts";

// The selected story as Intent names it.
// A completed story carries what is known of its published done record.
export type LensStory = {
  readonly identity: string;
  readonly title: string;
} & (
  | { readonly completed: false }
  | { readonly completed: true; readonly record: IntentDoneRecord }
);

// The selected story with the comparison read of it.
export type ComparedStory = {
  readonly lens: LensStory;
  readonly shown: ShownStoryComparison;
  // While another comparison than the default is chosen, the CI views'
  // whole-story note.
  readonly wholeStory: boolean;
};

// The "Selected story only" choice over a compared story's tree and whether
// no location's test file changed; only the locations browser has them.
export type StoryTreeScope = {
  readonly only: boolean;
  readonly noneInLocations: boolean;
  readonly onOnly: (only: boolean) => void;
};

// The selected story, what is known of its comparison, and the way to read
// it again after a failure.
export type StorySummary = {
  readonly story: LensStory;
  readonly comparison: LensComparison;
  readonly onRetry: () => void;
};

export function useStorySummary(
  story: LensStory | undefined,
  comparison: LensComparison,
  onRetry: () => void,
): StorySummary | undefined {
  return story === undefined ? undefined : { story, comparison, onRetry };
}

// Whether the CI views need the whole-story note beside the chosen comparison.
export function wholeStoryOf(
  summary: Pick<StorySummary, "comparison"> | undefined,
): boolean {
  return summary !== undefined && otherThanDefaultChosen(summary.comparison);
}

// The completed result owns the history endpoint while another comparison is
// chosen. When no endpoint remains after reading, explain its absence.
function publishedDoneEvidenceOf(summary: StorySummary | undefined) {
  if (summary?.story.completed !== true) return {};
  const { comparison } = summary;
  const review = defaultReviewOf(comparison);
  if (review?.kind === "published" && review.landingRevision !== undefined)
    return {
      doneEndpoint: {
        revision: review.landingRevision,
        at: review.completedAt,
      },
    };
  if (review?.kind === "landed")
    return {
      doneEndpoint: {
        revision: review.landing.revision,
        at: review.landing.receivedAt,
      },
    };
  if (comparison.state === "reading") return {};
  if (comparison.state === "failed")
    return { doneEndpointReason: comparison.problem };
  if (comparison.state === "unavailable")
    return {
      doneEndpointReason:
        comparison.explanation ??
        "The selected Done result’s published landing is unavailable.",
    };
  return {
    doneEndpointReason:
      review?.kind === "unavailable" || review?.kind === "landing-unavailable"
        ? review.explanation
        : "Published history does not identify this Done result’s represented landing.",
  };
}

function settledComparisonEvidenceOf(summary: StorySummary | undefined) {
  if (summary === undefined) return {};
  const { comparison } = summary;
  if (comparison.state !== "compared" || comparison.reading === true) return {};
  const { compare, review } = comparison;
  if (compare === undefined) return {};

  if (
    !summary.story.completed ||
    review?.kind !== "landed" ||
    compare.shown !== "landed" ||
    compare.selectedRun?.comparison === undefined ||
    compare.isDefault
  )
    return {};
  const { base, revision } = review.landing;
  return ciRangeEvidenceOf(base, revision);
}

function ciRangeEvidenceOf(
  start: string | undefined,
  end: string,
): { readonly selectedRange?: CiComparisonRange } {
  return start !== undefined &&
    commitShaPattern.test(start) &&
    commitShaPattern.test(end)
    ? { selectedRange: { start, end } }
    : {};
}

export function storyCiEvidenceOptionsOf(summary: StorySummary | undefined) {
  return {
    ...publishedDoneEvidenceOf(summary),
    ...settledComparisonEvidenceOf(summary),
  };
}

// "Selected story only" heading the Changes tree, with its message when
// no location's test file changed.
export function StoryTreeScopeChoice({
  scope,
}: {
  readonly scope: StoryTreeScope;
}) {
  return (
    <div className="intent-story-scope">
      <label className="intent-story-only">
        <input
          type="checkbox"
          checked={scope.only}
          onChange={(event) => {
            scope.onOnly(event.target.checked);
          }}
        />{" "}
        Selected story only
      </label>
      {scope.only && scope.noneInLocations && (
        <p className="intent-story-none" role="status">
          No test files in Intent locations changed in this story
        </p>
      )}
    </div>
  );
}
