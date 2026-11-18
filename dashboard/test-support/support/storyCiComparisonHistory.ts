// Published history a CI comparison fixture
// (./storyCiComparisonFixture.ts) reads from a fixture repository: an
// agent's claim commit.

import { execFileSync } from "node:child_process";

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
