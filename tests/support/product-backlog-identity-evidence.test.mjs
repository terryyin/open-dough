// Runs the real backlog CLI's `identity-evidence` against a scratch project
// whose seed directory, backlog, and done records each show identities
// already used: cleanup removes completed seeds, so the report must name the
// highest number every source shows, the record behind it, and each source it
// could not read, and it must write nothing. Published Git history still
// shows seeds and records cleanup removed, so a Git project's history is a
// source too, and a project without readable history names it as a gap.
import assert from "node:assert/strict";
import { mkdtempSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import {
  backlog,
  projectFile,
  run,
  scratchProject,
  takenStory,
} from "./product-backlog-fixture.mjs";
import { at, doneDirectory } from "./product-backlog-done-fixture.mjs";
import {
  cleanedUpProject,
  evidence,
  git,
  historyUnread,
  projectWithRemovedAllocation,
  snapshot,
} from "./product-backlog-identity-evidence-fixture.mjs";

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
  assert.deepEqual(report.gaps, [historyUnread]);
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
    historyUnread,
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
    historyUnread,
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
test("identity-evidence names a seed history still shows above the active seeds and done records", async (t) => {
  const { project, added, head } = projectWithRemovedAllocation(t);
  const before = snapshot(project);

  const report = await evidence(project);

  assert.deepEqual(report.highest, {
    source: "history",
    seed: "SEED-090",
    number: 90,
    identity: "SEED-090",
    evidence: "seeds/SEED-090-x.md",
    commit: added,
  });
  assert.equal(report.next, "SEED-091");
  const history = report.sources.find((source) => source.source === "history");
  assert.equal(history.read, true);
  assert.equal(history.path, "..");
  assert.equal(history.revision, head);
  const bySource = Object.fromEntries(
    report.sources.map((source) => [source.source, source]),
  );
  assert.equal(bySource["seed-directory"].highest.seed, "SEED-074");
  assert.equal(bySource["done-records"].highest.seed, "SEED-084");
  assert.deepEqual(
    report.gaps.map(({ source }) => source),
    ["done-catalog"],
  );
  assert.deepEqual(snapshot(project), before);
  assert.equal(git(project.directory, "rev-parse", "HEAD"), head);
});

test("identity-evidence reports a candidate history alone still shows", async (t) => {
  const { project, added } = projectWithRemovedAllocation(t);

  const recorded = await evidence(project, "--identity", "SEED-090#x_y");
  const sameSeed = await evidence(project, "--identity", "SEED-090#other");
  const activeSeed = await evidence(project, "--identity", "SEED-074#new");

  assert.deepEqual(recorded.candidate, {
    identity: "SEED-090#x_y",
    status: "in-history",
    history: {
      record: { evidence: "done/SEED-090_x~5Fy.json", commit: added },
      seed: {
        seed: "SEED-090",
        evidence: "seeds/SEED-090-x.md",
        commit: added,
      },
    },
  });
  assert.deepEqual(sameSeed.candidate, {
    identity: "SEED-090#other",
    status: "in-history",
    history: {
      seed: {
        seed: "SEED-090",
        evidence: "seeds/SEED-090-x.md",
        commit: added,
      },
    },
  });
  assert.equal(activeSeed.candidate.status, "unlisted");
  assert.equal(
    activeSeed.candidate.history.seed.evidence,
    "seeds/SEED-074-latest-active.md",
  );
});

test("identity-evidence names shallow history as unread while the other sources stand", async (t) => {
  const { project } = projectWithRemovedAllocation(t);
  const clone = mkdtempSync(join(tmpdir(), "dough-backlog-shallow-"));
  t.after(() => rmSync(clone, { recursive: true, force: true }));
  git(
    tmpdir(),
    "clone",
    "-q",
    "--depth",
    "1",
    `file://${project.directory}`,
    clone,
  );

  const report = await evidence({ directory: clone });

  assert.equal(report.highest.evidence, "done/SEED-084_story-1.json");
  assert.equal(report.next, "SEED-085");
  assert.deepEqual(report.gaps.at(-1), {
    source: "history",
    path: "..",
    reason: "shallow history: commits beyond its boundary are unread",
  });
});
