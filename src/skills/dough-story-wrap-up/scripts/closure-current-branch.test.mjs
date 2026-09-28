// Git mechanics (not guidance-following): explicit current-branch closure
// stays in the recorded checkout under the caller's own authority and commits
// only its authorized paths. Local-only closure is committed and pending
// publication. Publish-authorized closure uses the common publisher from
// that checkout. Native agent behavior is not this file.
import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import {
  commitParentsAndPaths,
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

test("explicit local-only current-branch closure commits only its authorized paths and leaves remote refs unchanged", async (t) => {
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
  assert.deepEqual(await commitParentsAndPaths(integration, delivered.sha), {
    parents: [trunkSha],
    paths: ["owned.txt"],
  });
  assert.equal(
    (await git(integration, "show", `${delivered.sha}:owned.txt`)).stdout,
    "owned closure\n",
  );
  await assert.rejects(
    git(integration, "cat-file", "-e", `${delivered.sha}:human-staged.txt`),
  );
  assert.deepEqual(await plantedHumanEditBytes(integration), beforeHuman);
});

test("explicit publish-authorized current-branch closure publishes only its authorized commit from the same checkout", async (t) => {
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
  assert.equal((await recordedCheckoutIdentity(integration)).branch, "main");
  assert.equal(await lsRemoteSha(origin, trunkTarget), delivered.sha);
  assert.equal(await revParse(integration, "HEAD"), delivered.sha);
  assert.deepEqual(await commitParentsAndPaths(integration, delivered.sha), {
    parents: [trunkSha],
    paths: ["owned.txt"],
  });
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

test("a current-branch closure publishes its before-cleanup and final-closure commits, each over its own published base", async (t) => {
  const fixture = await createCleanTrunkFixture();
  t.after(fixture.cleanup);
  const { origin, integration, trunkSha } = fixture;
  await plantHumanEdit(integration);
  const beforeHuman = await plantedHumanEditBytes(integration);
  const close = async (path, message) => {
    const base = await revParse(integration, "HEAD");
    writeFileSync(join(integration, path), `${message}\n`);
    return deliverCurrentBranchClosure({
      checkout: integration,
      defaultCheckout: integration,
      authority: "publish",
      operation: "publish",
      paths: [path],
      message,
      targetRef: trunkTarget,
      previouslyPublishedBase: base,
    });
  };

  const beforeCleanup = await close("recovery.txt", "before-cleanup closure");
  const finalClosure = await close("closure.txt", "final closure");

  assert.equal(beforeCleanup.publication, "accepted");
  assert.equal(finalClosure.publication, "accepted");
  assert.deepEqual(
    await commitParentsAndPaths(integration, beforeCleanup.sha),
    { parents: [trunkSha], paths: ["recovery.txt"] },
  );
  assert.deepEqual(await commitParentsAndPaths(integration, finalClosure.sha), {
    parents: [beforeCleanup.sha],
    paths: ["closure.txt"],
  });
  assert.equal(await lsRemoteSha(origin, trunkTarget), finalClosure.sha);
  assert.equal(await revParse(integration, "HEAD"), finalClosure.sha);
  assert.deepEqual(await plantedHumanEditBytes(integration), beforeHuman);
});
