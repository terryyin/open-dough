// A story's default comparison follows the server's opening answer. The
// chosen comparison is read through Review changes' selection, keyed by the
// story and whether it is Done, so it equals the default until a choice is
// made, and a story becoming Done opens on its completed result.
// An active workspace shows all changes, including uncommitted work. Done
// Intent reads the completed result even while that workspace remains.

import { useRef, useState } from "react";
import {
  storyComparisonShown,
  type ShownStoryComparison,
} from "./storyComparisonShown.ts";
import { useStoryReviewOpening } from "./pageStoryReviewOpening.tsx";
import type { StoryReview } from "./storyReviewContract.ts";
import { useStoryReviewComparison } from "./useStoryReviewComparison.ts";
import { useStoryReviewSelection } from "./useStoryReviewSelection.ts";
import type { ReviewedStorySubject } from "./reviewedWorkSubject.ts";
import type { StoryCompare } from "./IntentStoryCompare.tsx";
import { shownChoice } from "./StoryReviewComparison.tsx";
import { unreadRange, type UnreadComparison } from "./StoryReviewFeedback.tsx";
import { useStateKeyedBy } from "./stateKeyedBy.ts";

// The comparison such a view reads of a workspace: all changes, with its
// uncommitted changes included as Review changes includes them at every
// opening.
const defaultStoryComparison = {
  chosen: "all",
  includeUncommitted: true,
} as const;

export function useStoryComparison({
  source,
  identity,
  completed,
  enabled,
}: {
  readonly source: string;
  readonly identity: string;
  readonly completed: boolean;
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
  readonly refreshed: boolean;
  // Reads the worktree again, keeping the choice.
  readonly onRefresh: () => void;
} {
  const subject: ReviewedStorySubject = { source, identity };
  // The choice and its refreshes belong to the story in its project. A story
  // becoming Done opens on its result.
  const opening = useStoryReviewOpening(source);
  const sequence =
    opening?.identity === identity ? opening.sequence : undefined;
  const [lastOpening, setLastOpening] = useState(sequence);
  if (sequence !== undefined && sequence !== lastOpening)
    setLastOpening(sequence);
  const keyedBy = JSON.stringify([
    source,
    identity,
    completed,
    sequence ?? lastOpening,
  ]);
  const { value: round, set: setRound } = useStateKeyedBy(0, keyedBy);
  const { value: includeMerged, set: setIncludeMerged } = useStateKeyedBy(
    false,
    keyedBy,
  );
  const onRefresh = () => {
    setRound(round + 1);
  };
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
      refreshed: false,
      onRefresh,
    };
  const storyShown = storyComparisonShown({
    subject,
    review,
    comparison,
    tree,
    includeMergedChanges: includeMerged,
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
  const includesMerged = shownKept?.includesMergedChanges === true;
  const canIncludeMerged =
    reviewKept?.kind === "published" && reviewKept.withMerged !== undefined;
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
    refreshed: round > 0,
    onRefresh,
    compare: !carry
      ? undefined
      : {
          shown: shownChoice(shown, review, selectedRun),
          isDefault:
            review === defaultReview &&
            !includesMerged &&
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
          includeMergedChanges: canIncludeMerged ? includesMerged : undefined,
          onIncludeMergedChanges: setIncludeMerged,
          onRefresh,
          reading: readingNow,
        },
  };
}
