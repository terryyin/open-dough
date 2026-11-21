// What the selected story's summary (`./IntentStorySummary.tsx`) says of its
// comparison: compact, briefly while it is reading, unavailable, or failed,
// the failure with a retry; behind the disclosure, the full explanation or the
// revisions it runs between, read as Review changes reads them
// (`./useStoryComparison.ts`). Neither gap reads as a story without changes.

import { shortRevision } from "./publishedWork.ts";
import type { ShownStoryComparison } from "./storyComparisonShown.ts";
import { ComparedRange, type StoryCompare } from "./IntentStoryCompare.tsx";
import { baselineRevision, type StoryReview } from "./storyReviewContract.ts";

// What Intent knows of the selected story's comparison.
export type LensComparison =
  | { readonly state: "reading" }
  | { readonly state: "unavailable"; readonly explanation?: string }
  | { readonly state: "failed"; readonly problem: string }
  | {
      readonly state: "compared";
      readonly shown: ShownStoryComparison;
      // The chosen comparison's review read.
      readonly review: StoryReview | undefined;
      // The default review read: the completed result's owner.
      readonly defaultReview: StoryReview | undefined;
      // The choice of what is compared, while the story has a workspace.
      readonly compare?: StoryCompare | undefined;
    };

// The two sides the comparison runs between, as Review changes names them.
function ComparedRevisions({
  shown,
  review,
}: {
  readonly shown: ShownStoryComparison;
  readonly review: StoryReview | undefined;
}) {
  const from =
    review?.kind === "snapshot"
      ? baselineRevision(review)
      : shown.comparison.from;
  const rev = (revision: string) => (
    <code title={revision}>{shortRevision(revision)}</code>
  );
  return (
    <p className="intent-story-revisions">
      Compared {rev(from)} with{" "}
      {review?.kind === "snapshot" ? (
        <>
          worktree <code>{review.workspace}</code> at {rev(review.head)},
          uncommitted changes included
        </>
      ) : review?.kind === "published" ? (
        <>completion {rev(review.completion)}</>
      ) : (
        <>the landed run&apos;s tree {rev(shown.tree)}</>
      )}
      .
    </p>
  );
}

const unavailableWords =
  "No comparison is available for this story: no workspace on this machine holds it.";

// What the compact summary says of a comparison it cannot show yet or at all.
export function CompactComparisonState({
  comparison,
  onRetry,
}: {
  readonly comparison: LensComparison;
  readonly onRetry: () => void;
}) {
  if (comparison.state === "reading")
    return (
      <p className="intent-story-state quiet" role="status">
        Reading the story&apos;s changes…
      </p>
    );
  if (comparison.state === "unavailable")
    return (
      <p className="intent-story-state" role="status">
        No comparison is available.
      </p>
    );
  if (comparison.state === "failed")
    return (
      <p className="intent-story-state" role="alert">
        The story&apos;s changes could not be read.{" "}
        <button type="button" onClick={onRetry}>
          Retry
        </button>
      </p>
    );
  return null;
}

// The full explanation, or the compared revisions, behind the disclosure.
export function ComparisonDetail({
  comparison,
  completed = false,
}: {
  readonly comparison: LensComparison;
  readonly completed?: boolean;
}) {
  if (comparison.state === "reading") return null;
  if (comparison.state === "unavailable")
    return (
      <p className="intent-story-problem">
        {comparison.explanation ?? unavailableWords}{" "}
        {completed
          ? "The story's historical test source is unavailable."
          : "Intent shows the published tree without the story's changes."}
      </p>
    );
  if (comparison.state === "failed")
    return (
      <p className="intent-story-problem">
        {comparison.problem}{" "}
        {completed
          ? "The story's historical test source is unavailable."
          : "Intent shows the published tree without them."}
      </p>
    );
  return comparison.compare?.shown === "commits" ? (
    <ComparedRange compare={comparison.compare} />
  ) : (
    <ComparedRevisions shown={comparison.shown} review={comparison.review} />
  );
}
