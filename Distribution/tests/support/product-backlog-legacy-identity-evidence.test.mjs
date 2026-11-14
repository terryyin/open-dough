// Real CLI evidence for readable legacy context and identity-bearing homes.
import assert from "node:assert/strict";
import { symlinkSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { projectFile, run } from "./product-backlog-fixture.mjs";
import { at } from "./product-backlog-done-fixture.mjs";
import {
  evidence,
  git,
  projectWithRemovedAllocation,
  snapshot,
} from "./product-backlog-identity-evidence-fixture.mjs";

async function legacyProject(t) {
  const { project } = await projectWithRemovedAllocation(t);
  const catalog = await run(
    project,
    ["catalog-done"],
    at("2026-10-23T00:00:00.000Z"),
  );
  assert.equal(catalog.code, 0, catalog.stderr);
  return project;
}

test("readable context allocates nothing while numeric filenames and old identity layouts reserve their numbers", async (t) => {
  const project = await legacyProject(t);
  projectFile(
    project,
    "seeds/shared-context.md",
    "# Shared research context\n\nReferences to SEED-999 are not allocations.\n",
  );
  projectFile(project, "seeds/SEED-100-no-frontmatter.md", "# Existing seed\n");
  projectFile(
    project,
    "seeds/legacy-layout.md",
    "# Earlier story layout\n\n## A story\n\n**Identity:** SEED-101#earlier-layout\n",
  );
  const before = snapshot(project);

  const report = await evidence(project);

  assert.deepEqual(report.gaps, []);
  assert.equal(report.highest.seed, "SEED-101");
  assert.equal(report.highest.evidence, "seeds/legacy-layout.md");
  assert.equal(report.next, "SEED-102");
  assert.deepEqual(snapshot(project), before);
});

test("removed legacy paths retain identities from later versions and preserve nonnumeric identities", async (t) => {
  const project = await legacyProject(t);
  projectFile(project, "seeds/legacy.md", "# Initial context\n");
  projectFile(project, "seeds/removed-context.md", "# Evidence only\n");
  git(project.directory, "add", "-A");
  git(project.directory, "commit", "-q", "-m", "Context before allocation");
  projectFile(
    project,
    "seeds/legacy.md",
    "# Earlier layout\n\n**Identity:** SEED-125#earlier\n",
  );
  projectFile(
    project,
    "seeds/scheduler-wake.md",
    "# Wake work\n\n**Identity:** scheduler-wake#overdue-jobs\n",
  );
  git(project.directory, "add", "-A");
  git(project.directory, "commit", "-q", "-m", "Record legacy identities");
  const allocated = git(project.directory, "rev-parse", "HEAD");
  projectFile(
    project,
    "seeds/legacy.md",
    "# Later layout\n\n**Identity:** SEED-115#later\n",
  );
  git(project.directory, "add", "-A");
  git(
    project.directory,
    "commit",
    "-q",
    "-m",
    "A later identity on the same path",
  );
  git(
    project.directory,
    "rm",
    "-q",
    ".planning/seeds/legacy.md",
    ".planning/seeds/removed-context.md",
    ".planning/seeds/scheduler-wake.md",
  );
  git(project.directory, "commit", "-q", "-m", "Remove spent legacy documents");
  const before = snapshot(project);
  const head = git(project.directory, "rev-parse", "HEAD");

  const earlier = await evidence(project, "--identity", "SEED-125#earlier");
  const later = await evidence(project, "--identity", "SEED-115#later");
  const nonnumeric = await evidence(
    project,
    "--identity",
    "scheduler-wake#overdue-jobs",
  );

  assert.deepEqual(earlier.gaps, []);
  assert.equal(earlier.highest.seed, "SEED-125");
  assert.equal(earlier.highest.commit, allocated);
  assert.equal(earlier.next, "SEED-126");
  for (const report of [earlier, later, nonnumeric])
    assert.equal(report.candidate.status, "in-history");
  assert.deepEqual(nonnumeric.candidate.history, {
    story: { evidence: "seeds/scheduler-wake.md", commit: allocated },
  });
  assert.deepEqual(snapshot(project), before);
  assert.equal(git(project.directory, "rev-parse", "HEAD"), head);
});

test("malformed current and historical identity evidence remains a gap", async (t) => {
  const project = await legacyProject(t);
  projectFile(
    project,
    "seeds/old-malformed.md",
    "# Earlier work\n\n**Identity:**\n",
  );
  git(project.directory, "add", "-A");
  git(project.directory, "commit", "-q", "-m", "Malformed historical evidence");
  git(project.directory, "rm", "-q", ".planning/seeds/old-malformed.md");
  git(
    project.directory,
    "commit",
    "-q",
    "-m",
    "Remove unreadable identity evidence",
  );
  projectFile(
    project,
    "seeds/current-malformed.md",
    "# Current work\n\n**Identity:** not an identity\n",
  );
  projectFile(
    project,
    "seeds/malformed-metadata.md",
    "---\nid:\n---\n# Invalid seed\n",
  );
  const before = snapshot(project);

  const report = await evidence(project);

  assert.deepEqual(
    report.gaps.map((gap) => [gap.source, gap.path]),
    [
      ["seed-directory", "seeds/current-malformed.md"],
      ["seed-directory", "seeds/malformed-metadata.md"],
      ["history", "seeds/old-malformed.md"],
    ],
  );
  assert.match(report.gaps[0].reason, /cannot be written in an entry/);
  assert.match(report.gaps[1].reason, /malformed seed ID/);
  assert.match(report.gaps[2].reason, /malformed Identity record/);
  assert.deepEqual(snapshot(project), before);
});

test("an unreadable current document remains a gap beside readable identity evidence", async (t) => {
  const project = await legacyProject(t);
  symlinkSync(
    "missing-document",
    join(project.directory, ".planning/seeds/unreadable.md"),
  );
  const before = snapshot(project);

  const report = await evidence(project);

  assert.equal(report.highest.seed, "SEED-090");
  assert.equal(report.next, "SEED-091");
  assert.equal(report.gaps.length, 1);
  assert.equal(report.gaps[0].path, "seeds/unreadable.md");
  assert.match(report.gaps[0].reason, /ENOENT/);
  assert.deepEqual(snapshot(project), before);
});
