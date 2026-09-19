// The cherry-pick-specific half of the shared Git-plumbing test harness,
// split out of `product-backlog-git-fixture.mjs` for file size: running the
// real cherry-pick-specific CLI (`product-backlog-git-cherry-pick.mjs`) as a
// child process, and reading Git's own real cherry-pick state back —
// `CHERRY_PICK_HEAD` and `.git/sequencer/`, confirmed empirically to be
// where it actually lives, never rebase's own state directories. Everything
// else (scratch repositories, branches, commits, staging a resolution) is
// shared, Git-operation-generic harness from `product-backlog-git-fixture.mjs`.
import { execFile } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const exec = promisify(execFile);
const cherryPickCli = fileURLToPath(
  new URL(
    "../../src/skills/dough-product-backlog/scripts/product-backlog-git-cherry-pick.mjs",
    import.meta.url,
  ),
);

// The same shape as `run`/`runRebase` in `product-backlog-git-fixture.mjs`,
// against the cherry-pick-specific CLI.
export async function runCherryPick(repo, arguments_) {
  try {
    const { stdout, stderr } = await exec(
      process.execPath,
      [cherryPickCli, ...arguments_, "--cwd", repo.directory],
      { cwd: repo.directory },
    );
    return { code: 0, stdout, stderr };
  } catch (error) {
    return { code: error.code, stdout: error.stdout, stderr: error.stderr };
  }
}

// A cherry-pick (or a sequence still holding further commits) is genuinely
// in progress whenever `CHERRY_PICK_HEAD` or the sequencer's own state
// directory exists — confirmed empirically that `CHERRY_PICK_HEAD` alone can
// momentarily disappear (a human commits Git's own "empty" stop directly,
// `git commit --allow-empty`) while a real, resumable cherry-pick still
// remains, the same reason `cherryPickState` in the production adapter
// checks both rather than trusting `CHERRY_PICK_HEAD` alone.
export function isMidCherryPick(repo) {
  return (
    existsSync(join(repo.directory, ".git", "CHERRY_PICK_HEAD")) ||
    existsSync(join(repo.directory, ".git", "sequencer"))
  );
}

// The commit a stopped cherry-pick is actually applying, its real parent,
// and the real destination it is being applied onto — read the same way the
// production adapter reads it, so a test can assert the gate's message names
// real revisions rather than merely containing some sha-shaped string.
export function cherryPickStop(repo) {
  const pickedCommit = readFileSync(
    join(repo.directory, ".git", "CHERRY_PICK_HEAD"),
    "utf8",
  ).trim();
  return {
    pickedCommit,
    pickedParent: repo.git(["rev-parse", `${pickedCommit}^`]).trim(),
    destination: repo.git(["rev-parse", "HEAD"]).trim(),
  };
}
