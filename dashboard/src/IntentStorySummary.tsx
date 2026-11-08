// The selected story as Intent shows it (`./IntentStoryView.tsx`): one
// persistent header, led by the way to Project Intent, above the story's
// views (`./intentStoryTabs.tsx`), drawn
// whether locations are still read, unavailable, or browsed, so the title
// appears once and never collapses. It names the story by its full title
// under its identity, marked Done once completed, with what its comparison
// says (`./IntentStoryComparison.tsx`),
// briefly while it is reading, unavailable, or failed with a retry, and the
// revisions it runs between or the full explanation. Once the comparison and
// the location inventory are known, the title line ends with the count of
// changed files outside every Intent location, the Review changes action that
// shows them. The Changed tests tree (`./IntentBrowser.tsx`) offers "Selected
// story only", off until chosen, which says so when no test file in a
// location changed. **Intent coverage** is its own view
// (`./IntentStoryCoverage.tsx`).
// Intent itself stays at its published revision (ADR 0008).

import { GitCompare } from "lucide-react";
import type { ReactNode } from "react";
import {
  CompactComparisonState,
  ComparisonDetail,
  type LensComparison,
} from "./IntentStoryComparison.tsx";
import type { IntentDoneRecord } from "./IntentStoryCoverage.tsx";
import { useOpenStoryReview } from "./pageStoryReviews.ts";
import type { ShownStoryComparison } from "./storyComparisonShown.ts";
import { changedFiles } from "./StoryReviewFileTree.tsx";
import { Icon } from "./Icon.tsx";
import { defaultStoryComparison } from "./useStoryComparison.ts";
import "./intent-story-summary.css";

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

const outsideWords = (count: number) =>
  `${changedFiles(count)} outside Intent locations — open Review changes`;

// How many of the story's changed files no Intent location admits, as an
// icon and the count that open Review changes, which shows them, explained by
// its name and hover text; nothing when there are none.
function StoryOutsideLocations({
  source,
  story,
  outside,
}: {
  readonly source: string;
  readonly story: LensStory;
  readonly outside: number;
}) {
  const openStoryReview = useOpenStoryReview();
  if (outside === 0) return null;
  return (
    <button
      type="button"
      className="intent-story-outside"
      aria-label={outsideWords(outside)}
      title={outsideWords(outside)}
      onClick={(event) => {
        openStoryReview({
          source,
          identity: story.identity,
          title: story.title,
          control: event.currentTarget,
          comparison: defaultStoryComparison,
          ...(story.completed ? { completed: true } : {}),
        });
      }}
    >
      <Icon icon={GitCompare} />
      {outside}
    </button>
  );
}

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

export function IntentStoryHeader({
  summary: { story, comparison, onRetry },
  source,
  outside,
  crumb,
}: {
  readonly summary: StorySummary;
  readonly source: string;
  // Changed files outside every Intent location, once the comparison and the
  // locations are both known.
  readonly outside: number | undefined;
  // The way to Project Intent, leading the header.
  readonly crumb: ReactNode;
}) {
  return (
    <section
      className="intent-story-summary"
      aria-label="Selected story"
      data-state={comparison.state}
    >
      <p className="intent-story-crumb">
        {crumb} <span aria-hidden="true">/</span> Selected story
      </p>
      <p className="intent-story-meta">
        {story.completed && <span className="intent-story-done">Done</span>}
        <span className="record-identity">{story.identity}</span>
      </p>
      <div className="intent-story-title-line">
        <h2 className="intent-story-title">{story.title}</h2>
        {outside !== undefined && (
          <StoryOutsideLocations
            source={source}
            story={story}
            outside={outside}
          />
        )}
      </div>
      <CompactComparisonState comparison={comparison} onRetry={onRetry} />
      <div className="intent-story-detail">
        <ComparisonDetail comparison={comparison} />
      </div>
    </section>
  );
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
