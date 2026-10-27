// The story review's one status region: snapshot and range read progress,
// Refresh's displayed comparison counts, marking, read failures, and, for as
// long as the snapshot is shown, that this machine's Git kept a Trunk Mode
// story's published commits in its baseline.
import { shortRevision } from "./publishedWork.ts";
import { changedFiles } from "./StoryReviewFileTree.tsx";
import type { ShownComparison } from "./StoryReviewComparison.tsx";
import {
  baselineRevision,
  type MarkReviewedAnswer,
  type ReviewComparison,
  type ReviewRange,
  type StoryReview,
} from "./storyReviewContract.ts";
import type { useReviewRead } from "./useReviewRead.ts";

type RangeRead = ReturnType<typeof useReviewRead<ReviewRange>>;

export function ReviewFeedback({
  review,
  reading,
  problem,
  range,
  shown,
  comparison,
  since,
  round,
  made,
}: {
  readonly review: StoryReview | undefined;
  readonly reading: boolean;
  readonly problem: string | undefined;
  readonly range: RangeRead;
  readonly shown: ShownComparison;
  readonly comparison: ReviewComparison | undefined;
  readonly since: ReviewComparison | undefined;
  readonly round: number;
  readonly made: MarkReviewedAnswer | undefined;
}) {
  const snapshot = review?.kind === "snapshot" ? review : undefined;
  const kept =
    snapshot?.published?.kept === undefined ? undefined : snapshot.published;
  return (
    <div role="status">
      {shown === "commits" && <RangeFeedback range={range} />}
      {reading &&
        review?.kind !== "snapshot" &&
        review?.kind !== "landed" &&
        review?.kind !== "published" && (
          <p>Reading the story&apos;s changes…</p>
        )}
      {reading &&
        (review?.kind === "snapshot" ||
          review?.kind === "landed" ||
          review?.kind === "published") && (
          <p>
            Refreshing the review… What is shown is still the snapshot taken
            earlier.
          </p>
        )}
      {!reading &&
        round > 0 &&
        made === undefined &&
        snapshot !== undefined &&
        (shown === "commits" ? (
          comparison !== undefined && (
            <p>
              Review refreshed: {changedFiles(comparison.files.length)} in the
              chosen range.
            </p>
          )
        ) : since === undefined ? (
          <p>
            Review refreshed:{" "}
            {changedFiles((comparison ?? snapshot).files.length)} against
            baseline <code>{shortRevision(baselineRevision(snapshot))}</code>.
          </p>
        ) : (
          <p>
            Review refreshed: {changedFiles(since.files.length)} since the
            review.
          </p>
        ))}
      {!reading && round > 0 && review?.kind === "landed" && (
        <p>
          Review refreshed: {changedFiles(review.files.length)} in the captured
          landed comparison.
        </p>
      )}
      {!reading && round > 0 && review?.kind === "published" && (
        <p>
          Review refreshed: {changedFiles(review.files.length)} in the fixed
          published completion.
        </p>
      )}
      {kept !== undefined && (
        <p>
          This machine&apos;s Git cannot take the story&apos;s {kept.commits}{" "}
          published {kept.commits === 1 ? "commit" : "commits"} out of trunk, so
          All changes shows only what is not yet published.
        </p>
      )}
      {review?.kind === "landing-unavailable" && <p>{review.explanation}</p>}
      {made?.kind === "marked" && <p>Marked reviewed.</p>}
      {made?.kind === "unavailable" && <p>{made.explanation}</p>}
      {problem !== undefined && <p>The review could not be read: {problem}</p>}
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
  return (
    <>
      {range.reading && <p>Reading the chosen commits&apos; changes…</p>}
      {!range.reading && range.problem !== undefined && (
        <p>The chosen commits could not be read: {range.problem}</p>
      )}
      {!range.reading && range.answer?.kind === "unavailable" && (
        <p>{range.answer.explanation}</p>
      )}
    </>
  );
}
