// Shared setup and observations for runs of the real backlog CLI's
// `identity-evidence` against a scratch project whose seed directory,
// backlog, done records, and Git history each show identities already used.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  projectFile,
  run,
  scratchProject,
} from "./product-backlog-fixture.mjs";
import {
  at,
  gitWorkspace,
  isolatedGit,
  recordText,
} from "./product-backlog-done-fixture.mjs";

const seed = (number) => `---\nid: SEED-${number}\n---\n\n# Seed ${number}\n`;

const doneTimes = (index) =>
  `2026-10-${String(index + 1).padStart(2, "0")}T10:00:00.000Z`;

// Active seeds end at SEED-074; cleanup has removed SEED-075 … SEED-084,
// whose done records remain.
export function cleanedUpProject(t) {
  const project = scratchProject(t);
  projectFile(project, "seeds/SEED-073-earlier.md", seed("073"));
  projectFile(project, "seeds/SEED-074-latest-active.md", seed("074"));
  for (let number = 75; number <= 84; number += 1) {
    const identity = `SEED-0${number}#story-1`;
    projectFile(
      project,
      `done/SEED-0${number}_story-1.json`,
      recordText(identity, `Story ${number}`, doneTimes(number - 75)),
    );
  }
  return project;
}

// A scratch project outside any Git work tree has no history to read.
export const historyUnread = {
  source: "history",
  path: ".",
  reason: "not a Git work tree",
};

export const evidence = async (project, ...arguments_) => {
  const result = await run(
    project,
    ["identity-evidence", ...arguments_],
    at("2026-10-23T00:00:00.000Z"),
  );
  assert.equal(result.code, 0, result.stderr);
  return JSON.parse(result.stdout);
};

export const snapshot = (project) =>
  readdirSync(join(project.directory, ".planning"), { recursive: true })
    .sort()
    .map((path) => {
      const full = join(project.directory, ".planning", path);
      try {
        return [path, readFileSync(full, "utf8")];
      } catch {
        return [path, "(directory)"];
      }
    });

export const git = (directory, ...args) =>
  execFileSync("git", ["-c", "user.email=ann@example.com", ...args], {
    cwd: directory,
    env: { ...process.env, ...isolatedGit },
    encoding: "utf8",
  }).trim();

// Four months before the report runs, SEED-090 was allocated, completed, and
// cleaned up: its seed file and its done record were committed and later
// removed, so only history still shows them. The record's anchor holds a
// character its file name escapes.
export function projectWithRemovedAllocation(t) {
  const project = gitWorkspace(cleanedUpProject(t));
  git(project.directory, "add", "-A");
  git(project.directory, "commit", "-q", "-m", "Active work");
  projectFile(project, "seeds/SEED-090-x.md", seed("090"));
  projectFile(
    project,
    "done/SEED-090_x~5Fy.json",
    recordText("SEED-090#x_y", "Story 90", "2026-06-20T10:00:00.000Z"),
  );
  git(project.directory, "add", "-A");
  git(project.directory, "commit", "-q", "-m", "Allocate SEED-090");
  const added = git(project.directory, "rev-parse", "HEAD");
  git(
    project.directory,
    "rm",
    "-q",
    ".planning/seeds/SEED-090-x.md",
    ".planning/done/SEED-090_x~5Fy.json",
  );
  git(project.directory, "commit", "-q", "-m", "Clean up SEED-090");
  return { project, added, head: git(project.directory, "rev-parse", "HEAD") };
}
