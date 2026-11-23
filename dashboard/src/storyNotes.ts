// One shared page/project owner for machine-local notes, refreshed at the shared
// check interval. Older reads never replace a newer successful save answer.
import { useSyncExternalStore } from "react";
import { localSettingState } from "./localSettingState.ts";
import { heldOnPagePerKey } from "./pageReads.tsx";
import type { StoryNotesAnswer, StoryNoteChange } from "./storyNote.ts";

export type StoryNotes = {
  readonly answer: StoryNotesAnswer | undefined;
  readonly change: (change: StoryNoteChange) => Promise<void>;
};

/** One project's subscribed notes over its read from the page's reads. */
const storyNotesState = (
  source: (change?: StoryNoteChange) => Promise<StoryNotesAnswer>,
) => localSettingState<StoryNotesAnswer, StoryNoteChange>(source);

export type StoryNotesState = ReturnType<typeof storyNotesState>;

export const useProjectStoryNotes = heldOnPagePerKey((reads, project) =>
  storyNotesState((change) => reads.storyNotes(project, change)),
);

export function useStoryNotesAnswer(state: StoryNotesState) {
  return useSyncExternalStore(state.subscribe, state.snapshot);
}

export function useStoryNotes(project: string): StoryNotes {
  const state = useProjectStoryNotes(project);
  const answer = useStoryNotesAnswer(state);
  return { answer, change: state.change };
}
