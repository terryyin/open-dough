// Real Git worktrees for review, off the bare origin in startOrigin.ts.
// Fixtures cover uncommitted changes, trunk integration, nested files and large
// diffs; cases remain in ../review/story-review*.spec.ts.

import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { RepositoryRevision } from "../../../Distribution/tests/support/repositoryTestData.mjs";
import { queuedReadyRepository } from "../../../Distribution/tests/support/queued-repository.mjs";
import type { StartOrigin } from "./startOrigin.ts";
import type { StartRepository } from "./startOriginPreparation.ts";

export const branch = "claude/story-a";

export const git = (cwd: string, ...args: string[]) =>
  execFileSync("git", args, { cwd, encoding: "utf8" }).trim();

export function commitAll(cwd: string, message: string) {
  git(cwd, "add", "--all");
  git(cwd, "commit", "--quiet", "-m", message);
}

// Lines enough for a small edit to stay a rename.
export const lines = (word: string, count = 12) =>
  [...Array(count).keys()].map((line) => `${word} ${String(line)}\n`).join("");

// The unstaged edit's added line, too long for the review to show unscrolled.
export const wideLine = `more ${"wide ".repeat(80)}`;

export function writeAt(root: string, file: string, text: string) {
  mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
  writeFileSync(path.join(root, file), text);
}

// Where Story A's linked worktree is checked out, on `branch`.
const storyWorkspace = (project: string) =>
  path.join(project, ".worktrees", "story-a");

export function addStoryWorktree(project: string) {
  const workspace = storyWorkspace(project);
  git(project, "worktree", "add", "--quiet", "-b", branch, workspace, "main");
  return workspace;
}

// Story A's worktree as the review finds it, from an origin started with a
// declared Story A workspace, and the queued trunk's revision `base`; with
// ./storyAReviewRepository.ts, also the trunk commit the story merged, the
// review's baseline, and the later one.
export function storyWorktree(origin: StartOrigin) {
  return {
    workspace: storyWorkspace(origin.project),
    get base() {
      return origin.revision("base");
    },
    get merged() {
      return origin.revision("merged");
    },
    get later() {
      return origin.revision("later");
    },
  };
}

// Admission: one story commit, a merged baseline and an edit, with trunk later unfetched.
export function admissionWorktree(origin: StartOrigin) {
  const project = origin.project;
  const workspace = addStoryWorktree(project);
  writeFileSync(path.join(workspace, "story.txt"), "story\n");
  commitAll(workspace, "story file");
  git(project, "commit", "--quiet", "--allow-empty", "-m", "another story");
  git(project, "push", "--quiet", "origin", "main");
  const merged = git(project, "rev-parse", "origin/main");
  git(workspace, "merge", "--quiet", "--no-ff", "-m", "merge trunk", merged);
  writeFileSync(path.join(workspace, "story.txt"), "story\nedited\n");
  const later = git(
    origin.origin,
    "-c",
    "user.name=Another Developer",
    "-c",
    "user.email=another@example.test",
    "commit-tree",
    "-p",
    merged,
    "-m",
    "later trunk",
    `${merged}^{tree}`,
  );
  git(origin.origin, "update-ref", "refs/heads/main", later, merged);
  return { workspace, merged };
}

// The first story commit landed; trunk lacks its later commit and edit.
export function landedWorktree(origin: StartOrigin) {
  const project = origin.project;
  writeFileSync(path.join(project, "edited.txt"), lines("edited"));
  commitAll(project, "trunk file");
  git(project, "push", "--quiet", "origin", "main");

  const workspace = addStoryWorktree(project);
  writeFileSync(path.join(workspace, "landed.txt"), "landed slice\n");
  commitAll(workspace, "landed slice");
  git(workspace, "push", "--quiet", "origin", "HEAD:main");
  const landed = git(workspace, "rev-parse", "HEAD");
  writeFileSync(path.join(workspace, "later.txt"), "later slice\n");
  commitAll(workspace, "later slice");
  writeFileSync(path.join(workspace, "edited.txt"), `${lines("edited")}more\n`);
  return { workspace, landed };
}

// Story A's worktree declared straight off the queued trunk's revision
// `base`; consumers add the story's revisions.
export const storyFromBase = () =>
  queuedReadyRepository().withWorkspace(branch, { from: "base" });

// Story A's worktree declared off the queued trunk, which first gains
// `files` as revision `trunk files`; consumers add the story's revisions.
const offTrunk = (files: Record<string, string>) =>
  queuedReadyRepository()
    .withRevision("trunk files", { files })
    .withWorkspace(branch, { from: "trunk files" });

// Story A's worktree straight off trunk, with nothing the story changed.
export const unchangedRepository: StartRepository = storyFromBase().please();

// Nested changes include a cross-folder rename leaving a sibling unchanged.
export const nestedRepository: StartRepository = offTrunk({
  "dashboard/src/b.ts": lines("b"),
  "dashboard/server/c.ts": lines("c"),
  "README.md": lines("readme"),
  "old/a.ts": lines("a"),
  "old/kept.ts": lines("kept"),
})
  .withUnpublishedRevision("nested changes", {
    remove: ["dashboard/server/c.ts", "old/a.ts"],
    files: {
      "dashboard/src/a.tsx": "added\n",
      "dashboard/src/b.ts": `${lines("b")}more\n`,
      "README.md": `${lines("readme")}more\n`,
      "docs/adrs/drafts/0009-tree.md": "tree\n",
      "new/a.ts": lines("a"),
    },
  })
  .please();

// Story A's worktree with one commit of the comparison a consumer describes
// (./largeReviewFiles.ts).
export const largeRepository = (revision: RepositoryRevision) =>
  storyFromBase().withUnpublishedRevision(revision.name, revision).please();

// What Git says of the worktree's own index and files.
export const observed = (workspace: string) => ({
  status: git(workspace, "status", "--porcelain=v1", "--ignored"),
  staged: git(workspace, "diff", "--cached", "--name-status"),
});

// Default diff context omits lines around two distant edits.
export const expandContextFile = "expand-context.txt";

export function expandContextLines(word: string, count: number) {
  return [...Array(count).keys()]
    .map((line) => `${word} ${String(line + 1)}\n`)
    .join("");
}

// One modified file has separated hunks and omitted trailing context.
export const expandContextRepository: StartRepository = offTrunk({
  [expandContextFile]: expandContextLines("line", 160),
})
  .withUnpublishedRevision("two distant edits", {
    files: {
      [expandContextFile]: expandContextLines("line", 160)
        .replace("line 54\n", "changed fifty-four\n")
        .replace("line 127\n", "changed one-twenty-seven\n"),
    },
  })
  .please();
