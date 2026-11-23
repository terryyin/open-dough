// The comparison chosen for a snapshot: all changes or a contiguous commit
// range. Range answers apply only after the read
// for the points currently chosen has settled. All changes of a snapshot
// holding uncommitted changes can leave them out: its committed work alone,
// to the head's tree, which came with the snapshot.
import type { ShownComparison } from "./StoryReviewComparison.tsx";
import type { TakenStoryReview } from "./storyReviewContract.ts";
import {
  reviewIntegrations,
  reviewItemId,
  reviewRangeEnds,
} from "./storyReviewPoints.ts";
import { useReviewRead } from "./useReviewRead.ts";
import { useStateKeyedBy } from "./stateKeyedBy.ts";
import {
  reviewedWorkQuery,
  type ReviewedWorkSubject,
} from "./reviewedWorkSubject.ts";

export function useStoryReviewComparison({
  subject,
  snapshot,
  chosen,
  includeUncommitted,
  active,
  keyedBy,
  round = 0,
}: {
  readonly subject: ReviewedWorkSubject;
  readonly snapshot: TakenStoryReview | undefined;
  readonly chosen: ShownComparison;
  // Whether all changes include the snapshot's uncommitted changes.
  readonly includeUncommitted: boolean;
  readonly active: boolean;
  // A changed key drops the chosen ends, so Commits anchors as at first.
  readonly keyedBy?: string | undefined;
  // How many times the reader asked for a new read.
  readonly round?: number;
}) {
  const { value: ends, set: setEnds } = useStateKeyedBy<
    readonly [string, string] | undefined
  >(undefined, keyedBy);
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
  const { oldest, newest } = reviewRangeEnds(selectedItems);
  const onSelect = (id: string) => {
    setEnds(
      selectedItems.length === 1 && newest !== undefined
        ? [reviewItemId(newest), id]
        : [id, id],
    );
  };
  const shown: ShownComparison =
    chosen === "commits" && newest !== undefined ? "commits" : "all";
  // The committed work alone, which all changes can show in place of the
  // whole snapshot.
  const committed = shown === "all" ? snapshot?.committed : undefined;
  const committedShown = includeUncommitted ? undefined : committed;
  const branchCommitRange =
    snapshot?.withMerged !== undefined && oldest?.kind === "commit";
  const range = useReviewRead(
    "range",
    {
      ...reviewedWorkQuery(subject),
      fromTree: oldest?.fromTree ?? "",
      fromBaseline: oldest?.fromBaseline ?? "",
      tree: newest?.tree ?? "",
      baseline: newest?.baseline ?? "",
      integrations: JSON.stringify(reviewIntegrations(selectedItems)),
      ...(branchCommitRange ? { withMerged: "1" } : {}),
    },
    { round, enabled: active && shown === "commits" },
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
        : (committedShown ?? {
            from: snapshot.baseline,
            files: snapshot.files,
          });
  const tree =
    shown === "commits"
      ? rangeComparison?.tree
      : (committedShown?.tree ?? snapshot?.tree);
  const withMerged =
    shown === "all"
      ? (committedShown ?? snapshot)?.withMerged
      : branchCommitRange
        ? rangeComparison?.withMerged
        : undefined;
  return {
    items,
    selectedItems,
    shown,
    committed,
    range,
    comparison,
    withMerged,
    tree,
    onSelect,
    trunkIntegrated: rangeComparison?.trunkIntegrated === true,
  };
}
