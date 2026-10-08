// Shared setup and observations for runs of the real backlog CLI that write,
// prune, or catalog done records beside a scratch project's backlog.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  doneCatalogMismatch,
  parseDoneCatalog,
} from "../../src/skills/dough-product-backlog/scripts/product-backlog-done-catalog.mjs";
import { renderDoneRecord } from "../../src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";

// Git reads only the scratch project's own configuration, never the machine's.
export const isolatedGit = {
  GIT_CONFIG_GLOBAL: "/dev/null",
  GIT_CONFIG_NOSYSTEM: "1",
};
export const completedAt = "2026-10-06T10:00:00.000Z";
export const at = (time) => ({
  ...isolatedGit,
  DOUGH_BACKLOG_COMPLETION_TIME: time,
});
export const daysBefore = (days) =>
  new Date(Date.parse(completedAt) - days * 24 * 60 * 60 * 1000).toISOString();

// Supplies only the starting precondition: the scratch project is a Git
// workspace configured with the developer's name.
export function gitWorkspace(project, developer = "Terry Yin") {
  const git = (args) =>
    execFileSync("git", args, {
      cwd: project.directory,
      env: { ...process.env, ...isolatedGit },
    });
  git(["init", "-q", "-b", "main"]);
  git(["config", "user.name", developer]);
  return project;
}

export const recordText = (identity, title, time) =>
  renderDoneRecord({ identity, title, completedAt: time, developer: "Ann" });

// The done catalog every completion rebuilds among the records it indexes.
export const catalogFile = ".catalog.json";
export const doneDirectory = (project) =>
  join(project.directory, ".planning", "done");
export const doneFiles = (project) =>
  existsSync(doneDirectory(project))
    ? readdirSync(doneDirectory(project)).sort()
    : [];
export const readCatalog = (done) =>
  JSON.parse(readFileSync(join(done, catalogFile), "utf8"));

// Git's own name for a file's content, never the product's.
export function gitBlob(path) {
  return execFileSync("git", ["hash-object", "--no-filters", path], {
    env: { ...process.env, ...isolatedGit },
  })
    .toString()
    .trim();
}

// The record files a done directory holds, each at Git's blob hash: what a
// published listing of that directory offers a reader.
function listing(done) {
  return readdirSync(done)
    .sort()
    .map((fileName) => ({ fileName, blob: gitBlob(join(done, fileName)) }));
}

// The published catalog reads back and describes exactly the record files
// beside it.
export function assertCatalogMatchesRecords(done) {
  const read = parseDoneCatalog(readFileSync(join(done, catalogFile), "utf8"));
  assert.equal(read.ok, true, read.error);
  assert.equal(doneCatalogMismatch(read.catalog, listing(done)), undefined);
}
