// The project's story review states (`./storyReviewState.ts`) as Recently
// done's cards share them: one local read per project, read again at the
// shared check interval so every page of the server shows another page's
// change at its next read, and a change shown at once from its own answer. An
// answer to a request started before the latest one shown is not shown.
import { useSyncExternalStore } from "react";
import { localSettingState } from "./localSettingState.ts";
import { useHeldOnPage, type HeldKind } from "./pageReads.tsx";
import type { StoryReviewStateChange } from "./storyReviewState.ts";

export type StoryReviewStates = {
  // The reviewed story identities, until the first read answers.
  readonly reviewed: ReadonlySet<string> | undefined;
  // Saves one story's state; rejects when it could not be saved.
  readonly change: (change: StoryReviewStateChange) => Promise<void>;
};

const projectReviewStates = (
  source: (change?: StoryReviewStateChange) => Promise<ReadonlySet<string>>,
) => localSettingState<ReadonlySet<string>, StoryReviewStateChange>(source);

const reviewStatesOnPage: HeldKind<ReturnType<typeof projectReviewStates>> = {
  name: "story review states",
};

const unknown = () => undefined;
const unsubscribed = () => () => undefined;
export function useStoryReviewStates(
  project: string,
  enabled: boolean,
): StoryReviewStates {
  const state = useHeldOnPage(reviewStatesOnPage, project, (reads) =>
    projectReviewStates((change) => reads.reviewStates(project, change)),
  );
  const reviewed = useSyncExternalStore(
    enabled ? state.subscribe : unsubscribed,
    enabled ? state.snapshot : unknown,
  );
  return { reviewed, change: state.change };
}
