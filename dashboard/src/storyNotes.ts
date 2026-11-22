// One shared page/project owner for machine-local notes, refreshed at the shared
// check interval. Older reads never replace a newer successful save answer.
import { useSyncExternalStore } from "react";
import { localSettingState } from "./localSettingState.ts";
import { useHeldOnPage, type HeldKind } from "./pageReads.tsx";
import type { StoryNotesAnswer, StoryNoteChange } from "./storyNote.ts";

export type StoryNotes = {
  readonly answer: StoryNotesAnswer | undefined;
  readonly change: (change: StoryNoteChange) => Promise<void>;
};

/** One project's subscribed notes over its read from the page's reads. */
const storyNotesState = (
  source: (change?: StoryNoteChange) => Promise<StoryNotesAnswer>,
) => localSettingState<StoryNotesAnswer, StoryNoteChange>(source);

const projectNotes: HeldKind<ReturnType<typeof storyNotesState>> = {
  name: "story notes",
};

export function useStoryNotes(project: string): StoryNotes {
  const state = useHeldOnPage(projectNotes, project, (reads) =>
    storyNotesState((change) => reads.storyNotes(project, change)),
  );
  const answer = useSyncExternalStore(state.subscribe, state.snapshot);
  return { answer, change: state.change };
}
