// Runs the real backlog CLI against actual canonical fixture files to point a
// listed entry at a story or plan that has already been renamed or moved,
// observing the resulting active reference, the preserved membership and
// order, and the untouched canonical homes by whole-file bytes.
import assert from "node:assert/strict";
import { rmSync } from "node:fs";
import { test } from "node:test";
import {
  adoptedBacklog,
  headings,
  identities,
  seedEight,
  seedOne,
  takenLink,
} from "./product-backlog-adoption-fixture.mjs";
import { run } from "./product-backlog-fixture.mjs";
import {
  adoptedProject,
  backlogWith,
  lines,
  movedAnchor,
  movedPlan,
  movedSeed,
  recording,
  refresh,
  withoutBacklog,
} from "./product-backlog-refresh-fixture.mjs";

test("refresh reference carries the identity to a renamed canonical home", async (t) => {
  const retitled = "Skip process retrospectives until a project asks for them";
  const project = adoptedProject(t, {
    extra: {
      [movedSeed]: recording(seedOne, [
        [headings.retrospective, identities.retrospective],
      ]),
    },
  });
  // The rename has already happened, so only the moved document is on disk.
  rmSync(project.path(seedOne));
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
      `- [${retitled}](${movedAnchor}) — SEED-001`,
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
      `- [${retitled}](${seedEight}#same-machine-merge-queue) — SEED-008`,
    ),
  );
  assert.deepEqual(withoutBacklog(project.snapshot()), withoutBacklog(before));
  assert.match(result.stdout, /Refreshed the title of/);
});

test("refresh reference repoints an entry at its relocated plan", async (t) => {
  const project = adoptedProject(t, {
    extra: {
      [movedPlan]: recording(takenLink, [[headings.plan, identities.taken]]),
    },
  });
  rmSync(project.path(takenLink));

  const result = await run(
    project,
    refresh(identities.taken, "--plan", movedPlan),
  );

  assert.equal(result.code, 0, result.stderr);
  assert.equal(
    project.read(),
    backlogWith(
      lines.taken,
      `- [Update the product backlog without hand-editing the shared list](${seedEight}#script-product-backlog-list-updates) — SEED-008 ([plan](${movedPlan}))`,
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
