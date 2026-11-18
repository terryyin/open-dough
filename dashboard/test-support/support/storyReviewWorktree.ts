// Real Git worktrees for review, off the bare origin in startOrigin.ts.
// Fixtures cover uncommitted changes, trunk integration, nested files and large
// diffs; cases remain in ../review/story-review*.spec.ts.

import { execFileSync } from "node:child_process";
import { chmodSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { RepositoryRevision } from "../../../Distribution/tests/support/repositoryTestData.mjs";
import { writeRevisionFiles } from "../../../Distribution/tests/support/repository-revision-files.mjs";
import type { StartOrigin } from "./startOrigin.ts";

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

// Story A's worktree as the review should find it, from an origin started
// with ./storyAReviewRepository.ts, and the trunk commit the story merged,
// which is the review's baseline. Its uncommitted edits are written here.
export function storyWorktree(origin: StartOrigin) {
  const workspace = storyWorkspace(origin.project);
  const merged = origin.revision("merged");
  const later = origin.revision("later");
  writeFileSync(path.join(workspace, "staged.txt"), `${lines("staged")}more\n`);
  git(workspace, "add", "staged.txt");
  writeFileSync(
    path.join(workspace, "unstaged.txt"),
    `${lines("unstaged").replace("unstaged 5\n", "unstaged five\n")}${wideLine}\n`,
  );
  mkdirSync(path.join(workspace, "fresh"));
  writeFileSync(path.join(workspace, "fresh", "new.txt"), "untracked\n");
  const exclude = path.join(
    git(workspace, "rev-parse", "--git-common-dir"),
    "info",
    "exclude",
  );
  writeFileSync(exclude, "ignored.log\n", { flag: "a" });
  writeFileSync(path.join(workspace, "ignored.log"), "ignored\n");
  return { workspace, merged, later };
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

// A merged trunk file changes mode alone against the baseline.
export function changeModeOnly(workspace: string) {
  chmodSync(path.join(workspace, "other.txt"), 0o755);
}

// Story A's worktree straight off trunk, with nothing the story changed.
export function unchangedWorktree(origin: StartOrigin) {
  const workspace = addStoryWorktree(origin.project);
  return { workspace, trunk: git(origin.project, "rev-parse", "main") };
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

// Nested changes include a cross-folder rename leaving a sibling unchanged.
export function nestedWorktree(origin: StartOrigin) {
  const project = origin.project;
  const trunkFiles = {
    "dashboard/src/b.ts": lines("b"),
    "dashboard/server/c.ts": lines("c"),
    "README.md": lines("readme"),
    "old/a.ts": lines("a"),
    "old/kept.ts": lines("kept"),
  };
  for (const [file, text] of Object.entries(trunkFiles)) {
    writeAt(project, file, text);
  }
  commitAll(project, "trunk files");
  git(project, "push", "--quiet", "origin", "main");

  const workspace = addStoryWorktree(project);
  const write = (file: string, text: string) => {
    writeAt(workspace, file, text);
  };
  write("dashboard/src/a.tsx", "added\n");
  write("dashboard/src/b.ts", `${lines("b")}more\n`);
  rmSync(path.join(workspace, "dashboard/server/c.ts"));
  write("README.md", `${lines("readme")}more\n`);
  write("docs/adrs/drafts/0009-tree.md", "tree\n");
  mkdirSync(path.join(workspace, "new"));
  git(workspace, "mv", "old/a.ts", "new/a.ts");
  commitAll(workspace, "nested changes");
  return { workspace };
}

// Story A's worktree with one commit of the comparison a consumer describes
// (./largeReviewFiles.ts).
export function largeWorktree(
  origin: StartOrigin,
  revision: RepositoryRevision,
) {
  const workspace = addStoryWorktree(origin.project);
  writeRevisionFiles(workspace, revision);
  commitAll(workspace, revision.name);
  return { workspace };
}

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
export function expandContextWorktree(origin: StartOrigin) {
  const project = origin.project;
  writeFileSync(
    path.join(project, expandContextFile),
    expandContextLines("line", 160),
  );
  commitAll(project, "expand context trunk");
  git(project, "push", "--quiet", "origin", "main");

  const workspace = addStoryWorktree(project);
  const edited = expandContextLines("line", 160)
    .replace("line 54\n", "changed fifty-four\n")
    .replace("line 127\n", "changed one-twenty-seven\n");
  writeFileSync(path.join(workspace, expandContextFile), edited);
  commitAll(workspace, "two distant edits");
  return { workspace };
}
