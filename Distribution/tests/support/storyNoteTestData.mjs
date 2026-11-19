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

  /** @param {string} id */
  identifiedAs(id) {
    this.#note.id = id;
    return this;
  }

  /** @param {string} at */
  savedAt(at) {
    this.#note.savedAt = at;
    return this;
  }

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

  /** @param {string} at version (`editedAt ?? savedAt`) a session received */
  deliveredAs(at) {
    this.#note.delivered = at;
    return this;
  }

  /** @returns {StoryNote} */
  please() {
    return structuredClone(this.#note);
  }
}

// The machine notes store document (`story-notes.json`) as data: project →
// story identity → notes, newest first.
export class StoredStoryNotesBuilder {
  /** @type {Record<string, Record<string, StoryNote[]>>} */
  #document = {};

  /**
   * @param {string} project
   * @param {string} identity
   * @param {StoryNote[]} notes
   */
  withNotes(project, identity, notes) {
    this.#document[project] = {
      ...this.#document[project],
      [identity]: structuredClone(notes),
    };
    return this;
  }

  /** @returns {Record<string, Record<string, StoryNote[]>>} */
  please() {
    return structuredClone(this.#document);
  }
}

/**
 * Story-note builders exposed on MakeMe (fresh on each access).
 * @typedef {object} StoryNoteMakeMe
 * @property {StoryNoteBuilder} aStoryNote
 * @property {StoredStoryNotesBuilder} aStoredStoryNotesDocument
 */

/** @returns {PropertyDescriptorMap} */
export function storyNoteMakeMeProperties() {
  return {
    aStoryNote: {
      enumerable: true,
      get() {
        return new StoryNoteBuilder();
      },
    },
    aStoredStoryNotesDocument: {
      enumerable: true,
      get() {
        return new StoredStoryNotesBuilder();
      },
    },
  };
}
