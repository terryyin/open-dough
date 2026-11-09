// Intent's persistent header for project evidence or a selected story.
// The common page supplies its navigation; story metadata, comparison and
// outside-location action appear only in that story's evidence context.

import { GitCompare } from "lucide-react";
import type { ReactNode } from "react";
import { Icon } from "./Icon.tsx";
import {
  CompactComparisonState,
  ComparisonDetail,
} from "./IntentStoryComparison.tsx";
import type { LensStory, StorySummary } from "./IntentStorySummary.tsx";
import { useOpenStoryReview } from "./pageStoryReviews.ts";
import { changedFiles } from "./StoryReviewFileTree.tsx";
import { defaultStoryComparison } from "./useStoryComparison.ts";

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

export function IntentHeader({
  summary,
  source,
  outside,
  navigation,
  projectVisit,
}: {
  readonly summary: StorySummary | undefined;
  readonly source: string;
  readonly outside: number | undefined;
  readonly navigation: ReactNode;
  readonly projectVisit: boolean;
}) {
  const story = summary?.story;
  return (
    <section
      className="intent-header"
      aria-label={story === undefined ? "Project Intent" : "Selected story"}
      data-state={summary?.comparison.state}
    >
      <p className="intent-story-crumb">
        {navigation}
        {navigation !== undefined && (
          <>
            {" "}
            <span aria-hidden="true">/</span>{" "}
          </>
        )}
        {story === undefined ? "Project Intent" : "Selected story"}
      </p>
      {story !== undefined && (
        <p className="intent-story-meta">
          {story.completed && <span className="intent-story-done">Done</span>}
          <span className="record-identity">{story.identity}</span>
        </p>
      )}
      <div className="intent-story-title-line">
        <h2 className="intent-story-title">
          {story?.title ??
            (projectVisit ? "Project Intent" : "No story selected")}
        </h2>
        {story !== undefined && outside !== undefined && (
          <StoryOutsideLocations
            source={source}
            story={story}
            outside={outside}
          />
        )}
      </div>
      {summary !== undefined && (
        <>
          <CompactComparisonState
            comparison={summary.comparison}
            onRetry={summary.onRetry}
          />
          <div className="intent-story-detail">
            <ComparisonDetail comparison={summary.comparison} />
          </div>
        </>
      )}
    </section>
  );
}
