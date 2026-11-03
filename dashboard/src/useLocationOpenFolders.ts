// The folders open in one Intent location's tree (`./IntentLocationGroup.tsx`).
// Every folder starts collapsed except those holding the selection. The
// folders holding the selection open again whenever the selection moves to
// another file or folder, and at each new reveal request inside the location
// (an open from the candidates record or a summary), even for the selection
// already made, so a test opened from elsewhere shows selected in the tree.
// Each new expansion a selected story's overlay asks for opens exactly the
// folders it names.

import { useState } from "react";
import {
  reviewFolderPaths,
  reviewFoldersHolding,
  type PathBearing,
  type PathTreeNode,
} from "./reviewFileTree.ts";

// A new set of folders for a location to open, asked for each time its round
// changes.
export type LocationExpansion = {
  readonly round: number;
  readonly folders: readonly string[];
};

// A request to show a selected path in the tree; each new object is one
// request.
export type TreeReveal = { readonly path: string };

export function useLocationOpenFolders<T extends PathBearing>({
  tree,
  revealPath,
  expansion,
  reveal,
}: {
  readonly tree: readonly PathTreeNode<T>[];
  // The selected file or folder, relative to the location, or "".
  readonly revealPath: string;
  readonly expansion: LocationExpansion | undefined;
  // A reveal request inside this location, relative to it.
  readonly reveal:
    { readonly request: TreeReveal; readonly path: string } | undefined;
}): {
  readonly collapsed: ReadonlySet<string>;
  readonly toggleFolder: (folderPath: string) => void;
} {
  // Folders are tracked by the ones open, so a folder not yet seen starts
  // collapsed; the selection last revealed keeps a moved selection opening
  // its folders without reopening one collapsed around it since.
  const [openFolders, setOpenFolders] = useState<ReadonlySet<string>>(
    () => new Set(reviewFoldersHolding(tree, revealPath)),
  );
  const [revealed, setRevealed] = useState(revealPath);
  const [requested, setRequested] = useState(reveal?.request);
  const [expandedRound, setExpandedRound] = useState<number | undefined>();
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
  if (reveal !== undefined && reveal.request !== requested) {
    setRequested(reveal.request);
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
