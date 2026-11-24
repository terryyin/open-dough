// The session comparison choices, run pickers and context in review details.
import type { ReactNode } from "react";
import { ReviewContext } from "./StoryReviewContext.tsx";
import { PublishedRangeSwitch } from "./StoryReviewSessionRuns.tsx";
import type { StoryReview } from "./storyReviewContract.ts";
import type { ReviewDetailsPlace } from "./StoryReviewToolbar.tsx";

export function reviewHoldsDetails(review: StoryReview | undefined) {
  return review?.kind === "landed" || review?.kind === "published-session";
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
  runKey,
  onRun,
}: {
  readonly details: ReviewDetailsPlace;
  readonly review: StoryReview | undefined;
  readonly runKey: string | undefined;
  readonly onRun: (run: string) => void;
}) {
  if (!reviewHoldsDetails(review)) return undefined;
  return (
    <ReviewDetails details={details}>
      {review.kind === "published-session" && review.ranges !== undefined && (
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
