// Real temporary repositories for the CI repair pause tests: an execution
// checkout and another worktree of the same repository share one stash stack,
// and every operation runs through the installed ci-repair-stash.mjs CLI.
// Descriptions declare the committed starting files; stashes, dirt and the
// submodule are Git operations of each case.
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { makeMe } from "../../../../tests/support/makeMe.mjs";
import { materializeRepository } from "../../../../tests/support/repository-fixture.mjs";
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

// The execution checkout on main with three tracked files, and the `other`
// worktree beside it. It is no Open Dough backlog project.
const sharedStashRepository = makeMe.aRepository
  .withRevision("base", {
    backlog: undefined,
    files: Object.fromEntries(
      ["tracked.txt", "staged.txt", "shared.txt"].map((name) => [
        name,
        `${name} base\n`,
      ]),
    ),
  })
  .withWorkspace("other", { from: "base" })
  .please();

// The repository a case adds as a submodule.
const libraryRepository = makeMe.aRepository
  .withRevision("library", {
    backlog: undefined,
    files: { "lib.txt": "library base\n" },
  })
  .please();

export async function createSharedStashFixture(t) {
  const root = mkdtempSync(join(tmpdir(), "ci-repair-stash-"));
  const records = [];
  t.after(() => {
    for (const path of [root, ...records.map((record) => dirname(record))])
      rmSync(path, { recursive: true, force: true });
  });
  const repository = await materializeRepository(sharedStashRepository, {
    parent: root,
  });
  const execution = repository.integration;
  const other = repository.execution;
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
    async stage(name, content) {
      writeFileSync(join(execution, name), content);
      await git(execution, "add", name);
    },
    async commit(name, content) {
      await this.stage(name, content);
      await git(execution, "commit", "-q", "-m", `repair ${name}`);
    },
  };
}

// Submodule content changes show as dirt that `git stash` cannot save.
export async function addDirtySubmodule({ root, execution }) {
  const { origin: library } = await materializeRepository(libraryRepository, {
    parent: root,
  });
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
