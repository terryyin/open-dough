// A selected story's changes over Intent's published tree, as one pure join
// (`./IntentBrowser.tsx`): the configured locations' files at the published
// revision, plus the story's changed files as Review changes compares them
// (`./useStoryComparison.ts`), give each location's tree files with their
// change kind, the changed files a location's selection admits inserted at
// their paths, whether each location contains changes, and how many changed
// files lie outside every location. A location admits a path by the one
// location-selection rule (`./intentLocationSelection.ts`). A changed file
// sits at its path where a location admits it; a rename no location admits
// at its new path sits at its old path where one admits that, so a rename
// across a location's boundary stays reviewable. Either way a renamed file
// is one entry: its old path's published entry gives way to it. A deleted
// file stays, whether or not the published tree still lists it. Without a
// story, the trees are the published files alone. "Selected story only" is
// the same join restricted to its changed entries (`storyChangesOnly`), and
// the folders to open follow from it too (`storyOverlayExpansion`).

import type { IntentLocation } from "./authenticatedIntentRead.ts";
import { locationSelectsRepositoryPath } from "./intentLocationSelection.ts";
import {
  reviewFileTree,
  reviewFoldersContainingChanges,
  type ChangeKind,
} from "./reviewFileTree.ts";
import type { ReviewedFile } from "./storyReviewFiles.ts";

// One file of a location's tree, its path relative to the location.
export type IntentTreeFile = {
  readonly path: string;
  // The story's change to this file; absent when the story left it alone.
  readonly kind?: ChangeKind;
  readonly change?: ReviewedFile;
  // Whether the published revision lists this file in the location.
  readonly published: boolean;
};

// Path whose baseline CI figures a rename reads; otherwise `path`.
export function baselinePathOf(
  treeFile: IntentTreeFile | undefined,
  path: string,
): string {
  if (treeFile?.change?.kind === "renamed") return treeFile.change.oldPath;
  return path;
}

export type LocationOverlay = {
  readonly files: readonly IntentTreeFile[];
  readonly containsChanges: boolean;
};

export type StoryOverlay = {
  // One per configured location, in configured order.
  readonly locations: readonly LocationOverlay[];
  // The story's changed files no location admits by either path.
  readonly outside: number;
};

// Where the comparison's changed file sits in Intent: its path where a
// location admits it, else a rename's old path where one admits that.
function placementOf(
  locations: readonly IntentLocation[],
  change: ReviewedFile,
): string | undefined {
  const admitted = (path: string) =>
    locations.some((location) => locationSelectsRepositoryPath(path, location));
  if (admitted(change.path)) return change.path;
  if (change.kind === "renamed" && admitted(change.oldPath))
    return change.oldPath;
  return undefined;
}

export function intentStoryOverlay(
  locations: readonly IntentLocation[],
  changed: readonly ReviewedFile[] | undefined,
): StoryOverlay {
  const placed = new Map<string, ReviewedFile>();
  // Old paths whose published entry a rename replaces.
  const movedAway = new Set<string>();
  let outside = 0;
  for (const change of changed ?? []) {
    const at = placementOf(locations, change);
    if (at === undefined) {
      outside += 1;
      continue;
    }
    placed.set(at, change);
    if (change.kind === "renamed" && at === change.path)
      movedAway.add(change.oldPath);
  }
  return {
    outside,
    locations: locations.map((location) => {
      const prefix = `${location.path}/`;
      const published = new Set(location.files);
      const files: IntentTreeFile[] = [];
      // The read lists a location's files by repository path under it.
      for (const full of location.files) {
        if (movedAway.has(full)) continue;
        const change = placed.get(full);
        files.push({
          path: full.slice(prefix.length),
          published: true,
          ...(change === undefined ? {} : { kind: change.kind, change }),
        });
      }
      for (const [at, change] of placed) {
        if (published.has(at) || !locationSelectsRepositoryPath(at, location))
          continue;
        files.push({
          path: at.slice(prefix.length),
          published: false,
          kind: change.kind,
          change,
        });
      }
      return {
        files,
        containsChanges: files.some((file) => file.change !== undefined),
      };
    }),
  };
}

// The overlay with only the story's changed entries, deleted and renamed ones
// included, each location still marked by whether it contains any.
export function storyChangesOnly(overlay: StoryOverlay): StoryOverlay {
  return {
    outside: overlay.outside,
    locations: overlay.locations.map((location) => ({
      ...location,
      files: location.files.filter((file) => file.change !== undefined),
    })),
  };
}

// Each overlaid tree file by its repository path.
export function overlayFilesByPath(
  locations: readonly IntentLocation[],
  overlay: StoryOverlay,
): ReadonlyMap<string, IntentTreeFile> {
  return new Map(
    overlay.locations.flatMap(({ files }, index) =>
      files.map((file) => [
        `${locations[index]?.path ?? ""}/${file.path}`,
        file,
      ]),
    ),
  );
}

// Which tree the story opens: the first location, in configured order, that
// contains changes, and in each location the folders that contain changes;
// every other folder and location stays collapsed. Restricting the overlay to
// its changes leaves this the same. Intent applies it when it opens with a
// selected story's comparison and at each "Selected story only" toggle, never
// on a live selection change.
export type StoryOverlayExpansion = {
  readonly location: string | undefined;
  // Per location, in configured order, its folders to open by path relative
  // to the location, as its tree names them (`./reviewFileTree.ts`).
  readonly folders: readonly (readonly string[])[];
};

export function storyOverlayExpansion(
  locations: readonly IntentLocation[],
  overlay: StoryOverlay,
): StoryOverlayExpansion {
  const first = overlay.locations.findIndex(
    (location) => location.containsChanges,
  );
  return {
    location: first < 0 ? undefined : locations[first]?.path,
    folders: overlay.locations.map((location) =>
      reviewFoldersContainingChanges(reviewFileTree(location.files)),
    ),
  };
}
