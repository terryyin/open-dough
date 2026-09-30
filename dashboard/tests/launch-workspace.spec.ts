// The shared workspace choice (../server/launchWorkspace.ts): a
// pure function of the project folder, the story's title, and the slugs
// already in use.

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
