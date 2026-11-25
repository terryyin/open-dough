// Story changes overlay the published inventory at their repository paths.
// A moved-out file keeps its former Intent proof scope without a second row.
import type { IntentLocation } from "./authenticatedIntentRead.ts";
import { locationSelectsRepositoryPath } from "./intentLocationSelection.ts";
import {
  reviewFileOrder,
  reviewFileTree,
  reviewFoldersHolding,
  type ChangeKind,
  type PathTreeNode,
} from "./reviewFileTree.ts";
import type { ReviewedFile } from "./storyReviewFiles.ts";

// A story row's path is relative to the repository root. Project groups
// pass their relative path to the shared FileTree.
export type IntentTreeFile = {
  readonly path: string;
  readonly kind?: ChangeKind;
  readonly change?: ReviewedFile;
  readonly published: boolean;
  readonly destinationLocations?: readonly string[];
  // Neither side belongs to a configured location.
  readonly outside?: true;
  // For a rename leaving Intent, the former path supplies location proof.
  readonly proofPath?: string;
};

export type StoryOverlay = {
  readonly files: ReadonlyMap<string, IntentTreeFile>;
  readonly renamedPaths: ReadonlyMap<string, string>;
  readonly changedLocations: ReadonlySet<string>;
};

export function baselinePathOf(
  treeFile: IntentTreeFile | undefined,
  path: string,
): string {
  if (treeFile?.change?.kind === "renamed") return treeFile.change.oldPath;
  return path;
}

export function intentStoryOverlay(
  locations: readonly IntentLocation[],
  changed: readonly ReviewedFile[] | undefined,
  inventory?: readonly string[],
): StoryOverlay {
  const published = new Set(
    inventory ?? locations.flatMap(({ files }) => files),
  );
  const files = new Map<string, IntentTreeFile>();
  const renamedPaths = new Map<string, string>();
  const changedLocations = new Set<string>();
  for (const change of changed ?? []) {
    if (change.kind === "renamed")
      renamedPaths.set(change.oldPath, change.path);
  }
  for (const path of published) {
    if (inventory !== undefined || !renamedPaths.has(path))
      files.set(path, { path, published: true });
  }
  const matching = (path: string) =>
    locations.filter((location) =>
      locationSelectsRepositoryPath(path, location),
    );
  for (const change of changed ?? []) {
    const { path, kind } = change;
    const destination = matching(path);
    const previous =
      destination.length === 0 && kind === "renamed"
        ? matching(change.oldPath)
        : [];
    for (const location of [...destination, ...previous]) {
      changedLocations.add(location.path);
    }
    files.set(path, {
      path,
      kind,
      change,
      published: published.has(path),
      destinationLocations: destination.map(({ path }) => path),
      ...(destination.length === 0 && previous.length === 0
        ? { outside: true }
        : {}),
      ...(previous.length > 0 && kind === "renamed"
        ? { proofPath: change.oldPath }
        : {}),
    });
  }
  return { files, renamedPaths, changedLocations };
}

// A path still held by a row takes precedence over a renamed-away path.
export function storyFilePath(overlay: StoryOverlay, path: string): string {
  if (overlay.files.has(path)) return path;
  return overlay.renamedPaths.get(path) ?? path;
}

// Scope Summary reads the configured location even if a file moved out.
export function intentLocationFiles(
  files: ReadonlyMap<string, IntentTreeFile>,
  location: IntentLocation,
): ReadonlyMap<string, IntentTreeFile> {
  const published = new Set(location.files);
  const scoped = new Map<string, IntentTreeFile>();
  for (const file of files.values()) {
    const path = file.proofPath ?? file.path;
    if (
      !published.has(path) &&
      (file.change === undefined ||
        !locationSelectsRepositoryPath(path, location))
    )
      continue;
    if (path === file.path || !scoped.has(path)) scoped.set(path, file);
  }
  return scoped;
}

export function storyRepositoryTree(
  locations: readonly IntentLocation[],
  overlay: StoryOverlay,
  changesOnly: boolean,
) {
  const roots = new Map(
    locations.flatMap((location) =>
      !changesOnly || overlay.changedLocations.has(location.path)
        ? [[location.path, location] as const]
        : [],
    ),
  );
  const files = [...overlay.files.values()].filter(
    (file) => !changesOnly || file.kind !== undefined,
  );
  // The listed inventory by repository path; a folder's file list reads it.
  const listed = new Map(files.map((file) => [file.path, file] as const));
  // Keep the former folder's Summary reachable without adding a file row.
  const proofFolders = files.flatMap(({ proofPath }) =>
    proofPath === undefined
      ? []
      : [proofPath.slice(0, proofPath.lastIndexOf("/"))],
  );
  const nodes = reviewFileTree(files, {
    compact: false,
    folders: [...roots.keys(), ...proofFolders],
  });
  return {
    nodes,
    roots,
    files: listed as ReadonlyMap<string, IntentTreeFile>,
    // Changes only is on and no path matches it.
    noMatch: changesOnly && files.length === 0,
    changedFiles: reviewFileOrder(nodes).filter(
      (file) => file.kind !== undefined,
    ),
  };
}

// Reveal the first changed configured root and the folders that hold changed
// files. Other configured roots still disclose on request.
export function storyOverlayExpansion(
  locations: readonly IntentLocation[],
  overlay: StoryOverlay,
  tree: readonly PathTreeNode<IntentTreeFile>[],
  changedFiles: readonly IntentTreeFile[],
): readonly string[] {
  const first = locations.find(({ path }) =>
    overlay.changedLocations.has(path),
  );
  const opened = new Set(
    locations.flatMap(({ path }) => reviewFoldersHolding(tree, path)),
  );
  const rootsOtherThanFirst = new Set(
    locations
      .filter(({ path }) => path !== first?.path)
      .map(({ path }) => path),
  );
  for (const file of changedFiles) {
    if (file.proofPath !== undefined) {
      for (const folder of reviewFoldersHolding(tree, file.proofPath)) {
        if (!rootsOtherThanFirst.has(folder)) opened.add(folder);
      }
    }
    for (const folder of reviewFoldersHolding(tree, file.path)) {
      if (
        !rootsOtherThanFirst.has(folder) ||
        !file.destinationLocations?.includes(folder)
      ) {
        opened.add(folder);
      }
    }
  }
  return [...opened];
}
