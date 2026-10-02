import { expect, test } from "@playwright/test";
import { githubRepository, projectIdentity } from "../src/projectInput.ts";
import { shownStartWorkspace } from "../server/launchWorkspace.ts";
import { workspaceWords } from "../src/launchWorkflow.ts";

for (const url of [
  "https://github.com/Example/Sample-App",
  "https://github.com/Example/Sample-App.git",
  "git@github.com:Example/Sample-App.git",
]) {
  test(`normalizes repository identity from ${url}`, () => {
    expect(githubRepository(url)).toBe("example/sample-app");
    expect(projectIdentity("example/sample-app")).toEqual({
      id: "sample-app",
      label: "Sample App",
    });
  });
}
test("repository punctuation yields a readable name and retains a stable id", () => {
  expect(projectIdentity("example/my_sample.app")).toEqual({
    id: "my_sample.app",
    label: "My Sample App",
  });
});

test("workspace display follows the configured folder without changing actual established facts", () => {
  const folder = {
    path: "/home/developer/work/custom",
    shown: "~/work/custom",
  };
  const established = {
    identity: "SEED-001#story",
    publisherId: "publisher",
    workspace: `${folder.path}/.worktrees/topic`,
    branch: "codex/topic",
    mode: "story-branch" as const,
    remote: "origin",
    target: "main",
    publishedSha: "ab".repeat(20),
  };
  expect(
    workspaceWords(
      established,
      shownStartWorkspace(folder, established.workspace),
    ),
  ).toBe("Workspace ~/work/custom/.worktrees/topic");
  expect(established.workspace).toBe(
    "/home/developer/work/custom/.worktrees/topic",
  );
  const moved = {
    path: "/home/developer/elsewhere/custom",
    shown: "~/elsewhere/custom",
  };
  expect(shownStartWorkspace(moved, established.workspace)).toBe(
    established.workspace,
  );
  expect(shownStartWorkspace(folder, folder.path)).toBe(folder.shown);
});
