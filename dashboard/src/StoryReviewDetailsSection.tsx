// The session comparison choices, run pickers and context in review details.
import type { ReactNode } from "react";
import { ReviewContext } from "./StoryReviewContext.tsx";
import {
  SessionComparisonSwitch,
  PublishedRangeSwitch,
  SessionRunSwitch,
} from "./StoryReviewSessionRuns.tsx";
import type { SessionComparisonKey } from "./sessionReviewComparisons.ts";
import type { SessionRunChoice } from "./sessionCommits.ts";
import type { StoryReview } from "./storyReviewContract.ts";
import type { ReviewDetailsPlace } from "./StoryReviewToolbar.tsx";

export function reviewHoldsDetails({
  review,
  sessionRuns,
  sessionComparisonKeys,
}: {
  readonly review: StoryReview | undefined;
  readonly sessionRuns: readonly SessionRunChoice[];
  readonly sessionComparisonKeys: readonly SessionComparisonKey[] | undefined;
}) {
  if (sessionRuns.length > 1 || sessionComparisonKeys !== undefined)
    return true;
  return (
    review?.kind === "landed" ||
    review?.kind === "session-commits" ||
    review?.kind === "published-session" ||
    review?.kind === "branch-result"
  );
}

// The details the eye reveals: the comparison choices and context. Escape from
// inside hides them and returns the keyboard to the eye.
function ReviewDetails({
  details,
  children,
}: {
  readonly details: ReviewDetailsPlace;
  readonly children: ReactNode;
}) {
  return (
    <div
      id={details.id}
      className="story-review-details"
      role="group"
      aria-label="Review details"
      hidden={!details.shown}
      onKeyDown={(event) => {
        if (event.key !== "Escape") return;
        event.preventDefault();
        event.stopPropagation();
        details.onShow(false, true);
      }}
    >
      {children}
    </div>
  );
}

export function StoryReviewDetailsSection({
  details,
  review,
  sessionRuns,
  sessionComparisonKeys,
  runKey,
  onRun,
}: {
  readonly details: ReviewDetailsPlace;
  readonly review: StoryReview | undefined;
  readonly sessionRuns: readonly SessionRunChoice[];
  readonly sessionComparisonKeys: readonly SessionComparisonKey[] | undefined;
  readonly runKey: string | undefined;
  readonly onRun: (run: string) => void;
}) {
  if (!reviewHoldsDetails({ review, sessionRuns, sessionComparisonKeys }))
    return undefined;
  return (
    <ReviewDetails details={details}>
      {sessionComparisonKeys !== undefined && (
        <SessionComparisonSwitch
          keys={sessionComparisonKeys}
          selected={runKey}
          onSelect={onRun}
        />
      )}
      {sessionRuns.length > 1 &&
        (sessionComparisonKeys === undefined ||
          review?.kind === "session-commits") && (
          <SessionRunSwitch
            label={
              sessionComparisonKeys === undefined
                ? undefined
                : "Execution checkout runs"
            }
            runs={sessionRuns}
            selected={runKey}
            onSelect={onRun}
          />
        )}
      {review?.kind === "published-session" && review.ranges !== undefined && (
        <PublishedRangeSwitch
          ranges={review.ranges}
          selected={runKey}
          onSelect={onRun}
        />
      )}
      <ReviewContext review={review} />
    </ReviewDetails>
  );
}
