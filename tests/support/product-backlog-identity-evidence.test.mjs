// Runs the real backlog CLI's `identity-evidence` against a scratch project
// whose seed directory, backlog, and done records each show identities
// already used: cleanup removes completed seeds, so the report must name the
// highest number every source shows, the record behind it, and each source it
// could not read, and it must write nothing.
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import {
  backlog,
  projectFile,
  run,
  scratchProject,
  takenStory,
} from "./product-backlog-fixture.mjs";
import {
  at,
  doneDirectory,
  recordText,
} from "./product-backlog-done-fixture.mjs";

const seed = (number) => `---\nid: SEED-${number}\n---\n\n# Seed ${number}\n`;

const doneTimes = (index) =>
  `2026-10-${String(index + 1).padStart(2, "0")}T10:00:00.000Z`;

// Active seeds end at SEED-074; cleanup has removed SEED-075 … SEED-084,
// whose done records remain.
function cleanedUpProject(t) {
  const project = scratchProject(t);
  projectFile(project, "seeds/SEED-073-earlier.md", seed("073"));
  projectFile(project, "seeds/SEED-074-latest-active.md", seed("074"));
  for (let number = 75; number <= 84; number += 1) {
    const identity = `SEED-0${number}#story-1`;
    projectFile(
      project,
      `done/SEED-0${number}_story-1.json`,
      recordText(identity, `Story ${number}`, doneTimes(number - 75)),
    );
  }
  return project;
}

const evidence = async (project, ...arguments_) => {
  const result = await run(
    project,
    ["identity-evidence", ...arguments_],
    at("2026-10-23T00:00:00.000Z"),
  );
  assert.equal(result.code, 0, result.stderr);
  return JSON.parse(result.stdout);
};

const snapshot = (project) =>
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

test("identity-evidence names the done record above the active seeds and the next number", async (t) => {
  const project = cleanedUpProject(t);
  await run(project, ["catalog-done"], at("2026-10-23T00:00:00.000Z"));
  const before = snapshot(project);

  const report = await evidence(project);

  assert.deepEqual(report.highest, {
    source: "done-records",
    seed: "SEED-084",
    number: 84,
    identity: "SEED-084#story-1",
    evidence: "done/SEED-084_story-1.json",
  });
  assert.equal(report.next, "SEED-085");
  const bySource = Object.fromEntries(
    report.sources.map((source) => [source.source, source]),
  );
  assert.equal(bySource["seed-directory"].highest.seed, "SEED-074");
  assert.equal(
    bySource["seed-directory"].highest.evidence,
    "seeds/SEED-074-latest-active.md",
  );
  assert.equal(bySource["done-catalog"].highest.seed, "SEED-084");
  assert.equal(bySource["done-catalog"].read, true);
  assert.deepEqual(report.gaps, []);
  assert.deepEqual(snapshot(project), before);
});

test("identity-evidence reads the records it can and names an absent catalog and an unreadable record as gaps", async (t) => {
  const project = cleanedUpProject(t);
  projectFile(project, "done/SEED-099_broken.json", "not a record\n");
  const before = snapshot(project);

  const report = await evidence(project);

  assert.equal(report.highest.evidence, "done/SEED-084_story-1.json");
  assert.equal(report.next, "SEED-085");
  const catalog = report.sources.find(
    (source) => source.source === "done-catalog",
  );
  assert.equal(catalog.read, false);
  assert.deepEqual(report.gaps, [
    {
      source: "done-records",
      path: "done/SEED-099_broken.json",
      reason: "done record is not JSON",
    },
    { source: "done-catalog", path: "done/.catalog.json", reason: "absent" },
  ]);
  assert.deepEqual(snapshot(project), before);
  assert.equal(
    readdirSync(doneDirectory(project)).includes(".catalog.json"),
    false,
  );
});

test("identity-evidence names an absent seed directory as a gap", async (t) => {
  const project = scratchProject(t);

  const report = await evidence(project);

  assert.deepEqual(report.gaps, [
    { source: "seed-directory", path: "seeds", reason: "absent" },
  ]);
  assert.equal(
    report.sources.find((source) => source.source === "seed-directory").read,
    false,
  );
});

test("identity-evidence reports a candidate as completed, active, or unlisted", async (t) => {
  const project = cleanedUpProject(t);
  const completed = await evidence(project, "--identity", "SEED-075#story-1");
  const active = await evidence(project, "--identity", takenStory);
  const unlisted = await evidence(project, "--identity", "SEED-085#story-1");

  assert.deepEqual(completed.candidate, {
    identity: "SEED-075#story-1",
    status: "completed",
    completed: {
      record: "done/SEED-075_story-1.json",
      title: "Story 75",
      completedAt: "2026-10-01T10:00:00.000Z",
    },
  });
  assert.deepEqual(active.candidate, {
    identity: takenStory,
    status: "active",
    list: "Taken",
  });
  assert.deepEqual(unlisted.candidate, {
    identity: "SEED-085#story-1",
    status: "unlisted",
  });
  assert.equal(project.read(), backlog);
});
