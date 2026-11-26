// What the selected story's summary (`./IntentStorySummary.tsx`) says of its
// comparison: compact, briefly while it is reading, unavailable, or failed,
// the failure with a retry; behind the disclosure, the full explanation or the
// revisions it runs between, read as Review changes reads them
// (`./useStoryComparison.ts`). Neither gap reads as a story without changes.

import { shortRevision } from "./publishedWork.ts";
import { useIntentCiEvidence } from "./IntentCiEvidence.tsx";
import {
  measuredStoryResult,
  selectedComparisonOf,
} from "./intentCiEvidenceModel.ts";
import type { ShownStoryComparison } from "./storyComparisonShown.ts";
import type { StoryCompare } from "./IntentStoryCompare.tsx";
import type { StoryReview } from "./storyReviewContract.ts";
import type { ReviewInitialSyncFeedback } from "./useReviewRead.ts";
import { IntentReviewInitialSync } from "./IntentReviewInitialSync.tsx";
import {
  ComparedContext,
  EmptyHistoricalContext,
  RefreshedComparison,
} from "./IntentComparedContext.tsx";
import {
  ReviewSyncNotice,
  reviewSyncFailure,
  type UnreadComparison,
} from "./StoryReviewFeedback.tsx";
import { storyChangesGapWords as gapWords } from "./storyChangesGapWords.ts";

// What Intent knows of the selected story's comparison.
export type LensComparison =
  | {
      readonly state: "reading";
      readonly initialSync?: ReviewInitialSyncFeedback | undefined;
      // Kept while the first comparison, or a later one, is still in flight.
      readonly defaultReview?: StoryReview | undefined;
      readonly compare?: StoryCompare | undefined;
    }
  | {
      readonly state: "unavailable";
      readonly explanation?: string;
      readonly unavailableLanding?: true;
      readonly compare?: StoryCompare | undefined;
    }
  | {
      readonly state: "failed";
      readonly problem: string;
      readonly compare?: StoryCompare | undefined;
    }
  | {
      readonly state: "compared";
      readonly shown: ShownStoryComparison;
      // The chosen comparison's review read.
      readonly review: StoryReview | undefined;
      // The default review read: the completed result's owner.
      readonly defaultReview: StoryReview | undefined;
      // The choice of what is compared, while the story has a workspace.
      readonly compare?: StoryCompare | undefined;
      // The last comparison stays while a newer read is in flight.
      readonly reading?: boolean;
      readonly refreshed?: boolean;
    }
  // A chosen comparison that cannot be read, with the choice still offered.
  | {
      readonly state: "unreadable";
      readonly unreadable: UnreadComparison;
      readonly defaultReview: StoryReview | undefined;
      readonly compare: StoryCompare;
    };

// The default review read, while a comparison is chosen.
export const defaultReviewOf = (comparison: LensComparison) =>
  comparison.state === "compared" ||
  comparison.state === "unreadable" ||
  comparison.state === "reading"
    ? comparison.defaultReview
    : undefined;

// The choice of what is compared, while one is offered.
export const compareOf = (comparison: LensComparison) => comparison.compare;

// Whether a comparison other than the story's default is chosen.
export const otherThanDefaultChosen = (comparison: LensComparison) =>
  compareOf(comparison)?.isDefault === false;

export function WholeStoryNote({
  whole,
  coverage = false,
}: {
  readonly whole: boolean | undefined;
  readonly coverage?: boolean;
}) {
  const evidence = useIntentCiEvidence();
  if (!whole || (!coverage && selectedComparisonOf(evidence) !== undefined))
    return null;
  const revision = measuredStoryResult(evidence);
  return (
    <p className="intent-story-whole quiet" role="note">
      Describes the whole story
      {revision !== undefined && (
        <>
          {" "}
          at build <code title={revision}>{shortRevision(revision)}</code>
        </>
      )}
      , not the chosen comparison.
    </p>
  );
}

const unavailableWords =
  "No comparison is available for this story: no published changes are recorded.";

export const hasUnavailableComparisonSource = (
  comparison: LensComparison | undefined,
) =>
  (comparison?.state === "unavailable" &&
    comparison.unavailableLanding === true) ||
  ((comparison?.state === "unreadable" || comparison?.state === "failed") &&
    comparison.compare?.shown === "landed");

// What the compact summary says of a comparison it cannot show yet or at all.
export function CompactComparisonState({
  comparison,
  onRetry,
}: {
  readonly comparison: LensComparison;
  readonly onRetry: () => void;
}) {
  if (comparison.state === "reading" && comparison.initialSync !== undefined)
    return <IntentReviewInitialSync sync={comparison.initialSync} />;
  if (
    comparison.state === "reading" ||
    (comparison.state === "compared" && comparison.reading === true)
  )
    return (
      <p className="intent-story-state quiet" role="status">
        {gapWords.reading}
        {comparison.state === "compared" &&
          " The previous comparison stays visible."}
      </p>
    );
  const syncFailure =
    comparison.state === "compared"
      ? reviewSyncFailure(comparison.review)
      : undefined;
  if (syncFailure !== undefined)
    return (
      <p className="intent-story-state" role="status">
        <ReviewSyncNotice failure={syncFailure} />
      </p>
    );
  if (comparison.state === "unavailable")
    return (
      <p className="intent-story-state" role="status">
        {gapWords.unavailable}
      </p>
    );
  if (comparison.state === "failed")
    return (
      <p className="intent-story-state" role="alert">
        {gapWords.failed}{" "}
        <button type="button" onClick={onRetry}>
          Retry
        </button>
      </p>
    );
  if (comparison.state === "unreadable")
    return (
      <p className="intent-story-state" role="alert">
        {gapWords.unreadable}
        {comparison.unreadable.failed && (
          <>
            {" "}
            <button type="button" onClick={onRetry}>
              Retry
            </button>
          </>
        )}
      </p>
    );
  return comparison.refreshed ? (
    <RefreshedComparison
      review={comparison.review}
      count={comparison.shown.comparison.files.length}
    />
  ) : null;
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
        {comparison.explanation ?? unavailableWords}
        {!hasUnavailableComparisonSource(comparison) &&
          (completed
            ? " The story's historical test source is unavailable."
            : " Intent shows the published tree without the story's changes.")}
      </p>
    );
  if (comparison.state === "failed")
    return (
      <p className="intent-story-problem">
        {comparison.problem}{" "}
        {!hasUnavailableComparisonSource(comparison) &&
          (completed
            ? "The story's historical test source is unavailable."
            : "Intent shows the published tree without them.")}
      </p>
    );
  if (comparison.state === "unreadable")
    return (
      <>
        <p className="intent-story-problem">
          {comparison.unreadable.explanation}
          {!hasUnavailableComparisonSource(comparison) &&
            " Intent shows the published tree without the chosen changes."}
        </p>
      </>
    );
  const { review, shown } = comparison;
  return (
    <>
      <ComparedContext shown={shown} review={review} />
      {shown.comparison.files.length === 0 && (
        <EmptyHistoricalContext review={review} />
      )}
    </>
  );
}
