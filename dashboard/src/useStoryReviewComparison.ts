// The comparison chosen for a snapshot: all changes, changes since its
// review, or a contiguous range's two points. Range answers apply only after the read
// for the points currently chosen has settled.
import { useState } from "react";
import type { ShownComparison } from "./StoryReviewComparison.tsx";
import {
  storyReviewRangeEndpoint,
  reviewRangeSchema,
  type ReviewRange,
  type TakenStoryReview,
} from "./storyReview.ts";
import { useReviewRead } from "./useReviewRead.ts";

export function useStoryReviewComparison({
  source,
  identity,
  snapshot,
}: {
  readonly source: string;
  readonly identity: string;
  readonly snapshot: TakenStoryReview | undefined;
}) {
  const [chosen, onSwitch] = useState<ShownComparison>("since");
  const [ends, setEnds] = useState<readonly [string, string]>();
  const commits = snapshot?.commits ?? [];
  const indexes = ends?.map((end) =>
    commits.findIndex((item) => item.revision === end),
  );
  const selectedCommits =
    indexes !== undefined && indexes.every((index) => index >= 0)
      ? commits.slice(Math.min(...indexes), Math.max(...indexes) + 1)
      : commits.slice(0, 1);
  const newest = selectedCommits[0];
  const oldest = selectedCommits.at(-1);
  const onSelect = (revision: string) => {
    setEnds(
      selectedCommits.length === 1 && newest !== undefined
        ? [newest.revision, revision]
        : [revision, revision],
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
        selectedCommits
          .filter((commit) => commit.merge)
          .map(({ fromTree, fromBaseline, baseline }) => ({
            fromTree,
            fromBaseline,
            baseline,
          })),
      ),
    },
    reviewRangeSchema,
    0,
    shown === "commits",
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
    selectedCommits,
    shown,
    since,
    range,
    comparison,
    tree,
    onSwitch,
    onSelect,
    trunkIntegrated: rangeComparison?.trunkIntegrated === true,
  };
}
