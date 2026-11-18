// Context follows the comparison actually shown, while each source of
// evidence keeps its own description and completion facts.
import { reviewsLanding, type StoryReview } from "./storyReviewContract.ts";
import { LandedContext } from "./StoryReviewLandedContext.tsx";
import { ContextLine } from "./StoryReviewContextLine.tsx";
import {
  SessionCommitsContext,
  sessionCommitsDescription,
} from "./StoryReviewSessionCommitsContext.tsx";

export function reviewDescription(review: StoryReview | undefined) {
  if (review?.kind === "published")
    return "Read-only: this completed story's fixed changes from published completion and execution history.";
  if (review?.kind === "session-commits") return sessionCommitsDescription;
  return reviewsLanding(review)
    ? "Read-only: this landed run's fixed delivered change from its captured base to its accepted revision."
    : "Read-only: what this story's worktree would add to trunk, as it was when the review opened or was last refreshed.";
}

export function ReviewContext({
  review,
}: {
  readonly review: StoryReview | undefined;
}) {
  if (review?.kind === "landed")
    return <LandedContext landing={review.landing} />;
  if (review?.kind === "session-commits")
    return <SessionCommitsContext review={review} />;
  if (review?.kind === "snapshot") return <ContextLine snapshot={review} />;
  if (review?.kind !== "published") return null;
  return (
    <div>
      <h3>Published completion</h3>
      <p>
        {review.agent} · Completed{" "}
        <time dateTime={review.completedAt}>
          {new Date(review.completedAt).toLocaleString()}
        </time>{" "}
        · {review.remote}/{review.target}
      </p>
      <p>
        Completion <code>{review.completion}</code>. Changes attributed from
        published execution history.
      </p>
    </div>
  );
}
