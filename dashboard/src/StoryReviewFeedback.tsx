// A review read's unread explanations and its failed sync from origin.
import { Moment } from "./Moment.tsx";
import type { ReviewSyncFailure, StoryReview } from "./storyReviewContract.ts";
import type { ReviewReadState } from "./useReviewRead.ts";

// Why a settled read holds no comparison, as this region says it: a failed
// read, which reading again may mend, or an answer explaining what is missing.
export type UnreadComparison = {
  readonly failed: boolean;
  readonly explanation: string;
};

const reviewReadFailure = (problem: string) =>
  `The review could not be read: ${problem}`;

// What a settled review read leaves unread.
export function unreadReview(
  read: ReviewReadState<StoryReview>,
): UnreadComparison | undefined {
  if (read.reading) return undefined;
  if (read.problem !== undefined)
    return { failed: true, explanation: reviewReadFailure(read.problem) };
  return read.answer?.kind === "unavailable"
    ? { failed: false, explanation: read.answer.explanation }
    : undefined;
}

// The failed sync from origin a review answered with, if any.
export const reviewSyncFailure = (review: StoryReview | undefined) =>
  review !== undefined && "syncFailure" in review
    ? review.syncFailure
    : undefined;

// The comparison shown is the last synced one: the sync from origin failed.
export function ReviewSyncNotice({
  failure: { problem, lastSyncedAt },
}: {
  readonly failure: ReviewSyncFailure;
}) {
  return (
    <>
      Review not refreshed: origin could not be synced ({problem}). What is
      shown was last synced{" "}
      {lastSyncedAt === undefined ? (
        "earlier"
      ) : (
        <>
          at <Moment at={new Date(lastSyncedAt)} />
        </>
      )}
      .
    </>
  );
}
