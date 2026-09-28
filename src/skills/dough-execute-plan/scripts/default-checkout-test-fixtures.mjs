// Default-checkout states for startup tests: one holding pending edits, and
// a repository with none at all, started in and observed through its checkouts.
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { exec, git } from "./publication-test-fixtures.mjs";
import { startCliResult } from "./workspace-publication-fixtures.mjs";

// Commits `files` unrelated tracked files to trunk, then leaves staged and
// unstaged patches of `lines` lines each in the integration checkout.
export async function busyCheckout(trunk, files, lines) {
  mkdirSync(join(trunk.integration, "inventory"));
  for (let index = 0; index < files; index += 1)
    writeFileSync(join(trunk.integration, "inventory", `${index}.txt`), "x\n");
  await git(trunk.integration, "add", "inventory");
  await git(trunk.integration, "commit", "-m", "unrelated inventory");
  await git(trunk.integration, "push", "origin", "main");
  const patch = `${"unrelated patch line".padEnd(79, ".")}\n`.repeat(lines);
  writeFileSync(join(trunk.integration, "staged.txt"), patch);
  await git(trunk.integration, "add", "staged.txt");
  writeFileSync(join(trunk.integration, "trunk.txt"), patch);
}

// The queued trunk's repository with no default checkout: a Git directory
// without a working tree whose only checkout is one owned worktree on
// `branch` at fetched trunk. The integration checkout is removed. Resolves to
// that Git directory and the worktree path.
export async function ownedWorktreeOnly(trunk, name, branch) {
  const repository = join(trunk.fixture, "repository.git");
  const workspace = join(trunk.fixture, name);
  await exec("git", ["init", "-q", "--bare", repository]);
  await git(repository, "config", "user.name", "Dana Developer");
  await git(repository, "config", "user.email", "dana@example.test");
  await git(repository, "remote", "add", "origin", trunk.origin);
  await git(repository, "fetch", "-q", "origin");
  await git(
    repository,
    "worktree",
    "add",
    "-q",
    "-b",
    branch,
    workspace,
    "origin/main",
  );
  rmSync(trunk.integration, { recursive: true, force: true });
  return { repository, workspace, branch };
}

// Starts in `owned` with no --integration.
export const startOwned = (trunk, owned, mode, extra = [], options = {}) =>
  startCliResult(trunk, mode, extra, {
    integration: null,
    workspace: owned.workspace,
    branch: owned.branch,
    ...options,
  });

// The checkouts the repository has: its own Git directory and each worktree.
export async function worktreePaths(repository) {
  const { stdout } = await git(repository, "worktree", "list", "--porcelain");
  return stdout
    .split("\n")
    .filter((line) => line.startsWith("worktree "))
    .map((line) => line.slice("worktree ".length));
}
