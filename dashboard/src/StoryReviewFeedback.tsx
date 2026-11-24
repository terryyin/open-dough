// Session review progress, refresh and failures, beside the shared unread explanations.
import { RefreshedHistoricalComparison } from "./StoryReviewHistoricalOutcome.tsx";
import { changedFiles } from "./StoryReviewFileTree.tsx";
import type { StoryReview } from "./storyReviewContract.ts";
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

export function ReviewFeedback({
  review,
  reading,
  problem,
  round,
}: {
  readonly review: StoryReview | undefined;
  readonly reading: boolean;
  readonly problem: string | undefined;
  readonly round: number;
}) {
  // A review already showing changes stays shown while it is read again.
  const showsChanges =
    review?.kind === "landed" || review?.kind === "published-session";
  return (
    <div role="status">
      {reading && !showsChanges && <p>Reading the story&apos;s changes…</p>}
      {reading && showsChanges && (
        <p>
          Refreshing the review… What is shown is still the snapshot taken
          earlier.
        </p>
      )}
      {!reading && round > 0 && review?.kind === "landed" && (
        <RefreshedHistoricalComparison
          kind={review.kind}
          count={review.files.length}
        />
      )}
      {!reading && round > 0 && review?.kind === "published-session" && (
        <p>
          Review refreshed: {changedFiles(review.files.length)} in the published
          changes.
        </p>
      )}
      {review?.kind === "landing-unavailable" && <p>{review.explanation}</p>}
      {problem !== undefined && <p>{reviewReadFailure(problem)}</p>}
      {review?.kind === "unavailable" && <p>{review.explanation}</p>}
    </div>
  );
}
