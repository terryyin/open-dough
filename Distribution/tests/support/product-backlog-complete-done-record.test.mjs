// Runs the real backlog CLI to complete work in a scratch Git project,
// observing the done record file written beside the backlog: the name it
// takes and when a later completion replaces it or writes none.
import { makeMe } from "./makeMe.mjs";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import {
  arrangedBacklogFacts,
  backlogOf,
  queued,
  run,
  takenEntry,
  trunkQueue,
} from "./product-backlog-fixture.mjs";
import {
  at,
  catalogFile,
  completedAt,
  doneDirectory,
  doneFiles,
  readRecord,
} from "./product-backlog-done-fixture.mjs";
import { checkoutOf } from "./product-backlog-git-fixture.mjs";

test("an identity holding # and . keeps one readable file name, replaced when completed again", async (t) => {
  const identity = "SEED-200#v1.2-release.notes";
  const line = `- [Release notes for v1.2](seeds/SEED-200-release.md#v1.2-release.notes) — ${identity}`;
  const project = await checkoutOf(
    t,
    makeMe.aRepository
      .withRevision("List the release notes", {
        backlog: {
          ...arrangedBacklogFacts,
          queued: [
            ...arrangedBacklogFacts.queued,
            makeMe.aBacklogEntry
              .with({
                identity,
                title: "Release notes for v1.2",
                href: "seeds/SEED-200-release.md#v1.2-release.notes",
              })
              .please(),
          ],
        },
        files: {
          ".planning/seeds/SEED-200-release.md": `---\nid: SEED-200\n---\n\n# Release\n\n<a id="v1.2-release.notes"></a>\n\n### Release notes for v1.2\n`,
        },
      })
      .please(),
  );
  const fileName = "SEED-200_v1.2-release.notes.json";

  const first = await run(
    project,
    ["complete", "--identity", identity],
    at(completedAt),
  );
  assert.equal(first.code, 0, first.stderr);
  assert.deepEqual(doneFiles(project), [catalogFile, fileName]);

  // `add` refuses an identity a done record names, so the entry is listed
  // again by hand: completing it again must still replace its one record.
  writeFileSync(project.file, backlogOf([takenEntry], [...queued, line]));
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
  const project = await checkoutOf(
    t,
    makeMe.aRepository
      .withRevision("List the queue", { backlog: arrangedBacklogFacts })
      .please(),
  );
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
