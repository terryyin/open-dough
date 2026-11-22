// Review details and whether they hold anything to reveal: choices, run
// pickers, context and the uncommitted check, independently of file count.
import type { ReactNode } from "react";
import {
  ComparisonSwitch,
  UncommittedCheck,
  type ComparisonChoice,
} from "./StoryReviewComparison.tsx";
import { ReviewContext } from "./StoryReviewContext.tsx";
import { RunChoice } from "./StoryReviewRunChoice.tsx";
import {
  SessionComparisonSwitch,
  PublishedRangeSwitch,
  SessionRunSwitch,
} from "./StoryReviewSessionRuns.tsx";
import type { SessionComparisonKey } from "./sessionReviewComparisons.ts";
import type { SessionRunChoice } from "./sessionCommits.ts";
import type {
  ReviewItem,
  StoryReview,
  TakenStoryReview,
} from "./storyReviewContract.ts";
import type { ReviewRunChoice } from "./storyReviewLandedRun.ts";
import type { ReviewDetailsPlace } from "./StoryReviewToolbar.tsx";

export function reviewHoldsDetails({
  review,
  runs,
  workspaceChoices,
  sessionRuns,
  sessionComparisonKeys,
  selectedRun,
}: {
  readonly review: StoryReview | undefined;
  readonly runs: readonly ReviewRunChoice[];
  readonly workspaceChoices: boolean;
  readonly sessionRuns: readonly SessionRunChoice[];
  readonly sessionComparisonKeys: readonly SessionComparisonKey[] | undefined;
  readonly selectedRun: ReviewRunChoice | undefined;
}) {
  if (runs.length > 0 || workspaceChoices) return true;
  if (sessionRuns.length > 1 || sessionComparisonKeys !== undefined)
    return true;
  if (selectedRun !== undefined) return true;
  return (
    review?.kind === "landed" ||
    review?.kind === "session-commits" ||
    review?.kind === "published-session" ||
    review?.kind === "branch-result" ||
    review?.kind === "snapshot" ||
    review?.kind === "published"
  );
}

// The details the eye reveals: the comparison choices, the run picker, the
// context of the comparison shown and the uncommitted check. Escape from
// inside hides them and returns the keyboard to the eye.
function ReviewDetails({
  details,
  children,
}: {
  readonly details: ReviewDetailsPlace;
  readonly children: ReactNode;
}) {
  return (
    <div
      id={details.id}
      className="story-review-details"
      role="group"
      aria-label="Review details"
      hidden={!details.shown}
      onKeyDown={(event) => {
        if (event.key !== "Escape") return;
        event.preventDefault();
        event.stopPropagation();
        details.onShow(false, true);
      }}
    >
      {children}
    </div>
  );
}

export function StoryReviewDetailsSection({
  details,
  review,
  runs,
  items,
  sessionRuns,
  sessionComparisonKeys,
  selectedRun,
  runKey,
  shownComparison,
  workspace,
  availablePublished,
  committed,
  includeUncommitted,
  onChoose,
  onRun,
  setIncludeUncommitted,
}: {
  readonly details: ReviewDetailsPlace;
  readonly review: StoryReview | undefined;
  readonly runs: readonly ReviewRunChoice[];
  readonly items: readonly ReviewItem[];
  readonly sessionRuns: readonly SessionRunChoice[];
  readonly sessionComparisonKeys: readonly SessionComparisonKey[] | undefined;
  readonly selectedRun: ReviewRunChoice | undefined;
  readonly runKey: string | undefined;
  readonly shownComparison: ComparisonChoice;
  readonly workspace: TakenStoryReview | undefined;
  readonly availablePublished: StoryReview | undefined;
  readonly committed: TakenStoryReview["committed"];
  readonly includeUncommitted: boolean;
  readonly onChoose: (choice: ComparisonChoice) => void;
  readonly onRun: (run: string) => void;
  readonly setIncludeUncommitted: (include: boolean) => void;
}) {
  if (
    !reviewHoldsDetails({
      review,
      runs,
      workspaceChoices: items.length > 0,
      sessionRuns,
      sessionComparisonKeys,
      selectedRun,
    })
  )
    return undefined;
  return (
    <ReviewDetails details={details}>
      {(runs.length > 0 || items.length > 0) && (
        <ComparisonSwitch
          shown={shownComparison}
          onSwitch={onChoose}
          workspace={workspace !== undefined}
          commits={items.length > 0}
          landed={runs.length > 0}
          published={availablePublished !== undefined}
        />
      )}
      {sessionComparisonKeys !== undefined && (
        <SessionComparisonSwitch
          keys={sessionComparisonKeys}
          selected={runKey}
          onSelect={onRun}
        />
      )}
      {sessionRuns.length > 1 &&
        (sessionComparisonKeys === undefined ||
          review?.kind === "session-commits") && (
          <SessionRunSwitch
            label={
              sessionComparisonKeys === undefined
                ? undefined
                : "Default main runs"
            }
            runs={sessionRuns}
            selected={runKey}
            onSelect={onRun}
          />
        )}
      {review?.kind === "published-session" && review.ranges !== undefined && (
        <PublishedRangeSwitch
          ranges={review.ranges}
          selected={runKey}
          onSelect={onRun}
        />
      )}
      {selectedRun !== undefined && (
        <RunChoice runs={runs} selected={selectedRun} onSelect={onRun} />
      )}
      <ReviewContext review={review} />
      {review?.kind === "snapshot" && committed !== undefined && (
        <UncommittedCheck
          included={includeUncommitted}
          onInclude={setIncludeUncommitted}
        />
      )}
    </ReviewDetails>
  );
}
