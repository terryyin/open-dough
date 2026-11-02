// Workspace snapshots and fixed historical comparisons share one browser and
// diff, over the comparison shown (`./storyComparisonShown.ts`).
import type { FileBrowserPlace } from "./StoryReviewContextLine.tsx";
import type {
  ReviewComparison,
  ReviewItem,
  StoryReview,
} from "./storyReviewContract.ts";
import type { ShownComparison } from "./StoryReviewComparison.tsx";
import { SnapshotView } from "./StoryReviewSnapshotView.tsx";
import { CommitList } from "./StoryReviewCommits.tsx";
import { storyComparisonShown } from "./storyComparisonShown.ts";

export function ReviewBody({
  review,
  shown,
  items,
  selectedItems,
  onSelect,
  comparison,
  tree,
  source,
  identity,
  headingId,
  browser,
  since,
  committedOnly,
}: {
  readonly review: StoryReview | undefined;
  readonly shown: ShownComparison;
  readonly items: readonly ReviewItem[];
  readonly selectedItems: readonly ReviewItem[];
  readonly onSelect: (id: string) => void;
  readonly comparison: ReviewComparison | undefined;
  readonly tree: string | undefined;
  readonly source: string;
  readonly identity: string;
  readonly headingId: string;
  readonly browser: FileBrowserPlace;
  readonly since: ReviewComparison | undefined;
  // Whether all changes leave the snapshot's uncommitted changes out.
  readonly committedOnly: boolean;
}) {
  const snapshot = review?.kind === "snapshot" ? review : undefined;
  const shownComparison = storyComparisonShown({
    source,
    identity,
    review,
    comparison,
    tree,
  });
  return (
    <>
      {snapshot === undefined && shownComparison !== undefined && (
        <SnapshotView
          key={
            shownComparison.reviewed.completion ??
            shownComparison.reviewed.reference
          }
          reviewed={shownComparison.reviewed}
          comparison={shownComparison.comparison}
          tree={shownComparison.tree}
          sinceReview={false}
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
          sinceReview={since !== undefined}
          committedOnly={committedOnly}
          headingId={headingId}
          browser={browser}
        />
      )}
    </>
  );
}
