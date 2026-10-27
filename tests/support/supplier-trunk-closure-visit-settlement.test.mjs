// Settlement of Trunk Mode `finish` around a selected story's visit through the
// installed `finish` and `deliver`: a clean visit with no consumers completes
// the accepted final closure and retires in the same call, while a discovery
// problem still hands the visit over; a `--visit-settled` earlier than a
// consumer publication this closure's observer registered is refused with
// everything kept, and naming that publication completes it and retires even
// after another writer moved the target past it.
import assert from "node:assert/strict";
import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { consumer } from "./supplier-dependency-fixture.mjs";
import {
  commitCompletedSupplier,
  commitSupplierCleanup,
  handTrunkVisit,
  judgeConsumers,
  selectedTrunkSupplier,
} from "./supplier-closure-visit-fixture.mjs";
import {
  cloneAsAnotherWriter,
  lsRemoteSha,
} from "../../src/skills/dough-execute-plan/scripts/publication-test-fixtures.mjs";
import { deliverThroughCli } from "../../src/skills/dough-execute-plan/scripts/execution-increment-managed-delivery-cli-test-fixtures.mjs";
import { git } from "../../src/skills/dough-execute-plan/scripts/execution-increment-managed-delivery-test-fixtures.mjs";
import {
  branchSha,
  createTrunkClosureFixture,
  deliverBeforeCleanupThroughCli,
  finishThroughCli,
  releaseCi,
} from "../../src/skills/dough-story-wrap-up/scripts/trunk-closure-test-fixtures.mjs";

const main = "refs/heads/main";
const question = "Does the late story adopt B's contract?";
// A completed selected story no current consumer waits on.
const unconsumed = [
  "--created-for-work",
  "--supplier-identity",
  consumer.identity,
];

// B's closure up to an accepted-ready final closure in the execution
// worktree, with CI released for it and the before-cleanup commit; `before`
// may add files the final closure commits.
async function closeUnconsumed(t, before = () => {}) {
  const fixture = await createTrunkClosureFixture(t);
  const project = await commitCompletedSupplier(
    t,
    fixture.execution,
    fixture.fixture,
  );
  const evidence = (await deliverBeforeCleanupThroughCli(fixture)).receipt.sha;
  before(fixture);
  const final = await commitSupplierCleanup(project);
  releaseCi(fixture, { [evidence]: "success", [final]: "success" });
  const finished = await finishThroughCli(fixture, {
    beforeCleanup: evidence,
    final,
    extra: unconsumed,
  });
  return { fixture, final, ...finished };
}

test("finish completes the accepted final closure and retires in one call when the visit finds no consumers and no problems", async (t) => {
  const { fixture, final, result, code, stderr } = await closeUnconsumed(t);

  assert.equal(code, 0, stderr);
  assert.equal(result.ok, true);
  assert.equal(result.step, "done");
  assert.equal(result.acceptedSha, final);
  assert.equal(result.visit.status, "visited");
  assert.equal(result.visit.supplierIdentity, consumer.identity);
  assert.deepEqual(result.visit.consumers, []);
  assert.deepEqual(result.visit.problems, []);
  assert.equal(result.completion.requestedSha, final);
  assert.equal(result.completion.verdict, "success");
  assert.equal(result.cleanup.worktree, "removed");
  assert.equal(existsSync(fixture.execution), false);
  assert.equal(await branchSha(fixture), "");
});

test("finish still hands an empty visit with a discovery problem to the agent with nothing completed or retired", async (t) => {
  const { fixture, final, result, code } = await closeUnconsumed(t, (fixture) =>
    writeFileSync(
      join(fixture.execution, ".planning/stray.md"),
      "```json dough-story-dependencies\n{}\n```\n",
    ),
  );

  assert.equal(code, 1);
  assert.equal(result.step, "visit");
  assert.equal(result.acceptedSha, final);
  assert.deepEqual(result.visit.consumers, []);
  assert.equal(result.visit.problems.length, 1);
  assert.match(result.recovery, /--visit-settled/);
  assert.equal(Object.hasOwn(result, "completion"), false);
  assert.equal(result.cleanup, "not-performed");
  assert.equal(existsSync(fixture.execution), true);
  assert.equal(await branchSha(fixture), final);
});

test("finish refuses a --visit-settled earlier than this closure's registered consumer publication, then completes that publication past another writer's commit", async (t) => {
  const handed = await handTrunkVisit(t);
  const { fixture, acceptedSha } = handed;
  await judgeConsumers(handed.setup, handed.visit, acceptedSha, question);
  const { delivered } = await deliverThroughCli(fixture, { base: acceptedSha });
  assert.equal(delivered.publication, "accepted");
  const consumerSha = delivered.receipt.sha;
  const writer = join(fixture.fixture, "later-writer");
  await cloneAsAnotherWriter(fixture.origin, writer);
  writeFileSync(join(writer, "unrelated.txt"), "another writer\n");
  await git(writer, "add", "unrelated.txt");
  await git(writer, "commit", "-q", "-m", "unrelated trunk change");
  await git(writer, "push", "-q", "origin", "HEAD:main");
  const moved = await lsRemoteSha(fixture.origin, main);
  assert.notEqual(moved, consumerSha);
  releaseCi(fixture, {
    [handed.evidence]: "success",
    [acceptedSha]: "success",
    [consumerSha]: "success",
  });
  const settle = (sha) =>
    finishThroughCli(fixture, {
      beforeCleanup: handed.evidence,
      final: acceptedSha,
      extra: [...selectedTrunkSupplier, "--visit-settled", sha],
    });

  const early = await settle(acceptedSha);
  assert.equal(early.code, 1);
  assert.equal(early.result.step, "visit");
  assert.match(early.result.reason, new RegExp(consumerSha));
  assert.doesNotMatch(early.result.reason, new RegExp(moved));
  assert.match(early.result.recovery, new RegExp(consumerSha));
  assert.equal(Object.hasOwn(early.result, "completion"), false);
  assert.equal(early.result.cleanup, "not-performed");
  assert.equal(existsSync(fixture.execution), true);
  assert.equal(await branchSha(fixture), consumerSha);

  const finished = await settle(consumerSha);
  assert.equal(finished.code, 0, finished.stderr);
  assert.equal(finished.result.visitSettled, consumerSha);
  assert.equal(finished.result.completion.requestedSha, consumerSha);
  assert.equal(finished.result.completion.verdict, "success");
  assert.equal(finished.result.cleanup.worktree, "removed");
  assert.equal(existsSync(fixture.execution), false);
  assert.equal(await branchSha(fixture), "");
});
