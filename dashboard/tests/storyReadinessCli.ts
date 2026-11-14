// CLI and Git helpers that advance a readiness repository with recorded
// preparation and path-specific commits.

import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { recordPreparationArgs } from "../../Distribution/tests/support/story-preparation.mjs";
import { repoRoot } from "./support/repositoryRoot.ts";

const cli = join(
  repoRoot,
  "Distribution/src/skills/dough-product-backlog/scripts/product-backlog.mjs",
);

function runCli(directory: string, args: string[]) {
  return execFileSync(process.execPath, [cli, ...args], {
    cwd: directory,
    encoding: "utf8",
  });
}

export function writePlanning(
  directory: string,
  relative: string,
  contents: string,
) {
  const path = join(directory, ".planning", relative);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, contents, "utf8");
  return path;
}

export function recordState(
  directory: string,
  ...args: Parameters<typeof recordPreparationArgs>
) {
  runCli(directory, recordPreparationArgs(...args));
}

function readState(directory: string, href: string) {
  const stdout = runCli(directory, ["read-state", "--link", href]);
  return JSON.parse(stdout) as {
    basis: { document: string; plan?: string };
  };
}

export function recordAssessed(
  directory: string,
  story: Parameters<typeof recordPreparationArgs>[0],
  {
    assessment,
    reasons,
    ...preparation
  }: Omit<Parameters<typeof recordPreparationArgs>[1], "expectedBasis"> & {
    assessment: "ready" | "not-ready";
  },
) {
  recordState(directory, story, preparation);
  const { basis } = readState(directory, story.href);
  recordState(directory, story, {
    ...preparation,
    assessment,
    ...(reasons !== undefined && { reasons }),
    expectedBasis: basis,
  });
}

export function commitPaths(
  directory: string,
  repositoryPaths: readonly string[],
  message: string,
): string {
  execFileSync("git", ["-C", directory, "add", "--", ...repositoryPaths], {
    encoding: "utf8",
  });
  return commitIndex(directory, message);
}

function commitIndex(directory: string, message: string): string {
  execFileSync(
    "git",
    [
      "-C",
      directory,
      "-c",
      "user.name=Story Readiness Fixture",
      "-c",
      "user.email=fixture@example.com",
      "commit",
      "-m",
      message,
    ],
    { encoding: "utf8" },
  );
  return execFileSync("git", ["-C", directory, "rev-parse", "HEAD"], {
    encoding: "utf8",
  }).trim();
}
