// Shared precondition and observation for the done catalog through the
// Git-aware backlog adapters: done records and catalogs written by the real
// `complete` and `catalog-done` commands on real branches, and a committed
// catalog checked against the committed record files at Git's own blob
// hashes and against what `catalog-done` would write from them.
import assert from "node:assert/strict";
import { execFile, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import {
  doneCatalogMismatch,
  parseDoneCatalog,
} from "../../src/skills/dough-product-backlog/scripts/product-backlog-done-catalog.mjs";
import { checkout } from "./product-backlog-git-fixture.mjs";

const exec = promisify(execFile);
const backlogCli = fileURLToPath(
  new URL(
    "../../src/skills/dough-product-backlog/scripts/product-backlog.mjs",
    import.meta.url,
  ),
);

export const done = ".planning/done";
export const catalog = `${done}/.catalog.json`;
const item = (name) =>
  `- [Item ${name}](seeds/${name}.md#${name}) — ${name}#${name}`;
export const items = (...names) => names.map(item);

// Runs the real backlog command in `directory` at a fixed completion time.
export async function backlogCommand(
  directory,
  args,
  time = "2026-10-06T10:00:00.000Z",
) {
  const { stdout } = await exec(process.execPath, [backlogCli, ...args], {
    cwd: directory,
    env: { ...process.env, DOUGH_BACKLOG_COMPLETION_TIME: time },
  });
  return stdout;
}

// Completes `name` on the checked-out branch with the real command and
// commits everything it changed.
export async function completeAndCommit(repo, name, time) {
  await backlogCommand(
    repo.directory,
    ["complete", "--identity", `${name}#${name}`],
    time,
  );
  repo.git(["add", "-A"]);
  repo.git(["commit", "-q", "-m", `complete ${name}`]);
}

// A branch from the current commit holding the completions `names`, returning
// to `main` afterward.
export async function completingBranch(repo, branch, names, time) {
  repo.git(["checkout", "-q", "-b", branch]);
  for (const name of names) await completeAndCommit(repo, name, time);
  checkout(repo, "main");
}

// The paths a plain Git merge of `ours` and `theirs`, with no driver
// registered, leaves conflicted. Observes only; writes no ref or file.
export function plainMergeConflicts(repo, ours, theirs) {
  const result = spawnSync(
    "git",
    [
      "merge-tree",
      "--write-tree",
      "--name-only",
      "--no-messages",
      ours,
      theirs,
    ],
    { cwd: repo.directory, encoding: "utf8" },
  );
  return result.stdout.split("\n").slice(1).join("\n");
}

export const show = (repo, rev, path) => repo.git(["show", `${rev}:${path}`]);

// The catalog text reads back and describes exactly the record files that
// `ls-tree` text of the done directory lists, at the blob hashes Git gave
// them. Returns the catalog read.
export function assertCatalogDescribes(catalogText, doneTree) {
  const read = parseDoneCatalog(catalogText);
  assert.equal(read.ok, true, read.error);
  const listing = doneTree
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [meta, fileName] = line.split("\t");
      return { fileName, blob: meta.split(" ")[2] };
    });
  assert.equal(doneCatalogMismatch(read.catalog, listing), undefined);
  return read.catalog;
}

// The catalog committed at `rev` is current for the records committed there.
export function assertCommittedCatalogCurrent(git, rev) {
  return assertCatalogDescribes(
    git(["show", `${rev}:${catalog}`]),
    git(["ls-tree", `${rev}:${done}`]),
  );
}

// `catalog-done` run over the committed checkout writes nothing new: the
// committed catalog is exactly what it would produce from the records.
export async function assertCatalogDoneAgrees(repo) {
  await backlogCommand(repo.directory, ["catalog-done"]);
  assert.equal(repo.git(["status", "--porcelain"]), "");
}

export const fileNames = (catalogRead) =>
  catalogRead.records.map(({ fileName }) => fileName).sort();
