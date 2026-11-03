// The selected story's lens over Intent (`./IntentPerspective.tsx`): which
// story Intent is scoped to and what its comparison says. With a
// comparison, the revisions it compares, read as Review changes reads them
// (`./useStoryComparison.ts`); the locations browser says how many changed
// files lie outside every Intent location, which Review changes shows
// (`StoryOutsideLocations`), and offers "Selected story only", off until
// chosen, which says so when no test file in a location changed
// (`StoryChangesScope`). A story with no comparison
// Review changes could offer (`storyComparisonOffered`) and a read that
// failed each have their own explanation, the failure with a retry; neither
// reads as a story without changes, and the published tree stays usable
// beneath. Intent itself stays at its published revision (ADR 0008).

import { shortRevision } from "./publishedWork.ts";
import { useOpenStoryReview } from "./pageStoryReviews.ts";
import type { ShownStoryComparison } from "./storyComparisonShown.ts";
import { baselineRevision, type StoryReview } from "./storyReviewContract.ts";
import { changedFiles } from "./StoryReviewFileTree.tsx";
import { defaultStoryComparison } from "./useStoryComparison.ts";
import "./intent-story-lens.css";

// The selected story as Intent names it.
export type LensStory = {
  readonly identity: string;
  readonly title: string;
  readonly completed: boolean;
};

// The selected story with the comparison read of it.
export type ComparedStory = {
  readonly lens: LensStory;
  readonly shown: ShownStoryComparison;
};

// What Intent knows of the selected story's comparison.
export type LensComparison =
  | { readonly state: "reading" }
  | { readonly state: "unavailable"; readonly explanation?: string }
  | { readonly state: "failed"; readonly problem: string }
  | {
      readonly state: "compared";
      readonly shown: ShownStoryComparison;
      readonly review: StoryReview | undefined;
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

const outsideWords = (count: number) =>
  `${changedFiles(count)} outside Intent locations ${count === 1 ? "is" : "are"} shown in Review changes.`;

// How many of the story's changed files no Intent location admits, and the
// way to Review changes, which shows them; nothing when there are none.
function StoryOutsideLocations({
  source,
  story,
  outside,
}: {
  readonly source: string;
  readonly story: LensStory;
  readonly outside: number;
}) {
  const openStoryReview = useOpenStoryReview();
  if (outside === 0) return null;
  return (
    <p className="intent-story-outside">
      {outsideWords(outside)}{" "}
      <button
        type="button"
        onClick={(event) => {
          openStoryReview({
            source,
            identity: story.identity,
            title: story.title,
            control: event.currentTarget,
            comparison: defaultStoryComparison,
            ...(story.completed ? { completed: true } : {}),
          });
        }}
      >
        Review changes
      </button>
    </p>
  );
}

// The "Selected story only" choice over a compared story's tree, what the
// tree leaves out when it is on and no location's test file changed, and the
// count of changed files outside the locations.
export function StoryChangesScope({
  source,
  story,
  outside,
  only,
  noneInLocations,
  onOnly,
}: {
  readonly source: string;
  readonly story: LensStory;
  readonly outside: number;
  readonly only: boolean;
  readonly noneInLocations: boolean;
  readonly onOnly: (only: boolean) => void;
}) {
  return (
    <>
      <label className="intent-story-only">
        <input
          type="checkbox"
          checked={only}
          onChange={(event) => {
            onOnly(event.target.checked);
          }}
        />{" "}
        Selected story only
      </label>
      {only && noneInLocations && (
        <p className="intent-story-none" role="status">
          No test files in Intent locations changed in this story
        </p>
      )}
      <StoryOutsideLocations source={source} story={story} outside={outside} />
    </>
  );
}

export function IntentStoryLens({
  story,
  comparison,
  onRetry,
}: {
  readonly story: LensStory;
  readonly comparison: LensComparison;
  readonly onRetry: () => void;
}) {
  return (
    <section
      className="intent-story-lens"
      aria-label="Selected story"
      data-state={comparison.state}
    >
      <p className="intent-story-name">
        Story <strong>{story.title}</strong>{" "}
        <span className="record-identity">{story.identity}</span>
      </p>
      {comparison.state === "reading" ? (
        <p className="quiet" role="status">
          Reading the story&apos;s changes…
        </p>
      ) : comparison.state === "unavailable" ? (
        <p className="intent-story-problem" role="status">
          {comparison.explanation ??
            "No comparison is available for this story: no workspace on this machine holds it."}{" "}
          Intent shows the published tree without the story&apos;s changes.
        </p>
      ) : comparison.state === "failed" ? (
        <p className="intent-story-problem" role="alert">
          The story&apos;s changes could not be read: {comparison.problem}{" "}
          Intent shows the published tree without them.{" "}
          <button type="button" onClick={onRetry}>
            Retry
          </button>
        </p>
      ) : (
        <ComparedRevisions
          shown={comparison.shown}
          review={comparison.review}
        />
      )}
    </section>
  );
}
