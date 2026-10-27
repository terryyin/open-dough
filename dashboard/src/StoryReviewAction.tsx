// A Story card's action opens its story review (`./StoryReview.tsx`) in
// the Side panel (`./PageFrame.tsx`), replacing its previous content: offered from a kept launch workspace, including a retired
// landed run's captured result, or from the worktrees local Git found holding
// the story's claim, by the boundary's same selection rule: one is reviewed,
// and several open a review that names them. Closing the review returns the
// keyboard to this action. Every completed card offers the same action and
// permits the boundary to recover its published historical comparison.
// It leads with a review glyph and ends with an
// arrow toward the panel, both decorative.

import type { LaunchRecord } from "./launchRecord.ts";
import type { LocalWorkspace } from "./localWorkspace.ts";
import type { WorkEntry } from "./publishedWork.ts";
import { reviewWorkspaceOf } from "./storyReviewWorkspace.ts";
import { useOpenStoryReview } from "./pageStoryReviews.ts";
import { ArrowRight, GitCompare } from "lucide-react";
import { Icon } from "./Icon.tsx";
import "./story-review.css";

export function StoryReviewAction({
  records,
  workspaces,
  sourceId,
  work,
  completed = false,
}: {
  // This machine's kept launch records.
  readonly records: readonly LaunchRecord[] | undefined;
  // The worktrees local Git found holding a story's claim, for a story that
  // may hold one.
  readonly workspaces?: readonly LocalWorkspace[];
  readonly sourceId: string;
  readonly work: Pick<WorkEntry, "identity" | "title">;
  readonly completed?: boolean;
}) {
  const openStoryReview = useOpenStoryReview();
  if (
    !completed &&
    reviewWorkspaceOf(records, workspaces, sourceId, work.identity) ===
      undefined
  )
    return null;
  return (
    <div>
      <button
        type="button"
        className="start-launch-button"
        onClick={(event) => {
          openStoryReview({
            source: sourceId,
            identity: work.identity,
            title: work.title,
            control: event.currentTarget,
            ...(completed ? { completed } : {}),
          });
        }}
      >
        <Icon icon={GitCompare} />
        Review changes
        <Icon icon={ArrowRight} />
      </button>
    </div>
  );
}
