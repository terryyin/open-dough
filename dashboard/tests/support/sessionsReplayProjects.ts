// The project catalog and local checkouts the Sessions replay
// (../boundary/sessions-replay.spec.ts) starts its server with, shaped like
// production's on 2026-11-03: six configured projects whose checkouts hold
// 44 linked worktrees between them. Every Sessions observation lists each
// checkout's worktrees and reads each worktree's author; one in six is owned
// by an agent whose profile its head and trunk name, so the observation
// reads both profiles there (../../server/localWorkspaces.ts). That is 66
// Git processes an observation; production's catalog took about 64. Written once before the server starts;
// worktree authorship is written as the files Git keeps it in, which saves
// one Git process a worktree.

import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  agentIdentity,
  renderAgentProfile,
} from "../../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { projectConfigurationFile } from "./projectConfiguration.ts";

// Each project and how many linked worktrees its checkout holds.
export const replayCatalog = [
  { id: "open-dough", repository: "terryyin/open-dough", worktrees: 7 },
  { id: "doughnut", repository: "nerds-odd-e/doughnut", worktrees: 7 },
  { id: "pygardon", repository: "terryyin/pygardon", worktrees: 5 },
  { id: "terry-talks", repository: "terryyin/terry-talks", worktrees: 2 },
  { id: "lizard", repository: "terryyin/lizard", worktrees: 21 },
  { id: "clipboard", repository: "terryyin/clipboard", worktrees: 2 },
] as const;

export const replayProjectIds = replayCatalog.map(({ id }) => id);

const owner = agentIdentity("Tsubomi") as {
  readonly agent: string;
  readonly email: string;
  readonly path: string;
};

// Writes the catalog and every checkout under `home`.
export function seedReplayProjects(home: string): void {
  const git = (cwd: string, ...args: string[]) =>
    execFileSync("git", args, {
      cwd,
      stdio: "ignore",
      env: {
        ...process.env,
        HOME: home,
        GIT_CONFIG_NOSYSTEM: "1",
        GIT_AUTHOR_NAME: owner.agent,
        GIT_AUTHOR_EMAIL: owner.email,
        GIT_COMMITTER_NAME: owner.agent,
        GIT_COMMITTER_EMAIL: owner.email,
      },
    });
  const catalogFile = projectConfigurationFile(home, "production");
  mkdirSync(path.dirname(catalogFile), { recursive: true });
  writeFileSync(
    catalogFile,
    JSON.stringify(
      replayCatalog.map(({ id, repository }) => ({
        id,
        label: id,
        repository,
        ref: "main",
        backlogPath: ".planning/PRODUCT-BACKLOG.md",
        localPath: `~/git/${id}`,
      })),
    ),
  );
  let linked = 0;
  for (const { id, worktrees } of replayCatalog) {
    const checkout = path.join(home, "git", id);
    const profile = path.join(checkout, ".planning", owner.path);
    mkdirSync(path.dirname(profile), { recursive: true });
    writeFileSync(
      path.join(checkout, ".planning", "PRODUCT-BACKLOG.md"),
      "# Backlog\n",
    );
    writeFileSync(
      profile,
      renderAgentProfile({
        name: "Tsubomi",
        identity: `SEED-001#replay-${id}`,
        mode: "story-branch",
        branch: `claude/replay-${id}`,
        host: "claude",
      }),
    );
    git(checkout, "init", "--quiet", "--initial-branch=main");
    git(checkout, "config", "extensions.worktreeConfig", "true");
    git(checkout, "add", ".");
    git(
      checkout,
      "commit",
      "--quiet",
      "--no-gpg-sign",
      "-m",
      "Replay checkout",
    );
    git(checkout, "update-ref", "refs/remotes/origin/main", "HEAD");
    for (let index = 0; index < worktrees; index += 1) {
      const name = `replay-${String(index)}`;
      git(
        checkout,
        "worktree",
        "add",
        "--quiet",
        "-b",
        `claude/${name}`,
        path.join(checkout, ".worktrees", name),
      );
      if (linked % 6 === 0)
        writeFileSync(
          path.join(checkout, ".git", "worktrees", name, "config.worktree"),
          `[author]\n\tname = ${owner.agent}\n`,
        );
      linked += 1;
    }
  }
}
