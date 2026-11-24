// Attach waiting story notes from a Done follow-up's Start session dialog.
// Reads the page's notes owner; StartSession passes the choice into the
// request as `notes: true` when checked. Unavailable when none wait or the
// notes could not be read; still allows starting without notes.

import { useEffect, useId } from "react";
import {
  attachStoryNotesDetail,
  attachStoryNotesLabel,
  attachStoryNotesNone,
} from "./attachStoryNotesWords.ts";
import { FollowUpDetails } from "./FollowUpDetails.tsx";
import { storyNoteItems } from "./followUpStoryNotes.ts";
import { LaunchDisclosure } from "./LaunchDisclosure.tsx";
import { storyNoteIsWaiting, storyNotesFor } from "./storyNote.ts";
import { useStoryNotes } from "./storyNotes.ts";
import { storyNotesUnreadable } from "./storyNotesReadSource.ts";
import "./follow-up.css";

type StoryNotesAttachmentProps = {
  readonly sourceId: string;
  readonly identity: string;
  readonly checked: boolean;
  readonly onAttach: (attach: boolean) => void;
};

export function StoryNotesAttachment({
  sourceId,
  identity,
  checked,
  onAttach,
}: StoryNotesAttachmentProps) {
  const { answer } = useStoryNotes(sourceId);
  const { notes, unreadable } = storyNotesFor(answer, identity);
  const waiting = notes.filter(storyNoteIsWaiting);
  const loaded = answer !== undefined;
  const available = waiting.length > 0;
  const detailId = useId();
  const inputId = useId();
  const detail = !loaded
    ? ""
    : unreadable
      ? storyNotesUnreadable
      : available
        ? attachStoryNotesDetail(waiting.length, notes.length)
        : attachStoryNotesNone;

  useEffect(() => {
    if (!available && checked) onAttach(false);
  }, [available, checked, onAttach]);

  return (
    <div className="attach-story-notes">
      <div className="attach-story-notes-choice">
        <input
          type="checkbox"
          id={inputId}
          checked={available && checked}
          disabled={!available}
          aria-describedby={detailId}
          onChange={(event) => {
            onAttach(event.currentTarget.checked);
          }}
        />
        <span>
          <label htmlFor={inputId}>{attachStoryNotesLabel}</label>
          <small id={detailId}>{detail}</small>
        </span>
      </div>
      {available && (
        <LaunchDisclosure summary="Waiting note details">
          {waiting.map((note) => (
            <FollowUpDetails key={note.id} items={storyNoteItems(note)} />
          ))}
        </LaunchDisclosure>
      )}
    </div>
  );
}
