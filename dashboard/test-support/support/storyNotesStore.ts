// Machine-local story-notes.json under HOME for test setup.
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { StoryNote } from "../../src/storyNote.ts";

export const storyNotesFile = (home: string) =>
  path.join(home, ".open-dough/dashboard/story-notes.json");

export function seedStoryNotes(
  home: string,
  notes: Record<string, StoryNote[]>,
): void {
  mkdirSync(path.dirname(storyNotesFile(home)), { recursive: true });
  writeFileSync(
    storyNotesFile(home),
    `${JSON.stringify({ "open-dough": notes })}\n`,
  );
}
