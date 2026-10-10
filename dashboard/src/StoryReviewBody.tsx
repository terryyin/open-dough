// The selected workspace or landed comparison shares one browser and diff.
import type { FileBrowserPlace } from "./StoryReviewContextLine.tsx";
import type {
  ReviewComparison,
  ReviewItem,
  StoryReview,
  TakenStoryReview,
} from "./storyReview.ts";
import type { ShownComparison } from "./StoryReviewComparison.tsx";
import { SnapshotView } from "./StoryReviewSnapshotView.tsx";
import { CommitList } from "./StoryReviewCommits.tsx";

export function ReviewBody({
  landed,
  snapshot,
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
  readonly landed: Extract<StoryReview, { kind: "landed" }> | undefined;
  readonly snapshot: TakenStoryReview | undefined;
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
  return (
    <>
      {landed !== undefined && (
        <SnapshotView
          key={landed.landing.reference}
          reviewed={{
            sourceId: source,
            identity,
            reference: landed.landing.reference,
          }}
          comparison={{ from: landed.baseline, files: landed.files }}
          tree={landed.tree}
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
