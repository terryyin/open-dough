// One native dialog keeps the collection and its add/edit composer together.
import { useEffect, useId, useRef, useState } from "react";
import {
  storyNoteTextLimit,
  type StoryNote,
  type StoryNoteChange,
  type StoryNoteContext as NoteContext,
} from "./storyNote.ts";
import { storyNoteNotSaved, storyNotesUnreadable } from "./storyNotes.ts";
import { useStoryNoteAnnouncement } from "./storyNoteAnnouncement.ts";
import { StoryNoteContext } from "./StoryNoteContext.tsx";
import { StoryNoteEntry } from "./StoryNoteEntry.tsx";
export function StoryNotesDialog({
  identity,
  title,
  notes,
  unreadable,
  onChange,
  onClose,
  context,
  onSaved,
}: {
  readonly identity: string;
  readonly title: string;
  readonly notes: readonly StoryNote[];
  readonly unreadable: boolean;
  readonly onChange: (change: StoryNoteChange) => Promise<void>;
  readonly onClose: () => void;
  readonly context?: NoteContext;
  readonly onSaved?: () => void;
}) {
  const id = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const add = useRef<HTMLButtonElement>(null);
  const field = useRef<HTMLTextAreaElement>(null);
  const returning = useRef<HTMLButtonElement | null>(null);
  const [composer, setComposer] = useState<"add" | StoryNote | undefined>(
    context === undefined ? undefined : "add",
  );
  const [saving, setSaving] = useState(false);
  const [problem, setProblem] = useState<string>();
  const [announcement, setAnnouncement] = useStoryNoteAnnouncement();
  const editing = typeof composer === "object" ? composer : undefined;
  useEffect(() => {
    dialog.current?.showModal();
    setAnnouncement("");
  }, []);
  useEffect(() => {
    if (composer !== undefined) field.current?.focus();
    else
      (returning.current?.isConnected
        ? returning.current
        : add.current
      )?.focus();
  }, [composer]);
  useEffect(() => {
    if (!saving && announcement === "Note deleted.") add.current?.focus();
  }, [announcement, saving]);
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
          hidden={composer !== undefined}
          disabled={saving}
          onClick={() => {
            returning.current = add.current;
            setProblem(undefined);
            setAnnouncement("");
            setComposer("add");
          }}
        >
          Add note
        </button>
        {composer !== undefined && (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              const text = field.current?.value.trim() ?? "";
              if (!text || saving) return;
              setSaving(true);
              setProblem(undefined);
              const change: StoryNoteChange = editing
                ? { action: "edit", identity, id: editing.id, text }
                : {
                    action: "add",
                    identity,
                    text,
                    ...(context === undefined ? {} : { context }),
                  };
              void onChange(change)
                .then(() => {
                  setSaving(false);
                  if (onSaved !== undefined) {
                    onSaved();
                    return;
                  }
                  setComposer(undefined);
                  setAnnouncement(
                    editing ? "Note updated." : "Note saved to this story.",
                  );
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
              <h3>{editing ? "Edit note" : "Add note"}</h3>
              <StoryNoteContext
                title={title}
                identity={identity}
                context={editing?.context ?? context}
              />
              <label htmlFor={`${id}-text`}>Note text</label>
              <textarea
                id={`${id}-text`}
                ref={field}
                className="frame-input"
                rows={4}
                maxLength={storyNoteTextLimit}
                defaultValue={editing?.text ?? ""}
              />
              {problem && <p role="alert">{problem}</p>}
              <button
                type="button"
                onClick={() => {
                  if (context !== undefined) dialog.current?.close();
                  else setComposer(undefined);
                }}
              >
                Cancel
              </button>
              <button type="submit">Save note</button>
            </fieldset>
          </form>
        )}
        {context === undefined && (
          <ol aria-label="Saved notes">
            {[...notes]
              .sort((a, b) => b.savedAt.localeCompare(a.savedAt))
              .map((note) => (
                <StoryNoteEntry
                  key={note.id}
                  note={note}
                  title={title}
                  identity={identity}
                  disabled={saving || composer !== undefined}
                  onEdit={(selected, control) => {
                    returning.current = control;
                    setProblem(undefined);
                    setAnnouncement("");
                    setComposer(selected);
                  }}
                  onDelete={async (selected) => {
                    setSaving(true);
                    setAnnouncement("");
                    try {
                      await onChange({
                        action: "delete",
                        identity,
                        id: selected.id,
                      });
                      setAnnouncement("Note deleted.");
                    } finally {
                      setSaving(false);
                    }
                  }}
                />
              ))}
          </ol>
        )}
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
