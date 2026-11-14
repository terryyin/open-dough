// Shared precondition and observation for the done catalog through the
// Git-aware backlog adapters: declared done records and agent profiles
// committed on real branches as `complete` and `take` publish them, with the
// catalog derived from the record files by the product's own rebuild, and a
// committed catalog checked against the committed record files at Git's own
// blob hashes and against what the real `catalog-done` would write from them.
import assert from "node:assert/strict";
import { execFile, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { agentIdentity } from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { completeEntry } from "../../src/skills/dough-product-backlog/scripts/product-backlog-complete.mjs";
import {
  doneCatalogMismatch,
  parseDoneCatalog,
} from "../../src/skills/dough-product-backlog/scripts/product-backlog-done-catalog.mjs";
import { makeMe } from "./makeMe.mjs";
import { checkout } from "./product-backlog-git-fixture.mjs";
import { writeRevisionFiles } from "./repository-revision-files.mjs";

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
// The same entries as `items` writes, as `makeMe.aBacklogEntry` facts.
export const entries = (...names) =>
  names.map((name) =>
    makeMe.aBacklogEntry
      .with({
        identity: `${name}#${name}`,
        title: `Item ${name}`,
        href: `seeds/${name}.md#${name}`,
      })
      .please(),
  );

// The done record of the entry `entries` declares for `name`, completed at
// `completedAt` with any further `facts` the case reads (`developer`,
// `agent`, `host`, `model`), as `makeMe.aDoneRecord`.
export const doneRecord = (name, completedAt, facts = {}) =>
  makeMe.aDoneRecord
    .with({
      identity: `${name}#${name}`,
      title: `Item ${name}`,
      completedAt,
      ...facts,
    })
    .please();

// Commits on the checked-out branch the completion `complete` would publish
// for `record`: its backlog entry removed, the record written, the
// `released` agent profile (as `anAgentProfile` builds it) removed, and the
// catalog rebuilt from the record files.
export function completeAndCommit(repo, record, { released } = {}) {
  repo.write(completeEntry(repo.read(), { identity: record.identity }).source);
  writeRevisionFiles(repo.directory, {
    doneRecords: [record],
    remove: released ? [profilePath(released.name)] : [],
  });
  repo.git(["add", "-A"]);
  repo.git(["commit", "-q", "-m", `complete ${record.identity.split("#")[0]}`]);
}

// The profile path, beside the backlog, of the agent `name`.
export const profilePath = (name) => `.planning/${agentIdentity(name).path}`;

// Publishes on the checked-out branch the agent profile `profile` (as
// MakeMe's `anAgentProfile` builds it), as a Take commits it.
export function takeAndCommit(repo, profile) {
  writeRevisionFiles(repo.directory, { agentProfiles: [profile] });
  repo.git(["add", "-A"]);
  repo.git(["commit", "-q", "-m", `take ${profile.identity}`]);
}

// A branch from the current commit holding the completions of `records`,
// one commit each, returning to `main` afterward.
export function completingBranch(repo, branch, records) {
  repo.git(["checkout", "-q", "-b", branch]);
  for (const record of records) completeAndCommit(repo, record);
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
  await exec(process.execPath, [backlogCli, "catalog-done"], {
    cwd: repo.directory,
  });
  assert.equal(repo.git(["status", "--porcelain"]), "");
}

export const fileNames = (catalogRead) =>
  catalogRead.records.map(({ fileName }) => fileName).sort();
