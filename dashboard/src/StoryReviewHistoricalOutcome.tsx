import { changedFiles } from "./StoryReviewFileRow.tsx";

export const emptyLandedReview =
  "No changes: this landed run has an empty delivered comparison.";
export const emptyPublishedReview =
  "No changes: this completed story has an empty published comparison.";

export function RefreshedHistoricalComparison({
  kind,
  count,
}: {
  readonly kind: "landed" | "published";
  readonly count: number;
}) {
  const comparison =
    kind === "landed"
      ? "accepted landing comparison"
      : "fixed published completion";
  return (
    <p>
      Review refreshed: {changedFiles(count)} in the {comparison}.
    </p>
  );
}
