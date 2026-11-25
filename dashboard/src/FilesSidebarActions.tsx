// The Files sidebar's first row: Home, then the Intent only and Changes only
// filters, in that order on one line, each present only when its owner
// supplies it. Whole-project scope has no Changes only. The row lays the
// actions out; their owners keep what each action does.
import "./files-sidebar-actions.css";
import { StoryHomeButton, type StoryPath } from "./IntentStoryEvidence.tsx";
import {
  storyOnlyFilterOf,
  type StoryTreeScope,
} from "./IntentStorySummary.tsx";

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

// Intent's row: a story supplies Home and its Changes tree's story-only
// choice; whole-project Intent has no supplied action yet.
export function IntentFilesActions({
  path,
  scope,
}: {
  readonly path: StoryPath | undefined;
  readonly scope: StoryTreeScope | undefined;
}) {
  return (
    <FilesSidebarActionsRow
      actions={
        path || scope
          ? {
              scope: "story",
              onHome: path?.onHome,
              changesOnly: scope && storyOnlyFilterOf(scope),
            }
          : { scope: "project" }
      }
    />
  );
}
