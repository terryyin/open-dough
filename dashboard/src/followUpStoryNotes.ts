// The follow-up context section for a done story's waiting notes: headed as
// the developer's story notes, each with its text and, when kept, the
// dashboard view from when the note was taken (`./followUpContext.ts`).

import type { FollowUpItem, FollowUpSection } from "./followUpContext.ts";
import type { StoryNote, StoryNoteContext } from "./storyNote.ts";

export const developerStoryNotesLabel = "Developer's story notes";
const noteContextPreamble = "what the dashboard showed when the note was taken";

function noteContextValue(context: StoryNoteContext): string {
  const path =
    context.oldPath === undefined
      ? context.path
      : `${context.oldPath} → ${context.path}`;
  const comparison = `${context.comparison.name} ${context.comparison.baseline} → ${context.comparison.tree}`;
  const line =
    context.line === undefined
      ? []
      : [
          `Line ${context.line.number} · ${context.line.side}`,
          context.line.text,
        ];
  return [noteContextPreamble, context.view, path, comparison, ...line].join(
    "\n",
  );
}

function noteItems(note: StoryNote): readonly FollowUpItem[] {
  return [
    { label: "Note", value: note.text },
    ...(note.context === undefined
      ? []
      : [{ label: "Context", value: noteContextValue(note.context) }]),
  ];
}

// One section for every waiting note, or none when the list is empty.
export function storyNotesContext(
  notes: readonly StoryNote[],
): FollowUpSection | undefined {
  if (notes.length === 0) return undefined;
  return {
    label: developerStoryNotesLabel,
    items: notes.flatMap(noteItems),
  };
}
