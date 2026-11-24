import { RefreshedWorkspaceComparison } from "./StoryReviewWorkspaceOutcome.tsx";
import {
  emptyLandedReview,
  emptyPublishedReview,
  RefreshedHistoricalComparison,
} from "./StoryReviewHistoricalOutcome.tsx";
import { shortRevision } from "./publishedWork.ts";
import type { ShownStoryComparison } from "./storyComparisonShown.ts";
import type { StoryReview } from "./storyReviewContract.ts";
import { ReviewContext } from "./StoryReviewContext.tsx";
import { KeptPublishedCommits } from "./StoryReviewFeedback.tsx";

// The facts of the comparison Intent is currently showing.
export function ComparedContext({
  shown,
  review,
  uncommittedLeftOut,
}: {
  readonly shown: ShownStoryComparison;
  readonly review: StoryReview | undefined;
  readonly uncommittedLeftOut: boolean;
}) {
  const rev = (revision: string) => (
    <code title={revision}>{shortRevision(revision)}</code>
  );
  return (
    <div className="intent-story-revisions intent-story-comparison-context">
      <ReviewContext review={review} shown={shown} />
      {review?.kind === "snapshot" && (
        <>
          <p>
            Head {rev(review.head)}
            {!uncommittedLeftOut && <>, uncommitted changes included</>}.
          </p>
          <KeptPublishedCommits snapshot={review} />
          {review.mergedChangesUnavailable !== undefined && (
            <p>{review.mergedChangesUnavailable}</p>
          )}
        </>
      )}
      {review?.kind !== "snapshot" &&
        review?.kind !== "published" &&
        review?.kind !== "published-taken" &&
        review?.kind !== "landed" && (
          <p>
            Compared {rev(shown.comparison.from)} with tree {rev(shown.tree)}.
          </p>
        )}
    </div>
  );
}

export function EmptyHistoricalContext({
  review,
}: {
  readonly review: StoryReview | undefined;
}) {
  if (review?.kind === "landed") return <p>{emptyLandedReview}</p>;
  if (review?.kind === "published") return <p>{emptyPublishedReview}</p>;
  if (review?.kind === "published-taken")
    return <p>No changes attributed to this story on its published branch.</p>;
  return null;
}

export function RefreshedComparison({
  review,
  count,
  commitsReview,
}: {
  readonly review: StoryReview | undefined;
  readonly count: number;
  readonly commitsReview: boolean;
}) {
  const result =
    review?.kind === "snapshot" ? (
      <RefreshedWorkspaceComparison
        snapshot={review}
        count={count}
        commitsReview={commitsReview}
      />
    ) : review?.kind === "published-taken" ? (
      <p>
        Review refreshed at published head{" "}
        <code>{shortRevision(review.head)}</code>.
      </p>
    ) : review?.kind === "landed" || review?.kind === "published" ? (
      <RefreshedHistoricalComparison kind={review.kind} count={count} />
    ) : null;
  return result === null ? null : (
    <div className="intent-story-state" role="status">
      {result}
    </div>
  );
}
