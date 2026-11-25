import type { PathTreeNode } from "./reviewFileTree.ts";

export type IntentFolderCue = "root" | "ancestor";

// A root has a cue whenever it is in the shown inventory. A collapsed
// ancestor has a cue only while it is hiding a root in that inventory.
export function intentFolderCues(
  nodes: readonly PathTreeNode[],
  collapsed: ReadonlySet<string>,
  configuredRoots: ReadonlySet<string>,
): ReadonlyMap<string, IntentFolderCue> {
  const cues = new Map<string, IntentFolderCue>();
  function visit(folders: readonly PathTreeNode[]): boolean {
    let containsRoot = false;
    for (const folder of folders) {
      if (folder.kind !== "folder") continue;
      const root = configuredRoots.has(folder.path);
      const rootBelow = visit(folder.children);
      if (root) cues.set(folder.path, "root");
      else if (rootBelow && collapsed.has(folder.path))
        cues.set(folder.path, "ancestor");
      containsRoot ||= root || rootBelow;
    }
    return containsRoot;
  }
  visit(nodes);
  return cues;
}
