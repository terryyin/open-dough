// Git mechanics (not guidance-following): current-branch closure stays in
// the recorded checkout. Local-only closure is committed and pending
// publication. Publish-authorized closure uses the common publisher from
// that checkout. Native agent behavior is not this file.
import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import {
  plantedHumanEditBytes,
  recordedCheckoutIdentity,
  remoteHeads,
} from "../../dough-execute-plan/scripts/publication-test-fixtures.mjs";
import { deliverCurrentBranchClosure } from "./closure-publication.mjs";
import {
  createCleanTrunkFixture,
  git,
  lsRemoteSha,
  plantHumanEdit,
  revParse,
  trunkTarget,
} from "./closure-publication-fixtures.mjs";

function prepare(checkout) {
  writeFileSync(join(checkout, "owned.txt"), "owned closure\n");
}

test("local-only current-branch closure commits and leaves remote refs unchanged", async (t) => {
  const fixture = await createCleanTrunkFixture();
  t.after(fixture.cleanup);
  const { origin, integration, trunkSha } = fixture;
  await plantHumanEdit(integration);
  const beforeHuman = await plantedHumanEditBytes(integration);
  prepare(integration);
  const beforeIdentity = await recordedCheckoutIdentity(integration);
  const beforeRemote = await remoteHeads(origin);

  const delivered = await deliverCurrentBranchClosure({
    checkout: integration,
    defaultCheckout: integration,
    declaredOwner: "caller",
    requester: "caller",
    authority: "local-only",
    operation: "publish",
    paths: ["owned.txt"],
    message: "current-branch closure",
    targetRef: trunkTarget,
    previouslyPublishedBase: trunkSha,
  });

  assert.equal(delivered.classification, "local");
  assert.equal(delivered.publication, "pending");
  assert.equal(delivered.report, "committed");
  assert.equal(delivered.receipt, null);
  assert.equal(delivered.checkout, beforeIdentity.toplevel);
  assert.equal(delivered.branch, "main");
  assert.deepEqual(await recordedCheckoutIdentity(integration), beforeIdentity);
  assert.equal(await remoteHeads(origin), beforeRemote);
  assert.equal(await lsRemoteSha(origin, trunkTarget), trunkSha);
  assert.equal(await revParse(integration, "HEAD"), delivered.sha);
  assert.equal(
    (await git(integration, "show", `${delivered.sha}:owned.txt`)).stdout,
    "owned closure\n",
  );
  await assert.rejects(
    git(integration, "cat-file", "-e", `${delivered.sha}:human-staged.txt`),
  );
  assert.deepEqual(await plantedHumanEditBytes(integration), beforeHuman);
});

test("publish-authorized current-branch closure records the accepted receipt from the same checkout", async (t) => {
  const fixture = await createCleanTrunkFixture();
  t.after(fixture.cleanup);
  const { origin, integration, trunkSha } = fixture;
  await plantHumanEdit(integration);
  const beforeHuman = await plantedHumanEditBytes(integration);
  prepare(integration);
  const beforeIdentity = await recordedCheckoutIdentity(integration);
  const receipts = [];

  const delivered = await deliverCurrentBranchClosure({
    checkout: integration,
    defaultCheckout: integration,
    declaredOwner: "caller",
    requester: "caller",
    authority: "publish",
    operation: "publish",
    paths: ["owned.txt"],
    message: "current-branch closure",
    targetRef: trunkTarget,
    previouslyPublishedBase: trunkSha,
    register(receipt) {
      receipts.push(receipt);
    },
  });

  assert.equal(delivered.publication, "accepted");
  assert.deepEqual(delivered.receipt, {
    sha: delivered.sha,
    target: trunkTarget,
  });
  assert.deepEqual(receipts, [delivered.receipt]);
  assert.equal(delivered.checkout, beforeIdentity.toplevel);
  assert.equal(delivered.branch, "main");
  assert.equal(
    (await recordedCheckoutIdentity(integration)).worktrees,
    beforeIdentity.worktrees,
  );
  assert.equal(await lsRemoteSha(origin, trunkTarget), delivered.sha);
  assert.equal(await revParse(integration, "HEAD"), delivered.sha);
  assert.equal(
    (await git(integration, "show", `${delivered.sha}:trunk.txt`)).stdout,
    "base\n",
  );
  await assert.rejects(
    git(integration, "cat-file", "-e", `${delivered.sha}:human-staged.txt`),
  );
  assert.deepEqual(await plantedHumanEditBytes(integration), beforeHuman);
  assert.equal(delivered.maintenance.result, "deferred");
  assert.equal(delivered.maintenance.reason, "pending-edit");
});
