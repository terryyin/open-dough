// Workspace snapshots and fixed historical comparisons share one browser and
// diff, over the comparison shown (`./storyComparisonShown.ts`).
import { StoryNoteComparison } from "./StoryDiffNote.tsx";
import { comparisonWords } from "./StoryReviewComparison.tsx";
import type { FileBrowserPlace } from "./FileBrowserToggle.tsx";
import type {
  ReviewComparison,
  ReviewItem,
  StoryReview,
} from "./storyReviewContract.ts";
import type { ShownComparison } from "./StoryReviewComparison.tsx";
import { SnapshotView } from "./StoryReviewSnapshotView.tsx";
import { CommitList } from "./StoryReviewCommits.tsx";
import { storyComparisonShown } from "./storyComparisonShown.ts";
import type { ReviewedWorkSubject } from "./reviewedWorkSubject.ts";

export function ReviewBody({
  review,
  shown,
  items,
  selectedItems,
  onSelect,
  comparison,
  tree,
  subject,
  headingId,
  browser,
  committedOnly,
}: {
  readonly review: StoryReview | undefined;
  readonly shown: ShownComparison;
  readonly items: readonly ReviewItem[];
  readonly selectedItems: readonly ReviewItem[];
  readonly onSelect: (id: string) => void;
  readonly comparison: ReviewComparison | undefined;
  readonly tree: string | undefined;
  readonly subject: ReviewedWorkSubject;
  readonly headingId: string;
  readonly browser: FileBrowserPlace;
  // Whether all changes leave the snapshot's uncommitted changes out.
  readonly committedOnly: boolean;
}) {
  const snapshot = review?.kind === "snapshot" ? review : undefined;
  const shownComparison = storyComparisonShown({
    subject,
    review,
    comparison,
    tree,
  });
  return (
    <StoryNoteComparison.Provider value={comparisonWords[shown]}>
      {snapshot === undefined && shownComparison !== undefined && (
        <SnapshotView
          key={
            shownComparison.reviewed.completion ??
            shownComparison.reviewed.reference
          }
          reviewed={shownComparison.reviewed}
          comparison={shownComparison.comparison}
          tree={shownComparison.tree}
          headingId={headingId}
          browser={browser}
        />
      )}
      {snapshot !== undefined &&
        shown === "commits" &&
        selectedItems.length > 0 && (
          <CommitList
            items={items}
            selected={selectedItems}
            onSelect={onSelect}
          />
        )}
      {snapshot !== undefined && shownComparison !== undefined && (
        <SnapshotView
          reviewed={shownComparison.reviewed}
          snapshot={snapshot}
          tree={shownComparison.tree}
          commitsReview={shown === "commits"}
          comparison={shownComparison.comparison}
          committedOnly={committedOnly}
          headingId={headingId}
          browser={browser}
        />
      )}
    </StoryNoteComparison.Provider>
  );
}
