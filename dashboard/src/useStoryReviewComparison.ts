// The comparison chosen for a snapshot: all changes, changes since its
// review, or a commit's two points. Range answers apply only after the read
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
  const [commitRevision, onSelect] = useState<string>();
  const commit =
    snapshot?.commits.find((item) => item.revision === commitRevision) ??
    snapshot?.commits[0];
  const shown: ShownComparison =
    chosen === "commits" && commit !== undefined
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
      fromTree: commit?.fromTree ?? "",
      fromBaseline: commit?.fromBaseline ?? "",
      tree: commit?.tree ?? "",
      baseline: commit?.baseline ?? "",
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
  return { commit, shown, since, range, comparison, tree, onSwitch, onSelect };
}
