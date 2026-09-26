// Runs the real backlog CLI's identity adoption against a scratch project
// whose backlog and canonical homes predate identities, inspecting the actual
// files before and after the command.
import assert from "node:assert/strict";
import { chmodSync } from "node:fs";
import { test } from "node:test";
import {
  adopt,
  adoptedBacklog,
  correctionLink,
  direction,
  headings,
  identities,
  legacyBacklog,
  legacyProject,
  recordsOnly,
  seedEight,
  seedOne,
  takenLink,
} from "./product-backlog-adoption-fixture.mjs";
import { entries, run } from "./product-backlog-fixture.mjs";

function titles(source, name) {
  return entries(source, name).map((line) => line.slice(3).split("](")[0]);
}

test("adopt identity: one identity per work item in its canonical homes", async (t) => {
  const project = legacyProject(t);
  const before = project.snapshot();

  const result = await run(project, adopt);
  assert.equal(result.code, 0, result.stderr);
  assert.equal(project.read(), adoptedBacklog);

  // A seed's own ID with the story's stable anchor; two stories, one seed.
  recordsOnly(project.readHome(seedEight), before[seedEight], [
    { heading: headings.queue, identity: identities.queue },
    { heading: headings.taken, identity: identities.taken },
  ]);
  recordsOnly(project.readHome(seedOne), before[seedOne], [
    { heading: headings.retrospective, identity: identities.retrospective },
  ]);

  // The story and its active plan are one work item, so both name the same ID.
  recordsOnly(project.readHome(takenLink), before[takenLink], [
    { heading: headings.plan, identity: identities.taken },
  ]);

  // The bounded correction keeps its plan as its canonical home and acquires
  // no story: no seed was written for it, and it names no seed ID.
  recordsOnly(project.readHome(correctionLink), before[correctionLink], [
    { heading: headings.correction, identity: identities.correction },
  ]);
  assert.equal(identities.correction, correctionLink);
  assert.deepEqual(Object.keys(project.snapshot()), Object.keys(before));
  assert.doesNotMatch(
    project.readHome(correctionLink),
    /\*\*Identity:\*\* SEED-/,
  );

  assert.match(result.stdout, /Recorded 5 identities for 4 active entries/);
});

test("adopt identity: recording identities never queues, takes, or reorders work", async (t) => {
  const project = legacyProject(t);
  const result = await run(project, adopt);
  assert.equal(result.code, 0, result.stderr);

  const after = project.read();
  for (const list of ["Taken", "Backlog list"]) {
    assert.deepEqual(
      titles(after, list),
      titles(legacyBacklog, list),
      `"## ${list}" membership or order changed`,
    );
  }
  assert.ok(after.includes(`## Near-future direction\n\n${direction}\n`));
  assert.equal(entries(after, "Taken").length, 1);
  assert.equal(entries(after, "Backlog list").length, 3);
});

test("adopt identity: repeating adoption retains every assignment", async (t) => {
  const project = legacyProject(t);
  assert.equal((await run(project, adopt)).code, 0);
  const adopted = project.snapshot();

  const again = await run(project, adopt);
  assert.equal(again.code, 0, again.stderr);
  assert.match(
    again.stdout,
    /All 4 active entries already record their identity/,
  );
  assert.deepEqual(project.snapshot(), adopted);
});

test("adopt identity: adoption is never implicit", async (t) => {
  const project = legacyProject(t);
  const before = project.snapshot();

  const result = await run(project, ["adopt"]);
  assert.equal(result.code, 1);
  assert.match(result.stderr, /adopt needs --all/);
  assert.deepEqual(project.snapshot(), before);
});

test("adopt identity: an interrupted adoption keeps what it recorded and a retry finishes", async (t) => {
  if (process.getuid?.() === 0) {
    t.skip("an unwritable directory does not stop a superuser");
    return;
  }
  const project = legacyProject(t);
  const before = project.snapshot();
  const planDirectory = project.path("slice-plans/057-script-product-backlog");
  chmodSync(planDirectory, 0o555);
  t.after(() => {
    try {
      chmodSync(planDirectory, 0o755);
    } catch {
      /* already restored by the test body */
    }
  });

  const stopped = await run(project, adopt);
  assert.equal(stopped.code, 1, stopped.stdout);
  assert.match(stopped.stderr, /Adoption stopped after recording 1 identity/);
  assert.match(
    stopped.stderr,
    new RegExp(`Recorded already, and kept:\\n  ${identities.taken} in`),
  );
  assert.match(stopped.stderr, /Still to record: 4\./);
  assert.match(stopped.stderr, /Re-run the same command/);

  // What it did record is on disk; the backlog itself is still untouched.
  recordsOnly(project.readHome(seedEight), before[seedEight], [
    { heading: headings.taken, identity: identities.taken },
  ]);
  assert.equal(project.read(), legacyBacklog);
  assert.equal(project.readHome(takenLink), before[takenLink]);
  assert.equal(project.readHome(seedOne), before[seedOne]);

  chmodSync(planDirectory, 0o755);
  const retry = await run(project, adopt);
  assert.equal(retry.code, 0, retry.stderr);
  assert.match(retry.stdout, /Recorded 4 identities for 4 active entries/);
  assert.equal(project.read(), adoptedBacklog);
  recordsOnly(project.readHome(seedEight), before[seedEight], [
    { heading: headings.queue, identity: identities.queue },
    { heading: headings.taken, identity: identities.taken },
  ]);
  recordsOnly(project.readHome(takenLink), before[takenLink], [
    { heading: headings.plan, identity: identities.taken },
  ]);
});
