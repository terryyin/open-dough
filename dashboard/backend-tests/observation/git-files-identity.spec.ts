import { execFileSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  statSync,
  utimesSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, onTestFinished, test } from "vitest";
import { gitFilesIdentity } from "../../server/gitFilesIdentity.ts";

const trunk = "origin/main";
const trunkRef = `refs/remotes/${trunk}`;

function temporaryHome() {
  const home = mkdtempSync(path.join(tmpdir(), "dough-git-identity-"));
  onTestFinished(() => {
    rmSync(home, { recursive: true, force: true });
  });
  return home;
}

function gitIn(home: string) {
  return (cwd: string, ...args: string[]) =>
    execFileSync("git", args, {
      cwd,
      stdio: "ignore",
      env: {
        ...process.env,
        HOME: home,
        XDG_CONFIG_HOME: home,
        GIT_CONFIG_NOSYSTEM: "1",
        GIT_AUTHOR_NAME: "Replay",
        GIT_AUTHOR_EMAIL: "replay@example.com",
        GIT_COMMITTER_NAME: "Replay",
        GIT_COMMITTER_EMAIL: "replay@example.com",
      },
    });
}

function checkoutWithWorktree() {
  const home = temporaryHome();
  const git = gitIn(home);
  const checkout = path.join(home, "checkout");
  const worktree = path.join(checkout, ".worktrees", "a");
  mkdirSync(checkout);
  writeFileSync(path.join(checkout, "file.txt"), "one\n");
  git(checkout, "init", "--quiet", "--initial-branch=main");
  git(checkout, "config", "extensions.worktreeConfig", "true");
  git(checkout, "add", ".");
  git(checkout, "commit", "--quiet", "--no-gpg-sign", "-m", "one");
  git(checkout, "update-ref", trunkRef, "HEAD");
  git(checkout, "worktree", "add", "--quiet", "-b", "claude/a", worktree);
  return { git, checkout, worktree };
}

async function settledIdentity(checkout: string): Promise<string> {
  const identity = await gitFilesIdentity(
    checkout,
    trunk,
    () => Date.now() + 2_000,
  );
  if (identity === undefined)
    throw new Error("Expected a settled Git identity");
  return identity;
}

test("an unchanged checkout keeps its Git identity", async () => {
  const { checkout } = checkoutWithWorktree();
  const held = await settledIdentity(checkout);
  expect(await settledIdentity(checkout)).toBe(held);
});

test("a worktree's author config changes the checkout's Git identity", async () => {
  const { git, checkout, worktree } = checkoutWithWorktree();
  const held = await settledIdentity(checkout);
  git(worktree, "config", "--worktree", "author.name", "Tsubomi");
  expect(await settledIdentity(checkout)).not.toBe(held);
});

test("advancing a worktree branch changes the checkout's Git identity", async () => {
  const { git, checkout, worktree } = checkoutWithWorktree();
  const held = await settledIdentity(checkout);
  writeFileSync(path.join(worktree, "file.txt"), "two\n");
  git(worktree, "commit", "--quiet", "--no-gpg-sign", "-am", "two");
  expect(await settledIdentity(checkout)).not.toBe(held);
});

test("advancing trunk changes the checkout's Git identity", async () => {
  const { git, checkout } = checkoutWithWorktree();
  git(
    checkout,
    "commit",
    "--quiet",
    "--no-gpg-sign",
    "--allow-empty",
    "-m",
    "two",
  );
  const held = await settledIdentity(checkout);
  git(checkout, "update-ref", trunkRef, "HEAD");
  expect(await settledIdentity(checkout)).not.toBe(held);
});

test("packing refs changes the checkout's Git identity", async () => {
  const { git, checkout } = checkoutWithWorktree();
  const held = await settledIdentity(checkout);
  git(checkout, "pack-refs", "--all");
  expect(await settledIdentity(checkout)).not.toBe(held);
});

test("switching a worktree to another branch changes the checkout's Git identity", async () => {
  const { git, checkout, worktree } = checkoutWithWorktree();
  git(checkout, "branch", "claude/b");
  const held = await settledIdentity(checkout);
  git(worktree, "switch", "--quiet", "claude/b");
  expect(await settledIdentity(checkout)).not.toBe(held);
});

test("adding a worktree changes the checkout's Git identity", async () => {
  const { git, checkout } = checkoutWithWorktree();
  const held = await settledIdentity(checkout);
  git(
    checkout,
    "worktree",
    "add",
    "--quiet",
    "-b",
    "claude/b",
    path.join(checkout, ".worktrees", "b"),
  );
  expect(await settledIdentity(checkout)).not.toBe(held);
});

test("removing a worktree folder changes the checkout's Git identity", async () => {
  const { checkout, worktree } = checkoutWithWorktree();
  const held = await settledIdentity(checkout);
  rmSync(worktree, { recursive: true });
  expect(await settledIdentity(checkout)).not.toBe(held);
});

test("a recent Git file change withholds the checkout's Git identity", async () => {
  const checkout = temporaryHome();
  gitIn(checkout)(checkout, "init", "--quiet", "--initial-branch=main");
  const config = statSync(path.join(checkout, ".git", "config"));
  const changedAt = Math.ceil(Math.max(config.mtimeMs, config.ctimeMs));

  expect(
    await gitFilesIdentity(checkout, trunk, () => changedAt + 500),
  ).toBeUndefined();
  expect(
    await gitFilesIdentity(checkout, trunk, () => changedAt + 2_000),
  ).toBeDefined();
});

test("a new file and Git index refresh in the main checkout keep its Git identity", async () => {
  const { git, checkout } = checkoutWithWorktree();
  const held = await settledIdentity(checkout);
  writeFileSync(path.join(checkout, "notes.txt"), "new\n");
  expect(await settledIdentity(checkout)).toBe(held);

  // Stale the index entry without changing the tracked file's contents.
  utimesSync(path.join(checkout, "file.txt"), 1, 1);
  const index = path.join(checkout, ".git", "index");
  const before = statSync(index, { bigint: true }).ino;
  git(checkout, "status");
  expect(statSync(index, { bigint: true }).ino).not.toBe(before);
  expect(await settledIdentity(checkout)).toBe(held);
});

test("a missing or plain folder has a Git identity of its own", async () => {
  const home = temporaryHome();
  const missing = path.join(home, "missing");
  expect(await gitFilesIdentity(missing, trunk)).toBe("ENOENT|no-git");
  expect(await gitFilesIdentity(home, trunk)).toMatch(/^\d+\|no-git$/);
});
