// Story A's worktree for its review (../story-review.spec.ts), off a real bare
// origin (./startOrigin.ts), and its kept launch record naming that worktree,
// written into the machine store as a launch would keep it. The worktree's
// story commits rename a trunk file and add one, delete another, and change
// an image; it merged trunk carrying another story's file, trunk moved on
// since, and it holds a staged, an unstaged, an untracked, and an ignored
// file.

import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { LaunchRecord } from "../../src/agentLaunch.ts";
import type { DashboardServer } from "./dashboardServer.ts";
import { queuedIdentity, type StartOrigin } from "./startOrigin.ts";

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

  const workspace = path.join(project, ".worktrees", "story-a");
  git(project, "worktree", "add", "--quiet", "-b", branch, workspace, "main");
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

// Story A's kept launch record, its start naming the worktree.
export async function keepLaunchRecord(
  dashboard: DashboardServer,
  workspace: string,
) {
  const record: LaunchRecord = {
    request: {
      source: "open-dough",
      identity: queuedIdentity,
      title: "Story A",
      workflow: "execution",
      host: "claude",
    },
    session: {
      host: "claude",
      sessionId: "story-a-session",
      shortId: "story-a",
      name: "Story A",
    },
    start: {
      identity: queuedIdentity,
      publisherId: "a1b2c3",
      workspace,
      branch,
      mode: "story-branch",
      remote: "origin",
      target: "main",
      publishedSha: "b2".repeat(20),
    },
    launchedAt: new Date().toISOString(),
  };
  const store = path.join(
    dashboard.home,
    ".open-dough/dashboard/agent-launches.json",
  );
  await mkdir(path.dirname(store), { recursive: true });
  await writeFile(store, JSON.stringify({ "open-dough": [record] }));
}

// What Git says of the worktree's own index and files.
export const observed = (workspace: string) => ({
  status: git(workspace, "status", "--porcelain=v1", "--ignored"),
  staged: git(workspace, "diff", "--cached", "--name-status"),
});
