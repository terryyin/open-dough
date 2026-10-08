// Runs the real backlog CLI to complete work in scratch projects, observing
// the done records each completion leaves beside the backlog — expired ones
// pruned, none for dropped work — and the done catalog it rebuilds from them,
// checked against Git's own blob hashes.
import assert from "node:assert/strict";
import { existsSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import {
  agentIdentity,
  renderAgentProfile,
} from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import {
  assertCatalogMatchesRecords,
  at,
  completedAt,
  daysBefore,
  doneDirectory,
  gitBlob,
  readCatalog,
  recordText,
} from "./product-backlog-done-fixture.mjs";
import {
  backlog,
  projectFile,
  run,
  scratchProject,
  takenEntry,
  takenStory,
  trunkQueue,
} from "./product-backlog-fixture.mjs";

test("completion rebuilds the catalog: a new row, a replaced row, and no row for an expired record", async (t) => {
  const project = scratchProject(t);
  const done = doneDirectory(project);
  projectFile(
    project,
    "done/SEED-900_expired.json",
    recordText("SEED-900#expired", "Expired", daysBefore(31)),
  );
  projectFile(
    project,
    "done/SEED-901_recent.json",
    recordText("SEED-901#recent", "Recent", daysBefore(29)),
  );

  const first = await run(
    project,
    ["complete", "--identity", trunkQueue],
    at(completedAt),
  );
  assert.equal(first.code, 0, first.stderr);
  const queueFile = "SEED-008_same-machine-merge-queue.json";
  const blob = (fileName) => gitBlob(join(done, fileName));
  assert.deepEqual(readCatalog(done).records, [
    {
      fileName: queueFile,
      identity: trunkQueue,
      completedAt,
      blob: blob(queueFile),
    },
    {
      fileName: "SEED-901_recent.json",
      identity: "SEED-901#recent",
      completedAt: daysBefore(29),
      blob: blob("SEED-901_recent.json"),
    },
  ]);
  assert.match(
    first.stdout,
    /Removed expired done record done\/SEED-900_expired\.json beside the backlog\. Rebuilt done catalog done\/\.catalog\.json beside the backlog, listing 2 done records\.$/m,
  );
  assert.doesNotMatch(first.stdout, /SEED-901/);

  // The same identity listed and completed again replaces its record, and
  // the catalog row follows the record's new time and content.
  const firstBlob = blob(queueFile);
  writeFileSync(
    project.file,
    project
      .read()
      .replace(
        "## Backlog list\n\n",
        "## Backlog list\n\n- [Queue trunk integration for agents on the same machine](seeds/SEED-008-worktree-branch-trunk-sync.md#same-machine-merge-queue) — SEED-008#same-machine-merge-queue\n",
      ),
    "utf8",
  );
  const later = "2026-10-07T09:30:00.000Z";
  const again = await run(
    project,
    ["complete", "--identity", trunkQueue],
    at(later),
  );
  assert.equal(again.code, 0, again.stderr);
  const catalog = readCatalog(done);
  assert.equal(catalog.records.length, 2);
  assert.deepEqual(catalog.records[0], {
    fileName: queueFile,
    identity: trunkQueue,
    completedAt: later,
    blob: blob(queueFile),
  });
  assert.notEqual(catalog.records[0].blob, firstBlob);
  assertCatalogMatchesRecords(done);
});

test("dropped work releases its profile and adds no record or catalog row, while expired records still go", async (t) => {
  const project = scratchProject(t);
  const done = doneDirectory(project);
  projectFile(
    project,
    agentIdentity("Akiho").path,
    renderAgentProfile({
      name: "Akiho",
      identity: takenStory,
      mode: "trunk",
      branch: "origin/main",
    }),
  );
  projectFile(
    project,
    "done/SEED-900_expired.json",
    recordText("SEED-900#expired", "Expired", daysBefore(31)),
  );
  projectFile(
    project,
    "done/SEED-901_recent.json",
    recordText("SEED-901#recent", "Recent", daysBefore(29)),
  );

  const result = await run(
    project,
    ["complete", "--identity", takenStory, "--dropped"],
    at(completedAt),
  );
  assert.equal(result.code, 0, result.stderr);
  assert.equal(project.read(), backlog.replace(`${takenEntry}\n\n`, ""));
  assert.deepEqual(readdirSync(done).sort(), [
    ".catalog.json",
    "SEED-901_recent.json",
  ]);
  assert.deepEqual(readCatalog(done), {
    schemaVersion: 1,
    records: [
      {
        fileName: "SEED-901_recent.json",
        identity: "SEED-901#recent",
        completedAt: daysBefore(29),
        blob: gitBlob(join(done, "SEED-901_recent.json")),
      },
    ],
    unreadable: [],
  });

  assert.equal(
    existsSync(join(project.directory, ".planning/agents/akiho-chan.json")),
    false,
  );
  assert.match(
    result.stdout,
    /Released agent profile agents\/akiho-chan\.json/,
  );
  assert.match(result.stdout, /Removed it as dropped work/);
  assert.match(result.stdout, /Removed expired done record done\/SEED-900/);
  assert.doesNotMatch(result.stdout, /Wrote done record/);
});

test("cooperating completions each keep their record and both appear in the catalog", async (t) => {
  const project = scratchProject(t);
  const done = doneDirectory(project);

  const results = await Promise.all([
    run(project, ["complete", "--identity", trunkQueue], at(completedAt)),
    run(
      project,
      ["complete", "--identity", takenStory],
      at("2026-10-06T10:00:01.000Z"),
    ),
  ]);
  for (const result of results) assert.equal(result.code, 0, result.stderr);

  const records = [
    "SEED-008_same-machine-merge-queue.json",
    "SEED-008_script-product-backlog-list-updates.json",
  ];
  assert.deepEqual(readdirSync(done).sort(), [".catalog.json", ...records]);
  const catalog = readCatalog(done);
  assert.deepEqual(
    catalog.records.map(({ identity }) => identity),
    [takenStory, trunkQueue],
  );
  assertCatalogMatchesRecords(done);
});
