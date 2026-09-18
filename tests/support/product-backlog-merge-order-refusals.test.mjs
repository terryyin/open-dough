// Where the three supplied versions do not determine one order — two branches
// moving one entry different ways, or two branches wanting the same place for
// different work — deciding which comes first is a priority decision, so the
// real backlog CLI hands it back: a diagnostic naming the competing placements,
// a nonzero exit, and the destination left exactly as it was.
import assert from "node:assert/strict";
import { test } from "node:test";
import { backlogOf, run, scratchProject } from "./product-backlog-fixture.mjs";
import { list, named, versions } from "./product-backlog-merge-fixture.mjs";

test("merge order refuses two branches moving one entry different ways", async (t) => {
  // The case an ordinary text merge accepts and then duplicates: each branch
  // moved B, to a different place. Neither move is the ancestor's order, so
  // nothing establishes which one holds.
  const ancestor = backlogOf([], list("ABCD"));
  const project = scratchProject(t, ancestor);

  const refused = await run(
    project,
    versions(
      project,
      ancestor,
      backlogOf([], list("ACBD")),
      backlogOf([], list("ACDB")),
    ),
  );

  assert.equal(refused.code, 1);
  assert.equal(project.read(), ancestor, "the destination was written");
  assert.match(
    refused.stderr,
    /"## Backlog list": the versions put the entries they share in different orders/,
  );
});

test("merge order refuses a queue position the versions do not determine", async (t) => {
  const ancestor = backlogOf([], list("ABC"));
  const project = scratchProject(t, ancestor);

  // Both branches queued new work into the same gap, between B and C.
  const gap = await run(
    project,
    versions(
      project,
      ancestor,
      backlogOf([], list("ABXC")),
      backlogOf([], list("ABYC")),
    ),
  );
  assert.equal(gap.code, 1);
  assert.equal(project.read(), ancestor, "the destination was written");
  assert.match(
    gap.stderr,
    /in the same place, after "SEED-003#story-b", and nothing in the versions says which of them comes first/,
  );
  assert.match(gap.stderr, /which is a decision for a human/);

  // The same branch moved one entry to two different places.
  const apart = await run(
    project,
    versions(
      project,
      ancestor,
      backlogOf([], list("AXBC")),
      backlogOf([], list("ABXC")),
    ),
  );
  assert.equal(apart.code, 1);
  assert.equal(project.read(), ancestor, "the destination was written");
  assert.match(
    apart.stderr,
    new RegExp(
      `puts "${named("X")}" after "${named("A")}" and .* puts it after ` +
        `"${named("B")}"`,
    ),
  );

  // Both branches queued the same two entries into the same gap, in opposite
  // order. They agree about where the pair sits and disagree about which of
  // the two is the more important, which is the same decision to hand back.
  const swapped = await run(
    project,
    versions(
      project,
      ancestor,
      backlogOf([], list("AXYBC")),
      backlogOf([], list("AYXBC")),
    ),
  );
  assert.equal(swapped.code, 1);
  assert.equal(project.read(), ancestor, "the destination was written");
  assert.match(
    swapped.stderr,
    new RegExp(
      `puts "${named("X")}", "${named("Y")}" and .* puts "${named("Y")}", ` +
        `"${named("X")}" in the same place, after "${named("A")}"`,
    ),
  );
});

test("merge order refuses two branches both queuing work at the head", async (t) => {
  // Each branch decided its own work was the most important thing in the
  // queue. Nothing in the three versions orders the two decisions.
  const ancestor = backlogOf([], list("AB"));
  const project = scratchProject(t, ancestor);

  const refused = await run(
    project,
    versions(
      project,
      ancestor,
      backlogOf([], list("XAB")),
      backlogOf([], list("YAB")),
    ),
  );

  assert.equal(refused.code, 1);
  assert.equal(project.read(), ancestor, "the destination was written");
  assert.match(
    refused.stderr,
    new RegExp(
      `puts "${named("X")}" and .* puts "${named("Y")}" in the same place, ` +
        `at the start of the list, and nothing in the versions says which of ` +
        `them comes first`,
    ),
  );
});

test("merge order refuses one entry queued at the head on one branch and below it on the other", async (t) => {
  // The head is a place like any other, so putting one entry there and
  // putting the same entry after A are two different priority decisions.
  const ancestor = backlogOf([], list("AB"));
  const project = scratchProject(t, ancestor);

  const refused = await run(
    project,
    versions(
      project,
      ancestor,
      backlogOf([], list("XAB")),
      backlogOf([], list("AXB")),
    ),
  );

  assert.equal(refused.code, 1);
  assert.equal(project.read(), ancestor, "the destination was written");
  assert.match(
    refused.stderr,
    new RegExp(
      `puts "${named("X")}" at the start of the list and .* puts it after ` +
        `"${named("A")}"`,
    ),
  );
});
