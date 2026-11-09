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
