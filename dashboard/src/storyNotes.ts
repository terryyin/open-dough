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

const useProjectNotes = heldOnPagePerKey((reads, project) =>
  storyNotesState((change) => reads.storyNotes(project, change)),
);

export function useStoryNotes(project: string): StoryNotes {
  const state = useProjectNotes(project);
  const answer = useSyncExternalStore(state.subscribe, state.snapshot);
  return { answer, change: state.change };
}
