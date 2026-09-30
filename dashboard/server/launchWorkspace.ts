// Shared workspace choice: `.worktrees/<slug>` and the selected host branch.
// The caller supplies occupied slugs across folders and host branches.

import type { AgentLaunchRequest } from "../src/agentLaunch.ts";
import path from "node:path";
import type { ProjectFolder } from "./projectFolders.ts";

export const worktreesFolder = ".worktrees";

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

// A workspace folder as the page shows a project's folders.
export function shownWorkspace(project: ProjectFolder, slug: string): string {
  return `${project.shown}/${worktreesFolder}/${slug}`;
}

export function launchWorkspace(
  project: ProjectFolder,
  title: string,
  taken: ReadonlySet<string>,
  host: AgentLaunchRequest["host"] = "claude",
): WorkspaceChoice {
  const slug = freeSlug(slugOf(title), taken);
  return {
    workspace: {
      path: path.join(project.path, worktreesFolder, slug),
      shown: shownWorkspace(project, slug),
    },
    branch: `${host}/${slug}`,
  };
}
