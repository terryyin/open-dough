// The read (and change) of one project's machine-local story notes; the
// authenticated implementation binds the local endpoint.
import { localSettingRequest } from "./localSettingRequest.ts";
import {
  storyNotesEndpoint,
  storyNotesAnswerSchema,
  type StoryNotesAnswer,
  type StoryNoteChange,
} from "./storyNote.ts";

export const storyNoteNotSaved = "The note could not be saved.";
export const storyNoteNotDeleted = "The note could not be deleted.";
export const storyNotesUnreadable = "The notes could not be read.";

/** Reads a project's notes, or changes them and answers with the result. */
export type StoryNotesReadSource = (
  project: string,
  change?: StoryNoteChange,
) => Promise<StoryNotesAnswer>;

export const authenticatedStoryNotesReads: StoryNotesReadSource = async (
  project,
  change,
) =>
  storyNotesAnswerSchema.parse(
    await localSettingRequest(
      `${storyNotesEndpoint}?id=${encodeURIComponent(project)}`,
      change,
      change === undefined
        ? storyNotesUnreadable
        : change.action === "delete"
          ? storyNoteNotDeleted
          : storyNoteNotSaved,
    ),
  );
