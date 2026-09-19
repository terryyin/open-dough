// Shared starting precondition and harness for the Git-plumbing reconciliation
// tests: a real scratch Git repository, real branches built from real
// commits, real `git merge` operations, and the real Git-aware CLI
// (`product-backlog-git-merge.mjs`) run against it as a child process. Every
// assertion built on this is made against real Git and file-system state
// afterward — unmerged index stages, `MERGE_HEAD`, ref positions, and the
// worktree's own bytes — never against a mocked function call.
import { execFile, execFileSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const exec = promisify(execFile);
const cli = fileURLToPath(
  new URL(
    "../../src/skills/dough-product-backlog/scripts/product-backlog-git-merge.mjs",
    import.meta.url,
  ),
);

export const backlogPath = ".planning/PRODUCT-BACKLOG.md";

function git(directory, args) {
  return execFileSync("git", args, { cwd: directory, encoding: "utf8" });
}

// A real scratch Git repository, already holding one commit with the
// established backlog shape, so every test starts from real Git history
// rather than an assumption about one.
export function scratchRepo(t, backlog) {
  const directory = mkdtempSync(join(tmpdir(), "dough-backlog-git-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  git(directory, ["init", "-q", "-b", "main"]);
  git(directory, ["config", "user.email", "test@example.com"]);
  git(directory, ["config", "user.name", "Test"]);
  const file = join(directory, backlogPath);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, backlog, "utf8");
  git(directory, ["add", "-A"]);
  git(directory, ["commit", "-q", "-m", "ancestor"]);
  return {
    directory,
    file,
    read: () => readFileSync(file, "utf8"),
    write: (contents) => writeFileSync(file, contents, "utf8"),
    git: (args) => git(directory, args),
  };
}

// A named branch holding one further real commit: the repository's own
// doing, the same way the ordinary CLI fixture's `branchFrom` builds a
// branch version by running a real operation rather than assuming its
// result. Here what is under test is Git's own merge machinery and this
// tool's gate on it, so the branch commit is simply the backlog bytes a real
// side of history would hold.
export function commitBranch(repo, name, backlog, message = name) {
  repo.git(["checkout", "-q", "-b", name]);
  repo.write(backlog);
  repo.git(["add", "-A"]);
  repo.git(["commit", "-q", "-m", message]);
  repo.git(["checkout", "-q", "main"]);
}

export function checkout(repo, ref) {
  repo.git(["checkout", "-q", ref]);
}

// Stages exactly the bytes a human decided the file should read, the same
// way resolving a real conflict by hand and running `git add` does.
export function stageResolution(repo, contents) {
  repo.write(contents);
  repo.git(["add", "--", backlogPath]);
}

// Runs the real Git-aware CLI as a child process, the same way the ordinary
// CLI fixture runs `product-backlog.mjs`.
export async function run(repo, arguments_) {
  try {
    const { stdout, stderr } = await exec(
      process.execPath,
      [cli, ...arguments_, "--cwd", repo.directory],
      { cwd: repo.directory },
    );
    return { code: 0, stdout, stderr };
  } catch (error) {
    return { code: error.code, stdout: error.stdout, stderr: error.stderr };
  }
}

export function unresolvedPaths(repo) {
  return repo.git(["ls-files", "-u"]).trim();
}

export function isMidMerge(repo) {
  try {
    repo.git(["rev-parse", "-q", "--verify", "MERGE_HEAD"]);
    return true;
  } catch {
    return false;
  }
}

// One index stage of the backlog path — 1 the ancestor, 2 ours, 3 theirs —
// or `undefined` once the path is no longer unmerged, the same as Git itself
// reports it.
export function stage(repo, number) {
  try {
    return repo.git(["show", `:${number}:${backlogPath}`]);
  } catch {
    return undefined;
  }
}

export function headSha(repo) {
  return repo.git(["rev-parse", "HEAD"]).trim();
}

export function parentCount(repo, ref = "HEAD") {
  const parents = repo.git(["rev-list", "--parents", "-n", "1", ref]).trim();
  return parents.split(" ").length - 1;
}

// What a plain, line-by-line three-way text merge — the merge Git would
// make of this file with no driver registered for it at all — produces from
// the same three real committed versions. This only observes: `-p` writes
// the result to standard output and changes no file. Contrasting this with
// the real gated merge is what proves the gate does semantic work a textual
// merge cannot, rather than merely reacting to conflicts Git already refuses
// to resolve on its own.
export async function textMerge(repo, ancestorRef, oursRef, theirsRef) {
  const named = (ref, label) => {
    const path = join(repo.directory, `.${label}.git-text-merge`);
    writeFileSync(path, repo.git(["show", `${ref}:${backlogPath}`]), "utf8");
    return path;
  };
  const files = [
    named(oursRef, "ours"),
    named(ancestorRef, "ancestor"),
    named(theirsRef, "theirs"),
  ];
  try {
    const { stdout } = await exec("git", ["merge-file", "-p", ...files], {
      cwd: repo.directory,
    });
    return { conflicts: 0, merged: stdout };
  } catch (error) {
    return { conflicts: error.code, merged: error.stdout };
  }
}

export function occurrences(text, needle) {
  return text.split(needle).length - 1;
}
