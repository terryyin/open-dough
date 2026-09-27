// Real temporary repositories for the CI repair pause tests: an execution
// worktree and another worktree of the same repository share one stash stack,
// and every operation runs through the installed ci-repair-stash.mjs CLI.
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { exec, git } from "./publication-git.mjs";

const script = fileURLToPath(new URL("./ci-repair-stash.mjs", import.meta.url));

async function stashTool(...args) {
  try {
    const { stdout } = await exec("node", [script, ...args]);
    return { exitCode: 0, ...JSON.parse(stdout) };
  } catch (error) {
    if (error.code !== 1) throw error;
    return { exitCode: 1, ...JSON.parse(error.stdout) };
  }
}

async function initFixtureRepo(parent, repo) {
  await git(parent, "init", "-q", "-b", "main", repo);
  await git(repo, "config", "user.email", "fixture@example.com");
  await git(repo, "config", "user.name", "Fixture");
}

export async function createSharedStashFixture(t) {
  const root = mkdtempSync(join(tmpdir(), "ci-repair-stash-"));
  const records = [];
  t.after(() => {
    for (const path of [root, ...records.map((record) => dirname(record))])
      rmSync(path, { recursive: true, force: true });
  });
  const execution = join(root, "execution");
  const other = join(root, "other");
  await initFixtureRepo(root, execution);
  for (const name of ["tracked.txt", "staged.txt", "shared.txt"])
    writeFileSync(join(execution, name), `${name} base\n`);
  await git(execution, "add", ".");
  await git(execution, "commit", "-q", "-m", "base");
  await git(execution, "worktree", "add", "-q", "-b", "other", other);
  return {
    root,
    execution,
    other,
    async save(label = "dough-execute-plan CI repair 1/1") {
      const receipt = await stashTool(
        "save",
        "--checkout",
        execution,
        "--label",
        label,
      );
      records.push(receipt.record);
      return receipt;
    },
    restore: (record) => stashTool("restore", "--record", record),
    drop: (record) => stashTool("drop", "--record", record),
    async foreignStash(name) {
      writeFileSync(join(other, "shared.txt"), `${name}\n`);
      await git(other, "stash", "push", "-q", "-m", name);
      return (await git(other, "rev-parse", "refs/stash")).stdout.trim();
    },
    async stack() {
      return (await git(execution, "stash", "list", "--format=%H")).stdout
        .split("\n")
        .filter(Boolean);
    },
    status: async () =>
      (
        await git(
          execution,
          "status",
          "--porcelain=v1",
          "--untracked-files=all",
        )
      ).stdout,
    read: (name) => readFileSync(join(execution, name), "utf8"),
    // The execution checkout's index (staged) content of one path.
    staged: async (name) => (await git(execution, "show", `:${name}`)).stdout,
    async commit(name, content) {
      writeFileSync(join(execution, name), content);
      await git(execution, "add", name);
      await git(execution, "commit", "-q", "-m", `repair ${name}`);
    },
  };
}

// Submodule content changes show as dirt that `git stash` cannot save.
export async function addDirtySubmodule({ root, execution }) {
  const library = join(root, "library");
  await initFixtureRepo(root, library);
  writeFileSync(join(library, "lib.txt"), "library base\n");
  await git(library, "add", ".");
  await git(library, "commit", "-q", "-m", "library");
  await git(
    execution,
    "-c",
    "protocol.file.allow=always",
    "submodule",
    "add",
    "-q",
    library,
    "sub",
  );
  await git(execution, "commit", "-q", "-m", "submodule");
  writeFileSync(join(execution, "sub", "lib.txt"), "submodule dirt\n");
}

export async function dirtyAllKinds({ execution }) {
  writeFileSync(join(execution, "staged.txt"), "staged owned\n");
  await git(execution, "add", "staged.txt");
  writeFileSync(join(execution, "tracked.txt"), "unstaged owned\n");
  writeFileSync(join(execution, "new.txt"), "untracked owned\n");
}
