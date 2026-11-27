// Keep a story's displayed published comparison while refreshing its evidence.

import { useRef, useState } from "react";
import type { LaunchRecord } from "./launchRecord.ts";
import {
  storyComparisonShown,
  type ShownStoryComparison,
} from "./storyComparisonShown.ts";
import { useStoryReviewOpening } from "./pageStoryReviewOpening.tsx";
import type { StoryReview } from "./storyReviewContract.ts";
import { useStoryReviewSelection } from "./useStoryReviewSelection.ts";
import { useStorySessionScope } from "./useStorySessionScope.ts";
import type { ReviewedWorkSubject } from "./reviewedWorkSubject.ts";
import type { StoryCompare } from "./IntentStoryCompare.tsx";
import type { UnreadComparison } from "./StoryReviewFeedback.tsx";
import { useStateKeyedBy } from "./stateKeyedBy.ts";
import type { ReviewInitialSyncFeedback } from "./useReviewRead.ts";

export function useStoryComparison({
  source,
  identity,
  completed,
  taken,
  enabled,
  records,
}: {
  // This machine's retained launches, which name the story's sessions.
  readonly records?: readonly LaunchRecord[] | undefined;
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
  readonly initialSync?: ReviewInitialSyncFeedback | undefined;
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
  // The choice and its refreshes belong to the story in its project. A story
  // becoming Done opens on its result.
  const opening = useStoryReviewOpening(source);
  const sequence =
    opening?.identity === identity ? opening.sequence : undefined;
  const [lastOpening, setLastOpening] = useState(opening);
  if (sequence !== undefined && sequence !== lastOpening?.sequence)
    setLastOpening(opening);
  const explicitOpening =
    sequence ??
    (lastOpening?.identity === identity && lastOpening.project === source
      ? lastOpening.sequence
      : undefined);
  const keyedBy = JSON.stringify([
    source,
    identity,
    completed,
    taken,
    explicitOpening,
  ]);
  const storySubject: ReviewedWorkSubject = { source, identity };
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
  // The story's selection keeps its choices while a session is chosen; its
  // default answer owns the story's completed result either way.
  const storySelection = useStoryReviewSelection({
    subject: storySubject,
    round,
    completed,
    taken,
    enabled,
    historical: completed,
    keyedBy,
    followsDefault: true,
    followInitialSync: explicitOpening !== undefined,
  });
  const sessionScope = useStorySessionScope({
    records,
    source,
    identity,
    round,
    enabled,
    keyedBy,
  });
  const { sessions, session, onSession, scopeKey, ranges } = sessionScope;
  // The reviewed scope: the chosen session, otherwise the whole story.
  const subject = sessionScope.subject ?? storySubject;
  const defaultReview = storySelection.defaultReview;
  const {
    review,
    reading,
    problem,
    onChoose,
    onRun,
    runs,
    selectedRun,
    runKey,
    runUnread,
    published,
    initialSync,
  } = sessionScope.selection ?? storySelection;
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
  const sameStory = shownMemory.current?.key === scopeKey;
  const carry = !reading || sameStory;
  if (storyShown !== undefined && !reading)
    shownMemory.current = { key: scopeKey, shown: storyShown, review };
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
    sessionScope.unreadable ??
    (readingNow || shownKept !== undefined ? undefined : runUnread);
  const hasPublishedChoice =
    published !== undefined ||
    (completed && defaultReview?.kind === "unavailable");
  return {
    review: reviewKept,
    defaultReview: carry ? defaultReview : undefined,
    reading: readingNow,
    initialSync,
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
          sessions,
          session,
          onSession,
          ...(ranges === undefined ? {} : { ranges, runKey }),
        },
  };
}
