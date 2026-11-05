// Which configured Intent location owns a workspace selection, and which of
// the files the tree lists, a selected story's overlay included, that
// selection covers: files under a location's or folder's path, or the one
// file. IntentBrowser uses this for a Summary's files, for Purpose's owning
// location, and for whether the shown tree holds the selection at all
// (`./IntentBrowser.tsx`, `./intentWorkspaceSelection.ts`).

import type { IntentLocation } from "./authenticatedIntentRead.ts";
import {
  selectionScope,
  type IntentSelection,
} from "./intentWorkspaceSelection.ts";

export function owningLocation(
  locations: readonly IntentLocation[],
  selection: IntentSelection,
): IntentLocation | undefined {
  const scope = selectionScope(selection);
  if (scope === "none") return undefined;
  if (scope === "location") {
    return locations.find((location) => location.path === selection.path);
  }
  return locations.find(
    (location) =>
      selection.path === location.path ||
      selection.path.startsWith(`${location.path}/`),
  );
}

// TREE_FILES are the files the tree lists, by repository path.
export function filesOfSelection(
  treeFiles: ReadonlyMap<string, unknown>,
  selection: IntentSelection,
): readonly string[] {
  const scope = selectionScope(selection);
  if (scope === "none") return [];
  if (scope === "file")
    return treeFiles.has(selection.path) ? [selection.path] : [];
  const prefix = `${selection.path}/`;
  return [...treeFiles.keys()].filter((file) => file.startsWith(prefix));
}

// Whether the shown tree holds the selected path: a configured location, a
// listed file, or a folder some listed file lies under.
export function treeHoldsSelection(
  locations: readonly IntentLocation[],
  treeFiles: ReadonlyMap<string, unknown>,
  selection: IntentSelection,
): boolean {
  if (selectionScope(selection) === "location")
    return owningLocation(locations, selection) !== undefined;
  return filesOfSelection(treeFiles, selection).length > 0;
}

export const intentFileCountWords = (count: number) =>
  count === 1 ? "file" : "files";
