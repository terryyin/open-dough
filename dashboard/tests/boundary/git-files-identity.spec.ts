// The identity of a checkout's Git files (../../server/gitFilesIdentity.ts),
// which keeps the sessions answer's found workspaces between reads: it stays
// the same while nothing changes, is withheld while a changed file is too
// recent to trust, and changes with every Git change a found workspace
// depends on -- a worktree's author config, its branch moving, trunk moving,
// its head switching branches, a worktree added or its folder removed, and
// refs being packed.

import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, test } from "../support/pageTest.ts";
import { gitFilesIdentity } from "../../server/gitFilesIdentity.ts";

const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function gitIn(home: string) {
  return (cwd: string, ...args: string[]) =>
    execFileSync("git", args, {
      cwd,
      stdio: "ignore",
      env: {
        ...process.env,
        HOME: home,
        GIT_CONFIG_NOSYSTEM: "1",
        GIT_AUTHOR_NAME: "Replay",
        GIT_AUTHOR_EMAIL: "replay@example.com",
        GIT_COMMITTER_NAME: "Replay",
        GIT_COMMITTER_EMAIL: "replay@example.com",
      },
    });
}

// The identity once every changed file is old enough to be trusted.
async function settled(checkout: string): Promise<string> {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const identity = await gitFilesIdentity(checkout, "origin/main");
    if (identity !== undefined) return identity;
    await pause(100);
  }
  throw new Error("The checkout's Git files never settled");
}

test("a checkout's Git identity changes with every Git change its workspaces depend on", async () => {
  test.setTimeout(60_000);
  const home = mkdtempSync(path.join(tmpdir(), "dough-git-identity-"));
  const git = gitIn(home);
  const checkout = path.join(home, "checkout");
  const worktree = path.join(checkout, ".worktrees", "a");
  try {
    mkdirSync(checkout);
    writeFileSync(path.join(checkout, "file.txt"), "one\n");
    git(checkout, "init", "--quiet", "--initial-branch=main");
    git(checkout, "config", "extensions.worktreeConfig", "true");
    git(checkout, "add", ".");
    git(checkout, "commit", "--quiet", "--no-gpg-sign", "-m", "one");
    git(checkout, "update-ref", "refs/remotes/origin/main", "HEAD");
    git(checkout, "worktree", "add", "--quiet", "-b", "claude/a", worktree);

    let held = await settled(checkout);
    expect(await gitFilesIdentity(checkout, "origin/main")).toBe(held);

    const changes: readonly [string, () => void][] = [
      [
        "the worktree's author",
        () => {
          git(worktree, "config", "--worktree", "author.name", "Tsubomi");
        },
      ],
      [
        "the worktree's branch",
        () => {
          writeFileSync(path.join(worktree, "file.txt"), "two\n");
          git(worktree, "commit", "--quiet", "--no-gpg-sign", "-am", "two");
        },
      ],
      [
        "trunk",
        () => {
          git(worktree, "update-ref", "refs/remotes/origin/main", "HEAD");
        },
      ],
      [
        "refs packed",
        () => {
          git(checkout, "pack-refs", "--all");
        },
      ],
      [
        "the worktree's head",
        () => {
          git(worktree, "switch", "--quiet", "-c", "claude/b");
        },
      ],
      [
        "a worktree added",
        () => {
          git(
            checkout,
            "worktree",
            "add",
            "--quiet",
            "-b",
            "claude/c",
            path.join(checkout, ".worktrees", "c"),
          );
        },
      ],
      [
        "a worktree's folder removed",
        () => {
          rmSync(worktree, { recursive: true, force: true });
        },
      ],
    ];
    for (const [change, make] of changes) {
      make();
      // Right after a change, the earlier identity never stands: a changed
      // file is withheld, and a removed one already reads as removed.
      expect(
        await gitFilesIdentity(checkout, "origin/main"),
        `${change}: not the earlier identity right after`,
      ).not.toBe(held);
      const next = await settled(checkout);
      expect(next, `${change}: changed`).not.toBe(held);
      held = next;
    }
  } finally {
    rmSync(home, { recursive: true, force: true });
  }
});

test("a missing or plain folder has an identity", async () => {
  const home = mkdtempSync(path.join(tmpdir(), "dough-git-identity-"));
  try {
    const missing = path.join(home, "missing");
    expect(await gitFilesIdentity(missing, "origin/main")).toBe(
      "ENOENT|no-git",
    );
    await pause(1_100);
    expect(await gitFilesIdentity(home, "origin/main")).toMatch(/\|no-git$/);
  } finally {
    rmSync(home, { recursive: true, force: true });
  }
});
