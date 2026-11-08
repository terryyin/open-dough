// Shared setup and observations for runs of the real backlog CLI's
// `identity-evidence` against a scratch project whose seed directory,
// backlog, done records, and Git history each show identities already used.
import { doneCatalogPath } from "../../src/skills/dough-product-backlog/scripts/product-backlog-done-catalog.mjs";
import {
  doneRecordPath,
  renderDoneRecord,
} from "../../src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import { makeMe } from "./makeMe.mjs";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  arrangedBacklogFacts,
  projectFile,
  run,
  scratchProject,
} from "./product-backlog-fixture.mjs";
import { at, isolatedGit } from "./product-backlog-done-fixture.mjs";
import { checkoutOf } from "./product-backlog-git-fixture.mjs";

const seed = (number) => `---\nid: SEED-${number}\n---\n\n# Seed ${number}\n`;

const doneTimes = (index) =>
  `2026-10-${String(index + 1).padStart(2, "0")}T10:00:00.000Z`;

// Active seeds end at SEED-074; cleanup has removed SEED-075 … SEED-084,
// whose done records remain.
const activeSeeds = {
  "seeds/SEED-073-earlier.md": seed("073"),
  "seeds/SEED-074-latest-active.md": seed("074"),
};
const cleanedUpRecords = [...Array(10).keys()].map((index) =>
  makeMe.aDoneRecord
    .with({
      identity: `SEED-0${index + 75}#story-1`,
      title: `Story ${index + 75}`,
      completedAt: doneTimes(index),
      developer: "Ann",
    })
    .please(),
);

export function cleanedUpProject(t) {
  const project = scratchProject(t);
  for (const [path, text] of Object.entries(activeSeeds))
    projectFile(project, path, text);
  for (const record of cleanedUpRecords)
    projectFile(
      project,
      doneRecordPath(record.identity),
      renderDoneRecord(record),
    );
  return project;
}

// A scratch project outside any Git work tree has no history to read.
export const historyUnread = {
  source: "history",
  path: ".",
  reason: "not a Git work tree",
};

export const evidence = async (project, ...arguments_) => {
  const result = await run(
    project,
    ["identity-evidence", ...arguments_],
    at("2026-10-23T00:00:00.000Z"),
  );
  assert.equal(result.code, 0, result.stderr);
  return JSON.parse(result.stdout);
};

export const snapshot = (project) =>
  readdirSync(join(project.directory, ".planning"), { recursive: true })
    .sort()
    .map((path) => {
      const full = join(project.directory, ".planning", path);
      try {
        return [path, readFileSync(full, "utf8")];
      } catch {
        return [path, "(directory)"];
      }
    });

export const git = (directory, ...args) =>
  execFileSync("git", args, {
    cwd: directory,
    env: { ...process.env, ...isolatedGit },
    encoding: "utf8",
  }).trim();

// Four months before the report runs, SEED-090 was allocated, completed, and
// cleaned up: its seed file and its done record were committed and later
// removed, so only history still shows them. The record's anchor holds a
// character its file name escapes. The project publishes no done catalog.
export async function projectWithRemovedAllocation(t) {
  const planning = (path) => `.planning/${path}`;
  const noCatalog = [planning(doneCatalogPath)];
  const project = await checkoutOf(
    t,
    makeMe.aRepository
      .withRevision("Active work", {
        backlog: arrangedBacklogFacts,
        files: Object.fromEntries(
          Object.entries(activeSeeds).map(([path, text]) => [
            planning(path),
            text,
          ]),
        ),
        doneRecords: cleanedUpRecords,
        remove: noCatalog,
      })
      .withRevision("Allocate SEED-090", {
        files: { [planning("seeds/SEED-090-x.md")]: seed("090") },
        doneRecords: [
          makeMe.aDoneRecord
            .with({
              identity: "SEED-090#x_y",
              title: "Story 90",
              completedAt: "2026-06-20T10:00:00.000Z",
              developer: "Ann",
            })
            .please(),
        ],
        remove: noCatalog,
      })
      .withRevision("Clean up SEED-090", {
        remove: [
          planning("seeds/SEED-090-x.md"),
          planning("done/SEED-090_x~5Fy.json"),
          ...noCatalog,
        ],
      })
      .please(),
  );
  return {
    project,
    added: project.revisions["Allocate SEED-090"],
    head: project.revisions["Clean up SEED-090"],
  };
}
