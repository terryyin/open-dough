// A completed supplier in a Trunk Mode or landing checkout whose closure
// races a writer adding a consumer on trunk. Every dependency write uses the
// real commands; tests supply only the agent's per-consumer judgment, never
// the consumer list.
import assert from "node:assert/strict";
import { cpSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  consumer,
  dependency,
  git,
  plan,
  revParse,
  run,
  supplier,
  supplierPlan,
  updateDependency,
} from "./supplier-dependency-fixture.mjs";
import {
  entryFor,
  recordJudgment,
  satisfied,
} from "./supplier-integration-visit-fixture.mjs";
import {
  createTrunkClosureFixture,
  deliverBeforeCleanupThroughCli,
  finishThroughCli,
} from "../../src/skills/dough-story-wrap-up/scripts/trunk-closure-test-fixtures.mjs";
import { cloneAsAnotherWriter } from "../../src/skills/dough-execute-plan/scripts/publication-test-fixtures.mjs";
import { createQueuedTrunk } from "../../src/skills/dough-execute-plan/scripts/workspace-publication-fixtures.mjs";
import { draftLateStory } from "../../src/skills/dough-execute-plan/scripts/workspace-publication-admission-fixtures.mjs";

export const third = { identity: "THIRD", link: "seeds/third.md" };

// Writes the queued backlog with consumer A waiting on supplier B and on the
// unrelated THIRD, and B's completed plan, into `checkout`, and commits them
// as the supplier's preserved outcome and proof.
export async function commitCompletedSupplier(t, checkout, inputDirectory) {
  const queued = await createQueuedTrunk();
  t.after(queued.cleanup);
  cpSync(join(queued.integration, ".planning"), join(checkout, ".planning"), {
    recursive: true,
  });
  writeFileSync(
    join(checkout, ".planning", third.link),
    "# Third\n**Identity:** THIRD\n",
  );
  writeFileSync(join(checkout, supplierPlan), plan("done"));
  const project = { directory: checkout, inputDirectory };
  for (const entry of [dependency(supplier), dependency(third)]) {
    const result = await updateDependency(project, consumer, entry);
    assert.equal(result.code, 0, result.stderr);
  }
  await git(checkout, "add", ".planning");
  await git(checkout, "commit", "-q", "-m", "supplier outcome and proof");
  return project;
}

// Another writer publishes the prepared unqueued sibling SEED-A#late waiting
// on B to trunk, before the supplier's cleanup lands there.
export async function raceLateConsumer(origin, directory, inputDirectory) {
  await cloneAsAnotherWriter(origin, directory);
  const late = draftLateStory({ integration: directory });
  const sibling = { identity: late.identity, link: "seeds/A.md#late" };
  const waiting = await updateDependency(
    { directory, inputDirectory },
    sibling,
    dependency(supplier),
  );
  assert.equal(waiting.code, 0, waiting.stderr);
  await git(directory, "add", ".planning");
  await git(directory, "commit", "-q", "-m", "late consumer waits on B");
  await git(directory, "push", "-q", "origin", "HEAD:main");
  return { sibling, sha: await revParse(directory, "HEAD") };
}

// Completes B in the queue and deletes its source and plan in one commit.
export async function commitSupplierCleanup(project) {
  const closed = await run(project, [
    "complete",
    "--identity",
    supplier.identity,
  ]);
  assert.equal(closed.code, 0, closed.stderr);
  rmSync(join(project.directory, ".planning/seeds/B.md"));
  rmSync(join(project.directory, supplierPlan));
  await git(project.directory, "add", "-A", ".planning");
  await git(project.directory, "commit", "-q", "-m", "supplier final closure");
  return revParse(project.directory, "HEAD");
}

// `setup` holds the visited checkout's `owned` project, `trunk.fixture` for
// judgment inputs, B's `evidence` revision and the late `sibling`.
// Records the agent's judgments: A's supplier agreement is satisfied by B's
// proof; the late sibling's needs a human decision and stays blocked.
export async function judgeConsumers(setup, visit, accepted, question) {
  const resolved = await recordJudgment(
    setup,
    entryFor(visit, consumer.identity),
    accepted,
    satisfied(setup, accepted),
  );
  assert.equal(resolved.code, 0, resolved.stderr);
  const retained = await recordJudgment(
    setup,
    entryFor(visit, setup.sibling.identity),
    accepted,
    {
      state: "decision-needed",
      decision: question,
      resolution: {
        ...satisfied(setup, accepted).resolution,
        summary: `Unresolved product choice for the developer: ${question}`,
      },
    },
  );
  assert.equal(retained.code, 0, retained.stderr);
  await git(setup.owned.directory, "add", ".planning");
  await git(
    setup.owned.directory,
    "commit",
    "-q",
    "-m",
    "resolve supplier B consumers",
  );
}

export const supplierStates = (visit) =>
  Object.fromEntries(
    visit.consumers.map((entry) => [entry.identity, entry.dependency.state]),
  );

// Trunk Mode closure of B up to `finish`'s visit handoff: the before-cleanup
// commit accepted on the coordinator's observer, a racing writer's late
// consumer on trunk, and the rebased final closure accepted with its visit.
export async function handTrunkVisit(t) {
  const fixture = await createTrunkClosureFixture(t);
  const project = await commitCompletedSupplier(
    t,
    fixture.execution,
    fixture.fixture,
  );
  const before = await deliverBeforeCleanupThroughCli(fixture);
  const { sibling } = await raceLateConsumer(
    fixture.origin,
    join(fixture.fixture, "another-writer"),
    fixture.fixture,
  );
  const final = await commitSupplierCleanup(project);
  const handed = await finishThroughCli(fixture, {
    beforeCleanup: before.receipt.sha,
    final,
    extra: selectedTrunkSupplier,
  });
  assert.equal(handed.result?.step, "visit", handed.stderr);
  return {
    fixture,
    project,
    evidence: before.receipt.sha,
    sibling,
    final,
    observer: before.observation.directory,
    acceptedSha: handed.result.acceptedSha,
    visit: handed.result.visit,
    setup: {
      owned: project,
      trunk: { fixture: fixture.fixture },
      evidence: before.receipt.sha,
      sibling,
    },
  };
}

export const selectedTrunkSupplier = [
  "--created-for-work",
  "--supplier-identity",
  supplier.identity,
];
