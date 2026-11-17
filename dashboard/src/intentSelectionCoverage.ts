// Which configured Intent location owns a workspace selection, which of the
// files the tree lists, a selected story's overlay included, that selection
// covers, and the Intent `syntax` hint for a repository file path.
// IntentBrowser uses this for a Summary's files, for Purpose's owning
// location and hint, and for whether the shown tree holds the selection at
// all (`./IntentBrowser.tsx`, `./intentWorkspaceSelection.ts`); story-review
// diffs reuse the hint when the path names no grammar
// (`./reviewDiffSyntaxHint.ts`).

import type { IntentLocation } from "./authenticatedIntentRead.ts";
import { sourceEntryOfRepositoryPath } from "./intentLocationSelection.ts";
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

// Intent `syntax` hint for a repository file path from configured locations.
export function syntaxHintOfRepositoryPath(
  path: string,
  locations: readonly IntentLocation[],
): string | undefined {
  const location = owningLocation(locations, { path });
  return location === undefined
    ? undefined
    : sourceEntryOfRepositoryPath(path, location)?.hint;
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
