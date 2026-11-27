// Intent's Files sidebar first row: a story's Home, then the Intent only and
// Changes only filters, in that order in one row; whole-project Intent has
// only Intent only. A crowded filter wraps its label within its own control.
// Below the row, a filter that cannot apply now says why. The row lays the
// actions out; their owners keep what each action does. Below it, a notice
// says when the chosen filters leave no path.
import { useId } from "react";
import "./files-sidebar-actions.css";
import { StoryHomeButton, type StoryPath } from "./IntentStoryEvidence.tsx";

export type FilesFilter = {
  readonly label: string;
  readonly checked: boolean;
  readonly onToggle: (checked: boolean) => void;
  // Why the kept choice does not narrow the files now.
  readonly unapplied?: string | undefined;
};

function FilesFilterChoice({
  filter,
  noteId,
}: {
  readonly filter: FilesFilter;
  readonly noteId?: string | undefined;
}) {
  return (
    <label className="files-actions-filter">
      <input
        type="checkbox"
        checked={filter.checked}
        aria-describedby={noteId}
        onChange={(event) => {
          filter.onToggle(event.target.checked);
        }}
      />{" "}
      {filter.label}
    </label>
  );
}

export function IntentFilesActions({
  path,
  intentOnly,
  changesOnly,
}: {
  readonly path: StoryPath | undefined;
  readonly intentOnly: FilesFilter;
  readonly changesOnly: FilesFilter | undefined;
}) {
  const noteId = useId();
  const unapplied = changesOnly?.unapplied;
  return (
    <>
      <div className="files-actions" role="group" aria-label="Files actions">
        {path && <StoryHomeButton onHome={path.onHome} />}
        <FilesFilterChoice filter={intentOnly} />
        {changesOnly && (
          <FilesFilterChoice
            filter={changesOnly}
            noteId={unapplied === undefined ? undefined : noteId}
          />
        )}
      </div>
      {unapplied !== undefined && (
        <p className="files-actions-note quiet" id={noteId}>
          {unapplied}
        </p>
      )}
    </>
  );
}

// The Files sidebar's notice when the chosen filters leave no path.
export function NoFilesMatchNote({ noMatch }: { readonly noMatch: boolean }) {
  if (!noMatch) return null;
  return (
    <p className="intent-story-none" role="status">
      No files match the chosen filters
    </p>
  );
}
