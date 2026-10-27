// Post-acceptance callers retain their receipts when the visit refuses input.
// The missing backlog directory cannot resolve inside Git; every publication still uses a real remote.
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { test } from "node:test";
import { supplier } from "./supplier-dependency-fixture.mjs";
import {
  branchedSupplier,
  integrate,
  remoteMain,
  selected,
} from "./supplier-integration-visit-fixture.mjs";
import {
  commitCompletedSupplier,
  commitSupplierCleanup,
  selectedTrunkSupplier,
} from "./supplier-closure-visit-fixture.mjs";
import { landing, main, racedLanding } from "./supplier-land-visit-fixture.mjs";
import { publishSelectedSupplier } from "../../src/skills/dough-execute-plan/scripts/supplier-integration.mjs";
import { lsRemoteSha } from "../../src/skills/dough-execute-plan/scripts/publication-test-fixtures.mjs";
import {
  branchSha,
  createTrunkClosureFixture,
  deliverBeforeCleanupThroughCli,
  finishThroughCli,
} from "../../src/skills/dough-story-wrap-up/scripts/trunk-closure-test-fixtures.mjs";

const outsideGit = "no-such-dir/PRODUCT-BACKLOG.md";
function assertRefusedVisit(visit) {
  assert.equal(visit.status, "stopped");
  assert.equal(visit.reason, "error");
  assert.match(visit.error, /not inside a Git repository/);
  assert.match(visit.recovery, /visit-consumers with this accepted revision/);
}

test("Story Branch integrate retains its accepted receipt when the consumer visit refuses the backlog path", async (t) => {
  const setup = await branchedSupplier(t);
  const result = await integrate(setup, [
    ...selected,
    "--backlog-path",
    outsideGit,
  ]);

  assert.equal(result.code, 0, result.stderr);
  assert.equal(result.json.classification, "published");
  assert.equal(result.json.receipt.sha, result.json.acceptedSha);
  assert.equal(await remoteMain(setup), result.json.acceptedSha);
  assertRefusedVisit(result.json.visit);
});

test("Trunk finish retains its accepted receipt and observer when the consumer visit refuses the backlog path", async (t) => {
  const fixture = await createTrunkClosureFixture(t);
  const project = await commitCompletedSupplier(
    t,
    fixture.execution,
    fixture.fixture,
  );
  const before = await deliverBeforeCleanupThroughCli(fixture);
  const final = await commitSupplierCleanup(project);
  const { result, code } = await finishThroughCli(fixture, {
    beforeCleanup: before.receipt.sha,
    final,
    extra: [...selectedTrunkSupplier, "--backlog-path", outsideGit],
  });

  assert.equal(code, 1);
  assert.equal(result.step, "visit");
  assert.equal(result.publication, "accepted");
  assert.equal(result.acceptedSha, final);
  assert.equal(await lsRemoteSha(fixture.origin, main), final);
  assert.equal(result.observation.directory, before.observation.directory);
  assertRefusedVisit(result.visit);
  assert.equal(Object.hasOwn(result, "completion"), false);
  assert.equal(result.cleanup, "not-performed");
  assert.equal(existsSync(fixture.execution), true);
  assert.equal(await branchSha(fixture), final);
});

test("Land retains its accepted receipt when the consumer visit refuses the backlog path", async (t) => {
  const setup = await racedLanding(t);
  const result = await publishSelectedSupplier(
    landing(setup, {
      supplierIdentity: supplier.identity,
      previouslyPublishedBase: setup.base,
      backlogPath: outsideGit,
    }),
  );

  assert.equal(result.ok, true, JSON.stringify(result));
  assert.equal(await lsRemoteSha(setup.trunk.origin, main), result.receipt.sha);
  assertRefusedVisit(result.visit);
});
