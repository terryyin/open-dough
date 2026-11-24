// Keep a story's displayed published comparison while refreshing its evidence.

import { useRef, useState } from "react";
import {
  storyComparisonShown,
  type ShownStoryComparison,
} from "./storyComparisonShown.ts";
import { useStoryReviewOpening } from "./pageStoryReviewOpening.tsx";
import type { StoryReview } from "./storyReviewContract.ts";
import { useStoryReviewSelection } from "./useStoryReviewSelection.ts";
import type { ReviewedStorySubject } from "./reviewedWorkSubject.ts";
import type { StoryCompare } from "./IntentStoryCompare.tsx";
import type { UnreadComparison } from "./StoryReviewFeedback.tsx";
import { useStateKeyedBy } from "./stateKeyedBy.ts";

export function useStoryComparison({
  source,
  identity,
  completed,
  taken,
  enabled,
}: {
  readonly source: string;
  readonly identity: string;
  readonly completed: boolean;
  readonly taken: boolean;
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
  // The published comparison and available retained landing choices.
  readonly compare: StoryCompare | undefined;
  // Why the chosen comparison cannot be read, once settled.
  readonly unreadable?: UnreadComparison | undefined;
  readonly refreshed: boolean;
  // Reread publication evidence, keeping the choice.
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
    taken,
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
    reading,
    problem,
    onChoose,
    onRun,
    runs,
    selectedRun,
    runUnread,
    published,
  } = useStoryReviewSelection({
    subject,
    round,
    completed,
    taken,
    enabled,
    historical: completed,
    keyedBy,
    followsDefault: true,
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
    includeMergedChanges: includeMerged,
  });
  // A selection read keeps the previous answer until the new one arrives.
  // That answer belongs to this story only when this story already showed a
  // comparison; another story's answer must not become this story's.
  const sameStory = shownMemory.current?.key === keyedBy;
  const carry = !reading || sameStory;
  if (storyShown !== undefined && !reading)
    shownMemory.current = { key: keyedBy, shown: storyShown, review };
  const remembered = sameStory && reading ? shownMemory.current : undefined;
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
  const readingNow = reading;
  const includesMerged = shownKept?.includesMergedChanges === true;
  const canIncludeMerged =
    (reviewKept?.kind === "published" ||
      reviewKept?.kind === "published-taken") &&
    reviewKept.withMerged !== undefined;
  const unreadable =
    readingNow || shownKept !== undefined ? undefined : runUnread;
  const hasPublishedChoice =
    published !== undefined ||
    (completed && defaultReview?.kind === "unavailable");
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
          shown:
            selectedRun !== undefined
              ? "landed"
              : hasPublishedChoice
                ? "published"
                : undefined,
          isDefault: review === defaultReview && !includesMerged,
          published: hasPublishedChoice,
          runs,
          selectedRun,
          onRun,
          onChoose,
          includeMergedChanges: canIncludeMerged ? includesMerged : undefined,
          onIncludeMergedChanges: setIncludeMerged,
          onRefresh,
          reading: readingNow,
        },
  };
}
