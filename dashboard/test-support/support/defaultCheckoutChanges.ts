// A default checkout holding existing changes, and how the launch dialogs
// name them before a Default main start.
import { execFileSync } from "node:child_process";
import { appendFileSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

export const existingChangesHeading = "Existing changes in default main";

// In Git status order: tracked changes, then untracked files.
export const changedPaths = [
  ".gitignore",
  ".planning/slice-plans/B/PLAN.md",
  "staged.txt",
  "notes/untracked.txt",
];

// What the new files hold, which the dialog never shows.
export const changedContent = "private-file-content";

// Leaves the default checkout with a changed, a deleted, a staged, and an
// untracked file.
export function dirty(project: string) {
  appendFileSync(path.join(project, ".gitignore"), "tmp/\n");
  rmSync(path.join(project, ".planning/slice-plans/B/PLAN.md"));
  writeFileSync(path.join(project, "staged.txt"), `${changedContent}\n`);
  execFileSync("git", ["-C", project, "add", "staged.txt"]);
  mkdirSync(path.join(project, "notes"));
  writeFileSync(
    path.join(project, "notes/untracked.txt"),
    `${changedContent}\n`,
  );
}

export const status = (project: string) =>
  execFileSync("git", ["-C", project, "status", "--porcelain"], {
    encoding: "utf8",
  });
