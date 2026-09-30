// Where a Claude Code execution's start puts its checkout, decided by this
// host's convention and nothing else: `<project folder>/.worktrees/<slug>` on
// the branch `claude/<slug>`, the slug drawn from the story's title. Pure:
// the caller says which slugs are already in use (`./executionStart.ts`
// reads the folder and the branches), so a colliding title gets a numeric
// suffix instead of another story's workspace.

import path from "node:path";
import type { ProjectFolder } from "./projectFolders.ts";

export const worktreesFolder = ".worktrees";
export const branchPrefix = "claude/";

const slugLimit = 48;

export type WorkspaceChoice = {
  readonly workspace: ProjectFolder;
  readonly branch: string;
};

// The title in lowercase words joined by hyphens, accents dropped, cut at
// `slugLimit` characters on a word edge where it can be; `story` when
// nothing usable is left.
export function slugOf(title: string): string {
  const words = title
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const cut = words.slice(0, slugLimit).replace(/-+$/, "");
  return cut === "" ? "story" : cut;
}

// The first of `slug`, `slug-2`, `slug-3`, ... that `taken` does not hold.
function freeSlug(slug: string, taken: ReadonlySet<string>): string {
  let candidate = slug;
  for (let count = 2; taken.has(candidate); count += 1) {
    candidate = `${slug}-${String(count)}`;
  }
  return candidate;
}

export function claudeWorkspace(
  project: ProjectFolder,
  title: string,
  taken: ReadonlySet<string>,
): WorkspaceChoice {
  const slug = freeSlug(slugOf(title), taken);
  return {
    workspace: {
      path: path.join(project.path, worktreesFolder, slug),
      shown: `${project.shown}/${worktreesFolder}/${slug}`,
    },
    branch: `${branchPrefix}${slug}`,
  };
}
