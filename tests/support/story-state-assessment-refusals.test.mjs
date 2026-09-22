// Slice 3 proof: stale expected basis and ready consistency refusals leave
// canonical homes unchanged. Setup plants preparation-capable homes without
// the outdated or refused outcomes under test.
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  projectFile,
  run,
  scratchProject,
} from "./product-backlog-fixture.mjs";
import {
  first,
  plantSeed,
  readState,
  recordArgs,
  seedBytes,
  seedRelative,
  twoStorySeed,
} from "./story-state-fixture.mjs";

test("story-state: content change makes ready outdated and stale submit refuses", async (t) => {
  const project = scratchProject(t);
  plantSeed(project);
  const planRelative = "../quick/075-example/PLAN.md";
  const planBody =
    "# Example plan\n\n### 1. Slice\nType: Behavior\nStatus: planned\n";
  projectFile(project, "quick/075-example/PLAN.md", planBody);

  await run(
    project,
    recordArgs(first, {
      refinement: "refined",
      approach: "planned",
      plan: planRelative,
    }),
  );
  const prepared = await readState(project, first);
  const ready = await run(
    project,
    recordArgs(first, {
      refinement: "refined",
      approach: "planned",
      plan: planRelative,
      assessment: "ready",
      expectDocument: prepared.basis.document,
      expectPlan: prepared.basis.plan,
    }),
  );
  assert.equal(ready.code, 0, ready.stderr);

  const staleBasis = (await readState(project, first)).basis;
  assert.equal((await readState(project, first)).assessment.status, "ready");

  projectFile(
    project,
    seedRelative,
    seedBytes(project).replace(
      "Goal, scope, and examples for the first story.",
      "Goal, scope, and examples for the first story. Scope widened.",
    ),
  );

  const outdated = await readState(project, first);
  assert.equal(outdated.assessment.status, "needs-reassessment");
  assert.equal(outdated.assessment.recorded, "ready");
  assert.notEqual(outdated.basis.document, staleBasis.document);
  assert.equal(outdated.assessment.basis.document, staleBasis.document);

  const refused = await run(
    project,
    recordArgs(first, {
      refinement: "refined",
      approach: "planned",
      plan: planRelative,
      assessment: "ready",
      expectDocument: staleBasis.document,
      expectPlan: staleBasis.plan,
    }),
  );
  assert.equal(refused.code, 1);
  assert.match(refused.stderr, /no longer matches/);
  assert.match(refused.stderr, /Nothing was written/);
  assert.equal(
    (await readState(project, first)).assessment.status,
    "needs-reassessment",
  );

  projectFile(
    project,
    "quick/075-example/PLAN.md",
    `${planBody}\n### 2. Extra\nType: Structure\nStatus: planned\n`,
  );
  const afterPlanEdit = await readState(project, first);
  assert.equal(afterPlanEdit.assessment.status, "needs-reassessment");
  assert.notEqual(afterPlanEdit.basis.plan, staleBasis.plan);
});

test("story-state: ready consistency refusals leave files unchanged", async (t) => {
  const project = scratchProject(t);
  plantSeed(project, twoStorySeed);
  const before = seedBytes(project);
  const prepared = await readState(project, first);

  const unselectedReady = await run(
    project,
    recordArgs(first, {
      refinement: "refined",
      approach: "unselected",
      assessment: "ready",
      expectDocument: prepared.basis.document,
    }),
  );
  assert.equal(unselectedReady.code, 1);
  assert.match(unselectedReady.stderr, /planned" or "planless/);
  assert.equal(seedBytes(project), before);

  const readyWithReason = await run(
    project,
    recordArgs(first, {
      refinement: "refined",
      approach: "planless",
      assessment: "ready",
      reasons: ["should not be here"],
      expectDocument: prepared.basis.document,
    }),
  );
  assert.equal(readyWithReason.code, 1);
  assert.match(readyWithReason.stderr, /cannot carry blocking reasons/);
  assert.equal(seedBytes(project), before);

  const notReadyWithoutReason = await run(
    project,
    recordArgs(first, {
      refinement: "refined",
      approach: "planless",
      assessment: "not-ready",
      expectDocument: prepared.basis.document,
    }),
  );
  assert.equal(notReadyWithoutReason.code, 1);
  assert.match(notReadyWithoutReason.stderr, /at least one blocking/);
  assert.equal(seedBytes(project), before);
});
