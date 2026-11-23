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
      <ReviewContext review={review} />
      {review?.kind === "snapshot" && (
        <>
          <p>
            Head {rev(review.head)}
            {!uncommittedLeftOut && <>, uncommitted changes included</>}.
          </p>
          <KeptPublishedCommits snapshot={review} />
        </>
      )}
      {review?.kind !== "snapshot" &&
        review?.kind !== "published" &&
        review?.kind !== "landed" && (
          <p>
            Compared {rev(shown.comparison.from)} with tree {rev(shown.tree)}.
          </p>
        )}
    </div>
  );
}
