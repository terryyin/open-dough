// Runs the real backlog CLI to complete work in a scratch Git project,
// observing the done record written beside the backlog: what it says and the
// file it takes.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import {
  agentIdentity,
  renderAgentProfile,
} from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import {
  addArguments,
  backlog,
  backlogOf,
  projectFile,
  queued,
  run,
  scratchProject,
  takenEntry,
  takenStory,
  trunkQueue,
} from "./product-backlog-fixture.mjs";
import {
  at,
  catalogFile,
  completedAt,
  doneDirectory,
  doneFiles,
  gitWorkspace,
  isolatedGit,
} from "./product-backlog-done-fixture.mjs";

const readRecord = (project, fileName) =>
  JSON.parse(readFileSync(join(doneDirectory(project), fileName), "utf8"));

test("complete on a Taken entry with an execution profile writes its done record beside the released profile", async (t) => {
  const project = gitWorkspace(scratchProject(t));
  projectFile(
    project,
    agentIdentity("Akiho").path,
    renderAgentProfile({
      name: "Akiho",
      identity: takenStory,
      mode: "trunk",
      branch: "origin/main",
      host: "claude",
      model: "claude-opus-5-5",
    }),
  );

  const result = await run(
    project,
    ["complete", "--identity", takenStory],
    at(completedAt),
  );
  assert.equal(result.code, 0, result.stderr);
  assert.equal(project.read(), backlog.replace(`${takenEntry}\n\n`, ""));
  assert.equal(
    existsSync(join(project.directory, ".planning/agents/akiho-chan.json")),
    false,
  );
  const fileName = "SEED-008_script-product-backlog-list-updates.json";
  assert.deepEqual(doneFiles(project), [catalogFile, fileName]);
  assert.deepEqual(readRecord(project, fileName), {
    schemaVersion: 1,
    identity: takenStory,
    title: "Update the product backlog without hand-editing the shared list",
    completedAt,
    developer: "Terry Yin",
    agent: "Akiho-chan",
    host: "claude",
    model: "claude-opus-5-5",
  });
  assert.match(
    result.stdout,
    new RegExp(`Wrote done record done/${fileName} beside the backlog\\.`),
  );
});

test("complete on a queued entry without a profile records the developer and no agent", async (t) => {
  const project = gitWorkspace(scratchProject(t));

  const result = await run(
    project,
    ["complete", "--identity", trunkQueue],
    at(completedAt),
  );
  assert.equal(result.code, 0, result.stderr);
  assert.deepEqual(
    readRecord(project, "SEED-008_same-machine-merge-queue.json"),
    {
      schemaVersion: 1,
      identity: trunkQueue,
      title: "Queue trunk integration for agents on the same machine",
      completedAt,
      developer: "Terry Yin",
    },
  );
});

test("complete in a workspace that names no developer records none", async (t) => {
  const project = scratchProject(t);

  const result = await run(
    project,
    ["complete", "--identity", trunkQueue],
    at(completedAt),
  );
  assert.equal(result.code, 0, result.stderr);
  const record = readRecord(project, "SEED-008_same-machine-merge-queue.json");
  assert.equal(Object.hasOwn(record, "developer"), false);
  assert.equal(record.identity, trunkQueue);
});

test("an identity holding # and . keeps one readable file name, replaced when completed again", async (t) => {
  const identity = "SEED-200#v1.2-release.notes";
  const line = `- [Release notes for v1.2](seeds/SEED-200-release.md#v1.2-release.notes) — ${identity}`;
  const project = gitWorkspace(
    scratchProject(t, backlogOf([takenEntry], [...queued, line])),
  );
  projectFile(
    project,
    "seeds/SEED-200-release.md",
    `---\nid: SEED-200\n---\n\n# Release\n\n<a id="v1.2-release.notes"></a>\n\n### Release notes for v1.2\n`,
  );
  const fileName = "SEED-200_v1.2-release.notes.json";

  const first = await run(
    project,
    ["complete", "--identity", identity],
    at(completedAt),
  );
  assert.equal(first.code, 0, first.stderr);
  assert.deepEqual(doneFiles(project), [catalogFile, fileName]);

  const added = await run(
    project,
    addArguments(
      {
        identity,
        title: "Release notes for v1.2",
        link: "seeds/SEED-200-release.md#v1.2-release.notes",
      },
      ["--position", "last"],
    ),
    isolatedGit,
  );
  assert.equal(added.code, 0, added.stderr);
  const later = "2026-10-07T09:30:00.000Z";
  const again = await run(
    project,
    ["complete", "--identity", identity],
    at(later),
  );
  assert.equal(again.code, 0, again.stderr);
  assert.deepEqual(doneFiles(project), [catalogFile, fileName]);
  assert.equal(readRecord(project, fileName).completedAt, later);
});

test("a repeated complete for an identity no longer listed writes no record", async (t) => {
  const project = gitWorkspace(scratchProject(t));
  const first = await run(
    project,
    ["complete", "--identity", trunkQueue],
    at(completedAt),
  );
  assert.equal(first.code, 0, first.stderr);
  const fileName = "SEED-008_same-machine-merge-queue.json";
  const written = readFileSync(join(doneDirectory(project), fileName), "utf8");

  const again = await run(
    project,
    ["complete", "--identity", trunkQueue],
    at("2026-10-08T00:00:00.000Z"),
  );
  assert.equal(again.code, 1);
  assert.match(again.stderr, /Nothing was removed\./);
  assert.deepEqual(doneFiles(project), [catalogFile, fileName]);
  assert.equal(
    readFileSync(join(doneDirectory(project), fileName), "utf8"),
    written,
  );

  const never = await run(
    project,
    ["complete", "--identity", "SEED-777#nowhere"],
    at(completedAt),
  );
  assert.equal(never.code, 1);
  assert.deepEqual(doneFiles(project), [catalogFile, fileName]);
});

test("a Taken profile recording no host or model leaves a record naming the agent only", async (t) => {
  const project = gitWorkspace(scratchProject(t));
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

  const result = await run(
    project,
    ["complete", "--identity", takenStory],
    at(completedAt),
  );
  assert.equal(result.code, 0, result.stderr);
  assert.deepEqual(
    readRecord(project, "SEED-008_script-product-backlog-list-updates.json"),
    {
      schemaVersion: 1,
      identity: takenStory,
      title: "Update the product backlog without hand-editing the shared list",
      completedAt,
      developer: "Terry Yin",
      agent: "Akiho-chan",
    },
  );
});
