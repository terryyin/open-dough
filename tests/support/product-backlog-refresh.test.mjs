// Runs the real backlog CLI against actual canonical fixture files to point a
// listed entry at a story or plan that has already been renamed or moved,
// observing the resulting active reference, the preserved membership and
// order, and the untouched canonical homes by whole-file bytes.
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  adoptedBacklog,
  correctionLink,
  headings,
  identities,
  seedEight,
  seedOne,
  takenLink,
} from "./product-backlog-adoption-fixture.mjs";
import { run } from "./product-backlog-fixture.mjs";
import {
  adoptedProject,
  afterMove,
  backlogWith,
  lines,
  movedAnchor,
  movedCorrection,
  movedPlan,
  movedSeed,
  queuedFirst,
  recording,
  refresh,
  unspelledSeed,
  unspelledStory,
  withoutBacklog,
} from "./product-backlog-refresh-fixture.mjs";

// Addresses the work by the identity it recorded before the move, which is
// what establishes that the relocation cost the backlog nothing: the entry is
// still found by that identity, still in its list, and every other line —
// the Taken entry, the unrelated queued work, and the direction — comes
// through the placement exactly as it stood.
async function placedFirst(project, identity, refreshed, line) {
  const placed = await run(project, [
    "place",
    "--identity",
    identity,
    "--position",
    "first",
  ]);
  assert.equal(placed.code, 0, placed.stderr);
  assert.equal(project.read(), queuedFirst(refreshed, line));
}

test("refresh reference carries the identity to a renamed canonical home", async (t) => {
  const retitled = "Skip process retrospectives until a project asks for them";
  const project = afterMove(
    t,
    seedOne,
    movedSeed,
    recording(seedOne, [[headings.retrospective, identities.retrospective]]),
  );
  const home = project.readHome(movedSeed);

  const result = await run(
    project,
    refresh(
      identities.retrospective,
      "--link",
      movedAnchor,
      "--title",
      retitled,
    ),
  );

  assert.equal(result.code, 0, result.stderr);
  assert.equal(
    project.read(),
    backlogWith(
      lines.retrospective,
      `- [${retitled}](${movedAnchor}) — ${identities.retrospective}`,
    ),
  );
  assert.equal(
    project.readHome(movedSeed),
    home,
    "the canonical home was changed",
  );
  assert.match(
    result.stdout,
    /Refreshed the title and canonical link of "SEED-001#default-skip-process-retrospective" in "## Backlog list"/,
  );
  assert.match(result.stdout, /its identity and its place are unchanged/);
});

test("refresh reference retitles an entry without touching its link", async (t) => {
  const retitled = "Queue trunk integration between agents on one machine";
  const project = adoptedProject(t);
  const before = project.snapshot();

  const result = await run(
    project,
    refresh(identities.queue, "--title", retitled),
  );

  assert.equal(result.code, 0, result.stderr);
  assert.equal(
    project.read(),
    backlogWith(
      lines.trunk,
      `- [${retitled}](${seedEight}#same-machine-merge-queue) — ${identities.queue}`,
    ),
  );
  assert.deepEqual(withoutBacklog(project.snapshot()), withoutBacklog(before));
  assert.match(result.stdout, /Refreshed the title of/);
});

test("refresh reference repoints an entry at its relocated plan", async (t) => {
  const project = afterMove(
    t,
    takenLink,
    movedPlan,
    recording(takenLink, [[headings.plan, identities.taken]]),
  );

  const result = await run(
    project,
    refresh(identities.taken, "--plan", movedPlan),
  );

  assert.equal(result.code, 0, result.stderr);
  assert.equal(
    project.read(),
    backlogWith(
      lines.taken,
      `- [Update the product backlog without hand-editing the shared list](${seedEight}#script-product-backlog-list-updates) — ${identities.taken} ([plan](${movedPlan}))`,
    ),
  );
  assert.match(result.stdout, /Refreshed the plan link of .* in "## Taken"/);
});

test("refresh reference changes no byte when the entry already reads as requested", async (t) => {
  const project = adoptedProject(t);

  const result = await run(
    project,
    refresh(
      identities.taken,
      "--title",
      "Update the product backlog without hand-editing the shared list",
      "--link",
      `${seedEight}#script-product-backlog-list-updates`,
      "--plan",
      takenLink,
    ),
  );

  assert.equal(result.code, 0, result.stderr);
  assert.equal(project.read(), adoptedBacklog);
  assert.match(result.stdout, /already reads as requested/);
});

test("refresh reference carries the identity to a home whose link spells none of it", async (t) => {
  // The seed was renamed so its file name no longer holds the seed token, and
  // the story was re-anchored. The moved document's own record is what says
  // this is still the same work item; the link is only where it is now.
  const reanchored = recording(seedOne, [
    [headings.retrospective, identities.retrospective],
  ]).replace(
    '<a id="default-skip-process-retrospective"></a>',
    '<a id="skip-process-retrospectives"></a>',
  );
  const project = afterMove(t, seedOne, unspelledSeed, reanchored);
  const home = project.readHome(unspelledSeed);

  const result = await run(
    project,
    refresh(identities.retrospective, "--link", unspelledStory),
  );

  assert.equal(result.code, 0, result.stderr);
  const line = `- [Skip process retrospectives by default for new installations](${unspelledStory}) — ${identities.retrospective}`;
  const refreshed = backlogWith(lines.retrospective, line);
  assert.equal(project.read(), refreshed);
  assert.equal(
    project.readHome(unspelledSeed),
    home,
    "the canonical home was changed",
  );
  assert.match(
    result.stdout,
    /Refreshed the canonical link of "SEED-001#default-skip-process-retrospective" in "## Backlog list"/,
  );

  await placedFirst(project, identities.retrospective, refreshed, line);
});

test("refresh reference follows a correction plan identified by its old path", async (t) => {
  // A bounded correction's identity is the path it was allocated at. Moving
  // the plan to another directory changes where it is, not which work it is,
  // so the old path stays its identity and becomes what the entry records.
  const project = afterMove(
    t,
    correctionLink,
    movedCorrection,
    recording(correctionLink, [[headings.correction, identities.correction]]),
  );
  const home = project.readHome(movedCorrection);

  const result = await run(
    project,
    refresh(identities.correction, "--link", movedCorrection),
  );

  assert.equal(result.code, 0, result.stderr);
  const line = `- [Complete hook-registration corrections and deferred Claude Code acceptance](${movedCorrection}) — ${identities.correction}`;
  const refreshed = backlogWith(lines.correction, line);
  assert.equal(project.read(), refreshed);
  assert.equal(project.readHome(movedCorrection), home, "the plan was changed");
  assert.match(
    result.stdout,
    /Refreshed the canonical link of "quick\/032-refuse-managed-hook-command-variants\/PLAN.md" in "## Backlog list"/,
  );

  await placedFirst(project, identities.correction, refreshed, line);
});
