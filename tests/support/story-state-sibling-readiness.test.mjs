// Proof that a story's readiness basis covers its own section, the seed's
// shared context, and its plan — not a sibling story in the same seed. The
// product recorder and reader produce every ready outcome under test; example
// 6 plants only the former whole-seed digest a record from before story
// scoping carries.
import assert from "node:assert/strict";
import { test } from "node:test";
import { pathToFileURL } from "node:url";
import {
  projectFile,
  run,
  scratchProject,
} from "./product-backlog-fixture.mjs";
import {
  first,
  plantSeed,
  readState,
  readerPath,
  recordArgs,
  second,
  seedBytes,
  seedRelative,
  twoStorySeed,
} from "./story-state-fixture.mjs";

const secondSection = twoStorySeed.slice(
  twoStorySeed.indexOf('<a id="second-story"></a>'),
);

function editSeed(project, from, to) {
  const before = seedBytes(project);
  assert.ok(before.includes(from), `seed holds ${JSON.stringify(from)}`);
  projectFile(project, seedRelative, before.replace(from, to));
}

async function recordReady(project) {
  const prepared = await readState(project, first);
  const result = await run(
    project,
    recordArgs(first, {
      refinement: "refined",
      approach: "planless",
      assessment: "ready",
      expectDocument: prepared.basis.document,
    }),
  );
  assert.equal(result.code, 0, result.stderr);
  return prepared.basis.document;
}

async function assessmentOf(project) {
  return (await readState(project, first)).assessment.status;
}

test("story-state: closing a sibling story keeps a ready story ready", async (t) => {
  const project = scratchProject(t);
  plantSeed(project);
  await recordReady(project);

  editSeed(project, `\n${secondSection}`, "");
  assert.equal(await assessmentOf(project), "ready");
  assert.equal(
    (await readState(project, first)).assessment.changedSinceReview,
    false,
  );

  // Closing only the anchored section keeps its separating blank line.
  plantSeed(project);
  await recordReady(project);
  editSeed(project, secondSection, "");
  assert.equal(await assessmentOf(project), "ready");
  assert.equal(
    (await readState(project, first)).assessment.changedSinceReview,
    false,
  );
});

test("story-state: preparing or editing a sibling story keeps a ready story ready", async (t) => {
  const project = scratchProject(t);
  plantSeed(project);
  const recorded = await recordReady(project);

  editSeed(
    project,
    "Goal, scope, and examples for the second story.",
    "Goal, scope, and examples for the second story, now refined.",
  );
  const secondBasis = (await readState(project, second)).basis.document;
  const secondRecorded = await run(
    project,
    recordArgs(second, {
      refinement: "refined",
      approach: "planless",
      assessment: "ready",
      expectDocument: secondBasis,
    }),
  );
  assert.equal(secondRecorded.code, 0, secondRecorded.stderr);

  const after = await readState(project, first);
  assert.equal(after.assessment.status, "ready");
  assert.equal(after.assessment.changedSinceReview, false);
  assert.equal(after.basis.document, recorded);
});

test("story-state: a change to the story's own section keeps ready with a change indication", async (t) => {
  const project = scratchProject(t);
  plantSeed(project);
  await recordReady(project);

  editSeed(
    project,
    "Goal, scope, and examples for the first story.",
    "Goal, scope, and examples for the first story.\n\n" +
      "**Depends on:** [Second story](#second-story)",
  );

  assert.equal(await assessmentOf(project), "ready");
  assert.equal(
    (await readState(project, first)).assessment.changedSinceReview,
    true,
  );
});

test("story-state: a change to the seed's shared context keeps ready with a change indication", async (t) => {
  const project = scratchProject(t);
  plantSeed(project);
  await recordReady(project);

  editSeed(
    project,
    "Shared scope for both stories.",
    "Shared scope for both stories, now narrowed.",
  );

  assert.equal(await assessmentOf(project), "ready");
  assert.equal(
    (await readState(project, first)).assessment.changedSinceReview,
    true,
  );
});

test("story-state: a former whole-seed record stays interpretable and is replaced by a fresh assessment", async (t) => {
  const project = scratchProject(t);
  plantSeed(project);
  const scoped = await recordReady(project);
  const { digestSource } = await import(pathToFileURL(readerPath).href);
  const whole = digestSource(seedBytes(project));
  assert.notEqual(whole, scoped);
  editSeed(project, `"document":"${scoped}"`, `"document":"${whole}"`);

  const former = await readState(project, first);
  assert.equal(former.assessment.status, "ready");
  assert.equal(former.assessment.changedSinceReview, false);
  assert.equal(former.assessment.basis.document, whole);
  assert.equal(former.basis.document, scoped);

  editSeed(
    project,
    "Goal, scope, and examples for the second story.",
    "Goal, scope, and examples for the second story, now refined.",
  );
  const outdated = await readState(project, first);
  assert.equal(outdated.assessment.status, "ready");
  assert.equal(outdated.assessment.changedSinceReview, true);
  assert.equal(outdated.assessment.basis.document, whole);

  const fresh = await recordReady(project);
  assert.equal(fresh, scoped);
  assert.equal(await assessmentOf(project), "ready");
  assert.equal(
    (await readState(project, first)).assessment.changedSinceReview,
    false,
  );

  editSeed(
    project,
    "Goal, scope, and examples for the second story, now refined.",
    "Goal, scope, and examples for the second story, refined again.",
  );
  assert.equal(await assessmentOf(project), "ready");
  assert.equal(
    (await readState(project, first)).assessment.changedSinceReview,
    false,
  );
});
