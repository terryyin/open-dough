// Context follows the comparison actually shown, while each source of
// evidence keeps its own description and completion facts.
import { reviewTargetName, type StoryReview } from "./storyReviewContract.ts";
import { shortRevision } from "./publishedWork.ts";
import { LandedContext } from "./StoryReviewLandedContext.tsx";
import type { ShownStoryComparison } from "./storyComparisonShown.ts";
import { PublishedSessionContext } from "./StoryReviewPublishedSessionContext.tsx";

export function publishedTakenScope(
  review: Extract<StoryReview, { kind: "published-taken" }>,
) {
  return review.mode === "trunk" ? "published trunk" : "its published branch";
}

export function ReviewContext({
  review,
  shown,
}: {
  readonly review: StoryReview | undefined;
  readonly shown?: ShownStoryComparison;
}) {
  if (review?.kind === "landed")
    return <LandedContext landing={review.landing} />;
  if (review?.kind === "published-session")
    return <PublishedSessionContext review={review} />;
  if (review?.kind === "published-taken")
    return (
      <div>
        <h3>
          {review.mode === "trunk"
            ? "Published trunk"
            : "Published story branch"}
        </h3>
        <p>
          {review.agent} · {reviewTargetName(review)}
        </p>
        <p>
          Baseline <code>{shown?.comparison.from ?? review.baseline}</code>.
        </p>
        <p>
          Head <code title={review.head}>{shortRevision(review.head)}</code>.
        </p>
      </div>
    );
  if (review?.kind !== "published") return null;
  return (
    <div>
      <h3>Published completion</h3>
      <p>
        {review.agent} · Completed{" "}
        <time dateTime={review.completedAt}>
          {new Date(review.completedAt).toLocaleString()}
        </time>{" "}
        · {reviewTargetName(review)}
      </p>
      <p>
        Baseline <code>{shown?.comparison.from ?? review.baseline}</code>.
      </p>
      <p>
        Completion <code>{review.completion}</code>.{" "}
        {shown?.includesMergedChanges === true
          ? "Net changes from the recorded story start."
          : "Changes attributed from published execution history."}
      </p>
    </div>
  );
}
