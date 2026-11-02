// Path-bearing items arranged under the folders that hold them, as the file
// browser shows them (`./StoryReviewFileTree.tsx`). Items at the repository
// root sit at the top level. A chain of folders that each hold only one folder
// is one folder named by the chain (`docs/adrs/drafts`). Each folder knows how
// many items it holds at any depth. Folders come before files, each in
// code-point order of their names, so the same list always arranges the same
// way. The browser's order reads the items from top to bottom with every
// folder expanded. Review changes supplies its reviewed files; a renamed file
// sits at its new path only.
//
// An item may carry its change kind, the one change-kind model Review changes
// and Intent share; an item without one is unchanged. Each folder knows, once
// here, whether it contains a changed item at any depth. The browser shows a
// file's kind in the style of its name (`./change-kinds.css`).

import type { ReviewedFile } from "./storyReviewFiles.ts";

export type ChangeKind = ReviewedFile["kind"];

export type PathBearing = {
  readonly path: string;
  readonly kind?: ChangeKind;
};

export type PathFolderNode<T extends PathBearing = PathBearing> = {
  readonly kind: "folder";
  // The row's name: one folder, or a compacted chain joined by `/`.
  readonly name: string;
  // The folder's full path from the repository root, which identifies it.
  readonly path: string;
  // Items inside, at any depth.
  readonly fileCount: number;
  // Whether an item inside, at any depth, carries a change kind.
  readonly containsChanges: boolean;
  readonly children: readonly PathTreeNode<T>[];
};

export type PathFileNode<T extends PathBearing = PathBearing> = {
  readonly kind: "file";
  // The last segment of the item's path.
  readonly name: string;
  readonly file: T;
};

export type PathTreeNode<T extends PathBearing = PathBearing> =
  PathFolderNode<T> | PathFileNode<T>;

type Building<T extends PathBearing> = {
  readonly folders: Map<string, Building<T>>;
  readonly files: PathFileNode<T>[];
};

const building = <T extends PathBearing>(): Building<T> => ({
  folders: new Map(),
  files: [],
});

const byName = (a: { name: string }, b: { name: string }) =>
  a.name < b.name ? -1 : a.name > b.name ? 1 : 0;

function arranged<T extends PathBearing>(
  folder: Building<T>,
  at: string,
): PathTreeNode<T>[] {
  const folders = [...folder.folders].map(([name, inner]) =>
    compacted(name, inner, at === "" ? name : `${at}/${name}`),
  );
  return [...folders.sort(byName), ...[...folder.files].sort(byName)];
}

function compacted<T extends PathBearing>(
  name: string,
  folder: Building<T>,
  path: string,
): PathFolderNode<T> {
  const [only] = folder.folders;
  if (folder.files.length === 0 && folder.folders.size === 1 && only)
    return compacted(`${name}/${only[0]}`, only[1], `${path}/${only[0]}`);
  const children = arranged(folder, path);
  const fileCount = children.reduce(
    (sum, child) => sum + (child.kind === "folder" ? child.fileCount : 1),
    0,
  );
  return {
    kind: "folder",
    name,
    path,
    fileCount,
    containsChanges: reviewContainsChanges(children),
    children,
  };
}

export function reviewFileTree<T extends PathBearing>(
  files: readonly T[],
): readonly PathTreeNode<T>[] {
  const root = building<T>();
  for (const file of files) {
    const segments = file.path.split("/");
    const name = segments.pop() ?? file.path;
    let folder = root;
    for (const segment of segments) {
      const inner = folder.folders.get(segment) ?? building<T>();
      folder.folders.set(segment, inner);
      folder = inner;
    }
    folder.files.push({ kind: "file", name, file });
  }
  return arranged(root, "");
}

// Whether any of the nodes is, or holds, a changed item.
export function reviewContainsChanges<T extends PathBearing>(
  nodes: readonly PathTreeNode<T>[],
): boolean {
  return nodes.some((node) =>
    node.kind === "folder"
      ? node.containsChanges
      : node.file.kind !== undefined,
  );
}

// The items as the browser's rows read them, each folder's items in its
// place, whether or not the browser shows it collapsed.
export function reviewFileOrder<T extends PathBearing>(
  nodes: readonly PathTreeNode<T>[],
): readonly T[] {
  return nodes.flatMap((node) =>
    node.kind === "file" ? [node.file] : reviewFileOrder(node.children),
  );
}

// Every folder's path, outer folders before the folders they hold.
export function reviewFolderPaths<T extends PathBearing>(
  nodes: readonly PathTreeNode<T>[],
): readonly string[] {
  return nodes.flatMap((node) =>
    node.kind === "file"
      ? []
      : [node.path, ...reviewFolderPaths(node.children)],
  );
}

// The folders that hold `path` at any depth, outermost first; a folder does
// not hold itself.
export function reviewFoldersHolding<T extends PathBearing>(
  nodes: readonly PathTreeNode<T>[],
  path: string,
): readonly string[] {
  for (const node of nodes) {
    if (node.kind === "folder" && path.startsWith(`${node.path}/`)) {
      return [node.path, ...reviewFoldersHolding(node.children, path)];
    }
  }
  return [];
}

// Every folder that contains a changed item, outer folders before the
// folders they hold.
export function reviewFoldersContainingChanges<T extends PathBearing>(
  nodes: readonly PathTreeNode<T>[],
): readonly string[] {
  return nodes.flatMap((node) =>
    node.kind === "folder" && node.containsChanges
      ? [node.path, ...reviewFoldersContainingChanges(node.children)]
      : [],
  );
}
