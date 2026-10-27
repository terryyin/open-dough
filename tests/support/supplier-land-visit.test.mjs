// Dough Land of a selected completed supplier's wholly unpublished suffix
// through `publishSelectedSupplier`: once the publication reconciled with a
// writer that added a consumer on trunk is accepted, the visit discovers it
// from the landing worktree, with no CI observer; the consumer publication
// adds no second landing capture; retirement follows. A generic landing
// carries no visit and changes no consumer agreement.
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  consumer,
  git,
  plan,
  readDependencies,
  revParse,
  supplier,
  supplierPlan,
} from "./supplier-dependency-fixture.mjs";
import {
  identities,
  supplierBlocks,
} from "./supplier-integration-visit-fixture.mjs";
import {
  judgeConsumers,
  supplierStates,
  third,
} from "./supplier-closure-visit-fixture.mjs";
import {
  branch,
  finalView,
  landing,
  main,
  racedLanding,
} from "./supplier-land-visit-fixture.mjs";
import { publishExecutionIncrement } from "../../src/skills/dough-execute-plan/scripts/execution-increment-publication.mjs";
import { publishSelectedSupplier } from "../../src/skills/dough-execute-plan/scripts/supplier-integration.mjs";
import {
  assertCheckoutUnchanged,
  captureCheckout,
  lsRemoteSha,
  plantHumanEdit,
} from "../../src/skills/dough-execute-plan/scripts/publication-test-fixtures.mjs";
import {
  landingContextFile,
  landingReceiver,
} from "../../src/skills/dough-execute-plan/scripts/dashboard-landing-test-fixtures.mjs";
import { retireWorktree } from "../../src/skills/dough-land/scripts/worktree-retirement.mjs";

const question =
  "Does the late story still need the old endpoint shape, or should it adopt B's contract?";

test("a selected supplier's landing visits a consumer added during its reconciliation before its consumer publication and retirement", async (t) => {
  const setup = await racedLanding(t);
  const receiver = await landingReceiver(t);
  const context = await landingContextFile(
    t,
    receiver.origin,
    supplier.identity,
  );
  await plantHumanEdit(setup.trunk.integration);
  const defaultBefore = await captureCheckout(setup.trunk.integration);
  const operations = [];

  const landed = await publishSelectedSupplier(
    landing(setup, {
      supplierIdentity: supplier.identity,
      previouslyPublishedBase: setup.base,
      landingContext: context,
    }),
  );
  operations.push("land-and-visit");
  assert.equal(landed.ok, true, JSON.stringify(landed));
  assert.equal(landed.reconciliations, 1);
  assert.equal(landed.observation, undefined);
  assert.equal(landed.landing.state, "recorded");
  const accepted = landed.receipt.sha;
  assert.equal(await lsRemoteSha(setup.trunk.origin, main), accepted);
  const { visit } = landed;
  assert.equal(visit.status, "visited");
  assert.deepEqual(identities(visit), [
    consumer.identity,
    setup.sibling.identity,
  ]);
  assert.deepEqual(visit.problems, []);
  assert.equal(visit.checkout.revision, accepted);
  assert.equal(visit.checkout.path, setup.workspace);

  const resumed = await publishSelectedSupplier(
    landing(setup, {
      supplierIdentity: supplier.identity,
      previouslyPublishedBase: setup.base,
      landingContext: context,
    }),
  );
  assert.equal(resumed.receipt.sha, accepted);
  assert.equal(resumed.reconciliations, 0);
  assert.deepEqual(identities(resumed.visit), identities(visit));

  // Reconciliation rewrote the preserved outcome commit; its accepted
  // rewrite, below the cleanup, is the evidence the judgments cite.
  const evidence = await revParse(setup.workspace, `${accepted}~1`);
  assert.notEqual(evidence, setup.evidence);
  const proof = await git(
    setup.workspace,
    "show",
    `${evidence}:${supplierPlan}`,
  );
  assert.equal(proof.stdout, plan("done"));
  await judgeConsumers({ ...setup, evidence }, visit, accepted, question);
  const consumers = await publishExecutionIncrement(
    landing(setup, { previouslyPublishedBase: accepted }),
  );
  operations.push("publish-consumers");
  assert.equal(consumers.ok, true, JSON.stringify(consumers));
  assert.equal(Object.hasOwn(consumers, "landing"), false);
  assert.equal(Object.hasOwn(consumers, "visit"), false);
  const consumerSha = consumers.receipt.sha;
  assert.equal(await lsRemoteSha(setup.trunk.origin, main), consumerSha);

  const revisited = await publishSelectedSupplier(
    landing(setup, {
      supplierIdentity: supplier.identity,
      previouslyPublishedBase: accepted,
    }),
  );
  assert.equal(revisited.receipt.sha, consumerSha);
  assert.equal(revisited.visit.checkout.revision, consumerSha);
  assert.deepEqual(supplierStates(revisited.visit), {
    [consumer.identity]: "satisfied",
    [setup.sibling.identity]: "decision-needed",
  });
  assert.ok(receiver.requests.length > 0);
  for (const { report } of receiver.requests) {
    assert.equal(report.revision, accepted);
    assert.equal(report.base, setup.lateTrunk);
  }

  const retired = await retireWorktree({
    repository: setup.trunk.integration,
    worktree: setup.workspace,
    branch,
    createdForWork: true,
    contained: [accepted, consumerSha],
  });
  operations.push("retire");
  assert.equal(retired.removed, true, JSON.stringify(retired));
  assert.deepEqual(operations, [
    "land-and-visit",
    "publish-consumers",
    "retire",
  ]);

  const view = await finalView(setup);
  const older = await readDependencies(view, consumer);
  assert.equal(supplierBlocks(older), 0);
  assert.match(JSON.stringify(older.blocking), new RegExp(third.identity));
  const late = await readDependencies(view, setup.sibling);
  assert.equal(supplierBlocks(late), 1);
  assert.equal(late.dependencies[0].decision, question);
  assertCheckoutUnchanged(
    defaultBefore,
    await captureCheckout(setup.trunk.integration),
  );
});

test("a generic landing of the same suffix carries no visit and leaves every consumer waiting", async (t) => {
  const setup = await racedLanding(t);
  const landed = await publishExecutionIncrement(
    landing(setup, { previouslyPublishedBase: setup.base }),
  );
  assert.equal(landed.ok, true, JSON.stringify(landed));
  assert.equal(Object.hasOwn(landed, "visit"), false);
  const view = await finalView(setup);
  assert.equal(supplierBlocks(await readDependencies(view, consumer)), 1);
  assert.equal(supplierBlocks(await readDependencies(view, setup.sibling)), 1);
});
