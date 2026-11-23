// The story review's one status region: snapshot and range read progress,
// Refresh's displayed comparison counts, read failures, and, for as
// long as the snapshot is shown, that this machine's Git kept a Trunk Mode
// story's published commits in its baseline.
import { RefreshedHistoricalComparison } from "./StoryReviewHistoricalOutcome.tsx";
import { RefreshedWorkspaceComparison } from "./StoryReviewWorkspaceOutcome.tsx";
import { changedFiles } from "./StoryReviewFileTree.tsx";
import type { ShownComparison } from "./StoryReviewComparison.tsx";
import {
  type ReviewComparison,
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
  range,
  shown,
  comparison,
  round,
}: {
  readonly review: StoryReview | undefined;
  readonly reading: boolean;
  readonly problem: string | undefined;
  readonly range: RangeRead;
  readonly shown: ShownComparison;
  readonly comparison: ReviewComparison | undefined;
  readonly round: number;
}) {
  const snapshot = review?.kind === "snapshot" ? review : undefined;
  // A review already showing changes stays shown while it is read again.
  const showsChanges =
    review?.kind === "snapshot" ||
    review?.kind === "landed" ||
    review?.kind === "session-commits" ||
    review?.kind === "published-session" ||
    review?.kind === "branch-result" ||
    review?.kind === "published";
  return (
    <div role="status">
      {shown === "commits" && <RangeFeedback range={range} />}
      {reading && !showsChanges && <p>Reading the story&apos;s changes…</p>}
      {reading && showsChanges && (
        <p>
          Refreshing the review… What is shown is still the snapshot taken
          earlier.
        </p>
      )}
      {!reading &&
        round > 0 &&
        snapshot !== undefined &&
        (shown !== "commits" || comparison !== undefined) && (
          <RefreshedWorkspaceComparison
            snapshot={snapshot}
            count={(comparison ?? snapshot).files.length}
            commitsReview={shown === "commits"}
          />
        )}
      {!reading &&
        round > 0 &&
        (review?.kind === "landed" || review?.kind === "published") && (
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
      <KeptPublishedCommits snapshot={snapshot} />
      {review?.kind === "landing-unavailable" && <p>{review.explanation}</p>}
      {review?.deliveryGap !== undefined && <p>{review.deliveryGap}</p>}
      {problem !== undefined && <p>{reviewReadFailure(problem)}</p>}
      {review?.kind === "unavailable" && (
        <p>
          {review.explanation}
          {review.workspace !== undefined && (
            <>
              {" "}
              Worktree <code>{review.workspace}</code>.
            </>
          )}
        </p>
      )}
    </div>
  );
}

// Range feedback is rendered in the panel's one status region.
function RangeFeedback({ range }: { readonly range: RangeRead }) {
  const unread = unreadRange(range);
  return (
    <>
      {range.reading && <p>Reading the chosen commits&apos; changes…</p>}
      {unread !== undefined && <p>{unread.explanation}</p>}
    </>
  );
}
