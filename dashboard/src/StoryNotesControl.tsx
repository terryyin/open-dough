// A story's notes open over its current page, without replacing a terminal or
// review. The card and open dialog subscribe to the same project answer.
import { useEffect, useId, useRef, useState } from "react";
import { storyNoteTextLimit } from "./storyNote.ts";
import {
  storyNoteNotSaved,
  storyNotesUnreadable,
  useStoryNotes,
} from "./storyNotes.ts";
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
  const [open, setOpen] = useState(false);
  const opener = useRef<HTMLButtonElement>(null);
  const notes = answer?.kind === "notes" ? (answer.notes[identity] ?? []) : [];
  const unreadable = answer?.kind === "unreadable";
  return (
    <>
      <button
        type="button"
        className="start-launch-button"
        ref={opener}
        aria-describedby={unreadable ? problemId : undefined}
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
      {open && (
        <StoryNotesDialog
          identity={identity}
          title={title}
          notes={notes}
          unreadable={unreadable}
          onSave={async (text) => {
            await change({ action: "add", identity, text });
          }}
          onClose={() => {
            setOpen(false);
            opener.current?.focus();
          }}
        />
      )}
    </>
  );
}

function StoryNotesDialog({
  identity,
  title,
  notes,
  unreadable,
  onSave,
  onClose,
}: {
  readonly identity: string;
  readonly title: string;
  readonly notes: readonly import("./storyNote.ts").StoryNote[];
  readonly unreadable: boolean;
  readonly onSave: (text: string) => Promise<void>;
  readonly onClose: () => void;
}) {
  const id = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const add = useRef<HTMLButtonElement>(null);
  const field = useRef<HTMLTextAreaElement>(null);
  const [composing, setComposing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [problem, setProblem] = useState<string>();
  const [announcement, setAnnouncement] = useState("");
  useEffect(() => {
    dialog.current?.showModal();
  }, []);
  useEffect(() => {
    if (composing) field.current?.focus();
    else add.current?.focus();
  }, [composing]);
  const finishComposer = () => {
    setComposing(false);
  };
  return (
    <dialog
      ref={dialog}
      className="launch-dialog story-notes"
      aria-labelledby={`${id}-heading`}
      onClick={(event) => {
        event.stopPropagation();
      }}
      onClose={onClose}
      onCancel={(event) => {
        if (saving) event.preventDefault();
      }}
    >
      <div className="launch-dialog-body">
        <h2 id={`${id}-heading`}>Story notes</h2>
        <p>{title}</p>
        <p className="record-identity">{identity}</p>
        <p role="status">{announcement}</p>
        {unreadable && <p role="alert">{storyNotesUnreadable}</p>}
        <button
          type="button"
          ref={add}
          hidden={composing}
          onClick={() => {
            setProblem(undefined);
            setAnnouncement("");
            setComposing(true);
          }}
        >
          Add note
        </button>
        {composing && (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              const text = field.current?.value.trim() ?? "";
              if (!text || saving) return;
              setSaving(true);
              setProblem(undefined);
              void onSave(text)
                .then(() => {
                  finishComposer();
                  setAnnouncement("Note saved to this story.");
                })
                .catch(() => {
                  setProblem(storyNoteNotSaved);
                })
                .finally(() => {
                  setSaving(false);
                });
            }}
          >
            <fieldset disabled={saving}>
              <h3>Add note</h3>
              <p>
                {title} · {identity}
              </p>
              <label htmlFor={`${id}-text`}>Note text</label>
              <textarea
                id={`${id}-text`}
                ref={field}
                className="frame-input"
                rows={4}
                maxLength={storyNoteTextLimit}
              />
              {problem && <p role="alert">{problem}</p>}
              <button type="button" onClick={finishComposer}>
                Cancel
              </button>
              <button type="submit">Save note</button>
            </fieldset>
          </form>
        )}
        <ol aria-label="Saved notes">
          {[...notes]
            .sort((a, b) => b.savedAt.localeCompare(a.savedAt))
            .map((note) => (
              <li key={note.id}>
                <p className="story-note-text">{note.text}</p>
                <p>
                  {title} · {identity}
                </p>
              </li>
            ))}
        </ol>
        <button
          type="button"
          disabled={saving}
          onClick={() => {
            dialog.current?.close();
          }}
        >
          Close
        </button>
      </div>
    </dialog>
  );
}
