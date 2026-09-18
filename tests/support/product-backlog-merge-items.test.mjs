// Runs the real backlog CLI to reconcile three supplied versions of one
// backlog in a scratch project, observing the whole destination file's bytes:
// the changes both branches made to the work items combined once, and the
// removals neither branch undid. Where the two branches change one work item
// differently the run is handed back to a human instead, which
// `product-backlog-merge-items-refusals.test.mjs` establishes.
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  addedLine,
  backlog,
  backlogOf,
  occurrences,
  queued,
  run,
  scratchProject,
  takenEntry,
} from "./product-backlog-fixture.mjs";
import { versions } from "./product-backlog-merge-fixture.mjs";

const [trunk, retrospective, review] = queued;

test("merge items keeps both branches' closures", async (t) => {
  // Two items are taken; each branch closes one of them and leaves the other
  // exactly as the ancestor wrote it.
  const ancestor = backlogOf([takenEntry, trunk], [retrospective, review]);
  const project = scratchProject(t, ancestor);

  const merged = await run(
    project,
    versions(
      project,
      ancestor,
      backlogOf([trunk], [retrospective, review]),
      backlogOf([takenEntry], [retrospective, review]),
    ),
  );

  assert.equal(merged.code, 0, merged.stderr);
  // Neither branch's untouched entry brought the other branch's removal back:
  // "## Taken" ends empty, keeping its heading, and the queue is untouched.
  assert.equal(project.read(), backlogOf([], [retrospective, review]));
  assert.match(
    merged.stdout,
    /removed "SEED-008#script-product-backlog-list-updates" from "## Taken"/,
  );
  assert.match(
    merged.stdout,
    /removed "SEED-008#same-machine-merge-queue" from "## Taken"/,
  );
});

test("merge items combines a claim on one branch with a closure on the other", async (t) => {
  const project = scratchProject(t);

  const merged = await run(
    project,
    versions(
      project,
      backlog,
      // One branch took the trunk-integration story.
      backlogOf([takenEntry, trunk], [retrospective, review]),
      // The other closed the architecture story it had nothing to do with.
      backlogOf([takenEntry], [trunk, retrospective]),
    ),
  );

  assert.equal(merged.code, 0, merged.stderr);
  assert.equal(project.read(), backlogOf([takenEntry, trunk], [retrospective]));
  // The claim is listed once, in "## Taken" only.
  assert.equal(occurrences(project.read(), trunk), 1);
  assert.equal(occurrences(project.read(), review), 0);
});

test("merge items gives the same result whichever branch is named first", async (t) => {
  const project = scratchProject(t);
  const claimed = backlogOf([takenEntry, trunk], [retrospective, review]);
  const closed = backlogOf([takenEntry], [trunk, retrospective]);

  const forwards = await run(
    project,
    versions(project, backlog, claimed, closed),
  );
  assert.equal(forwards.code, 0, forwards.stderr);
  const result = project.read();

  const backwards = await run(
    project,
    versions(project, backlog, closed, claimed),
  );
  assert.equal(backwards.code, 0, backwards.stderr);
  assert.equal(project.read(), result);
});

test("merge items applies an identical change on both branches once", async (t) => {
  const project = scratchProject(t);
  // Both branches closed the architecture story and queued the same new work.
  const both = backlogOf([takenEntry], [trunk, retrospective, addedLine]);

  const merged = await run(project, versions(project, backlog, both, both));

  assert.equal(merged.code, 0, merged.stderr);
  assert.equal(project.read(), both);
  assert.equal(occurrences(project.read(), addedLine), 1);
  assert.equal(occurrences(project.read(), review), 0);
});

test("merge items reads one work item through its canonical home", async (t) => {
  // The ancestor entry carries no identity yet, so its identity is its link.
  // One branch adopts an identity for it; the other renames it. Both are
  // talking about one work item, and the merged entry carries both changes.
  const home =
    "seeds/SEED-002-release-the-guidance.md#publish-the-release-notes";
  const before = `- [Publish the release notes](${home})`;
  const adopted = `- [Publish the release notes](${home}) — SEED-002`;
  const renamed = `- [Publish the release notes with the tag](${home})`;
  const ancestor = backlogOf([takenEntry], [before, retrospective]);
  const project = scratchProject(t, ancestor);

  const merged = await run(
    project,
    versions(
      project,
      ancestor,
      backlogOf([takenEntry], [adopted, retrospective]),
      backlogOf([takenEntry], [renamed, retrospective]),
    ),
  );

  assert.equal(merged.code, 0, merged.stderr);
  assert.equal(
    project.read(),
    backlogOf(
      [takenEntry],
      [
        `- [Publish the release notes with the tag](${home}) — SEED-002#publish-the-release-notes`,
        retrospective,
      ],
    ),
  );
  assert.equal(occurrences(project.read(), home), 1);
});

test("merge items writes the destination without reading it", async (t) => {
  // The destination is where an integration left it: conflict markers no
  // backlog operation could parse. The result comes from the three supplied
  // versions alone, so it is written over whatever was there.
  const abandoned = `<<<<<<< HEAD\n${backlog}=======\nnonsense\n>>>>>>> branch\n`;
  const project = scratchProject(t, abandoned);

  const merged = await run(
    project,
    versions(
      project,
      backlog,
      backlogOf([takenEntry], [trunk, retrospective]),
      backlog,
    ),
  );

  assert.equal(merged.code, 0, merged.stderr);
  assert.equal(project.read(), backlogOf([takenEntry], [trunk, retrospective]));
});
