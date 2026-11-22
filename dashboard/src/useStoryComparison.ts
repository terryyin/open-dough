// A story's default comparison follows the server's opening answer. The
// chosen comparison is read through Review changes' selection, keyed by the
// story and whether it is Done, so it equals the default until a choice is
// made, and a story becoming Done opens on its completed result.
// An active workspace shows all changes, including uncommitted work. Done
// Intent reads the completed result even while that workspace remains.

import { useRef } from "react";
import {
  storyComparisonShown,
  type ShownStoryComparison,
} from "./storyComparisonShown.ts";
import type { RequestedComparison } from "./pageStoryReviews.ts";
import type { StoryReview } from "./storyReviewContract.ts";
import { useStoryReviewComparison } from "./useStoryReviewComparison.ts";
import { useStoryReviewSelection } from "./useStoryReviewSelection.ts";
import type { ReviewedStorySubject } from "./reviewedWorkSubject.ts";
import type { StoryCompare } from "./IntentStoryCompare.tsx";
import { shownChoice } from "./StoryReviewComparison.tsx";
import { unreadRange, type UnreadComparison } from "./StoryReviewFeedback.tsx";

// The comparison such a view reads of a workspace: all changes, with its
// uncommitted changes included as Review changes includes them at every
// opening.
export const defaultStoryComparison: RequestedComparison = {
  chosen: "all",
  includeUncommitted: true,
};

export function useStoryComparison({
  source,
  identity,
  completed,
  round,
  onRefresh,
  enabled,
}: {
  readonly source: string;
  readonly identity: string;
  readonly completed: boolean;
  // How many times the reader asked for a new read.
  readonly round: number;
  // Reads the worktree again, keeping the choice.
  readonly onRefresh: () => void;
  // A disabled comparison reads nothing and shows none.
  readonly enabled: boolean;
}): {
  // The chosen review read, which explains a comparison it cannot show.
  readonly review: StoryReview | undefined;
  // The default review read, which owns the story's completed result.
  readonly defaultReview: StoryReview | undefined;
  readonly reading: boolean;
  readonly problem: string | undefined;
  readonly shown: ShownStoryComparison | undefined;
  // The choice of what is compared, while the story has a workspace, a
  // published completion or captured landed runs.
  readonly compare: StoryCompare | undefined;
  // Why the chosen comparison cannot be read, once settled.
  readonly unreadable?: UnreadComparison | undefined;
} {
  const subject: ReviewedStorySubject = { source, identity };
  // The choice is the story's, and a story becoming Done opens on its result.
  const keyedBy = `${identity}${completed ? " done" : ""}`;
  // The last comparison this story showed, kept while a newer read is in flight.
  const shownMemory = useRef<
    | {
        readonly key: string;
        readonly shown: ShownStoryComparison;
        readonly review: StoryReview | undefined;
      }
    | undefined
  >(undefined);
  const {
    defaultReview,
    review,
    snapshot,
    reading,
    problem,
    chosen,
    onChoose,
    onRun,
    runs,
    selectedRun,
    runUnread,
    published,
    includeUncommitted,
    setIncludeUncommitted,
  } = useStoryReviewSelection({
    subject,
    round,
    completed,
    enabled,
    historical: completed,
    keyedBy,
    followsDefault: true,
  });
  const {
    comparison,
    tree,
    committed,
    items,
    selectedItems,
    shown,
    onSelect,
    trunkIntegrated,
    range,
  } = useStoryReviewComparison({
    subject,
    snapshot,
    chosen,
    includeUncommitted,
    keyedBy,
    round,
    active: enabled && !completed && review?.selectedRun === undefined,
  });
  if (!enabled)
    return {
      review: undefined,
      defaultReview: undefined,
      reading: false,
      problem: undefined,
      shown: undefined,
      compare: undefined,
    };
  const storyShown = storyComparisonShown({
    subject,
    review,
    comparison,
    tree,
  });
  // A selection read keeps the previous answer until the new one arrives.
  // That answer belongs to this story only when this story already showed a
  // comparison; another story's answer must not become this story's.
  const sameStory = shownMemory.current?.key === keyedBy;
  const carry = !reading || sameStory;
  if (storyShown !== undefined && !reading)
    shownMemory.current = { key: keyedBy, shown: storyShown, review };
  const remembered =
    sameStory && (reading || range.reading) ? shownMemory.current : undefined;
  const shownKept = !carry
    ? undefined
    : reading
      ? remembered?.shown
      : (storyShown ?? remembered?.shown);
  // The review that produced the comparison still on screen. A chosen run
  // leaves the live review unset until its answer matches.
  const reviewKept = !carry
    ? undefined
    : reading
      ? remembered?.review
      : storyShown !== undefined
        ? review
        : (remembered?.review ?? review);
  const readingNow = reading || (carry && range.reading);
  // A chosen run other than the answer's own, or a chosen commit range, read
  // as the Side panel review explains them.
  const unreadable =
    readingNow || shownKept !== undefined
      ? undefined
      : (runUnread ?? (shown === "commits" ? unreadRange(range) : undefined));
  return {
    review: reviewKept,
    defaultReview: carry ? defaultReview : undefined,
    reading: readingNow,
    problem,
    unreadable,
    shown: shownKept,
    compare:
      !carry ||
      ((snapshot === undefined || review?.kind !== "snapshot") &&
        published === undefined &&
        runs.length === 0)
        ? undefined
        : {
            shown: shownChoice(shown, review, selectedRun),
            isDefault:
              review === defaultReview &&
              chosen === defaultStoryComparison.chosen &&
              includeUncommitted === defaultStoryComparison.includeUncommitted,
            workspace: snapshot !== undefined,
            published: published !== undefined,
            runs,
            selectedRun,
            onRun,
            items,
            selectedItems,
            trunkIntegrated,
            onChoose,
            onSelect,
            includeUncommitted:
              committed === undefined || review?.kind !== "snapshot"
                ? undefined
                : includeUncommitted,
            onIncludeUncommitted: setIncludeUncommitted,
            onRefresh,
            reading: readingNow,
          },
  };
}
