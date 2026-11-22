// A saved entry owns its in-place deletion question; the dialog owns changes
// and announcements, so a removed entry leaves no focus or status behind.
import { useState } from "react";
import { InPlaceQuestion, useAskInPlace } from "./AskInPlace.tsx";
import { StoryNoteContext } from "./StoryNoteContext.tsx";
import { storyNoteNotDeleted } from "./storyNotesReadSource.ts";
import { storyNoteDeliveryLabel, type StoryNote } from "./storyNote.ts";
export function StoryNoteEntry({
  note,
  title,
  identity,
  disabled,
  onEdit,
  onDelete,
}: {
  readonly note: StoryNote;
  readonly title: string;
  readonly identity: string;
  readonly disabled: boolean;
  readonly onEdit: (note: StoryNote, control: HTMLButtonElement) => void;
  readonly onDelete: (note: StoryNote) => Promise<void>;
}) {
  const [problem, setProblem] = useState(false);
  const asking = useAskInPlace("Delete this note?", async () => {
    try {
      await onDelete(note);
      return "settled";
    } catch {
      setProblem(true);
      return "returned";
    }
  });
  return (
    <li>
      <p className="story-note-text">{note.text}</p>
      <StoryNoteContext
        title={title}
        identity={identity}
        context={note.context}
      />
      <p className="story-note-delivery">{storyNoteDeliveryLabel(note)}</p>
      <button
        type="button"
        disabled={disabled || asking.shown}
        onClick={(event) => {
          onEdit(note, event.currentTarget);
        }}
      >
        Edit
      </button>
      {asking.shown ? (
        <InPlaceQuestion asking={asking} confirm="Delete" keep="Cancel" />
      ) : (
        <button
          ref={asking.control}
          type="button"
          disabled={disabled}
          onClick={(event) => {
            setProblem(false);
            asking.press(event.currentTarget);
          }}
        >
          Delete
        </button>
      )}
      {problem && <p role="alert">{storyNoteNotDeleted}</p>}
    </li>
  );
}
