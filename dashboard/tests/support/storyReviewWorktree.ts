// Story A's worktree for its review (../story-review.spec.ts), off a real bare
// origin (./startOrigin.ts); its kept launch record names that worktree
// (./storyLaunchRecord.ts). The worktree's story commits rename a trunk file
// and add one, delete another, and change an image; it merged trunk carrying
// another story's file, trunk moved on since, and it holds a staged, an
// unstaged, an untracked, and an ignored file. A worktree straight off trunk
// has nothing to review, and a story whose first commit landed on trunk has
// only its later changes to review. A story changing files in nested folders,
// at the root, and across folders by a rename shows its files under their
// folders. A large story changes more files than the file browser holds and
// files longer than the diff shows.

import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { StartOrigin } from "./startOrigin.ts";

export const branch = "claude/story-a";

export const git = (cwd: string, ...args: string[]) =>
  execFileSync("git", args, { cwd, encoding: "utf8" }).trim();

function commitAll(cwd: string, message: string) {
  git(cwd, "add", "--all");
  git(cwd, "commit", "--quiet", "-m", message);
}

// Lines enough for a small edit to stay a rename.
const lines = (word: string, count = 12) =>
  [...Array(count).keys()].map((line) => `${word} ${String(line)}\n`).join("");

// An image's bytes, which Git reads as binary.
const image = (last: number) =>
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, last]);

// The unstaged edit's added line, too long for the review to show unscrolled.
export const wideLine = `more ${"wide ".repeat(80)}`;

// A file written at its path under a root, making its folders.
function writeAt(root: string, file: string, text: string) {
  mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
  writeFileSync(path.join(root, file), text);
}

// Story A's worktree on its branch, started from the project's trunk.
function addStoryWorktree(project: string) {
  const workspace = path.join(project, ".worktrees", "story-a");
  git(project, "worktree", "add", "--quiet", "-b", branch, workspace, "main");
  return workspace;
}

// Story A's worktree as the review should find it, and the trunk commit the
// story merged, which is the review's baseline.
export function storyWorktree(origin: StartOrigin) {
  const project = origin.project;
  // Trunk's files the story changes.
  writeFileSync(path.join(project, "old.txt"), lines("old"));
  writeFileSync(path.join(project, "staged.txt"), lines("staged"));
  writeFileSync(path.join(project, "unstaged.txt"), lines("unstaged"));
  writeFileSync(path.join(project, "gone.txt"), lines("gone", 3));
  writeFileSync(path.join(project, "image.png"), image(1));
  commitAll(project, "trunk files");
  git(project, "push", "--quiet", "origin", "main");

  const workspace = addStoryWorktree(project);
  git(workspace, "mv", "old.txt", "new.txt");
  writeFileSync(path.join(workspace, "new.txt"), `${lines("old")}renamed\n`);
  commitAll(workspace, "rename with a small edit");
  writeFileSync(path.join(workspace, "story.txt"), "story\n");
  commitAll(workspace, "story file");
  rmSync(path.join(workspace, "gone.txt"));
  writeFileSync(path.join(workspace, "image.png"), image(2));
  commitAll(workspace, "delete a file and redraw the image");

  // Another story lands on trunk, and the story merges trunk.
  const elsewhere = mkdtempSync(path.join(origin.machine, "elsewhere-"));
  git(elsewhere, "clone", "--quiet", origin.origin, ".");
  git(elsewhere, "config", "user.name", "Another Developer");
  git(elsewhere, "config", "user.email", "another@example.test");
  writeFileSync(path.join(elsewhere, "other.txt"), "other story\n");
  commitAll(elsewhere, "another story");
  git(elsewhere, "push", "--quiet", "origin", "main");
  const merged = git(elsewhere, "rev-parse", "HEAD");
  git(workspace, "fetch", "--quiet", "origin", "main");
  git(workspace, "merge", "--quiet", "--no-ff", "-m", "merge trunk", merged);

  // Trunk moves on after the merge; nothing here fetches it.
  writeFileSync(path.join(elsewhere, "other2.txt"), "later trunk\n");
  commitAll(elsewhere, "later trunk");
  git(elsewhere, "push", "--quiet", "origin", "main");
  const later = git(elsewhere, "rev-parse", "HEAD");
  rmSync(elsewhere, { recursive: true, force: true });

  // What the worktree holds beyond its commits.
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

// Story A's worktree straight off trunk, with nothing the story changed.
export function unchangedWorktree(origin: StartOrigin) {
  const workspace = addStoryWorktree(origin.project);
  return { workspace, trunk: git(origin.project, "rev-parse", "main") };
}

// Story A's worktree whose first commit landed on trunk, which is the
// review's baseline, then a later commit and an edit trunk does not have.
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

// Story A's worktree changing files in nested folders, under a chain of
// single folders, at the root, and by a rename across folders that leaves
// its old folder's other file alone.
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

// The large story's two long files, the first with a line wider than the
// diff.
export const longA = "long-a.txt";
export const longB = "long-b.txt";

// Story A's worktree adding the large story's files: two folders of many
// small files, a file whose name is wider than the file browser, and the
// long files.
export function largeWorktree(origin: StartOrigin) {
  const workspace = addStoryWorktree(origin.project);
  for (const folder of ["many", "more"])
    for (const at of [...Array(30).keys()])
      writeAt(
        workspace,
        `${folder}/file-${String(at).padStart(2, "0")}.txt`,
        `${folder} ${String(at)}\n`,
      );
  writeAt(
    workspace,
    `a-file-named-${"at-length-".repeat(6)}.txt`,
    "long name\n",
  );
  writeAt(workspace, longA, `${lines("first", 200)}${wideLine}\n`);
  writeAt(workspace, longB, lines("second", 200));
  commitAll(workspace, "large changes");
  return { workspace };
}

// What Git says of the worktree's own index and files.
export const observed = (workspace: string) => ({
  status: git(workspace, "status", "--porcelain=v1", "--ignored"),
  staged: git(workspace, "diff", "--cached", "--name-status"),
});
