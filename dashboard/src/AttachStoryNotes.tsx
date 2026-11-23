// Attach waiting story notes from a Done follow-up's Start session dialog.
// Reads the page's notes owner; StartSession passes the choice into the
// request as `notes: true` when checked. Unavailable when none wait or the
// notes could not be read; still allows starting without notes.

import { useEffect, useId, useState } from "react";
import {
  attachStoryNotesDetail,
  attachStoryNotesLabel,
  attachStoryNotesNone,
} from "./attachStoryNotesWords.ts";
import {
  storyNoteIsWaiting,
  storyNotesFor,
  type StoryNotesAnswer,
} from "./storyNote.ts";
import { useStoryNotes } from "./storyNotes.ts";
import { storyNotesUnreadable } from "./storyNotesReadSource.ts";
import type { DialogSession } from "./LaunchSessionPolicy.tsx";
import "./follow-up.css";

type StoryNotesAttachmentProps = {
  readonly sourceId: string;
  readonly identity: string;
  readonly onAttach: (attach: boolean) => void;
};

// Mounts Attach story notes above the Session group for a story follow-up.
export function sessionAttachingStoryNotes(
  session: DialogSession,
  attach: StoryNotesAttachmentProps | undefined,
): DialogSession {
  if (attach === undefined) return session;
  return {
    ...session,
    group: (id) => (
      <>
        <StoryNotesAttachment {...attach} />
        {session.group(id)}
      </>
    ),
  };
}

export function StoryNotesAttachment({
  sourceId,
  identity,
  onAttach,
}: StoryNotesAttachmentProps) {
  const { answer } = useStoryNotes(sourceId);
  return (
    <AttachStoryNotes answer={answer} identity={identity} onAttach={onAttach} />
  );
}

function AttachStoryNotes({
  answer,
  identity,
  onAttach,
}: {
  readonly answer: StoryNotesAnswer | undefined;
  readonly identity: string;
  readonly onAttach: (attach: boolean) => void;
}) {
  const { notes, unreadable } = storyNotesFor(answer, identity);
  const waiting = notes.filter(storyNoteIsWaiting).length;
  const total = notes.length;
  const loaded = answer !== undefined;
  const available = loaded && !unreadable && waiting > 0;
  const [checked, setChecked] = useState(available);
  const detailId = useId();
  const inputId = useId();
  const detail = !loaded
    ? ""
    : unreadable
      ? storyNotesUnreadable
      : available
        ? attachStoryNotesDetail(waiting, total)
        : attachStoryNotesNone;

  useEffect(() => {
    setChecked(available);
  }, [available]);

  useEffect(() => {
    onAttach(available && checked);
  }, [available, checked, onAttach]);

  return (
    <div className="attach-story-notes">
      <input
        type="checkbox"
        id={inputId}
        checked={available && checked}
        disabled={!available}
        aria-describedby={detailId}
        onChange={(event) => {
          setChecked(event.target.checked);
        }}
      />
      <span>
        <label htmlFor={inputId}>{attachStoryNotesLabel}</label>
        <small id={detailId}>{detail}</small>
      </span>
    </div>
  );
}
