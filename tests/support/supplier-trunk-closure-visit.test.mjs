// Trunk Mode closure of a selected completed supplier through the installed
// `finish`: the accepted final closure hands the current-consumer visit to the
// agent while the worktree, branch and observer remain; owned consumer
// publications follow on the same observer; only a rerun naming the settled
// visit's last accepted SHA completes that SHA and retires.
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { consumer, readDependencies } from "./supplier-dependency-fixture.mjs";
import {
  identities,
  supplierBlocks,
} from "./supplier-integration-visit-fixture.mjs";
import {
  commitCompletedSupplier,
  commitSupplierCleanup,
  judgeConsumers,
  raceLateConsumer,
  supplierStates,
  third,
} from "./supplier-closure-visit-fixture.mjs";
import {
  assertCheckoutUnchanged,
  captureCheckout,
  cloneAsAnotherWriter,
  lsRemoteSha,
  plantHumanEdit,
} from "../../src/skills/dough-execute-plan/scripts/publication-test-fixtures.mjs";
import { deliverThroughCli } from "../../src/skills/dough-execute-plan/scripts/execution-increment-managed-delivery-cli-test-fixtures.mjs";
import {
  branchSha,
  createTrunkClosureFixture,
  deliverBeforeCleanupThroughCli,
  finishThroughCli,
  releaseCi,
} from "../../src/skills/dough-story-wrap-up/scripts/trunk-closure-test-fixtures.mjs";

const main = "refs/heads/main";
const question =
  "Does the late story still need the old endpoint shape, or should it adopt B's contract?";

test("Trunk Mode finish visits a consumer a racing writer added before completing the last consumer publication and retiring", async (t) => {
  const fixture = await createTrunkClosureFixture(t);
  const project = await commitCompletedSupplier(
    t,
    fixture.execution,
    fixture.fixture,
  );
  const before = await deliverBeforeCleanupThroughCli(fixture);
  const evidence = before.receipt.sha;
  const { sibling } = await raceLateConsumer(
    fixture.origin,
    join(fixture.fixture, "another-writer"),
    fixture.fixture,
  );
  const final = await commitSupplierCleanup(project);
  await plantHumanEdit(fixture.integration);
  const defaultBefore = await captureCheckout(fixture.integration);
  const selected = [
    "--created-for-work",
    "--default-checkout",
    fixture.integration,
    "--supplier-identity",
    "SEED-B#b",
  ];
  const operations = [];

  const handed = await finishThroughCli(fixture, {
    beforeCleanup: evidence,
    final,
    extra: selected,
  });
  operations.push("publish-and-visit");
  assert.equal(handed.code, 1, handed.stderr);
  const { result } = handed;
  assert.equal(result.step, "visit");
  assert.equal(result.publication, "accepted");
  assert.equal(result.cleanup, "not-performed");
  assert.equal(Object.hasOwn(result, "completion"), false);
  const acceptedSha = result.acceptedSha;
  assert.notEqual(acceptedSha, final);
  assert.equal(await lsRemoteSha(fixture.origin, main), acceptedSha);
  assert.equal(result.visit.status, "visited");
  assert.deepEqual(identities(result.visit), [
    consumer.identity,
    sibling.identity,
  ]);
  assert.deepEqual(result.visit.problems, []);
  assert.equal(result.visit.checkout.revision, acceptedSha);
  assert.match(result.recovery, /--visit-settled/);
  assert.equal(existsSync(fixture.execution), true);
  assert.equal(await branchSha(fixture), acceptedSha);
  const observer = result.observation.directory;
  assert.equal(observer, before.observation.directory);

  const resumed = await finishThroughCli(fixture, {
    beforeCleanup: evidence,
    final,
    extra: selected,
  });
  assert.equal(resumed.result.step, "visit");
  assert.equal(resumed.result.acceptedSha, acceptedSha);
  assert.equal(resumed.result.pushCount, 0);
  assert.deepEqual(identities(resumed.result.visit), [
    consumer.identity,
    sibling.identity,
  ]);

  const setup = {
    owned: project,
    trunk: { fixture: fixture.fixture },
    evidence,
    sibling,
  };
  await judgeConsumers(setup, result.visit, acceptedSha, question);
  const { delivered } = await deliverThroughCli(fixture, { base: acceptedSha });
  operations.push("publish-consumers");
  assert.equal(delivered.publication, "accepted");
  assert.equal(delivered.observation.directory, observer);
  const consumerSha = delivered.receipt.sha;
  assert.equal(await lsRemoteSha(fixture.origin, main), consumerSha);

  const revisited = await finishThroughCli(fixture, {
    beforeCleanup: evidence,
    final,
    extra: selected,
  });
  assert.equal(revisited.result.step, "visit");
  assert.equal(revisited.result.pushCount, 0);
  assert.equal(revisited.result.visit.checkout.revision, consumerSha);
  assert.deepEqual(supplierStates(revisited.result.visit), {
    [consumer.identity]: "satisfied",
    [sibling.identity]: "decision-needed",
  });
  assert.equal(existsSync(fixture.execution), true);

  const early = await finishThroughCli(fixture, {
    beforeCleanup: evidence,
    final: acceptedSha,
    extra: [...selected, "--visit-settled", evidence],
  });
  assert.equal(early.result.step, "visit");
  assert.match(early.result.reason, /--visit-settled/);
  assert.equal(existsSync(fixture.execution), true);

  releaseCi(fixture, {
    [evidence]: "success",
    [acceptedSha]: "success",
    [consumerSha]: "success",
  });
  const finished = await finishThroughCli(fixture, {
    beforeCleanup: evidence,
    final: acceptedSha,
    extra: [...selected, "--visit-settled", consumerSha],
  });
  operations.push("complete-and-retire");
  assert.equal(finished.code, 0, finished.stderr);
  assert.equal(finished.result.ok, true);
  assert.equal(finished.result.pushCount, 0);
  assert.equal(finished.result.visitSettled, consumerSha);
  assert.equal(finished.result.completion.requestedSha, consumerSha);
  assert.equal(finished.result.completion.verdict, "success");
  assert.equal(finished.result.completion.shutdown.status, "confirmed");
  assert.equal(finished.result.cleanup.worktree, "removed");
  assert.equal(existsSync(fixture.execution), false);
  assert.equal(await branchSha(fixture), "");
  assert.deepEqual(operations, [
    "publish-and-visit",
    "publish-consumers",
    "complete-and-retire",
  ]);

  assert.equal(await lsRemoteSha(fixture.origin, main), consumerSha);
  const view = {
    directory: join(fixture.fixture, "final-view"),
    inputDirectory: fixture.fixture,
  };
  await cloneAsAnotherWriter(fixture.origin, view.directory);
  const older = await readDependencies(view, consumer);
  assert.equal(supplierBlocks(older), 0);
  assert.equal(older.dependencies[0].resolution.revision, evidence);
  assert.match(JSON.stringify(older.blocking), new RegExp(third.identity));
  const late = await readDependencies(view, sibling);
  assert.equal(supplierBlocks(late), 1);
  assert.equal(late.dependencies[0].decision, question);
  assertCheckoutUnchanged(
    defaultBefore,
    await captureCheckout(fixture.integration),
  );
});

test("finish refuses --visit-settled without a selected supplier as a usage error", async (t) => {
  const fixture = await createTrunkClosureFixture(t);
  const { result, code, stderr } = await finishThroughCli(fixture, {
    beforeCleanup: fixture.candidateSha,
    final: fixture.candidateSha,
    extra: ["--visit-settled", fixture.candidateSha],
  });
  assert.equal(code, 2);
  assert.equal(result, null);
  assert.match(stderr, /--visit-settled needs --supplier-identity/);
});
