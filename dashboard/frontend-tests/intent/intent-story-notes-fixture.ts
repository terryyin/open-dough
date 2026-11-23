import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { StoryNote, StoryNoteChange } from "../../src/storyNote.ts";
import type { StoryNotesReadSource } from "../../src/storyNotesReadSource.ts";

// Save each new note on its story and retain the requests for assertions.
export function notesKept() {
  const changes: StoryNoteChange[] = [];
  const kept: Record<string, StoryNote[]> = {};
  const source: StoryNotesReadSource = (...[, change]) => {
    if (change) changes.push(structuredClone(change));
    if (change?.action === "add") {
      const note = makeMe.aStoryNote
        .identifiedAs(
          `74800000-0000-4000-8000-${String(changes.length).padStart(12, "0")}`,
        )
        .withText(change.text);
      (kept[change.identity] ??= []).push(
        (change.context ? note.withContext(change.context) : note).please(),
      );
    }
    return Promise.resolve({ kind: "notes", notes: structuredClone(kept) });
  };
  return { source, changes: () => structuredClone(changes) };
}
