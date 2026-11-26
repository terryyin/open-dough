// The open folders of Intent's repository tree. A path selection or directed
// reveal opens its ancestors. A story comparison may provide its own expansion
// for the next round. The reading place keeps arrangement across visits.

import { useKeptArrangement } from "./pageIntentReading.tsx";
import {
  reviewFolderPaths,
  reviewFoldersHolding,
  type PathBearing,
  type PathTreeNode,
} from "./reviewFileTree.ts";

// The folders to open when the story comparison's round changes.
export type TreeExpansion = {
  readonly round: number | string;
  readonly folders: readonly string[];
};

// A request to show a selected path in the tree; each new object is one
// request.
export type TreeReveal = { readonly path: string };

export function useIntentOpenFolders<T extends PathBearing>({
  tree,
  revealPath,
  expansion,
  reveal,
}: {
  readonly tree: readonly PathTreeNode<T>[];
  // The selected file or folder, as a repository path, or "".
  readonly revealPath: string;
  readonly expansion: TreeExpansion | undefined;
  // A fresh reveal request for a repository path.
  readonly reveal: TreeReveal | undefined;
}): {
  readonly collapsed: ReadonlySet<string>;
  readonly toggleFolder: (folderPath: string) => void;
} {
  // Folders are tracked by the ones open, so a folder not yet seen starts
  // collapsed; the selection last revealed keeps a moved selection opening
  // its folders without reopening one collapsed around it since.
  const kept = (name: string) => `folders:${name}`;
  const [openFolders, setOpenFolders] = useKeptArrangement<ReadonlySet<string>>(
    kept("open"),
    () => new Set(reviewFoldersHolding(tree, revealPath)),
  );
  const [revealed, setRevealed] = useKeptArrangement(
    kept("revealed"),
    () => revealPath,
  );
  const [requested, setRequested] = useKeptArrangement(
    kept("requested"),
    () => reveal,
  );
  const [expandedRound, setExpandedRound] = useKeptArrangement<
    TreeExpansion["round"] | undefined
  >(kept("expandedRound"), () => undefined);
  // The folders open in this render, after a new expansion, a moved
  // selection, and a new reveal request have all been applied.
  let open = openFolders;
  function openHolding(path: string) {
    const holding = reviewFoldersHolding(tree, path);
    if (holding.some((folderPath) => !open.has(folderPath))) {
      open = new Set([...open, ...holding]);
      setOpenFolders(open);
    }
  }
  if (expansion !== undefined && expansion.round !== expandedRound) {
    setExpandedRound(expansion.round);
    open = new Set(expansion.folders);
    setOpenFolders(open);
  }
  if (revealed !== revealPath) {
    setRevealed(revealPath);
    openHolding(revealPath);
  }
  if (reveal !== undefined && reveal !== requested) {
    setRequested(reveal);
    openHolding(reveal.path);
  }
  const collapsed = new Set(
    reviewFolderPaths(tree).filter((folderPath) => !open.has(folderPath)),
  );

  function toggleFolder(folderPath: string) {
    setOpenFolders((was) => {
      const next = new Set(was);
      if (next.has(folderPath)) next.delete(folderPath);
      else next.add(folderPath);
      return next;
    });
  }

  return { collapsed, toggleFolder };
}
