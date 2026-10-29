// One packed, path-free origin per installation layout, prepared from this
// run's working-tree source. Only copies reach a test: Git never hardlinks
// objects or reads alternates, and each checkout names its own bare origin.

import { execFile } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { installedSkillPath } from "../../server/launchHosts.ts";
import { writeQueuedStories } from "./queuedStories.ts";
import { repoRoot } from "./repositoryRoot.ts";

const exec = promisify(execFile);
export const startOriginPreparationVariable =
  "OPEN_DOUGH_START_ORIGIN_PREPARATION";
export const installedStartSkills = [
  "dough-execute-plan",
  "dough-product-backlog",
  "dough-story-refinement",
  "dough-land",
  "dough-story-wrap-up",
] as const;

export function createStartOriginPreparationDirectory(): string {
  return mkdtempSync(path.join(tmpdir(), "dough-start-preparation-"));
}

export async function prepareStartOrigins(
  directory: string,
  source = path.join(repoRoot, "src", "skills"),
  layout?: "claude" | "codex",
): Promise<void> {
  try {
    for (const host of layout === undefined
      ? (["claude", "codex"] as const)
      : [layout]) {
      const project = path.join(directory, "building");
      mkdirSync(project);
      try {
        await exec("git", ["init", "-b", "main", project]);
        writeFileSync(path.join(project, ".gitignore"), ".worktrees/\n");
        writeQueuedStories(project);
        const folder = { path: project, shown: project };
        for (const skill of installedStartSkills) {
          cpSync(
            path.join(source, skill),
            installedSkillPath(host, folder, skill),
            {
              recursive: true,
            },
          );
        }
        await exec("git", ["-C", project, "add", "."]);
        await exec("git", [
          "-C",
          project,
          "-c",
          "user.name=Dashboard Developer",
          "-c",
          "user.email=developer@example.test",
          "commit",
          "-m",
          "queued story and installed skills",
        ]);
        const origin = path.join(directory, host);
        // The transport produces one pack instead of copying loose objects.
        await exec("git", ["clone", "--bare", "--no-local", project, origin]);
        await exec("git", ["-C", origin, "remote", "remove", "origin"]);
        await exec("git", [
          "-C",
          origin,
          "config",
          "maintenance.auto",
          "false",
        ]);
      } finally {
        rmSync(project, { recursive: true, force: true });
      }
    }
  } catch (error) {
    rmSync(directory, { recursive: true, force: true });
    throw error;
  }
}

export async function initializeStartOrigin(
  origin: string,
  project: string,
  repository: string,
  host: "claude" | "codex" | "cursor",
): Promise<void> {
  const inherited = process.env[startOriginPreparationVariable];
  const directory = inherited ?? createStartOriginPreparationDirectory();
  const layout = host === "claude" ? "claude" : "codex";
  try {
    // Nested configurations without global setup get current source too, and
    // never acquire a cache that could survive this invocation.
    if (inherited === undefined)
      await prepareStartOrigins(directory, undefined, layout);
    cpSync(path.join(directory, layout), origin, {
      recursive: true,
    });
    mkdirSync(path.dirname(project), { recursive: true });
    const spelled = `https://github.com/${repository}.git`;
    await exec("git", [
      "clone",
      "--no-hardlinks",
      "-c",
      "user.name=Dashboard Developer",
      "-c",
      "user.email=developer@example.test",
      "-c",
      "maintenance.auto=false",
      "-c",
      `url.${origin}.insteadOf=${spelled}`,
      spelled,
      project,
    ]);
    // The original init + explicit push fixture had no upstream branch.
    await exec("git", [
      "-C",
      project,
      "config",
      "--remove-section",
      "branch.main",
    ]);
    await exec("git", [
      "-C",
      project,
      "symbolic-ref",
      "--delete",
      "refs/remotes/origin/HEAD",
    ]);
  } finally {
    if (inherited === undefined)
      rmSync(directory, { recursive: true, force: true });
  }
}
