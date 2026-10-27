// Context and browser visibility follow the comparison actually shown, while
// each source of evidence keeps its own description and completion facts.
import type { StoryReview, ReviewComparison } from "./storyReviewContract.ts";
import { LandedContext } from "./StoryReviewLandedContext.tsx";
import { ContextLine } from "./StoryReviewContextLine.tsx";
import {
  FileBrowserToggle,
  type FileBrowserPlace,
} from "./StoryReviewBrowserToggle.tsx";

export function reviewDescription(review: StoryReview | undefined) {
  if (review?.kind === "published")
    return "Read-only: this completed story's fixed changes from published completion and execution history.";
  return review?.kind !== "landed" && review?.kind !== "landing-unavailable"
    ? "Read-only: what this story's worktree would add to trunk, as it was when the review opened or was last refreshed."
    : "Read-only: this landed run's fixed delivered change from its captured base to its accepted revision.";
}

export function ReviewContext({
  review,
  comparison,
  browser,
  onShowBrowser,
}: {
  readonly review: StoryReview | undefined;
  readonly comparison: ReviewComparison | undefined;
  readonly browser: FileBrowserPlace;
  readonly onShowBrowser: (shown: boolean) => void;
}) {
  if (review?.kind === "landed")
    return (
      <LandedContext
        landing={review.landing}
        {...(review.files.length === 0 ? {} : { browser })}
        onShowBrowser={onShowBrowser}
      />
    );
  if (review?.kind === "snapshot")
    return (
      <ContextLine
        snapshot={review}
        {...(comparison === undefined || comparison.files.length === 0
          ? {}
          : { browser })}
        onShowBrowser={onShowBrowser}
      />
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
        · {review.remote}/{review.target}
      </p>
      <p>
        Completion <code>{review.completion}</code>. Changes attributed from
        published execution history.
      </p>
      {review.files.length > 0 && (
        <FileBrowserToggle browser={browser} onShowBrowser={onShowBrowser} />
      )}
    </div>
  );
}
