// A story's notes open over its current page, without replacing a terminal or
// review. The card and open dialog subscribe to the same project answer.
import { useId, useRef, useState } from "react";
import { StoryNotesDialog } from "./StoryNotesDialog.tsx";
import {
  storyNoteIsWaiting,
  storyNotesFor,
  storyNotesWaitingDescription,
} from "./storyNote.ts";
import { storyNotesUnreadable, useStoryNotes } from "./storyNotes.ts";
import "./launch-dialog.css";
import "./story-notes.css";

export function StoryNotes({
  sourceId,
  identity,
  title,
}: {
  readonly sourceId: string;
  readonly identity: string;
  readonly title: string;
}) {
  const { answer, change } = useStoryNotes(sourceId);
  const problemId = useId();
  const waitingId = useId();
  const [open, setOpen] = useState(false);
  const opener = useRef<HTMLButtonElement>(null);
  const { notes, unreadable } = storyNotesFor(answer, identity);
  const waiting = notes.filter(storyNoteIsWaiting).length;
  const described = unreadable
    ? problemId
    : waiting > 0
      ? waitingId
      : undefined;
  return (
    <>
      <button
        type="button"
        className="start-launch-button"
        ref={opener}
        aria-describedby={described}
        onClick={() => {
          setOpen(true);
        }}
      >
        Notes{notes.length > 0 ? ` (${notes.length})` : ""}
      </button>
      {unreadable && (
        <p id={problemId} role="status">
          {storyNotesUnreadable}
        </p>
      )}
      {!unreadable && waiting > 0 && (
        <p id={waitingId} role="status">
          {storyNotesWaitingDescription(waiting)}
        </p>
      )}
      {open && (
        <StoryNotesDialog
          identity={identity}
          title={title}
          notes={notes}
          unreadable={unreadable}
          onChange={change}
          onClose={() => {
            setOpen(false);
            opener.current?.focus();
          }}
        />
      )}
    </>
  );
}
