// The project's story review states (`./storyReviewState.ts`) as Recently
// done's cards share them: one local read per project, read again at the
// shared check interval so every page of the server shows another page's
// change at its next read, and a change shown at once from its own answer. An
// answer to a request started before the latest one shown is not shown.
import { useSyncExternalStore } from "react";
import { localSettingState } from "./localSettingState.ts";
import { heldOnPagePerKey } from "./pageReads.tsx";
import type {
  StoryReviewMark,
  StoryReviewStateChange,
} from "./storyReviewState.ts";

export type StoryReviewStates = {
  // Each marked story's mark by identity, once the first read answers.
  readonly reviewed: ReadonlyMap<string, StoryReviewMark> | undefined;
  // Saves one story's state; rejects when it could not be saved.
  readonly change: (change: StoryReviewStateChange) => Promise<void>;
};

const projectReviewStates = (
  source: (
    change?: StoryReviewStateChange,
  ) => Promise<ReadonlyMap<string, StoryReviewMark>>,
) =>
  localSettingState<
    ReadonlyMap<string, StoryReviewMark>,
    StoryReviewStateChange
  >(source);

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

// One reviewable session: its identity (`./recentlyDoneListing.ts`) and when
// it completed.
export type ReviewableSession = {
  readonly identity: string;
  readonly completedAt: string;
};

// The one review rule: a completed session is reviewed when it has an explicit
// mark saying so, or, with none, when its completion is at or before its
// story's saved `reviewedAt`.
export function sessionReviewed(
  mark: StoryReviewMark | undefined,
  { identity, completedAt }: ReviewableSession,
): boolean {
  const explicit = mark?.sessions?.[identity];
  if (explicit !== undefined) return explicit;
  return (
    mark?.reviewedAt !== undefined &&
    Date.parse(completedAt) <= Date.parse(mark.reviewedAt)
  );
}

export type StoryReviewStatus = "unreviewed" | "partial" | "reviewed";

// A story's status from its current reviewable sessions; with none, the saved
// `reviewedAt` alone decides.
export function storyReviewStatus(
  mark: StoryReviewMark | undefined,
  sessions: readonly ReviewableSession[],
): StoryReviewStatus {
  if (sessions.length === 0)
    return mark?.reviewedAt === undefined ? "unreviewed" : "reviewed";
  const reviewed = sessions.filter((session) =>
    sessionReviewed(mark, session),
  ).length;
  if (reviewed === 0) return "unreviewed";
  return reviewed === sessions.length ? "reviewed" : "partial";
}
