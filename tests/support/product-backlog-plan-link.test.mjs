// Runs the real backlog CLI to show that take and record-state apply one
// plan-link rule: a link to a plan file, or to a section of it, links that
// plan, while a link to another plan file is never repointed.
import assert from "node:assert/strict";
import { test } from "node:test";
import {
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
  recordArgs,
  second,
  seedBytes,
} from "./story-state-fixture.mjs";

const planPath = "slice-plans/075-example/PLAN.md";
const sectionLink = `${planPath}#ordered-slices`;
const otherPlan = "slice-plans/075-other/PLAN.md";
const firstLine = `- [${first.title}](${first.link}) — ${first.identity}`;
const secondLine = `- [${second.title}](${second.link}) — ${second.identity}`;
const planned = {
  refinement: "refined",
  approach: "planned",
  plan: `../${planPath}`,
};

const take = (identity, target) => [
  "take",
  "--identity",
  identity,
  "--plan",
  target,
];

// A scratch project whose backlog holds `taken` and `waiting`, with the seed
// and both plans in place.
function projectWith(t, taken, waiting = queued) {
  const project = scratchProject(t, backlogOf(taken, waiting));
  plantSeed(project);
  projectFile(project, planPath, "# Example plan\n");
  projectFile(project, otherPlan, "# Other plan\n");
  return project;
}

test("plan link: a planned record links the plan of its Taken entry and leaves other entries alone", async (t) => {
  const project = projectWith(
    t,
    [takenEntry, firstLine],
    [...queued, secondLine],
  );
  const before = backlogBytes(project);

  // Unselected and planless records name no plan to link.
  for (const approach of ["unselected", "planless"]) {
    const recorded = await run(
      project,
      recordArgs(first, { refinement: "refined", approach }),
    );
    assert.equal(recorded.code, 0, recorded.stderr);
    assert.equal(backlogBytes(project), before);
  }

  // A queued story's plan is linked when it is taken, not when it is planned.
  const queuedRecord = await run(project, recordArgs(second, planned));
  assert.equal(queuedRecord.code, 0, queuedRecord.stderr);
  assert.equal(backlogBytes(project), before);

  const linked = await run(project, recordArgs(first, planned));
  assert.equal(linked.code, 0, linked.stderr);
  assert.match(linked.stdout, /Linked its Taken entry to the plan/);
  const expected = backlogOf(
    [takenEntry, `${firstLine} ([plan](${planPath}))`],
    [...queued, secondLine],
  );
  assert.equal(backlogBytes(project), expected);

  // Recording the same plan again leaves the linked entry as it is.
  const again = await run(project, recordArgs(first, planned));
  assert.equal(again.code, 0, again.stderr);
  assert.equal(backlogBytes(project), expected);
});

test("plan link: a Taken entry linking a section of its plan stays unchanged through record-state and take", async (t) => {
  const project = projectWith(t, [
    takenEntry,
    `${firstLine} ([plan](${sectionLink}))`,
  ]);
  const before = backlogBytes(project);

  const recorded = await run(project, recordArgs(first, planned));
  assert.equal(recorded.code, 0, recorded.stderr);
  assert.doesNotMatch(recorded.stdout, /Linked/);
  assert.match(recorded.stdout, /the backlog were not changed/);
  assert.equal(backlogBytes(project), before);

  for (const target of [planPath, sectionLink]) {
    const resumed = await run(project, take(first.identity, target));
    assert.equal(resumed.code, 0, `${target}: ${resumed.stderr}`);
    assert.match(resumed.stdout, /already in "## Taken".*unchanged\./, target);
    assert.equal(backlogBytes(project), before, target);
  }
});

test("plan link: queued work taken with a section of its plan keeps that link", async (t) => {
  const project = projectWith(t, [takenEntry], [...queued, firstLine]);

  const taken = await run(project, take(first.identity, sectionLink));
  assert.equal(taken.code, 0, taken.stderr);
  assert.match(taken.stdout, /Took "SEED-021#first-story"/);
  assert.equal(
    backlogBytes(project),
    backlogOf([takenEntry, `${firstLine} ([plan](${sectionLink}))`], queued),
  );
});

test("plan link: a section of a plan file that is not there is refused unchanged", async (t) => {
  const project = projectWith(t, [takenEntry], [...queued, firstLine]);
  const before = backlogBytes(project);

  const refused = await run(
    project,
    take(first.identity, "slice-plans/075-absent/PLAN.md#ordered-slices"),
  );
  assert.equal(refused.code, 1);
  assert.match(
    refused.stderr,
    /Unresolved plan: slice-plans\/075-absent\/PLAN\.md#ordered-slices/,
  );
  assert.match(refused.stderr, /The backlog was not changed\./);
  assert.equal(backlogBytes(project), before);
});

test("plan link: a Taken entry linking another plan file is refused by take and record-state", async (t) => {
  const project = projectWith(t, [
    `${firstLine} ([plan](${otherPlan}#ordered-slices))`,
  ]);
  const seedBefore = seedBytes(project);
  const backlogBefore = backlogBytes(project);

  const recorded = await run(project, recordArgs(first, planned));
  assert.equal(recorded.code, 1);
  assert.match(
    recorded.stderr,
    /already links the plan "slice-plans\/075-other\/PLAN.md#ordered-slices"/,
  );
  assert.match(recorded.stderr, /never repoints/);
  assert.match(recorded.stderr, /Nothing was written/);
  assert.equal(seedBytes(project), seedBefore);
  assert.equal(backlogBytes(project), backlogBefore);

  for (const target of [planPath, sectionLink]) {
    const refused = await run(project, take(first.identity, target));
    assert.equal(refused.code, 1, target);
    assert.match(refused.stderr, /never repoints/, target);
    assert.match(refused.stderr, /The backlog was not changed\./, target);
    assert.equal(backlogBytes(project), backlogBefore, target);
  }
});
