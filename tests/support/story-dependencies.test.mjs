import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
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
  dependency,
  readDependencies,
  resolution,
  updateDependency,
} from "./story-dependencies-fixture.mjs";

const third = { identity: "SUPPLIER-3", link: "suppliers/third.md" };

test("dependency CLI records two suppliers, preserves preparation and siblings, and detects changed review", async (t) => {
  const project = scratchProject(t);
  const backlogBefore = project.read();
  plantSeed(project);
  projectFile(
    project,
    third.link,
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
        expectDocument: state.basis.document,
      }),
    );
    assert.equal(recorded.code, 0, recorded.stderr);
  }
  const before = seedBytes(project);
  const siblingBefore = before.slice(before.indexOf('<a id="second-story">'));
  const empty = await readDependencies(project, first);
  assert.equal(empty.status, "not-recorded");
  assert.deepEqual(empty.blocking, []);
  const recorded = await updateDependency(project, first, dependency(second));
  assert.equal(recorded.code, 0, recorded.stderr);
  const recordedThird = await updateDependency(
    project,
    first,
    dependency(third),
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
    dependency(second, { state: "satisfied", resolution }),
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
          expectDocument: state.basis.document,
        }),
      )
    ).code,
    0,
  );
  assert.equal(
    (await updateDependency(project, first, dependency(second))).code,
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
    dependency(second, {
      state: "decision-needed",
      decision:
        "Which endpoint behavior satisfies this consumer's selected outcome?",
    }),
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

test("dependency CLI refuses stale writes and invalid or ambiguous endpoints without partial changes", async (t) => {
  const project = scratchProject(t);
  const path = plantSeed(project);
  const initial = await readDependencies(project, first);
  assert.equal(
    (await updateDependency(project, first, dependency(second))).code,
    0,
  );
  const held = seedBytes(project);
  const stale = await updateDependency(
    project,
    first,
    dependency(second, { rationale: "Old proposed replacement" }),
    initial.basis,
  );
  assert.equal(stale.code, 1);
  assert.match(stale.stderr, /changed since it was read/);
  assert.equal(seedBytes(project), held);
  for (const entry of [
    dependency(second, { condition: "" }),
    dependency(first),
    dependency({ identity: "WRONG", link: second.link }),
    dependency({ identity: "MISSING", link: "seeds/absent.md#missing" }),
    dependency(second, { state: "satisfied" }),
    dependency(second, { state: "decision-needed" }),
  ]) {
    const result = await updateDependency(project, first, entry);
    assert.equal(result.code, 1, JSON.stringify(entry));
    assert.equal(seedBytes(project), held);
  }
  const ambiguous = held.replace(
    `**Identity:** ${second.identity}`,
    `**Identity:** ${second.identity}\n**Identity:** ${second.identity}`,
  );
  writeFileSync(path, ambiguous);
  const result = await updateDependency(project, first, dependency(second));
  assert.equal(result.code, 1);
  assert.match(result.stderr, /identity 2 times/);
  assert.equal(seedBytes(project), ambiguous);
});

test("canonical plan-homed corrections use the same dependency command", async (t) => {
  const project = scratchProject(t);
  plantSeed(project);
  projectFile(project, correctionRelative, correctionPlan());
  const result = await updateDependency(
    project,
    correction,
    dependency(second),
  );
  assert.equal(result.code, 0, result.stderr);
  assert.equal(
    (await readDependencies(project, correction)).blocking[0].supplier.identity,
    second.identity,
  );
});

for (const block of [
  "```json dough-story-dependencies\n{}\n```",
  "```json dough-story-dependencies\nnot json\n```",
  "```json dough-story-dependencies\n{}",
  `\`\`\`json dough-story-dependencies\n${JSON.stringify({ schemaVersion: 1, identity: first.identity })}\n\`\`\``,
  `\`\`\`json dough-story-dependencies\n${JSON.stringify({ schemaVersion: 99, identity: first.identity, dependencies: [] })}\n\`\`\``,
  `\`\`\`json dough-story-dependencies\n${JSON.stringify({ schemaVersion: 1, identity: first.identity, dependencies: [] })}\n\`\`\`\n\`\`\`json dough-story-dependencies\n{}\n\`\`\``,
]) {
  test(`a malformed present dependency block refuses reads: ${block.slice(0, 55)}`, async (t) => {
    const project = scratchProject(t);
    plantSeed(project, seedBytesForBlock(block));
    const result = await run(project, [
      "read-dependencies",
      "--link",
      first.link,
    ]);
    assert.equal(result.code, 1);
    assert.match(result.stderr, /Story dependencies/);
  });
}

function seedBytesForBlock(block) {
  return `---\nid: SEED-021\n---\n# Seed\n<a id="first-story"></a>\n### First\n**Identity:** ${first.identity}\n${block}\n`;
}
