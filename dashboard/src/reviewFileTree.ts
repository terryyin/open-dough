// A story review's changed files (`./storyReview.ts`) arranged under the
// folders that hold them, as its file browser shows them
// (`./StoryReviewFileTree.tsx`). Files at the repository root sit at the
// top level. A chain of folders that each hold only one folder is one folder
// named by the chain (`docs/adrs/drafts`). A renamed file sits at its new
// path only. Each folder knows how many changed files it holds at any depth.
// Folders come before files, each in code-point order of their names, so the
// same snapshot always arranges the same way.

import type { ReviewedFile } from "./storyReview.ts";

export type ReviewFolderNode = {
  readonly kind: "folder";
  // The row's name: one folder, or a compacted chain joined by `/`.
  readonly name: string;
  // The folder's full path from the repository root, which identifies it.
  readonly path: string;
  // Changed files inside, at any depth.
  readonly fileCount: number;
  readonly children: readonly ReviewTreeNode[];
};

export type ReviewFileNode = {
  readonly kind: "file";
  // The last segment of the file's path.
  readonly name: string;
  readonly file: ReviewedFile;
};

export type ReviewTreeNode = ReviewFolderNode | ReviewFileNode;

type Building = {
  readonly folders: Map<string, Building>;
  readonly files: ReviewFileNode[];
};

const building = (): Building => ({ folders: new Map(), files: [] });

const byName = (a: { name: string }, b: { name: string }) =>
  a.name < b.name ? -1 : a.name > b.name ? 1 : 0;

function arranged(folder: Building, at: string): ReviewTreeNode[] {
  const folders = [...folder.folders].map(([name, inner]) =>
    compacted(name, inner, at === "" ? name : `${at}/${name}`),
  );
  return [...folders.sort(byName), ...[...folder.files].sort(byName)];
}

function compacted(
  name: string,
  folder: Building,
  path: string,
): ReviewFolderNode {
  const [only] = folder.folders;
  if (folder.files.length === 0 && folder.folders.size === 1 && only)
    return compacted(`${name}/${only[0]}`, only[1], `${path}/${only[0]}`);
  const children = arranged(folder, path);
  const fileCount = children.reduce(
    (sum, child) => sum + (child.kind === "folder" ? child.fileCount : 1),
    0,
  );
  return { kind: "folder", name, path, fileCount, children };
}

export function reviewFileTree(
  files: readonly ReviewedFile[],
): readonly ReviewTreeNode[] {
  const root = building();
  for (const file of files) {
    const segments = file.path.split("/");
    const name = segments.pop() ?? file.path;
    let folder = root;
    for (const segment of segments) {
      const inner = folder.folders.get(segment) ?? building();
      folder.folders.set(segment, inner);
      folder = inner;
    }
    folder.files.push({ kind: "file", name, file });
  }
  return arranged(root, "");
}
