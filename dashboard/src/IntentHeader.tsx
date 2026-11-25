// Intent's persistent header for project evidence or a selected story.
// Story metadata and comparison appear in that story's evidence context:
// its views, then the comparison bar whose row holds the files toggle, the
// comparison choice and the summary, directly above the story's view.

import type { ReactNode } from "react";
import { IntentStoryCompare } from "./IntentStoryCompare.tsx";
import { IntentComparisonBar } from "./IntentComparisonBar.tsx";
import { compareOf } from "./IntentStoryComparison.tsx";
import type { StorySummary } from "./IntentStorySummary.tsx";
import { shortRevision } from "./publishedWork.ts";
import { StoryComparisonFollowUp } from "./StoryAnchoredFollowUp.tsx";
import { StoryNotes } from "./StoryNotesControl.tsx";
import { intentStoryHeadingMarks } from "./storyCardFocus.ts";

export function IntentHeader({
  summary,
  source,
  browserRevision,
  filesToggle,
  tabBar,
}: {
  readonly summary: StorySummary | undefined;
  readonly source: string;
  readonly browserRevision: string | undefined;
  // A story's files toggle, which leads its comparison bar.
  readonly filesToggle: ReactNode;
  // A story's views, between its title rows and its comparison bar.
  readonly tabBar: ReactNode;
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
          {story?.title ?? "No story selected"}
        </h2>
        {story !== undefined && (
          <StoryNotes
            sourceId={source}
            identity={story.identity}
            title={story.title}
          />
        )}
        {story?.completed === true &&
          story.record.state === "read" &&
          summary?.comparison.state === "compared" && (
            <StoryComparisonFollowUp
              shown={summary.comparison.shown}
              story={story.record.story}
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
      {tabBar}
      {summary !== undefined && (
        <IntentComparisonBar
          key={summary.story.identity}
          summary={summary}
          compare={compare}
          leading={
            <>
              {filesToggle}
              {compare !== undefined && (
                <IntentStoryCompare compare={compare} />
              )}
            </>
          }
        />
      )}
    </section>
  );
}
