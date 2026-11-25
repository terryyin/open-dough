// A historical story comparison and the file and line actions use the same
// Follow up dialog and carry the target from the review it opened on.

import { useContext } from "react";
import { useDoneStoryFollowUp } from "./doneStoryFollowUp.ts";
import type { DiffLineSide } from "./DiffLineNumber.tsx";
import type { DoneStory } from "./doneRecord.ts";
import type { FollowUpFile, FollowUpTarget } from "./followUpRequest.ts";
import { StoryFollowUpSession } from "./FollowUp.tsx";
import { LaunchesOnPage, usePageLaunches } from "./pageLaunches.ts";
import type { ReviewedFile } from "./storyReviewFiles.ts";
import type { ReviewedWork } from "./reviewedFileRead.ts";
import {
  isReviewedPublishedSessionSubject,
  reviewedStoryIdentity,
} from "./reviewedWorkSubject.ts";
import { reviewedFilePaths } from "./reviewedFileContext.ts";
import type { ShownStoryComparison } from "./storyComparisonShown.ts";

export function useReviewedStoryFollowUp(
  reviewed: ReviewedWork,
  shownStory?: DoneStory,
) {
  const story = useDoneStoryFollowUp(
    reviewedStoryIdentity(reviewed.subject) ?? reviewed.publishedStory,
    shownStory,
  );
  return story?.sourceId === reviewed.subject.source ? story : undefined;
}

function namedStoryComparison({ completion, reference }: ReviewedWork) {
  if (completion !== undefined) return { completion };
  if (reference !== undefined) return { reference };
  return undefined;
}

// A file names its literal path and the exact pair shown by its review.
export function fileFollowUpTarget(
  reviewed: ReviewedWork,
  baseline: string,
  tree: string,
  file: ReviewedFile,
  line?: { readonly line: number; readonly side: DiffLineSide },
): FollowUpFile | undefined {
  const { subject } = reviewed;
  const comparison = isReviewedPublishedSessionSubject(subject)
    ? { published: subject.published }
    : namedStoryComparison(reviewed);
  if (comparison === undefined) return undefined;
  return { ...reviewedFilePaths(file), baseline, tree, ...comparison, ...line };
}

function DoneStoryAnchoredFollowUp({
  reviewed,
  target,
  shownStory,
  autoOpen = false,
  showTrigger = true,
  onClosed,
}: {
  readonly reviewed: ReviewedWork;
  readonly target: FollowUpTarget | undefined;
  readonly shownStory?: DoneStory;
  readonly autoOpen?: boolean;
  readonly showTrigger?: boolean;
  readonly onClosed?: () => void;
}) {
  const launches = usePageLaunches();
  const story = useReviewedStoryFollowUp(reviewed, shownStory);
  if (story === undefined || target === undefined) return null;
  return (
    <StoryFollowUpSession
      {...story}
      launches={launches}
      target={target}
      autoOpen={autoOpen}
      showTrigger={showTrigger}
      {...(onClosed === undefined ? {} : { onClosed })}
    />
  );
}

export function StoryComparisonFollowUp({
  shown: { reviewed, comparison, tree },
  story,
}: {
  readonly shown: ShownStoryComparison;
  readonly story: DoneStory;
}) {
  const launches = useContext(LaunchesOnPage);
  const name = namedStoryComparison(reviewed);
  if (name === undefined || launches === undefined) return null;
  return (
    <DoneStoryAnchoredFollowUp
      reviewed={reviewed}
      shownStory={story}
      target={{
        ...name,
        baseline: comparison.from,
        tree,
      }}
    />
  );
}

// Follow up from a Done story's file header in Review changes or Intent.
export function StoryFileFollowUp({
  reviewed,
  from,
  tree,
  file,
}: {
  readonly reviewed: ReviewedWork;
  readonly from: string;
  readonly tree: string;
  readonly file: ReviewedFile;
}) {
  return (
    <DoneStoryAnchoredFollowUp
      reviewed={reviewed}
      target={fileFollowUpTarget(reviewed, from, tree, file)}
    />
  );
}

// Follow up from a Done story's line-number menu: same dialog as the file
// header for one line and side; unmounts when the dialog closes.
export function StoryLineFollowUp({
  reviewed,
  from,
  tree,
  file,
  line,
  side,
  onClosed,
}: {
  readonly reviewed: ReviewedWork;
  readonly from: string;
  readonly tree: string;
  readonly file: ReviewedFile;
  readonly line: number;
  readonly side: DiffLineSide;
  readonly onClosed: () => void;
}) {
  return (
    <DoneStoryAnchoredFollowUp
      reviewed={reviewed}
      target={fileFollowUpTarget(reviewed, from, tree, file, { line, side })}
      autoOpen
      showTrigger={false}
      onClosed={onClosed}
    />
  );
}
