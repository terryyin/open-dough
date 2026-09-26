// Every way a reference refresh is refused, run through the real CLI against
// actual canonical fixture files. Each case establishes that the backlog and
// every canonical home are byte-identical afterwards: a refusal records
// nothing, and the same identity is never left reachable twice.
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  adoptedBacklog,
  headings,
  homes,
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
  movedPlan,
  movedSeed,
  recording,
  refresh,
  renamedSeedEight,
} from "./product-backlog-refresh-fixture.mjs";

// The canonical home the taken entry links, before and after its seed is
// renamed. Linking either as that entry's plan names one document twice.
const takenHome = `${seedEight}#script-product-backlog-list-updates`;
const renamedTakenHome = `${renamedSeedEight}#script-product-backlog-list-updates`;

test("refresh reference refuses a canonical home the backlog already lists", async (t) => {
  // The renamed seed's story was queued separately while it was moving, so
  // refreshing the old entry onto it would list the same work twice.
  const stray = `- [Queue trunk integration for agents on the same machine](${renamedSeedEight}#same-machine-merge-queue)`;
  const backlog = backlogWith(lines.trunk, `${lines.trunk}\n${stray}`);
  const project = adoptedProject(t, {
    backlog,
    extra: {
      [renamedSeedEight]: recording(seedEight, [
        [headings.queue, identities.queue],
        [headings.taken, identities.taken],
      ]),
    },
  });

  const result = await run(
    project,
    refresh(
      identities.queue,
      "--link",
      `${renamedSeedEight}#same-machine-merge-queue`,
    ),
  );

  assert.equal(result.code, 1, result.stdout);
  assert.match(result.stderr, /Ambiguous canonical home/);
  assert.match(
    result.stderr,
    /is already listed in "## Backlog list" at line \d+ as identity "seeds\/SEED-008-trunk-sync.md#same-machine-merge-queue"/,
  );
  assert.equal(project.read(), backlog);
});

test("refresh reference refuses a home that does not record the identity", async (t) => {
  const project = afterMove(t, seedOne, movedSeed, homes[seedOne]);

  const unrecorded = await run(
    project,
    refresh(identities.retrospective, "--link", movedAnchor),
  );
  assert.equal(unrecorded.code, 1, unrecorded.stdout);
  assert.match(unrecorded.stderr, /records no identity/);
  assert.equal(project.read(), adoptedBacklog);

  project.write(
    movedSeed,
    recording(seedOne, [[headings.retrospective, identities.queue]]),
  );
  const other = await run(
    project,
    refresh(identities.retrospective, "--link", movedAnchor),
  );
  assert.equal(other.code, 1, other.stdout);
  assert.match(
    other.stderr,
    /records identity "SEED-008#same-machine-merge-queue", not "SEED-001#default-skip-process-retrospective"/,
  );
  assert.equal(project.read(), adoptedBacklog);
});

test("refresh reference refuses while the old home still records the identity", async (t) => {
  const project = adoptedProject(t, {
    extra: {
      [movedSeed]: recording(seedOne, [
        [headings.retrospective, identities.retrospective],
      ]),
    },
  });
  const before = project.snapshot();

  const result = await run(
    project,
    refresh(identities.retrospective, "--link", movedAnchor),
  );

  assert.equal(result.code, 1, result.stdout);
  assert.match(
    result.stderr,
    /still records identity "SEED-001#default-skip-process-retrospective", so refreshing the reference would leave two documents claiming one work item/,
  );
  assert.deepEqual(project.snapshot(), before);
});

test("refresh reference refuses a home its identity could not be read back from", async (t) => {
  // Relocating a correction plan is ordinary, but this identity names no
  // anchor, and written beside a link that names one it would read back as
  // different work. That ambiguity is a human's to settle, not a guess.
  const project = adoptedProject(t);
  const before = project.snapshot();

  const result = await run(
    project,
    refresh(identities.correction, "--link", `${seedEight}#refuse-variants`),
  );

  assert.equal(result.code, 1, result.stdout);
  assert.match(
    result.stderr,
    /Ambiguous canonical home: identity "slice-plans\/032-refuse-managed-hook-command-variants\/PLAN.md" names no anchor but the link ".*" names "refuse-variants"/,
  );
  assert.deepEqual(project.snapshot(), before);
});

test("refresh reference refuses a request it cannot carry out", async (t) => {
  const project = adoptedProject(t);

  const unlisted = await run(
    project,
    refresh("SEED-404#never-queued", "--title", "Anything at all"),
  );
  assert.match(
    unlisted.stderr,
    /is in neither "## Taken" nor "## Backlog list"/,
  );

  const nothing = await run(project, refresh(identities.queue));
  assert.match(
    nothing.stderr,
    /supply at least one of --title, --link, or --plan/,
  );

  const dropped = await run(project, refresh(identities.taken, "--no-plan"));
  assert.match(dropped.stderr, /never drops one/);

  for (const result of [unlisted, nothing, dropped]) {
    assert.equal(result.code, 1, result.stdout);
  }
  assert.equal(project.read(), adoptedBacklog);
});

test("refresh reference refuses a plan it cannot link", async (t) => {
  const project = adoptedProject(t, {
    extra: {
      [renamedSeedEight]: recording(seedEight, [
        [headings.queue, identities.queue],
        [headings.taken, identities.taken],
      ]),
    },
  });
  const before = project.snapshot();

  const unplanned = await run(
    project,
    refresh(identities.queue, "--plan", takenLink),
  );
  assert.match(unplanned.stderr, /links no active plan/);

  const absent = await run(
    project,
    refresh(identities.taken, "--plan", movedPlan),
  );
  assert.match(
    absent.stderr,
    /Unresolved plan: slice-plans\/061-script-product-backlog\/PLAN.md is not there/,
  );

  // A plan link naming the entry's own canonical home would name one document
  // twice: once as the home and once as the plan. That holds for the home the
  // entry already links...
  const ownHome = await run(
    project,
    refresh(identities.taken, "--plan", takenHome),
  );
  assert.equal(
    ownHome.stderr.trim(),
    `The plan "${takenHome}" is the canonical home this entry links, which ` +
      `needs no duplicate plan link.\nThe backlog was not changed.`,
  );

  // ...and for the relocated home supplied in the same request, which the
  // refusal reads rather than the link the backlog still carries.
  const movedHome = await run(
    project,
    refresh(
      identities.taken,
      "--link",
      renamedTakenHome,
      "--plan",
      renamedTakenHome,
    ),
  );
  assert.equal(
    movedHome.stderr.trim(),
    `The plan "${renamedTakenHome}" is the canonical home this entry links, ` +
      `which needs no duplicate plan link.\nThe backlog was not changed.`,
  );

  for (const result of [unplanned, absent, ownHome, movedHome]) {
    assert.equal(result.code, 1, result.stdout);
  }
  assert.equal(project.read(), adoptedBacklog);
  assert.deepEqual(project.snapshot(), before);
});
