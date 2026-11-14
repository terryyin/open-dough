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
import { localSettingRequest } from "./localSettingRequest.ts";
import { checkIntervalMs } from "./revisionCheckSchedule.ts";
import {
  storyReviewStateEndpoint,
  storyReviewStatesAnswerSchema,
  type StoryReviewStateChange,
} from "./storyReviewState.ts";

export type StoryReviewStates = {
  // The reviewed story identities, until the first read answers.
  readonly reviewed: ReadonlySet<string> | undefined;
  // Saves one story's state; rejects when it could not be saved.
  readonly change: (change: StoryReviewStateChange) => Promise<void>;
};

const notRead = "The review state could not be read.";

// What a card says when a review state change could not be saved (the
// machine could not write its local records or the dashboard was not reached),
// and a rejected change's message when the dashboard gives none.
export const reviewStateNotSaved = "The review state could not be saved.";

async function request(project: string, change?: StoryReviewStateChange) {
  return new Set(
    storyReviewStatesAnswerSchema.parse(
      await localSettingRequest(
        `${storyReviewStateEndpoint}?id=${encodeURIComponent(project)}`,
        change,
        change === undefined ? notRead : reviewStateNotSaved,
      ),
    ).reviewed,
  );
}

// One page/project owner. Subscribers share both periodic reads and save answers;
// an older read cannot replace a newer successful save. An unanswered/failed
// initial read stays unknown rather than becoming an empty reviewed set.
function projectReviewStates(project: string) {
  let reviewed: ReadonlySet<string> | undefined;
  let issued = 0;
  let shown = 0;
  let generation = 0;
  let interval: ReturnType<typeof setInterval> | undefined;
  const listeners = new Set<() => void>();
  const answered = async (asked: Promise<ReadonlySet<string>>) => {
    const sequence = ++issued;
    const from = generation;
    const answer = await asked;
    if (from !== generation || sequence <= shown) return;
    shown = sequence;
    reviewed = answer;
    for (const listener of listeners) listener();
  };
  const read = () => {
    void answered(request(project)).catch(() => undefined);
  };
  return {
    snapshot: () => reviewed,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      if (listeners.size === 1) {
        read();
        interval = setInterval(read, checkIntervalMs);
      }
      return () => {
        listeners.delete(listener);
        if (listeners.size !== 0) return;
        clearInterval(interval);
        generation += 1;
        reviewed = undefined;
      };
    },
    change: (change: StoryReviewStateChange) =>
      answered(request(project, change)),
  };
}

type ProjectReviewStates = ReturnType<typeof projectReviewStates>;
export const StoryReviewStatesOnPage = createContext<
  Map<string, ProjectReviewStates> | undefined
>(undefined);
export function usePageStoryReviewStates() {
  return useMemo(() => new Map<string, ProjectReviewStates>(), []);
}

const unknown = () => undefined;
const unsubscribed = () => () => undefined;
export function useStoryReviewStates(
  project: string,
  enabled = true,
): StoryReviewStates {
  const page = useContext(StoryReviewStatesOnPage);
  const state = useMemo(() => {
    const existing = page?.get(project);
    if (existing !== undefined) return existing;
    const created = projectReviewStates(project);
    page?.set(project, created);
    return created;
  }, [page, project]);
  const reviewed = useSyncExternalStore(
    enabled ? state.subscribe : unsubscribed,
    enabled ? state.snapshot : unknown,
  );
  return { reviewed, change: state.change };
}
