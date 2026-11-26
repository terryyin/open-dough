// The Files sidebar's first row: Home, then the Intent only and Changes only
// filters, in that order in one row, each present only when its owner
// supplies it; a crowded filter wraps its label within its own control.
// Whole-project scope has no Changes only. The row lays the actions out;
// their owners keep what each action does. Below it, a notice says when the
// chosen filters leave no path.
import "./files-sidebar-actions.css";
import { StoryHomeButton, type StoryPath } from "./IntentStoryEvidence.tsx";

export type FilesFilter = {
  readonly label: string;
  readonly checked: boolean;
  readonly onToggle: (checked: boolean) => void;
};

export type FilesSidebarActions =
  | {
      readonly scope: "story";
      readonly onHome?: (() => void) | undefined;
      readonly intentOnly?: FilesFilter;
      readonly changesOnly?: FilesFilter | undefined;
    }
  | {
      readonly scope: "project";
      readonly onHome?: (() => void) | undefined;
      readonly intentOnly?: FilesFilter;
    };

function FilesFilterChoice({ filter }: { readonly filter: FilesFilter }) {
  return (
    <label className="files-actions-filter">
      <input
        type="checkbox"
        checked={filter.checked}
        onChange={(event) => {
          filter.onToggle(event.target.checked);
        }}
      />{" "}
      {filter.label}
    </label>
  );
}

export function FilesSidebarActionsRow({
  actions,
}: {
  readonly actions: FilesSidebarActions;
}) {
  const changesOnly =
    actions.scope === "story" ? actions.changesOnly : undefined;
  if (!actions.onHome && !actions.intentOnly && !changesOnly) return null;
  return (
    <div className="files-actions" role="group" aria-label="Files actions">
      {actions.onHome && <StoryHomeButton onHome={actions.onHome} />}
      {actions.intentOnly && <FilesFilterChoice filter={actions.intentOnly} />}
      {changesOnly && <FilesFilterChoice filter={changesOnly} />}
    </div>
  );
}

// Intent's row: a story supplies Home, Intent only and Changes only;
// whole-project Intent supplies Intent only.
export function IntentFilesActions({
  path,
  intentOnly,
  changesOnly,
}: {
  readonly path: StoryPath | undefined;
  readonly intentOnly: FilesFilter;
  readonly changesOnly: FilesFilter | undefined;
}) {
  return (
    <FilesSidebarActionsRow
      actions={
        path || changesOnly
          ? {
              scope: "story",
              onHome: path?.onHome,
              intentOnly,
              changesOnly,
            }
          : { scope: "project", intentOnly }
      }
    />
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
