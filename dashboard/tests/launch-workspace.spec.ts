// The shared workspace choice (../server/launchWorkspace.ts): a
// pure function of the project folder, the story's title, and the slugs
// already in use.

import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { takenSlugs } from "../server/startGit.ts";
import { expect, test } from "@playwright/test";
import { launchWorkspace, slugOf } from "../server/launchWorkspace.ts";

const project = { path: "/home/dev/git/open-dough", shown: "~/git/open-dough" };

test("puts the workspace under .worktrees on a claude/ branch named for the title", () => {
  expect(
    launchWorkspace(
      project,
      "Start execution with mechanical preparation",
      new Set(),
    ),
  ).toEqual({
    workspace: {
      path: "/home/dev/git/open-dough/.worktrees/start-execution-with-mechanical-preparation",
      shown:
        "~/git/open-dough/.worktrees/start-execution-with-mechanical-preparation",
    },
    branch: "claude/start-execution-with-mechanical-preparation",
  });
});

test("numbers the slug when another workspace or branch already has it", () => {
  const taken = new Set(["fix-it", "fix-it-2"]);
  expect(launchWorkspace(project, "Fix it!", taken).branch).toBe(
    "claude/fix-it-3",
  );
  expect(launchWorkspace(project, "Fix it!", new Set(["other"])).branch).toBe(
    "claude/fix-it",
  );
});

test("makes a plain, bounded slug from any title", () => {
  expect(slugOf("  Café: naïve — “Résumé” & more  ")).toBe(
    "cafe-naive-resume-more",
  );
  expect(slugOf("!!!")).toBe("story");
  const long = slugOf(`${"word ".repeat(30)}end`);
  expect(long.length).toBeLessThanOrEqual(48);
  expect(long).not.toMatch(/^-|-$/);
});

test("Codex shares collisions across host branches and workspace folders", async () => {
  const directory = mkdtempSync(path.join(tmpdir(), "dough-workspace-choice-"));
  try {
    execFileSync("git", ["init", "-b", "main", directory]);
    execFileSync("git", [
      "-C",
      directory,
      "-c",
      "user.name=T",
      "-c",
      "user.email=t@example.test",
      "commit",
      "--allow-empty",
      "-m",
      "baseline",
    ]);
    for (const branch of ["codex/fix-it", "claude/fix-it-2", "cursor/fix-it-3"])
      execFileSync("git", ["-C", directory, "branch", branch]);
    mkdirSync(path.join(directory, ".worktrees/fix-it-4"), { recursive: true });
    const folder = { path: directory, shown: "~/git/open-dough" };
    expect(
      launchWorkspace(folder, "Fix it!", await takenSlugs(folder), "codex"),
    ).toEqual({
      workspace: {
        path: path.join(directory, ".worktrees/fix-it-5"),
        shown: "~/git/open-dough/.worktrees/fix-it-5",
      },
      branch: "codex/fix-it-5",
    });
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
