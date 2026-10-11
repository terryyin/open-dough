// A story's card action that opens its story review (`./storyReview.ts`) in
// the page's side panel (`./StoryReviewPanel.tsx`), in place of whatever the
// panel showed: offered from a kept launch workspace, including a retired
// landed run's captured result, or from the one worktree local Git found
// holding the story's claim, by the boundary's same selection rule. Closing the
// review returns the keyboard to this action. It leads with a review glyph
// and ends with an arrow toward the panel, both decorative.

import type { LaunchRecord } from "./launchRecord.ts";
import type { LocalWorkspace } from "./localWorkspace.ts";
import type { WorkEntry } from "./publishedWork.ts";
import { reviewWorkspaceOf } from "./storyReviewWorkspace.ts";
import { useOpenStoryReview } from "./pageReviews.ts";
import { ArrowRight, GitCompare } from "lucide-react";
import { Icon } from "./Icon.tsx";
import "./story-review.css";

export function StoryReviewAction({
  records,
  workspaces,
  sourceId,
  work,
}: {
  // This machine's kept launch records.
  readonly records: readonly LaunchRecord[] | undefined;
  // The worktrees local Git found holding a story's claim, for a story that
  // may hold one.
  readonly workspaces?: readonly LocalWorkspace[];
  readonly sourceId: string;
  readonly work: Pick<WorkEntry, "identity" | "title">;
}) {
  const openReview = useOpenStoryReview();
  if (
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
          openReview({
            source: sourceId,
            identity: work.identity,
            title: work.title,
            control: event.currentTarget,
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
