// One shared page/project owner for machine-local notes, refreshed at the shared
// check interval. Older reads never replace a newer successful save answer.
import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import { localSettingState } from "./localSettingState.ts";
import { useStoryNotesReads } from "./pageReads.tsx";
import type { StoryNotesAnswer, StoryNoteChange } from "./storyNote.ts";

export type StoryNotes = {
  readonly answer: StoryNotesAnswer | undefined;
  readonly change: (change: StoryNoteChange) => Promise<void>;
};

/** One project's subscribed notes over its read from the page's reads. */
const storyNotesState = (
  source: (change?: StoryNoteChange) => Promise<StoryNotesAnswer>,
) => localSettingState<StoryNotesAnswer, StoryNoteChange>(source);

export type ProjectNotes = ReturnType<typeof storyNotesState>;
export const StoryNotesOnPage = createContext<
  Map<string, ProjectNotes> | undefined
>(undefined);

export function useStoryNotes(project: string): StoryNotes {
  const page = useContext(StoryNotesOnPage);
  if (page === undefined)
    throw new Error("The page's story notes are outside StoryNotesOnPage.");
  const reads = useStoryNotesReads();
  const state = useMemo(() => {
    const existing = page.get(project);
    if (existing !== undefined) return existing;
    const created = storyNotesState((change) => reads(project, change));
    page.set(project, created);
    return created;
  }, [page, project, reads]);
  const answer = useSyncExternalStore(state.subscribe, state.snapshot);
  return { answer, change: state.change };
}
