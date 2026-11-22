// The project's story review states (`./storyReviewState.ts`) as Recently
// done's cards share them: one local read per project, read again at the
// shared check interval so every page of the server shows another page's
// change at its next read, and a change shown at once from its own answer. An
// answer to a request started before the latest one shown is not shown.
import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import { localSettingState } from "./localSettingState.ts";
import { useStoryReviewStatesReads } from "./pageReads.tsx";
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

export type ProjectReviewStates = ReturnType<typeof projectReviewStates>;
export const StoryReviewStatesOnPage = createContext<
  Map<string, ProjectReviewStates> | undefined
>(undefined);

const unknown = () => undefined;
const unsubscribed = () => () => undefined;
export function useStoryReviewStates(
  project: string,
  enabled: boolean,
): StoryReviewStates {
  const page = useContext(StoryReviewStatesOnPage);
  if (page === undefined)
    throw new Error(
      "The page's story review states are outside StoryReviewStatesOnPage.",
    );
  const reads = useStoryReviewStatesReads();
  const state = useMemo(() => {
    const existing = page.get(project);
    if (existing !== undefined) return existing;
    const created = projectReviewStates((change) => reads(project, change));
    page.set(project, created);
    return created;
  }, [page, project, reads]);
  const reviewed = useSyncExternalStore(
    enabled ? state.subscribe : unsubscribed,
    enabled ? state.snapshot : unknown,
  );
  return { reviewed, change: state.change };
}
