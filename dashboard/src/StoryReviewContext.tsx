// Context follows the comparison actually shown, while each source of
// evidence keeps its own description and completion facts.
import {
  reviewTargetName,
  reviewsLanding,
  reviewsPublishedSession,
  reviewsSessionCommits,
  type StoryReview,
} from "./storyReviewContract.ts";
import { LandedContext } from "./StoryReviewLandedContext.tsx";
import { ContextLine } from "./StoryReviewContextLine.tsx";
import {
  SessionCommitsContext,
  sessionCommitsDescription,
} from "./StoryReviewSessionCommitsContext.tsx";
import {
  PublishedSessionContext,
  publishedSessionDescription,
} from "./StoryReviewPublishedSessionContext.tsx";

export function reviewDescription(review: StoryReview | undefined) {
  if (review?.kind === "published")
    return "Read-only: this completed story's fixed changes from published completion and execution history.";
  if (reviewsPublishedSession(review)) return publishedSessionDescription;
  if (review?.kind === "session-commits") return sessionCommitsDescription;
  if (review?.kind === "branch-result")
    return "Read-only: the branch and working files at Done, compared with the launch's starting revision.";
  if (reviewsSessionCommits(review))
    return "Read-only: this session's kept commits.";
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
  if (review?.kind === "published-session")
    return <PublishedSessionContext review={review} />;
  if (review?.kind === "session-commits")
    return <SessionCommitsContext review={review} />;
  if (review?.kind === "snapshot") return <ContextLine snapshot={review} />;
  if (review?.kind === "branch-result")
    return (
      <p>
        Done{" "}
        <time dateTime={review.doneAt}>
          {new Date(review.doneAt).toLocaleString()}
        </time>
      </p>
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
        Baseline <code>{review.baseline}</code>.
      </p>
      <p>
        Completion <code>{review.completion}</code>. Changes attributed from
        published execution history.
      </p>
    </div>
  );
}
