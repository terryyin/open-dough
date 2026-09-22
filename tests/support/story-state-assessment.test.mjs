// Slice 3 proof: record an assessment against the content actually reviewed.
// Setup plants preparation-capable homes and never writes the ready outcome
// under test; the product recorder and reader produce those.
import assert from "node:assert/strict";
import { test } from "node:test";
import { pathToFileURL } from "node:url";
import {
  projectFile,
  run,
  scratchProject,
} from "./product-backlog-fixture.mjs";
import {
  correction,
  correctionPlan,
  correctionRelative,
  first,
  plantSeed,
  planningFile,
  readState,
  recordArgs,
  readerPath,
  seedBytes,
} from "./story-state-fixture.mjs";

test("story-state: read returns a basis; ready and not-ready round-trip", async (t) => {
  const project = scratchProject(t);
  plantSeed(project);
  const planRelative = "../quick/075-example/PLAN.md";
  projectFile(
    project,
    "quick/075-example/PLAN.md",
    "# Example plan\n\n### 1. Slice\nType: Behavior\nStatus: planned\n",
  );

  const beforeReady = await readState(project, first);
  assert.equal(beforeReady.status, "not-recorded");
  assert.equal(typeof beforeReady.basis.document, "string");
  assert.equal(beforeReady.basis.document.length, 64);
  assert.equal(beforeReady.basis.plan, undefined);
  assert.equal(beforeReady.assessment.status, "absent");

  const notReady = await run(
    project,
    recordArgs(first, {
      refinement: "not-refined",
      approach: "unselected",
      assessment: "not-ready",
      reasons: ["Goal and examples are still free-form."],
      expectDocument: beforeReady.basis.document,
    }),
  );
  assert.equal(notReady.code, 0, notReady.stderr);
  assert.match(notReady.stdout, /Assessment not-ready/);

  const afterNotReady = await readState(project, first);
  assert.equal(afterNotReady.status, "recorded");
  assert.equal(afterNotReady.refinement, "not-refined");
  assert.deepEqual(afterNotReady.approach, { kind: "unselected" });
  assert.equal(afterNotReady.assessment.status, "not-ready");
  assert.deepEqual(afterNotReady.assessment.reasons, [
    "Goal and examples are still free-form.",
  ]);
  assert.equal(
    afterNotReady.assessment.basis.document,
    afterNotReady.basis.document,
  );

  const planned = await run(
    project,
    recordArgs(first, {
      refinement: "refined",
      approach: "planned",
      plan: planRelative,
    }),
  );
  assert.equal(planned.code, 0, planned.stderr);

  const beforeReadyAgain = await readState(project, first);
  assert.equal(typeof beforeReadyAgain.basis.document, "string");
  assert.equal(typeof beforeReadyAgain.basis.plan, "string");
  assert.notEqual(beforeReadyAgain.basis.document, beforeReadyAgain.basis.plan);

  const ready = await run(
    project,
    recordArgs(first, {
      refinement: "refined",
      approach: "planned",
      plan: planRelative,
      assessment: "ready",
      expectDocument: beforeReadyAgain.basis.document,
      expectPlan: beforeReadyAgain.basis.plan,
    }),
  );
  assert.equal(ready.code, 0, ready.stderr);
  assert.match(ready.stdout, /Assessment ready/);

  const afterReady = await readState(project, first);
  assert.equal(afterReady.assessment.status, "ready");
  assert.deepEqual(afterReady.assessment.reasons, []);
  assert.deepEqual(afterReady.approach, {
    kind: "planned",
    plan: planRelative,
  });
  assert.deepEqual(afterReady.assessment.basis, afterReady.basis);

  const { readStoryState } = await import(pathToFileURL(readerPath).href);
  const shared = readStoryState(seedBytes(project), first.link, {
    planSource: planningFile(project, "quick/075-example/PLAN.md"),
  });
  assert.equal(shared.assessment.status, "ready");
  assert.deepEqual(shared.basis, afterReady.basis);
});

test("story-state: planless ready needs no plan file", async (t) => {
  const project = scratchProject(t);
  plantSeed(project);

  await run(
    project,
    recordArgs(first, {
      refinement: "refined",
      approach: "planless",
    }),
  );
  const prepared = await readState(project, first);
  assert.equal(prepared.basis.plan, undefined);

  const ready = await run(
    project,
    recordArgs(first, {
      refinement: "refined",
      approach: "planless",
      assessment: "ready",
      expectDocument: prepared.basis.document,
    }),
  );
  assert.equal(ready.code, 0, ready.stderr);

  const after = await readState(project, first);
  assert.equal(after.assessment.status, "ready");
  assert.deepEqual(after.approach, { kind: "planless" });
  assert.equal(after.basis.plan, undefined);
  assert.equal(after.assessment.basis.plan, undefined);
});

test("story-state: correction home digests once without self-reference", async (t) => {
  const project = scratchProject(t);
  projectFile(project, correctionRelative, correctionPlan());

  const legacy = await readState(project, correction);
  assert.equal(legacy.status, "not-recorded");
  assert.equal(typeof legacy.basis.document, "string");
  assert.equal(legacy.basis.plan, undefined);

  await run(
    project,
    recordArgs(correction, {
      refinement: "refined",
      approach: "planless",
    }),
  );
  const prepared = await readState(project, correction);
  const ready = await run(
    project,
    recordArgs(correction, {
      refinement: "refined",
      approach: "planless",
      assessment: "ready",
      expectDocument: prepared.basis.document,
    }),
  );
  assert.equal(ready.code, 0, ready.stderr);

  const after = await readState(project, correction);
  assert.equal(after.assessment.status, "ready");
  assert.equal(after.basis.document, prepared.basis.document);
  assert.equal(after.assessment.basis.document, after.basis.document);
  assert.equal(after.basis.plan, undefined);

  const { readStoryState, digestSource } = await import(
    pathToFileURL(readerPath).href
  );
  const homeText = planningFile(project, correctionRelative);
  assert.match(homeText, /```json dough-story-state/);
  assert.equal(digestSource(homeText), after.basis.document);
  const shared = readStoryState(homeText, correction.link);
  assert.equal(shared.assessment.status, "ready");
  assert.equal(shared.basis.document, after.basis.document);

  // Planned association to the same file still digests once: no separate
  // plan digest, and writing the assessment cannot invalidate the basis.
  const planned = await run(
    project,
    recordArgs(correction, {
      refinement: "refined",
      approach: "planned",
      plan: "PLAN.md",
      assessment: "ready",
      expectDocument: after.basis.document,
    }),
  );
  assert.equal(planned.code, 0, planned.stderr);
  const plannedRead = await readState(project, correction);
  assert.equal(plannedRead.assessment.status, "ready");
  assert.deepEqual(plannedRead.approach, { kind: "planned", plan: "PLAN.md" });
  assert.equal(plannedRead.basis.plan, undefined);
  assert.equal(plannedRead.basis.document, after.basis.document);
  assert.equal(
    plannedRead.assessment.basis.document,
    plannedRead.basis.document,
  );
});
