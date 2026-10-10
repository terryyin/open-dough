// The comparison chosen for a snapshot: all changes, changes since its
// review, or a contiguous range's two points. Range answers apply only after the read
// for the points currently chosen has settled.
import { useState } from "react";
import type { ShownComparison } from "./StoryReviewComparison.tsx";
import {
  storyReviewRangeEndpoint,
  reviewRangeSchema,
  reviewItemId,
  type ReviewRange,
  type TakenStoryReview,
} from "./storyReview.ts";
import { useReviewRead } from "./useReviewRead.ts";

export function useStoryReviewComparison({
  source,
  identity,
  snapshot,
  chosen,
  active,
}: {
  readonly source: string;
  readonly identity: string;
  readonly snapshot: TakenStoryReview | undefined;
  readonly chosen: ShownComparison;
  readonly active: boolean;
}) {
  const [ends, setEnds] = useState<readonly [string, string]>();
  const items = [
    ...(snapshot?.uncommitted === undefined ? [] : [snapshot.uncommitted]),
    ...(snapshot?.commits ?? []),
  ];
  const indexes = ends?.map((end) =>
    items.findIndex((item) => reviewItemId(item) === end),
  );
  const first = items[0];
  const resolvedEnds =
    indexes !== undefined && indexes.every((index) => index >= 0)
      ? ends
      : first === undefined
        ? undefined
        : ([reviewItemId(first), reviewItemId(first)] as const);
  // Anchor when Commits is first shown; thereafter each snapshot reconciles
  // vanished ends permanently, while stable items keep their refreshed points.
  if ((chosen === "commits" || ends !== undefined) && ends !== resolvedEnds)
    setEnds(resolvedEnds);
  const selectedIndexes = resolvedEnds?.map((end) =>
    items.findIndex((item) => reviewItemId(item) === end),
  );
  const selectedItems =
    selectedIndexes === undefined
      ? []
      : items.slice(
          Math.min(...selectedIndexes),
          Math.max(...selectedIndexes) + 1,
        );
  const newest = selectedItems[0];
  const oldest = selectedItems.at(-1);
  const onSelect = (id: string) => {
    setEnds(
      selectedItems.length === 1 && newest !== undefined
        ? [reviewItemId(newest), id]
        : [id, id],
    );
  };
  const shown: ShownComparison =
    chosen === "commits" && newest !== undefined
      ? "commits"
      : chosen === "since" && snapshot?.since !== undefined
        ? "since"
        : "all";
  const since = chosen === "since" ? snapshot?.since : undefined;
  const range = useReviewRead<ReviewRange>(
    storyReviewRangeEndpoint,
    {
      source,
      identity,
      fromTree: oldest?.fromTree ?? "",
      fromBaseline: oldest?.fromBaseline ?? "",
      tree: newest?.tree ?? "",
      baseline: newest?.baseline ?? "",
      integrations: JSON.stringify(
        selectedItems
          .filter((item) => item.kind === "commit" && item.merge)
          .map(({ fromTree, fromBaseline, baseline }) => ({
            fromTree,
            fromBaseline,
            baseline,
          })),
      ),
    },
    reviewRangeSchema,
    0,
    active && shown === "commits",
  );
  const rangeComparison =
    !range.reading && range.answer?.kind === "comparison"
      ? range.answer
      : undefined;
  const comparison =
    snapshot === undefined
      ? undefined
      : shown === "commits"
        ? rangeComparison
        : (since ?? { from: snapshot.baseline, files: snapshot.files });
  const tree = shown === "commits" ? rangeComparison?.tree : snapshot?.tree;
  return {
    items,
    selectedItems,
    shown,
    since,
    range,
    comparison,
    tree,
    onSelect,
    trunkIntegrated: rangeComparison?.trunkIntegrated === true,
  };
}
