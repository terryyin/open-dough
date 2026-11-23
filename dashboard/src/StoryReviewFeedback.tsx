// Session review progress, refresh and failures, beside the shared unread explanations.
import { RefreshedHistoricalComparison } from "./StoryReviewHistoricalOutcome.tsx";
import { changedFiles } from "./StoryReviewFileTree.tsx";
import {
  type ReviewRange,
  type StoryReview,
  type TakenStoryReview,
} from "./storyReviewContract.ts";
import type { ReviewReadState } from "./useReviewRead.ts";

type RangeRead = ReviewReadState<ReviewRange>;

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

// What a settled read of the chosen commits leaves unread.
export function unreadRange(range: RangeRead): UnreadComparison | undefined {
  if (range.reading) return undefined;
  if (range.problem !== undefined)
    return {
      failed: true,
      explanation: `The chosen commits could not be read: ${range.problem}`,
    };
  return range.answer?.kind === "unavailable"
    ? { failed: false, explanation: range.answer.explanation }
    : undefined;
}

export function KeptPublishedCommits({
  snapshot,
}: {
  readonly snapshot: TakenStoryReview | undefined;
}) {
  const published = snapshot?.published;
  if (published?.kept === undefined) return null;
  return (
    <p>
      This machine&apos;s Git cannot take the story&apos;s {published.commits}{" "}
      published {published.commits === 1 ? "commit" : "commits"} out of trunk,
      so All changes shows only what is not yet published.
    </p>
  );
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
    review?.kind === "landed" ||
    review?.kind === "session-commits" ||
    review?.kind === "published-session" ||
    review?.kind === "branch-result";
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
      {!reading && round > 0 && review?.kind === "session-commits" && (
        <p>
          Review refreshed: {changedFiles(review.files.length)} in the kept
          session commits.
        </p>
      )}
      {!reading && round > 0 && review?.kind === "published-session" && (
        <p>
          Review refreshed: {changedFiles(review.files.length)} in the published
          changes.
        </p>
      )}
      {!reading && round > 0 && review?.kind === "branch-result" && (
        <p>
          Review refreshed: {changedFiles(review.files.length)} in the branch
          result at Done.
        </p>
      )}
      {review?.kind === "landing-unavailable" && <p>{review.explanation}</p>}
      {review?.deliveryGap !== undefined && <p>{review.deliveryGap}</p>}
      {problem !== undefined && <p>{reviewReadFailure(problem)}</p>}
      {review?.kind === "unavailable" && <p>{review.explanation}</p>}
    </div>
  );
}
