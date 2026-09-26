// Runs the real backlog CLI to show that take, admission, record-state and
// the backlog's listing checks apply one plan-link rule to homes: a declared
// plan that is the story's own home file, with or without a section, is never
// linked, and a plan link names the same work as another entry's home when it
// names that home's file, whichever section of the plan it points into.
import assert from "node:assert/strict";
import { dirname } from "node:path";
import { test } from "node:test";
import { admitEntry } from "../../src/skills/dough-product-backlog/scripts/product-backlog-take.mjs";
import {
  added,
  addedHomeSource,
  backlog,
  backlogOf,
  projectFile,
  queued,
  run,
  scratchProject,
  takenEntry,
} from "./product-backlog-fixture.mjs";
import {
  backlogBytes,
  first,
  plantSeed,
  readState,
  recordArgs,
  seedRelative,
} from "./story-state-fixture.mjs";

const firstLine = `- [${first.title}](${first.link}) — ${first.identity}`;
const planPath = "slice-plans/076-repair/PLAN.md";
const sectionLink = `${planPath}#ordered-slices`;
const correctionLine = `- [Repair the release notes](${planPath})`;
const ownHomeRefusal =
  /already the canonical home of .* needs no duplicate plan link/s;

const take = (identity, target) => [
  "take",
  "--identity",
  identity,
  "--plan",
  target,
];

function projectWith(t, source) {
  const project = scratchProject(t, source);
  plantSeed(project);
  projectFile(project, planPath, "# Repair the release notes\n");
  return project;
}

function assertRefused(project, result, before, expect) {
  assert.equal(result.code, 1, result.stdout);
  assert.match(result.stderr, expect);
  assert.match(result.stderr, /The backlog was not changed\./);
  assert.equal(backlogBytes(project), before);
}

test("plan home: take refuses the story's own home file as its plan", async (t) => {
  const project = projectWith(
    t,
    backlogOf([takenEntry], [...queued, firstLine]),
  );
  const before = backlogBytes(project);

  const refused = await run(project, take(first.identity, seedRelative));
  assertRefused(project, refused, before, ownHomeRefusal);
});

// Startup admission uses this operation for accepted work no list holds yet.
test("plan home: admission refuses the story's own home file as its plan", (t) => {
  const project = scratchProject(t);
  const homeFile = added.link.split("#")[0];
  projectFile(project, homeFile, addedHomeSource);
  assert.throws(
    () =>
      admitEntry(backlog, {
        identity: added.identity,
        title: added.title,
        href: added.link,
        plan: homeFile,
        backlogDirectory: dirname(project.file),
      }),
    ownHomeRefusal,
  );
});

test("plan home: a planned record whose plan is its own home file writes no plan link", async (t) => {
  const project = projectWith(t, backlogOf([takenEntry, firstLine], queued));
  const before = backlogBytes(project);

  for (const plan of [
    "SEED-021-two-stories.md",
    "SEED-021-two-stories.md#first-story",
  ]) {
    const recorded = await run(
      project,
      recordArgs(first, { refinement: "refined", approach: "planned", plan }),
    );
    assert.equal(recorded.code, 0, `${plan}: ${recorded.stderr}`);
    assert.doesNotMatch(recorded.stdout, /Linked/, plan);
    assert.equal(backlogBytes(project), before, plan);
    const state = await readState(project, first);
    assert.deepEqual(state.approach, { kind: "planned", plan }, plan);
    assert.equal(state.basis.plan, undefined, plan);
  }
});

test("plan home: a section link to another entry's whole-document home is refused", async (t) => {
  const project = projectWith(
    t,
    backlogOf([takenEntry, correctionLine], [...queued, firstLine]),
  );
  const before = backlogBytes(project);

  const refused = await run(project, take(first.identity, sectionLink));
  assertRefused(
    project,
    refused,
    before,
    /the plan "slice-plans\/076-repair\/PLAN.md#ordered-slices" is already listed in "## Taken" .* as the canonical home of "slice-plans\/076-repair\/PLAN.md"/s,
  );
});

test("plan home: a home another entry links a section of as its plan is refused", async (t) => {
  const project = projectWith(
    t,
    backlogOf([takenEntry, `${firstLine} ([plan](${sectionLink}))`], queued),
  );
  const before = backlogBytes(project);

  const listed = await run(project, [
    "add",
    "--identity",
    planPath,
    "--title",
    "Repair the release notes",
    "--link",
    planPath,
    "--position",
    "first",
  ]);
  assertRefused(
    project,
    listed,
    before,
    /"slice-plans\/076-repair\/PLAN.md" is already the plan of "SEED-021#first-story"/,
  );
});

test("plan home: a backlog listing a home and a section of it as another plan is refused", async (t) => {
  const project = projectWith(
    t,
    backlogOf(
      [takenEntry, `${firstLine} ([plan](${sectionLink}))`, correctionLine],
      queued,
    ),
  );
  const before = backlogBytes(project);

  const refused = await run(project, take(first.identity, sectionLink));
  assertRefused(project, refused, before, /already lists the same work twice/);
});
