// Runs the real backlog CLI in scratch projects, observing the done catalog
// it rebuilds for existing done records without touching them or the
// backlog, and how a published catalog is read back and checked against a
// listing of the record files.
import assert from "node:assert/strict";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { doneRecordFilesOf } from "../../src/skills/dough-product-backlog/scripts/product-backlog-complete.mjs";
import {
  doneRecordFileName,
  renderDoneRecord,
} from "../../src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import { makeMe } from "./makeMe.mjs";
import "./product-backlog-done-catalog-reader-cases.mjs";
import {
  assertCatalogMatchesRecords,
  doneDirectory,
  gitBlob,
  isolatedGit,
  readCatalog,
} from "./product-backlog-done-fixture.mjs";
import {
  backlog,
  projectFile,
  run,
  scratchProject,
} from "./product-backlog-fixture.mjs";

// The file name a record takes from its own identity.
const recordFileName = (identity) => `${identity.replace("#", "_")}.json`;

// Every file under `directory` with its bytes, for before/after comparison.
function snapshot(directory) {
  const files = {};
  const walk = (relative) => {
    for (const entry of readdirSync(join(directory, relative), {
      withFileTypes: true,
    })) {
      const path = relative === "" ? entry.name : `${relative}/${entry.name}`;
      if (entry.isDirectory()) walk(path);
      else files[path] = readFileSync(join(directory, path)).toString("base64");
    }
  };
  walk("");
  return files;
}

test("the done record files among named bytes are those a record can take, in name order, each with its text and Git blob hash", () => {
  const record = makeMe.aDoneRecord
    .completed({ identity: "SEED-1#earlier" })
    .please();
  const recordText = renderDoneRecord(record);

  const files = doneRecordFilesOf([
    { fileName: "SEED-2_later.json", bytes: Buffer.from("hello\n") },
    { fileName: ".catalog.json", bytes: Buffer.from("{}\n") },
    { fileName: "notes.txt", bytes: Buffer.from("not a record\n") },
    { fileName: "SEED-1_earlier.json", bytes: Buffer.from(recordText) },
  ]);

  assert.deepEqual(
    files.map(({ fileName }) => fileName),
    ["SEED-1_earlier.json", "SEED-2_later.json"],
  );
  assert.equal(files[0].text, recordText);
  // `printf 'hello\n' | git hash-object --stdin`
  assert.deepEqual(files[1], {
    fileName: "SEED-2_later.json",
    text: "hello\n",
    blob: "ce013625030ba8dba906f756967f9e9ca394464a",
  });
});

test("catalog-done rebuilds a catalog for existing records at another backlog location, changing no record or backlog byte", async (t) => {
  const project = scratchProject(t);
  const backlogFile = join(project.directory, "team", "BACKLOG.md");
  mkdirSync(join(project.directory, "team", "done"), { recursive: true });
  writeFileSync(backlogFile, backlog, "utf8");
  const done = join(project.directory, "team", "done");
  const write = (fileName, text) =>
    writeFileSync(join(done, fileName), text, "utf8");
  const records = [
    {
      identity: "SEED-301#older",
      title: "Older work",
      completedAt: "2026-09-20T08:00:00.000Z",
    },
    {
      identity: "SEED-302#newest",
      title: "Newest work",
      completedAt: "2026-10-05T08:00:00.000Z",
    },
    {
      identity: "SEED-303#same-time",
      title: "Same time",
      completedAt: "2026-10-01T08:00:00.000Z",
    },
    {
      identity: "SEED-300#same-time",
      title: "Same time",
      completedAt: "2026-10-01T08:00:00.000Z",
    },
    // Already expired: a rebuild prunes nothing, so it stays listed.
    {
      identity: "SEED-299#expired",
      title: "Expired",
      completedAt: "2026-08-01T08:00:00.000Z",
    },
  ];
  for (const facts of records) {
    const record = makeMe.aDoneRecord
      .with({ ...facts, developer: "Ann" })
      .please();
    write(doneRecordFileName(record.identity), renderDoneRecord(record));
  }
  write("SEED-400_broken.json", "{ not json");
  write(
    "SEED-401_elsewhere.json",
    renderDoneRecord({
      identity: "SEED-999#other",
      title: "Named elsewhere",
      completedAt: "2026-10-02T08:00:00.000Z",
      developer: "Ann",
    }),
  );
  write("notes.txt", "not a record\n");
  write(".catalog.json", '{"schemaVersion": 1, "records": "stale"}\n');
  const before = snapshot(project.directory);

  const result = await run(
    project,
    ["catalog-done", "--file", "team/BACKLOG.md"],
    isolatedGit,
  );
  assert.equal(result.code, 0, result.stderr);

  const after = snapshot(project.directory);
  const catalogPath = "team/done/.catalog.json";
  delete before[catalogPath];
  const written = after[catalogPath];
  delete after[catalogPath];
  assert.deepEqual(after, before);
  assert.ok(written);

  const blob = (fileName) => gitBlob(join(done, fileName));
  const row = (identity, time) => ({
    fileName: recordFileName(identity),
    identity,
    completedAt: time,
    blob: blob(recordFileName(identity)),
  });
  assert.deepEqual(readCatalog(done), {
    schemaVersion: 1,
    records: [
      row("SEED-302#newest", "2026-10-05T08:00:00.000Z"),
      row("SEED-300#same-time", "2026-10-01T08:00:00.000Z"),
      row("SEED-303#same-time", "2026-10-01T08:00:00.000Z"),
      row("SEED-301#older", "2026-09-20T08:00:00.000Z"),
      row("SEED-299#expired", "2026-08-01T08:00:00.000Z"),
    ],
    unreadable: [
      { fileName: "SEED-400_broken.json", blob: blob("SEED-400_broken.json") },
      {
        fileName: "SEED-401_elsewhere.json",
        blob: blob("SEED-401_elsewhere.json"),
      },
    ],
  });
  assert.doesNotMatch(
    readFileSync(join(done, ".catalog.json"), "utf8"),
    /title|developer|Ann|Newest work/,
  );
  assert.equal(
    result.stdout.trim(),
    "Rebuilt done catalog done/.catalog.json beside the backlog, listing 5 " +
      "done records. It names 2 unreadable done records without a completion " +
      "time: done/SEED-400_broken.json, done/SEED-401_elsewhere.json. " +
      "team/BACKLOG.md and its done records were not changed.",
  );
  assertCatalogMatchesRecords(done);
  assert.equal(existsSync(`${backlogFile}.lock`), false);

  const again = await run(
    project,
    ["catalog-done", "--file", "team/BACKLOG.md"],
    isolatedGit,
  );
  assert.equal(again.code, 0, again.stderr);
  assert.equal(snapshot(project.directory)[catalogPath], written);
  assert.match(again.stdout, /already listed 5 done records\./);
});

test("catalog-done publishes no catalog where no done record exists, and removes one left behind", async (t) => {
  const project = scratchProject(t);
  const done = doneDirectory(project);

  const none = await run(project, ["catalog-done"], isolatedGit);
  assert.equal(none.code, 0, none.stderr);
  assert.equal(existsSync(done), false);
  assert.match(none.stdout, /No done record is beside .*PRODUCT-BACKLOG\.md/);
  assert.equal(project.read(), backlog);

  projectFile(project, "done/.catalog.json", "{}\n");
  const left = await run(project, ["catalog-done"], isolatedGit);
  assert.equal(left.code, 0, left.stderr);
  assert.deepEqual(readdirSync(done), []);
  assert.match(left.stdout, /Removed done catalog done\/\.catalog\.json/);
});

test("catalog-done refuses a backlog file that is not there, writing nothing", async (t) => {
  const project = scratchProject(t);
  const result = await run(
    project,
    ["catalog-done", "--file", "missing/BACKLOG.md"],
    isolatedGit,
  );
  assert.equal(result.code, 1);
  assert.match(result.stderr, /Backlog file not found: .*missing\/BACKLOG\.md/);
  assert.equal(existsSync(join(project.directory, "missing")), false);
});
