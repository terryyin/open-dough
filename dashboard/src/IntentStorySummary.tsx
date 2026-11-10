// The selected story and comparison retained by Intent's evidence/reading
// owners, plus the story-only tree scope choice. The shared persistent
// header lives in IntentHeader; the page layout lives in IntentPage.

import type { LensComparison } from "./IntentStoryComparison.tsx";
import type { IntentDoneRecord } from "./IntentStoryCoverage.tsx";
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

// The completed result owns the history endpoint, even when newer publications
// share its story identity or the measured CI build is a later revision.
export function publishedDoneEndpointOf(
  storySummary: StorySummary | undefined,
) {
  const review =
    storySummary?.comparison.state === "compared"
      ? storySummary.comparison.review
      : undefined;
  return storySummary?.story.completed !== true
    ? undefined
    : review?.kind === "published"
      ? review.landingRevision === undefined
        ? undefined
        : { revision: review.landingRevision, at: review.completedAt }
      : review?.kind === "landed"
        ? { revision: review.landing.revision, at: review.landing.receivedAt }
        : undefined;
}

// Absence while reading is pending; a settled owner must explain absence.
export function publishedDoneEndpointReasonOf(
  storySummary: StorySummary | undefined,
): string | undefined {
  if (
    storySummary?.story.completed !== true ||
    publishedDoneEndpointOf(storySummary) !== undefined
  )
    return undefined;
  const comparison = storySummary.comparison;
  if (comparison.state === "reading") return undefined;
  if (comparison.state === "failed") return comparison.problem;
  if (comparison.state === "unavailable")
    return (
      comparison.explanation ??
      "The selected Done result’s published landing is unavailable."
    );
  const review = comparison.review;
  return review?.kind === "unavailable" ||
    review?.kind === "landing-unavailable"
    ? review.explanation
    : "Published history does not identify this Done result’s represented landing.";
}

// "Selected story only" heading the Changed tests tree, with its message when
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
