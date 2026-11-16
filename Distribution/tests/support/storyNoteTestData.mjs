// @ts-check
/** @typedef {import("../../../dashboard/src/storyNote.ts").StoryNote} StoryNote */
/** @typedef {import("../../../dashboard/src/storyNote.ts").StoryNoteContext} StoryNoteContext */

export class StoryNoteBuilder {
  /** @type {StoryNote} */
  #note = {
    id: "34800000-0000-4000-8000-000000000001",
    text: "Check the story's result.",
    savedAt: "2026-11-17T00:00:00.000Z",
  };

  /** @param {string} text */
  withText(text) {
    this.#note.text = text;
    return this;
  }

  /** @param {StoryNoteContext} context */
  withContext(context) {
    this.#note.context = structuredClone(context);
    return this;
  }

  /** @returns {StoryNote} */
  please() {
    return structuredClone(this.#note);
  }
}
