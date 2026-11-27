// The project's story review states (`./storyReviewState.ts`) as Recently
// done's cards share them: one local read per project, read again at the
// shared check interval so every page of the server shows another page's
// change at its next read, and a change shown at once from its own answer. An
// answer to a request started before the latest one shown is not shown.
import { useSyncExternalStore } from "react";
import { localSettingState } from "./localSettingState.ts";
import { heldOnPagePerKey } from "./pageReads.tsx";
import type { StoryReviewStateChange } from "./storyReviewState.ts";

export type StoryReviewStates = {
  // Each marked story's `reviewedAt` by identity, once the first read answers.
  readonly reviewed: ReadonlyMap<string, string> | undefined;
  // Saves one story's state; rejects when it could not be saved.
  readonly change: (change: StoryReviewStateChange) => Promise<void>;
};

const projectReviewStates = (
  source: (
    change?: StoryReviewStateChange,
  ) => Promise<ReadonlyMap<string, string>>,
) =>
  localSettingState<ReadonlyMap<string, string>, StoryReviewStateChange>(
    source,
  );

const useProjectReviewStates = heldOnPagePerKey((reads, project) =>
  projectReviewStates((change) => reads.reviewStates(project, change)),
);

const unknown = () => undefined;
const unsubscribed = () => () => undefined;
export function useStoryReviewStates(
  project: string,
  enabled: boolean,
): StoryReviewStates {
  const state = useProjectReviewStates(project);
  const reviewed = useSyncExternalStore(
    enabled ? state.subscribe : unsubscribed,
    enabled ? state.snapshot : unknown,
  );
  return { reviewed, change: state.change };
}

// The one review rule: a completed session is reviewed when its completion is
// at or before its story's saved `reviewedAt`.
export const sessionReviewed = (
  reviewedAt: string | undefined,
  completedAt: string,
): boolean =>
  reviewedAt !== undefined && Date.parse(completedAt) <= Date.parse(reviewedAt);

export type StoryReviewStatus = "unreviewed" | "partial" | "reviewed";

// A story's status from its current reviewable sessions' completions; with
// none, the saved mark alone decides.
export function storyReviewStatus(
  reviewedAt: string | undefined,
  completions: readonly string[],
): StoryReviewStatus {
  if (completions.length === 0)
    return reviewedAt === undefined ? "unreviewed" : "reviewed";
  const reviewed = completions.filter((completedAt) =>
    sessionReviewed(reviewedAt, completedAt),
  ).length;
  if (reviewed === 0) return "unreviewed";
  return reviewed === completions.length ? "reviewed" : "partial";
}
