// Where a Claude Code execution's start puts its checkout, decided by this
// host's convention and nothing else: `<project folder>/.worktrees/<slug>` on
// the branch `claude/<slug>`, the slug drawn from the story's title. Pure:
// the caller says which slugs are already in use (`./executionStart.ts`
// reads the folder and the branches), so a colliding title gets a numeric
// suffix instead of another story's workspace. It also owns where this host
// installs a project's skills, so a reader of an installed skill file asks
// `installedSkillPath` instead of spelling the root.

import path from "node:path";
import type { ProjectFolder } from "./projectFolders.ts";

export const worktreesFolder = ".worktrees";
export const branchPrefix = "claude/";

const skillsFolder = path.join(".claude", "skills");

const slugLimit = 48;

// A file or folder of `skill` installed in `project`, at Claude Code's skill
// root; `segments` are the path within the skill's own folder.
export function installedSkillPath(
  project: ProjectFolder,
  skill: string,
  ...segments: readonly string[]
): string {
  return path.join(project.path, skillsFolder, skill, ...segments);
}

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

// A workspace folder as the page shows a project's folders.
export function shownWorkspace(project: ProjectFolder, slug: string): string {
  return `${project.shown}/${worktreesFolder}/${slug}`;
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
      shown: shownWorkspace(project, slug),
    },
    branch: `${branchPrefix}${slug}`,
  };
}
