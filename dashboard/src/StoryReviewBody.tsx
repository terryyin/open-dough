// Workspace snapshots and fixed historical comparisons share one browser and diff.
import type { FileBrowserPlace } from "./StoryReviewContextLine.tsx";
import type {
  ReviewComparison,
  ReviewItem,
  StoryReview,
} from "./storyReviewContract.ts";
import type { ShownComparison } from "./StoryReviewComparison.tsx";
import { SnapshotView } from "./StoryReviewSnapshotView.tsx";
import { CommitList } from "./StoryReviewCommits.tsx";

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
  const fixed =
    review?.kind === "published" || review?.kind === "landed"
      ? review
      : undefined;
  return (
    <>
      {fixed !== undefined && (
        <SnapshotView
          key={
            fixed.kind === "published"
              ? fixed.completion
              : fixed.landing.reference
          }
          reviewed={{
            sourceId: source,
            identity,
            ...(fixed.kind === "published"
              ? { completion: fixed.completion }
              : { reference: fixed.landing.reference }),
          }}
          comparison={{ from: fixed.baseline, files: fixed.files }}
          tree={fixed.tree}
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
      {snapshot !== undefined &&
        comparison !== undefined &&
        tree !== undefined && (
          <SnapshotView
            reviewed={{ sourceId: source, identity }}
            snapshot={snapshot}
            tree={tree}
            commitsReview={shown === "commits"}
            comparison={comparison}
            sinceReview={since !== undefined}
            committedOnly={committedOnly}
            headingId={headingId}
            browser={browser}
          />
        )}
    </>
  );
}
