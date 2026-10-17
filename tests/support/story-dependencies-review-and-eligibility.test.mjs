import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { run, scratchProject } from "./product-backlog-fixture.mjs";
import {
  first,
  plantSeed,
  readState,
  recordArgs,
  second,
  seedBytes,
  twoStorySeed,
} from "./story-state-fixture.mjs";
import {
  dependency,
  resolution,
  updateDependency,
} from "./story-dependencies-fixture.mjs";

// Records a fresh Ready assessment for the first story through the CLI and
// returns the document digest it reviewed.
async function recordReady(project) {
  const state = await readState(project, first);
  const recorded = await run(
    project,
    recordArgs(first, {
      refinement: "refined",
      approach: "planless",
      assessment: "ready",
      expectDocument: state.basis.document,
    }),
  );
  assert.equal(recorded.code, 0, recorded.stderr);
  return state.basis.document;
}

async function changedSinceReview(project) {
  const { assessment } = await readState(project, first);
  assert.equal(assessment.status, "ready");
  return assessment.changedSinceReview;
}

// The first story's document digest as recorded before agreement digests: its
// scoped text with story-state fences removed and every other byte, the
// dependency fence included, hashed as written.
function asWrittenDigest(seed) {
  const scoped = `${seed.slice(0, seed.indexOf('<a id="second-story">')).trimEnd()}\n`;
  const stripped = scoped.replace(
    /```json dough-story-state\n[^\n]*\n```\n/g,
    "",
  );
  return createHash("sha256").update(stripped).digest("hex");
}

test("a supplier's resolution leaves the readiness review unchanged while an agreement edit flags it", async (t) => {
  const project = scratchProject(t);
  plantSeed(project);
  assert.equal(
    (await updateDependency(project, first, dependency(second))).code,
    0,
  );
  const reviewed = await recordReady(project);
  const decision = await updateDependency(
    project,
    first,
    dependency(second, {
      state: "decision-needed",
      decision: "Which endpoint behavior satisfies this consumer?",
    }),
  );
  assert.equal(decision.code, 0, decision.stderr);
  assert.equal(await changedSinceReview(project), false);
  const satisfied = await updateDependency(
    project,
    first,
    dependency(second, { state: "satisfied", resolution }),
  );
  assert.equal(satisfied.code, 0, satisfied.stderr);
  assert.equal(await changedSinceReview(project), false);
  assert.equal((await readState(project, first)).basis.document, reviewed);

  const edited = await updateDependency(
    project,
    first,
    dependency(second, {
      state: "satisfied",
      resolution,
      condition: "A narrower endpoint contract is completed and integrated.",
    }),
  );
  assert.equal(edited.code, 0, edited.stderr);
  assert.equal(await changedSinceReview(project), true);
});

test("a record reviewed over the dependency fence as written stays accurate", async (t) => {
  const project = scratchProject(t);
  plantSeed(project);
  assert.equal(
    (await updateDependency(project, first, dependency(second))).code,
    0,
  );
  const scoped = await recordReady(project);
  const legacy = asWrittenDigest(seedBytes(project));
  assert.notEqual(legacy, scoped);
  const planted = seedBytes(project).replace(
    `"document":"${scoped}"`,
    `"document":"${legacy}"`,
  );
  assert.notEqual(planted, seedBytes(project));
  plantSeed(project, planted);

  const unchanged = await readState(project, first);
  assert.equal(unchanged.assessment.basis.document, legacy);
  assert.equal(unchanged.assessment.changedSinceReview, false);

  const satisfied = await updateDependency(
    project,
    first,
    dependency(second, { state: "satisfied", resolution }),
  );
  assert.equal(satisfied.code, 0, satisfied.stderr);
  assert.equal(await changedSinceReview(project), false);

  const decisionNeeded = await updateDependency(
    project,
    first,
    dependency(second, {
      state: "decision-needed",
      decision: "Which endpoint behavior satisfies this consumer?",
    }),
  );
  assert.equal(decisionNeeded.code, 0, decisionNeeded.stderr);
  assert.equal(await changedSinceReview(project), false);

  plantSeed(
    project,
    seedBytes(project).replace(
      "Goal, scope, and examples for the first story.",
      "Goal, scope, and examples for the first story, revised.",
    ),
  );
  assert.equal(await changedSinceReview(project), true);
});

test("a malformed dependency fence is reviewed as written and reads as a dependencies gap", async (t) => {
  const project = scratchProject(t);
  const fence = "```json dough-story-dependencies\n{broken\n```";
  plantSeed(
    project,
    twoStorySeed.replace(
      "Goal, scope, and examples for the first story.",
      `Goal, scope, and examples for the first story.\n\n${fence}`,
    ),
  );
  const reviewed = await recordReady(project);
  assert.equal(reviewed, asWrittenDigest(seedBytes(project)));
  assert.equal(await changedSinceReview(project), false);
  const { startEligibility } = await readState(project, first);
  assert.equal(startEligibility.status, "blocked");
  assert.equal(startEligibility.blockers.length, 1);
  const [blocker] = startEligibility.blockers;
  assert.equal(blocker.kind, "gap");
  assert.equal(blocker.fact, "dependencies");
  assert.match(blocker.problem, /^Story dependencies: /);
  plantSeed(project, seedBytes(project).replace("{broken", "{broken again"));
  assert.equal(await changedSinceReview(project), true);
});

test("read-state reports start eligibility from the assessment and dependencies", async (t) => {
  const project = scratchProject(t);
  plantSeed(project);
  assert.deepEqual((await readState(project, first)).startEligibility, {
    status: "blocked",
    blockers: [
      {
        kind: "gap",
        fact: "preparation",
        problem: "Preparation is not recorded.",
      },
    ],
  });
  const agreement = dependency(second);
  assert.equal((await updateDependency(project, first, agreement)).code, 0);
  await recordReady(project);
  const waiting = await readState(project, first);
  assert.equal(waiting.assessment.status, "ready");
  assert.equal(typeof waiting.basis.document, "string");
  assert.deepEqual(waiting.startEligibility, {
    status: "blocked",
    blockers: [
      {
        kind: "dependency",
        supplier: second.identity,
        href: second.link,
        state: "waiting",
        rationale: agreement.rationale,
        condition: agreement.condition,
      },
    ],
  });
  const satisfied = await updateDependency(
    project,
    first,
    dependency(second, { state: "satisfied", resolution }),
  );
  assert.equal(satisfied.code, 0, satisfied.stderr);
  const state = await readState(project, first);
  assert.deepEqual(state.startEligibility, {
    status: "eligible",
    blockers: [],
  });

  const notReady = await run(
    project,
    recordArgs(first, {
      refinement: "refined",
      approach: "planless",
      assessment: "not-ready",
      reasons: ["Supplier scope still needs review"],
      expectDocument: state.basis.document,
    }),
  );
  assert.equal(notReady.code, 0, notReady.stderr);
  assert.deepEqual((await readState(project, first)).startEligibility, {
    status: "blocked",
    blockers: [
      {
        kind: "assessment",
        status: "not-ready",
        reasons: ["Supplier scope still needs review"],
      },
    ],
  });
});
