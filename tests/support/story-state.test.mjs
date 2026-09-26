// Slice 2 proof: record one story's preparation without changing its neighbors.
// Exercises the real CLI and the shared pure reader on a seed with two stories,
// and concurrent cooperating writes that preserve both.
import assert from "node:assert/strict";
import { test } from "node:test";
import { pathToFileURL } from "node:url";
import {
  backlogOf,
  projectFile,
  queued,
  run,
  scratchProject,
  takenEntry,
} from "./product-backlog-fixture.mjs";
import { importedModules } from "./pure-module-imports.mjs";
import {
  backlogBytes,
  first,
  plantSeed,
  readArgs,
  readerPath,
  recordArgs,
  second,
  seedBytes,
  seedRelative,
} from "./story-state-fixture.mjs";

test("story-state: shared reader imports no filesystem or Node-only module", async () => {
  const { visited, specifiers } = importedModules(readerPath);

  assert.ok(
    [...visited].some((path) =>
      path.endsWith("product-backlog-story-state.mjs"),
    ),
  );
  assert.ok(
    [...visited].some((path) =>
      path.endsWith("product-backlog-story-state-block.mjs"),
    ),
  );
  assert.ok(
    [...visited].some((path) =>
      path.endsWith("product-backlog-story-state-preparation.mjs"),
    ),
  );
  assert.ok(
    [...visited].some((path) =>
      path.endsWith("product-backlog-story-state-basis.mjs"),
    ),
  );
  assert.ok(
    [...visited].some((path) =>
      path.endsWith("product-backlog-story-state-assessment.mjs"),
    ),
  );
  for (const specifier of specifiers) {
    assert.equal(
      specifier.startsWith("node:"),
      false,
      `unexpected Node built-in import: ${specifier}`,
    );
    assert.equal(
      specifier.includes("product-backlog-store"),
      false,
      `unexpected store import: ${specifier}`,
    );
    assert.equal(
      specifier.includes("product-backlog-home.mjs"),
      false,
      `unexpected filesystem home wrapper import: ${specifier}`,
    );
    assert.equal(
      specifier.includes("product-backlog-story-state-home"),
      false,
      `unexpected filesystem story-state wrapper import: ${specifier}`,
    );
  }

  const loaded = await import(pathToFileURL(readerPath).href);
  assert.equal(typeof loaded.readStoryState, "function");
  assert.equal(typeof loaded.recordStoryState, "function");
});

test("story-state: records one story's preparation and leaves its neighbor intact", async (t) => {
  const project = scratchProject(t);
  const backlogBefore = backlogBytes(project);
  plantSeed(project);
  const planRelative = "../slice-plans/075-example/PLAN.md";
  projectFile(
    project,
    "slice-plans/075-example/PLAN.md",
    "# Example plan\n\n### 1. Slice\nType: Behavior\nStatus: planned\n",
  );
  const seedBefore = seedBytes(project);

  const recorded = await run(
    project,
    recordArgs(first, {
      refinement: "refined",
      approach: "planned",
      plan: planRelative,
    }),
  );
  assert.equal(recorded.code, 0, recorded.stderr);
  assert.match(
    recorded.stdout,
    /Recorded preparation for "SEED-021#first-story"/,
  );
  assert.match(recorded.stdout, /approach planned/);

  const read = await run(project, readArgs(first));
  assert.equal(read.code, 0, read.stderr);
  const firstState = JSON.parse(read.stdout);
  assert.equal(firstState.status, "recorded");
  assert.equal(firstState.refinement, "refined");
  assert.deepEqual(firstState.approach, {
    kind: "planned",
    plan: planRelative,
  });
  assert.equal(firstState.identity, first.identity);
  assert.equal(firstState.source.path, seedRelative);

  const neighbor = await run(project, readArgs(second));
  assert.equal(neighbor.code, 0, neighbor.stderr);
  const secondState = JSON.parse(neighbor.stdout);
  assert.equal(secondState.status, "not-recorded");
  assert.equal(secondState.identity, second.identity);

  const seedAfter = seedBytes(project);
  assert.match(seedAfter, /\*\*Identity:\*\* SEED-021#first-story/);
  assert.match(seedAfter, /\*\*Identity:\*\* SEED-021#second-story/);
  assert.match(seedAfter, /Goal, scope, and examples for the second story/);
  assert.equal(seedAfter.includes("```json dough-story-state"), true);
  assert.equal(
    seedAfter.split("```json dough-story-state").length - 1,
    1,
    "only the selected story received a state block",
  );
  assert.notEqual(seedAfter, seedBefore);
  assert.equal(backlogBytes(project), backlogBefore);

  const { readStoryState } = await import(pathToFileURL(readerPath).href);
  const shared = readStoryState(seedAfter, first.link);
  assert.equal(shared.status, "recorded");
  assert.equal(shared.refinement, "refined");
  assert.deepEqual(shared.approach, { kind: "planned", plan: planRelative });
});

test("story-state: concurrent cooperating writes to different stories preserve both", async (t) => {
  const project = scratchProject(t);
  plantSeed(project);

  const results = await Promise.all([
    run(
      project,
      recordArgs(first, {
        refinement: "not-refined",
        approach: "unselected",
      }),
    ),
    run(
      project,
      recordArgs(second, {
        refinement: "refined",
        approach: "planless",
      }),
    ),
  ]);
  for (const [index, result] of results.entries()) {
    assert.equal(result.code, 0, `${index}: ${result.stderr}`);
  }

  const firstRead = JSON.parse((await run(project, readArgs(first))).stdout);
  const secondRead = JSON.parse((await run(project, readArgs(second))).stdout);
  assert.equal(firstRead.status, "recorded");
  assert.equal(firstRead.refinement, "not-refined");
  assert.deepEqual(firstRead.approach, { kind: "unselected" });
  assert.equal(secondRead.status, "recorded");
  assert.equal(secondRead.refinement, "refined");
  assert.deepEqual(secondRead.approach, { kind: "planless" });

  const seed = seedBytes(project);
  assert.equal(seed.split("```json dough-story-state").length - 1, 2);
  assert.match(seed, /\*\*Identity:\*\* SEED-021#first-story/);
  assert.match(seed, /\*\*Identity:\*\* SEED-021#second-story/);
});

test("story-state: a planned record links the plan of its Taken entry and leaves other entries alone", async (t) => {
  const firstLine = `- [${first.title}](${first.link}) — ${first.identity}`;
  const secondLine = `- [${second.title}](${second.link}) — ${second.identity}`;
  const project = scratchProject(
    t,
    backlogOf([takenEntry, firstLine], [...queued, secondLine]),
  );
  plantSeed(project);
  projectFile(project, "slice-plans/075-example/PLAN.md", "# Example plan\n");
  const planned = {
    refinement: "refined",
    approach: "planned",
    plan: "../slice-plans/075-example/PLAN.md",
  };
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
    [takenEntry, `${firstLine} ([plan](slice-plans/075-example/PLAN.md))`],
    [...queued, secondLine],
  );
  assert.equal(backlogBytes(project), expected);

  // Recording the same plan again leaves the linked entry as it is.
  const again = await run(project, recordArgs(first, planned));
  assert.equal(again.code, 0, again.stderr);
  assert.equal(backlogBytes(project), expected);
});
