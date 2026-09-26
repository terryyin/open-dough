// A retrospective's new bounded correction, followed through the real backlog
// CLI: its minimal story in a seed links the correction plan, the story is the
// one work item queued and then taken, and the plan keeps the findings,
// provenance, and proof without ever being listed as work of its own. A
// plan-homed correction written before stories held corrections keeps its
// identity and is still listed through its plan.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { readHome } from "../../src/skills/dough-product-backlog/scripts/product-backlog-home-reader.mjs";
import { readPlanSlices } from "../../src/skills/dough-product-backlog/scripts/product-backlog-plan-reader.mjs";
import {
  backlogOf,
  occurrences,
  projectFile,
  queued,
  run,
  scratchProject,
  takenEntry,
} from "./product-backlog-fixture.mjs";
import { readState, recordArgs } from "./story-state-fixture.mjs";

const seedPath = "seeds/SEED-030-release-notes.md";
const planPath = "quick/070-order-release-notes/PLAN.md";
const story = {
  identity: "SEED-030#order-release-notes",
  link: `${seedPath}#order-release-notes`,
  title: "Order release notes by tag date",
};
const storyLine = `- [${story.title}](${story.link}) — ${story.identity}`;

// The completed story stays until its wrap-up; the correction story beside it
// holds only purpose and scope, and links the plan.
const seed = `---
id: SEED-030
---

# Publish release notes

<a id="publish-notes"></a>

### Publish notes with each tagged release

**Identity:** SEED-030#publish-notes

**Goal:** Readers find the notes for every tagged release.

<a id="order-release-notes"></a>

### ${story.title}

**Identity:** ${story.identity}

**Goal:** Readers see the notes of the newest tag first, as the published
notes promised.

**Scope:** Correct the note order only; no new release-note features.

**Plan:** [Order release notes](../${planPath}).
`;

const plan = `# Order release notes by tag date

## Source

**Identity:** ${story.identity}

Retrospective of SEED-030#publish-notes, commits abc1234..def5678.

## Findings

- The index sorts notes by file name, so v1.10 precedes v1.9.

## Ordered slices

### 1. Newest tag first
Type: Behavior
Status: planned
Proof: The release-notes index test lists v1.10 before v1.9.
`;

function plantCorrection(project) {
  projectFile(project, seedPath, seed);
  projectFile(project, planPath, plan);
}

const planBytes = (project) =>
  readFileSync(join(project.directory, ".planning", planPath), "utf8");

const add = (identity, link, title = story.title) => [
  "add",
  "--identity",
  identity,
  "--title",
  title,
  "--link",
  link,
  "--position",
  "first",
];

test("a new correction's story is queued and taken once while its plan keeps the evidence", async (t) => {
  const project = scratchProject(t);
  plantCorrection(project);

  const recorded = await run(
    project,
    recordArgs(story, {
      refinement: "refined",
      approach: "planned",
      plan: `../${planPath}`,
    }),
  );
  assert.equal(recorded.code, 0, recorded.stderr);
  const state = await readState(project, story);
  assert.equal(state.identity, story.identity);
  assert.deepEqual(state.approach, { kind: "planned", plan: `../${planPath}` });

  const queuedOnce = await run(project, add(story.identity, story.link));
  assert.equal(queuedOnce.code, 0, queuedOnce.stderr);
  assert.equal(project.read(), backlogOf([takenEntry], [storyLine, ...queued]));

  // Replaying the follow-up, or listing its plan as work of its own under
  // either identity, lists nothing twice.
  const listed = project.read();
  for (const [identity, link] of [
    [story.identity, story.link],
    [planPath, planPath],
    [story.identity, planPath],
  ]) {
    const again = await run(project, add(identity, link));
    assert.equal(again.code, 1, `${identity} ${link}: ${again.stdout}`);
    assert.equal(project.read(), listed);
  }

  const taken = await run(project, [
    "take",
    "--identity",
    story.identity,
    "--plan",
    planPath,
  ]);
  assert.equal(taken.code, 0, taken.stderr);
  const claimed = `${storyLine} ([plan](${planPath}))`;
  assert.equal(project.read(), backlogOf([takenEntry, claimed], queued));
  const resumed = await run(project, [
    "take",
    "--identity",
    story.identity,
    "--plan",
    planPath,
  ]);
  assert.equal(resumed.code, 0, resumed.stderr);
  assert.equal(occurrences(project.read(), story.identity), 1);
  assert.equal(occurrences(project.read(), planPath), 1);
  const planAsWork = await run(project, add(planPath, planPath));
  assert.match(planAsWork.stderr, /already the plan of "SEED-030#order/);

  // The story names the work; the plan names no work of its own and keeps
  // its findings, provenance, and proof unchanged.
  const home = readHome(
    readFileSync(join(project.directory, ".planning", seedPath), "utf8"),
    story.link,
  );
  assert.equal(home.recorded.identity, story.identity);
  assert.equal(planBytes(project), plan);
  assert.equal(readHome(plan, planPath).recorded.identity, story.identity);
  const slices = readPlanSlices(planBytes(project));
  assert.equal(slices.status, "interpreted");
  assert.match(slices.slices[0].proof, /v1\.10 before v1\.9/);
});

test("a backlog listing a story's plan as separate work is refused unchanged", async (t) => {
  const duplicated = backlogOf(
    [takenEntry],
    [`- [Old copy](quick/057-script-product-backlog/PLAN.md)`, ...queued],
  );
  const project = scratchProject(t, duplicated);
  const result = await run(project, [
    "place",
    "--identity",
    queued[0].split(" — ")[1],
    "--position",
    "last",
  ]);
  assert.equal(result.code, 1, result.stdout);
  assert.match(result.stderr, /lists the same work twice/);
  assert.equal(project.read(), duplicated);

  // Taking a story with a plan another entry already lists as its home would
  // write that duplicate, so it is refused before anything changes.
  const planListed = backlogOf(
    [takenEntry],
    [`- [Old copy](${planPath})`, ...queued],
  );
  const claim = scratchProject(t, planListed);
  projectFile(claim, planPath, plan);
  const taken = await run(claim, [
    "take",
    "--identity",
    queued[0].split(" — ")[1],
    "--plan",
    planPath,
  ]);
  assert.equal(taken.code, 1, taken.stdout);
  assert.match(taken.stderr, /already listed .* as the canonical home/);
  assert.equal(claim.read(), planListed);
});

test("a plan-homed correction keeps its recorded identity and is listed through its plan", async (t) => {
  const legacyPlan = "quick/060-repair-the-release-notes/PLAN.md";
  const identity = "quick/060-repair-the-release-notes";
  const project = scratchProject(t);
  projectFile(
    project,
    legacyPlan,
    `# Repair the release notes\n\n**Identity:** ${identity}\n\nFindings and proof.\n`,
  );

  const listed = await run(
    project,
    add(identity, legacyPlan, "Repair the release notes"),
  );
  assert.equal(listed.code, 0, listed.stderr);
  const line = `- [Repair the release notes](${legacyPlan}) — ${identity}`;
  assert.equal(project.read(), backlogOf([takenEntry], [line, ...queued]));

  const taken = await run(project, [
    "take",
    "--identity",
    identity,
    "--no-plan",
  ]);
  assert.equal(taken.code, 0, taken.stderr);
  assert.equal(project.read(), backlogOf([takenEntry, line], queued));
});
