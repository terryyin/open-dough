// A Story card opens its Changes in Intent when its comparison is offered.

import type { LaunchRecord } from "./launchRecord.ts";
import type { LocalWorkspace } from "./localWorkspace.ts";
import type { WorkEntry } from "./publishedWork.ts";
import {
  hasRecordedStoryBranch,
  storyComparisonOffered,
} from "./storyReviewWorkspace.ts";
import { useOpenStoryChanges } from "./pageStoryReviewOpening.tsx";
import { ReviewChangesButton } from "./ReviewChangesButton.tsx";
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
  readonly work: Pick<WorkEntry, "identity" | "owner">;
  readonly completed?: boolean;
}) {
  const openStoryChanges = useOpenStoryChanges();
  if (
    !storyComparisonOffered(
      records,
      workspaces,
      sourceId,
      work.identity,
      completed || hasRecordedStoryBranch(work.owner),
    )
  )
    return null;
  return (
    <ReviewChangesButton
      onClick={() =>
        openStoryChanges?.({ project: sourceId, identity: work.identity })
      }
    />
  );
}
