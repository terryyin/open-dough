// One shared page/project owner for machine-local notes, refreshed at the shared
// check interval. Older reads never replace a newer successful save answer.
import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import { localSettingRequest } from "./localSettingRequest.ts";
import { localSettingState } from "./localSettingState.ts";
import {
  storyNotesEndpoint,
  storyNotesAnswerSchema,
  type StoryNotesAnswer,
  type StoryNoteChange,
} from "./storyNote.ts";

export type StoryNotes = {
  readonly answer: StoryNotesAnswer | undefined;
  readonly change: (change: StoryNoteChange) => Promise<void>;
};
export const storyNoteNotSaved = "The note could not be saved.";
export const storyNotesUnreadable = "The notes could not be read.";
async function request(project: string, change?: StoryNoteChange) {
  return storyNotesAnswerSchema.parse(
    await localSettingRequest(
      `${storyNotesEndpoint}?id=${encodeURIComponent(project)}`,
      change,
      change === undefined ? storyNotesUnreadable : storyNoteNotSaved,
    ),
  );
}

function projectNotes(project: string) {
  return localSettingState<StoryNotesAnswer, StoryNoteChange>((change) =>
    request(project, change),
  );
}

type ProjectNotes = ReturnType<typeof projectNotes>;
export const StoryNotesOnPage = createContext<
  Map<string, ProjectNotes> | undefined
>(undefined);
export function usePageStoryNotes() {
  return useMemo(() => new Map<string, ProjectNotes>(), []);
}

export function useStoryNotes(project: string): StoryNotes {
  const page = useContext(StoryNotesOnPage);
  const state = useMemo(() => {
    const existing = page?.get(project);
    if (existing !== undefined) return existing;
    const created = projectNotes(project);
    page?.set(project, created);
    return created;
  }, [page, project]);
  const answer = useSyncExternalStore(state.subscribe, state.snapshot);
  return { answer, change: state.change };
}
