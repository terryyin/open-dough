// Published history a CI comparison fixture
// (./storyCiComparisonFixture.ts) reads from a fixture repository: the
// first-parent revisions from a start, and an agent's claim commit.

import { execFileSync } from "node:child_process";

export function revList(repo: string, start: string, count: number): string[] {
  return execFileSync(
    "git",
    [
      "-C",
      repo,
      "rev-list",
      "--first-parent",
      `--max-count=${String(count)}`,
      start,
    ],
    { encoding: "utf8" },
  )
    .trim()
    .split("\n")
    .filter(Boolean);
}

export function claimOf(repo: string, agent: string): string {
  const email = `${agent.replace(/-chan$/, "").toLowerCase()}-chan@example.org`;
  return execFileSync(
    "git",
    [
      "-C",
      repo,
      "log",
      "--all",
      "--format=%H",
      `--author=<${email}>`,
      "--grep=Take queued work",
      "-1",
    ],
    { encoding: "utf8" },
  ).trim();
}
