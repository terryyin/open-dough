import assert from "node:assert/strict";
import { makeMe } from "./makeMe.mjs";
import { test } from "node:test";
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
  readState,
  recordArgs,
  second,
  seedBytes,
} from "./story-state-fixture.mjs";
import {
  readDependencies,
  resolution,
  updateDependency,
} from "./story-dependencies-fixture.mjs";

const third = { identity: "SUPPLIER-3", href: "suppliers/third.md" };

test("dependency CLI records two suppliers, preserves preparation and siblings, and detects changed review", async (t) => {
  const project = scratchProject(t);
  const backlogBefore = project.read();
  plantSeed(project);
  projectFile(
    project,
    third.href,
    `# Third supplier\n\n**Identity:** ${third.identity}\n`,
  );
  for (const story of [first, second]) {
    const state = await readState(project, story);
    const recorded = await run(
      project,
      recordArgs(story, {
        refinement: "refined",
        approach: "planless",
        assessment: story === first ? "ready" : "not-ready",
        reasons: story === first ? [] : ["Supplier scope still needs review"],
        expectedBasis: { document: state.basis.document },
      }),
    );
    assert.equal(recorded.code, 0, recorded.stderr);
  }
  const before = seedBytes(project);
  const siblingBefore = before.slice(before.indexOf('<a id="second-story">'));
  const empty = await readDependencies(project, first);
  assert.equal(empty.status, "not-recorded");
  assert.deepEqual(empty.blocking, []);
  const recorded = await updateDependency(
    project,
    first,
    makeMe.aSupplierAgreement
      .with({ supplier: second, state: "waiting" })
      .please(),
  );
  assert.equal(recorded.code, 0, recorded.stderr);
  const recordedThird = await updateDependency(
    project,
    first,
    makeMe.aSupplierAgreement
      .with({ supplier: third, state: "waiting" })
      .please(),
  );
  assert.equal(recordedThird.code, 0, recordedThird.stderr);
  let state = await readDependencies(project, first);
  assert.deepEqual(
    state.blocking.map((entry) => entry.supplier.identity),
    [second.identity, third.identity],
  );
  assert.match(
    state.dependencies[0].rationale,
    /normal reconciliation cannot supply/,
  );
  assert.equal(
    seedBytes(project).slice(
      seedBytes(project).indexOf('<a id="second-story">'),
    ),
    siblingBefore,
  );
  assert.equal(
    (await readState(project, first)).assessment.changedSinceReview,
    true,
  );
  assert.equal((await readState(project, first)).assessment.status, "ready");
  assert.deepEqual((await readState(project, second)).assessment.reasons, [
    "Supplier scope still needs review",
  ]);
  // Rerecording preparation cannot reconstruct or erase the separate record.
  const beforeRerecord = state.dependencies;
  const rerecorded = await run(
    project,
    recordArgs(first, { refinement: "refined", approach: "planless" }),
  );
  assert.equal(rerecorded.code, 0, rerecorded.stderr);
  assert.deepEqual(
    (await readDependencies(project, first)).dependencies,
    beforeRerecord,
  );
  const satisfied = await updateDependency(
    project,
    first,
    makeMe.aSupplierAgreement
      .with({ supplier: second, state: "satisfied", resolution })
      .please(),
  );
  assert.equal(satisfied.code, 0, satisfied.stderr);
  state = await readDependencies(project, first);
  assert.deepEqual(
    state.blocking.map((entry) => entry.supplier.identity),
    [third.identity],
  );
  assert.deepEqual(state.dependencies[0].resolution, resolution);
  assert.equal(project.read(), backlogBefore);
});

test("dependency writes retain the consumer's unrelated Not ready reasons", async (t) => {
  const project = scratchProject(t);
  plantSeed(project);
  const state = await readState(project, first);
  assert.equal(
    (
      await run(
        project,
        recordArgs(first, {
          refinement: "refined",
          approach: "planless",
          assessment: "not-ready",
          reasons: ["Acceptance choice unresolved"],
          expectedBasis: { document: state.basis.document },
        }),
      )
    ).code,
    0,
  );
  assert.equal(
    (
      await updateDependency(
        project,
        first,
        makeMe.aSupplierAgreement
          .with({ supplier: second, state: "waiting" })
          .please(),
      )
    ).code,
    0,
  );
  const changed = await readState(project, first);
  assert.equal(changed.assessment.status, "not-ready");
  assert.deepEqual(changed.assessment.reasons, [
    "Acceptance choice unresolved",
  ]);
  assert.equal(changed.assessment.changedSinceReview, true);
  const decision = await updateDependency(
    project,
    first,
    makeMe.aSupplierAgreement
      .with({
        supplier: second,
        state: "decision-needed",
        decision:
          "Which endpoint behavior satisfies this consumer's selected outcome?",
      })
      .please(),
  );
  assert.equal(decision.code, 0, decision.stderr);
  assert.match(
    (await readDependencies(project, first)).blocking[0].decision,
    /Which endpoint behavior/,
  );
  assert.deepEqual((await readState(project, first)).assessment.reasons, [
    "Acceptance choice unresolved",
  ]);
});

test("canonical plan-homed corrections use the same dependency command", async (t) => {
  const project = scratchProject(t);
  plantSeed(project);
  projectFile(project, correctionRelative, correctionPlan());
  const result = await updateDependency(
    project,
    correction,
    makeMe.aSupplierAgreement
      .with({ supplier: second, state: "waiting" })
      .please(),
  );
  assert.equal(result.code, 0, result.stderr);
  assert.equal(
    (await readDependencies(project, correction)).blocking[0].supplier.identity,
    second.identity,
  );
});
