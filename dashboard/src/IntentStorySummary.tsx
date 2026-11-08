// The selected story's summary at the top of Intent's Intent reading mode:
// above the locations tree (`./IntentBrowser.tsx`) or above the explanation
// shown in its place (`./IntentPerspective.tsx`), so the tab names the story
// that scopes it. Compact, it names the story by its title on one line, the
// full title on hover, with what its comparison briefly says
// (`./IntentStoryComparison.tsx`); the published tree stays usable beneath.
// Over a tree of a compared story it also offers "Selected story only", off
// until chosen, which says so when no test file in a location changed. Its
// title line ends with the count of changed files outside every Intent
// location, which opens Review changes to show them. A disclosure, collapsed
// at first and kept only while Intent shows, reveals the full title, the
// identity, and the comparison's revisions or full explanation; it changes
// nothing else. Intent itself stays at its published revision (ADR 0008).

import { useId } from "react";
import { GitCompare } from "lucide-react";
import type { DoneStory } from "./doneStories.ts";
import {
  CompactComparisonState,
  ComparisonDetail,
  type LensComparison,
} from "./IntentStoryComparison.tsx";
import { useOpenStoryReview } from "./pageStoryReviews.ts";
import type { ShownStoryComparison } from "./storyComparisonShown.ts";
import { changedFiles } from "./StoryReviewFileTree.tsx";
import { Icon } from "./Icon.tsx";
import { defaultStoryComparison } from "./useStoryComparison.ts";
import "./intent-story-summary.css";

// The selected story as Intent names it.
export type LensStory = {
  readonly identity: string;
  readonly title: string;
  readonly completed: boolean;
  readonly intentCoverage?: DoneStory["intentCoverage"];
};

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

// The "Selected story only" choice over a compared story's tree, whether no
// location's test file changed, and the count of changed files outside the
// locations; only the locations browser has them.
export type StoryTreeScope = {
  readonly source: string;
  readonly outside: number;
  readonly only: boolean;
  readonly noneInLocations: boolean;
  readonly onOnly: (only: boolean) => void;
};

// The selected story, what is known of its comparison, the way to read it
// again after a failure, and whether the summary is expanded, as Intent's
// reading mode shows them. The perspective owns the expansion, so it
// survives the explanation giving way to the tree.
export type StorySummary = {
  readonly story: LensStory;
  readonly comparison: LensComparison;
  readonly onRetry: () => void;
  readonly expanded: boolean;
  readonly onExpand: (expanded: boolean) => void;
};

export function IntentStorySummary({
  summary: { story, comparison, onRetry, expanded, onExpand },
  scope,
}: {
  readonly summary: StorySummary;
  readonly scope?: StoryTreeScope | undefined;
}) {
  const detailId = useId();
  const coverage = story.intentCoverage;
  return (
    <section
      className="intent-story-summary"
      aria-label="Selected story"
      data-state={comparison.state}
    >
      <div className="intent-story-title-line">
        <button
          type="button"
          className="intent-story-disclosure"
          aria-expanded={expanded}
          aria-controls={detailId}
          title={story.title}
          onClick={() => {
            onExpand(!expanded);
          }}
        >
          <span className="intent-story-name">
            <span className="intent-story-kind">Story</span>{" "}
            <strong>{story.title}</strong>
          </span>
        </button>
        {scope !== undefined && (
          <StoryOutsideLocations
            source={scope.source}
            story={story}
            outside={scope.outside}
          />
        )}
      </div>
      <CompactComparisonState comparison={comparison} onRetry={onRetry} />
      <div id={detailId} className="intent-story-detail" hidden={!expanded}>
        <p className="intent-story-full-title">
          <strong>{story.title}</strong>{" "}
          <span className="record-identity">{story.identity}</span>
        </p>
        <ComparisonDetail comparison={comparison} />
        {story.completed && coverage !== undefined && (
          <div className="intent-story-coverage">
            <h3>Intent coverage</h3>
            {"report" in coverage ? (
              <p className="intent-story-coverage-text">{coverage.report}</p>
            ) : (
              <>
                <p>
                  <strong>Unavailable</strong>
                </p>
                <p className="intent-story-coverage-text">
                  {coverage.unavailable}
                </p>
              </>
            )}
          </div>
        )}
      </div>
      {scope !== undefined && (
        <>
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
        </>
      )}
    </section>
  );
}
