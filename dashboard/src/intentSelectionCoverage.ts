// Which configured Intent location owns a workspace selection, and which of
// its matching files that selection covers: every file for a location, files
// under a folder path, or the one file. IntentBrowser uses this for Summary
// file counts and for Purpose/Proof's owning location (`./IntentBrowser.tsx`,
// `./intentWorkspaceSelection.ts`).

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

export function filesOfSelection(
  location: IntentLocation,
  selection: IntentSelection,
): readonly string[] {
  const scope = selectionScope(selection);
  if (scope === "location") return location.files;
  if (scope === "folder") {
    const prefix = `${selection.path}/`;
    return location.files.filter((file) => file.startsWith(prefix));
  }
  return location.files.includes(selection.path) ? [selection.path] : [];
}

export const intentFileCountWords = (count: number) =>
  count === 1 ? "file" : "files";
