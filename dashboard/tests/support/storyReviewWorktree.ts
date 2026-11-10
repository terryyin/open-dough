// Real Git worktrees for review, off the bare origin in startOrigin.ts.
// Fixtures cover uncommitted changes, trunk integration, nested files and large
// diffs; cases remain in ../review/story-review*.spec.ts.

import { execFileSync } from "node:child_process";
import {
  chmodSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { writeRevisionFiles } from "../../../tests/support/repository-revision-files.mjs";
import { largeReviewRevision } from "./largeReviewFiles.ts";
import type { StartOrigin } from "./startOrigin.ts";

export { longA, longB } from "./largeReviewFiles.ts";

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

const image = (last: number) =>
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, last]);

// The unstaged edit's added line, too long for the review to show unscrolled.
export const wideLine = `more ${"wide ".repeat(80)}`;

export function writeAt(root: string, file: string, text: string) {
  mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
  writeFileSync(path.join(root, file), text);
}

export function addStoryWorktree(project: string) {
  const workspace = path.join(project, ".worktrees", "story-a");
  git(project, "worktree", "add", "--quiet", "-b", branch, workspace, "main");
  return workspace;
}

// Story A's worktree as the review should find it, and the trunk commit the
// story merged, which is the review's baseline.
export function storyWorktree(origin: StartOrigin) {
  const project = origin.project;
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

// Many files, a name wider than the browser and long diffs. Reading journeys
// can state a different wide line without changing other large comparisons.
export function largeWorktree(origin: StartOrigin, firstWideLine = wideLine) {
  const workspace = addStoryWorktree(origin.project);
  const revision = largeReviewRevision(
    `${lines("first", 200)}${firstWideLine}\n`,
    lines("second", 200),
  );
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
