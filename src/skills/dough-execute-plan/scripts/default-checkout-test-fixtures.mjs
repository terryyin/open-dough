// Default-checkout states for startup tests: one holding pending edits, one
// occupied by every kind of local content a session there must keep, and a
// repository with none at all, started in and observed through its checkouts.
import assert from "node:assert/strict";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { exec, git, revParse } from "./publication-test-fixtures.mjs";
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

// The paths the existing content touches, each with its expected state.
const existingPaths = [
  "kept.txt",
  "staged.txt",
  "added.txt",
  "edited.txt",
  "deleted.txt",
  "untracked.txt",
];

// Leaves the default checkout locally ahead with an unpublished commit and
// holding staged, unstaged, deleted and untracked content.
export async function occupyDefaultCheckout(checkout) {
  for (const name of ["kept", "staged", "edited", "deleted"])
    writeFileSync(join(checkout, `${name}.txt`), `${name} committed\n`);
  await git(checkout, "add", "kept.txt", "staged.txt", "edited.txt");
  await git(checkout, "add", "deleted.txt");
  await git(checkout, "commit", "--quiet", "-m", "unpublished local commit");
  writeFileSync(join(checkout, "staged.txt"), "staged edit\n");
  writeFileSync(join(checkout, "added.txt"), "staged addition\n");
  await git(checkout, "add", "staged.txt", "added.txt");
  writeFileSync(join(checkout, "edited.txt"), "unstaged edit\n");
  rmSync(join(checkout, "deleted.txt"));
  writeFileSync(join(checkout, "untracked.txt"), "untracked\n");
}

// Everything a start could change in the repository: the default checkout's
// HEAD, index, status and file bytes, its branches and worktrees, and every
// origin ref.
export async function snapshot(checkout, origin) {
  const out = async (cwd, ...args) => (await git(cwd, ...args)).stdout;
  return {
    head: await revParse(checkout, "HEAD"),
    branch: (await out(checkout, "branch", "--show-current")).trim(),
    status: await out(checkout, "status", "--porcelain", "--untracked=all"),
    index: await out(checkout, "ls-files", "--stage"),
    staged: await out(checkout, "diff", "--cached"),
    unstaged: await out(checkout, "diff"),
    files: Object.fromEntries(
      existingPaths.map((path) => {
        const file = join(checkout, path);
        return [path, existsSync(file) ? readFileSync(file, "utf8") : null];
      }),
    ),
    branches: await out(
      checkout,
      "for-each-ref",
      "--format=%(refname)",
      "refs/heads",
    ),
    worktrees: await worktreePaths(checkout),
    origin: await out(origin, "for-each-ref"),
  };
}

// Commits the result together with all existing checkout content, as the
// guidance directs, and asserts the commit kept every piece of it while
// nothing was pushed and no branch or worktree was created.
export async function commitAllAndAssertRetained(
  checkout,
  origin,
  before,
  message,
) {
  await git(checkout, "add", "-A");
  await git(checkout, "commit", "--quiet", "-m", message);
  const result = await revParse(checkout, "HEAD");
  assert.equal(await revParse(checkout, `${result}^`), before.head);
  const show = async (path) =>
    (await git(checkout, "show", `${result}:${path}`)).stdout;
  assert.equal(await show("kept.txt"), "kept committed\n");
  assert.equal(await show("staged.txt"), "staged edit\n");
  assert.equal(await show("added.txt"), "staged addition\n");
  assert.equal(await show("edited.txt"), "unstaged edit\n");
  assert.equal(await show("untracked.txt"), "untracked\n");
  await assert.rejects(show("deleted.txt"));
  assert.equal(
    (await git(checkout, "status", "--porcelain")).stdout,
    "",
    "everything in the checkout was committed together",
  );
  const after = await snapshot(checkout, origin);
  assert.equal(after.origin, before.origin, "nothing was pushed");
  assert.deepEqual(after.worktrees, before.worktrees);
  assert.equal(after.branches, before.branches);
  return result;
}

// A one-shot execution start of the default checkout itself.
export const startExecutionThere = (trunk, extra = [], options = {}) =>
  startCliResult(trunk, "story-branch", ["--one-shot", ...extra], {
    identity: null,
    workspace: trunk.integration,
    branch: "main",
    ...options,
  });
