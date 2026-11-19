// How the notes service substitute answers one request: project-scoped reads,
// accepted changes with their recorded requests, and unreadable projects.
// Both the Playwright route substitute and the mounted fetch answers call it,
// so it imports neither Playwright nor Node.
import {
  storyNoteChangeSchema,
  type StoryNote,
  type StoryNoteChange,
} from "../../src/storyNote.ts";

// A new note's identity and save time, assigned by the caller.
export type NewStoryNote = () => Pick<StoryNote, "id" | "savedAt">;

// Numbered identities, saved one second apart, for the substitutes' new notes.
export function numberedNewStoryNotes(): NewStoryNote {
  let serial = 0;
  return () => {
    serial += 1;
    return {
      id: `34810000-0000-4000-8000-${String(serial).padStart(12, "0")}`,
      savedAt: new Date(Date.UTC(2026, 10, 17, 1, 0, serial)).toISOString(),
    };
  };
}

// What the substitute remembers between requests.
export class StoryNotesRule {
  private readonly projects = new Map<string, Record<string, StoryNote[]>>();
  private readonly unreadable = new Set<string>();
  readonly changes: StoryNoteChange[] = [];

  constructor(private readonly newNote: NewStoryNote) {}

  // Later reads of the project answer these notes, even if it was unreadable.
  setNotes(project: string, notes: Record<string, StoryNote[]>) {
    this.unreadable.delete(project);
    this.projects.set(project, structuredClone(notes));
  }

  markUnreadable(project: string) {
    this.unreadable.add(project);
  }

  answer(request: { project: string; method: string; body?: unknown }) {
    const { project, method } = request;
    if (this.unreadable.has(project)) {
      return method === "POST"
        ? answer(500, { error: "The note could not be saved." })
        : answer(200, { kind: "unreadable" });
    }
    if (method === "POST") {
      const change = storyNoteChangeSchema.parse(request.body);
      this.changes.push(structuredClone(change));
      const notes = this.notesOf(project);
      this.projects.set(project, {
        ...notes,
        [change.identity]: this.changed(notes[change.identity] ?? [], change),
      });
    }
    return answer(200, {
      kind: "notes",
      notes: structuredClone(this.notesOf(project)),
    });
  }

  private notesOf(project: string) {
    return this.projects.get(project) ?? {};
  }

  private changed(existing: StoryNote[], change: StoryNoteChange) {
    if (change.action === "add") {
      const note: StoryNote = { ...this.newNote(), text: change.text };
      if (change.context !== undefined) note.context = change.context;
      return [...existing, note];
    }
    if (change.action === "edit") {
      return existing.map((note) =>
        note.id === change.id
          ? { ...note, text: change.text, editedAt: "2026-11-17T02:00:00.000Z" }
          : note,
      );
    }
    return existing.filter(({ id }) => id !== change.id);
  }
}

function answer(status: number, body: unknown) {
  return { status, body };
}
