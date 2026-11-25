// Intent's persistent header for project evidence or a selected story.
// The common page supplies its navigation; story metadata and comparison
// appear only in that story's evidence context.

import type { ReactNode } from "react";
import { IntentStoryCompare } from "./IntentStoryCompare.tsx";
import {
  CompactComparisonState,
  ComparisonDetail,
  compareOf,
} from "./IntentStoryComparison.tsx";
import type { StorySummary } from "./IntentStorySummary.tsx";
import { shortRevision } from "./publishedWork.ts";
import { StoryNotes } from "./StoryNotesControl.tsx";
import { intentStoryHeadingMarks } from "./storyCardFocus.ts";

export function IntentHeader({
  summary,
  source,
  navigation,
  projectVisit,
  browserRevision,
}: {
  readonly summary: StorySummary | undefined;
  readonly source: string;
  readonly navigation: ReactNode;
  readonly projectVisit: boolean;
  readonly browserRevision: string | undefined;
}) {
  const story = summary?.story;
  const compare =
    summary === undefined ? undefined : compareOf(summary.comparison);
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
        <h2
          className="intent-story-title"
          {...(story === undefined
            ? undefined
            : intentStoryHeadingMarks(source, story.identity))}
        >
          {story?.title ??
            (projectVisit ? "Project Intent" : "No story selected")}
        </h2>
        {story !== undefined && (
          <StoryNotes
            sourceId={source}
            identity={story.identity}
            title={story.title}
          />
        )}
      </div>
      {story === undefined && browserRevision !== undefined && (
        <p
          className="intent-browser-revision"
          aria-label="Test browser revision"
        >
          Test browser at{" "}
          <code title={browserRevision}>{shortRevision(browserRevision)}</code>
        </p>
      )}
      {summary !== undefined && (
        <>
          <CompactComparisonState
            comparison={summary.comparison}
            onRetry={summary.onRetry}
          />
          <div className="intent-story-detail">
            <ComparisonDetail
              comparison={summary.comparison}
              completed={summary.story.completed}
            />
            {compare !== undefined && <IntentStoryCompare compare={compare} />}
          </div>
        </>
      )}
    </section>
  );
}
