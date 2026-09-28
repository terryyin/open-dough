// Git mechanics (not guidance-following): explicit current-branch and
// host-owned execution stay in the recorded checkout under the caller's own
// authority. Local-only authority commits only the authorized paths and leaves
// remote refs unchanged. Publish authority uses the common increment publisher
// from that checkout. Native agent behavior is not this file.
import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { deliverRecordedCheckout } from "./current-branch-publication.mjs";
import {
  commitParentsAndPaths,
  createCleanTrunkFixture,
  git,
  lsRemoteSha,
  plantHumanEdit,
  plantedHumanEditBytes,
  recordedCheckoutIdentity,
  remoteHeads,
  revParse,
} from "./publication-test-fixtures.mjs";

const trunkTarget = "refs/heads/main";

function writeOwned(checkout) {
  writeFileSync(join(checkout, "owned.txt"), "owned change\n");
}

test("explicit local-only current-checkout work commits only its authorized paths and does not publish", async (t) => {
  const fixture = await createCleanTrunkFixture();
  t.after(fixture.cleanup);
  const { origin, integration, trunkSha } = fixture;
  await plantHumanEdit(integration);
  const beforeHuman = await plantedHumanEditBytes(integration);
  writeOwned(integration);
  const beforeIdentity = await recordedCheckoutIdentity(integration);
  const beforeRemote = await remoteHeads(origin);

  const delivered = await deliverRecordedCheckout({
    checkout: integration,
    defaultCheckout: integration,
    authority: "local-only",
    operation: "publish",
    paths: ["owned.txt"],
    message: "current-branch owned change",
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
    "owned change\n",
  );
  await assert.rejects(
    git(integration, "cat-file", "-e", `${delivered.sha}:human-staged.txt`),
  );
  assert.equal(
    (await git(integration, "show", `${delivered.sha}:trunk.txt`)).stdout,
    "base\n",
  );
  assert.deepEqual(await plantedHumanEditBytes(integration), beforeHuman);
  assert.equal(await lsRemoteSha(origin, "refs/heads/exec/story"), "");
});

test("explicit publish-authorized current-checkout work publishes only its authorized commit and preserves unrelated edits", async (t) => {
  const fixture = await createCleanTrunkFixture();
  t.after(fixture.cleanup);
  const { origin, integration, trunkSha } = fixture;
  await plantHumanEdit(integration);
  const beforeHuman = await plantedHumanEditBytes(integration);
  writeOwned(integration);
  const beforeIdentity = await recordedCheckoutIdentity(integration);
  const beforeNames = (await remoteHeads(origin))
    .split("\n")
    .map((line) => line.split(/\s+/)[1]);
  const receipts = [];

  const delivered = await deliverRecordedCheckout({
    checkout: integration,
    defaultCheckout: integration,
    authority: "publish",
    operation: "publish",
    paths: ["owned.txt"],
    message: "current-branch owned change",
    targetRef: trunkTarget,
    previouslyPublishedBase: trunkSha,
    register(receipt) {
      receipts.push(receipt);
    },
  });

  assert.equal(delivered.classification, "remote");
  assert.equal(delivered.publication, "accepted");
  assert.equal(delivered.report, "accepted");
  assert.deepEqual(delivered.receipt, {
    sha: delivered.sha,
    target: trunkTarget,
  });
  assert.deepEqual(receipts, [delivered.receipt]);
  assert.equal(delivered.preRebaseSha, delivered.sha);
  assert.equal(delivered.checkout, beforeIdentity.toplevel);
  assert.equal(delivered.branch, "main");
  assert.equal(
    (await recordedCheckoutIdentity(integration)).toplevel,
    beforeIdentity.toplevel,
  );
  assert.equal((await recordedCheckoutIdentity(integration)).branch, "main");
  assert.equal(
    (await recordedCheckoutIdentity(integration)).worktrees,
    beforeIdentity.worktrees,
  );
  assert.equal(await lsRemoteSha(origin, trunkTarget), delivered.sha);
  assert.deepEqual(
    (await remoteHeads(origin)).split("\n").map((line) => line.split(/\s+/)[1]),
    beforeNames,
  );
  assert.deepEqual(await commitParentsAndPaths(integration, delivered.sha), {
    parents: [trunkSha],
    paths: ["owned.txt"],
  });
  assert.equal(
    (await git(integration, "show", `${delivered.sha}:owned.txt`)).stdout,
    "owned change\n",
  );
  await assert.rejects(
    git(integration, "cat-file", "-e", `${delivered.sha}:human-staged.txt`),
  );
  assert.equal(
    (await git(integration, "show", `${delivered.sha}:trunk.txt`)).stdout,
    "base\n",
  );
  assert.deepEqual(await plantedHumanEditBytes(integration), beforeHuman);
  assert.equal(delivered.maintenance.result, "deferred");
  assert.equal(delivered.maintenance.reason, "pending-edit");
  assert.equal(await revParse(integration, "HEAD"), delivered.sha);
});

test("host-owned execution stays in its recorded checkout when authority is local-only", async (t) => {
  const fixture = await createCleanTrunkFixture();
  t.after(fixture.cleanup);
  const { origin, execution, trunkSha } = fixture;
  writeOwned(execution);
  const beforeIdentity = await recordedCheckoutIdentity(execution);
  const beforeRemote = await remoteHeads(origin);

  const delivered = await deliverRecordedCheckout({
    checkout: execution,
    authority: "local-only",
    operation: "publish",
    paths: ["owned.txt"],
    message: "host-owned owned change",
    targetRef: trunkTarget,
    previouslyPublishedBase: trunkSha,
  });

  assert.equal(delivered.classification, "local");
  assert.equal(delivered.publication, "pending");
  assert.equal(delivered.receipt, null);
  assert.equal(delivered.checkout, beforeIdentity.toplevel);
  assert.equal(delivered.branch, "exec/story");
  assert.deepEqual(await recordedCheckoutIdentity(execution), beforeIdentity);
  assert.equal(await remoteHeads(origin), beforeRemote);
  assert.equal(await revParse(execution, "HEAD"), delivered.sha);
  assert.notEqual(delivered.sha, trunkSha);
});

test("an in-progress merge stops explicit current-checkout work without committing or publishing", async (t) => {
  const fixture = await createCleanTrunkFixture();
  t.after(fixture.cleanup);
  const { origin, integration, trunkSha } = fixture;
  await git(integration, "checkout", "-b", "local-topic");
  writeFileSync(join(integration, "topic.txt"), "topic\n");
  await git(integration, "add", "topic.txt");
  await git(integration, "commit", "-m", "local topic");
  await git(integration, "checkout", "main");
  await git(integration, "merge", "--no-ff", "--no-commit", "local-topic");
  writeOwned(integration);
  const beforeIdentity = await recordedCheckoutIdentity(integration);
  const beforeRemote = await remoteHeads(origin);

  await assert.rejects(
    deliverRecordedCheckout({
      checkout: integration,
      defaultCheckout: integration,
      authority: "publish",
      operation: "publish",
      paths: ["owned.txt"],
      message: "should not commit during a merge",
      targetRef: trunkTarget,
      previouslyPublishedBase: trunkSha,
    }),
    /partial commit during a merge/,
  );

  assert.equal(await revParse(integration, "HEAD"), trunkSha);
  assert.equal(
    await revParse(integration, "MERGE_HEAD"),
    await revParse(integration, "local-topic"),
  );
  assert.deepEqual(await recordedCheckoutIdentity(integration), beforeIdentity);
  assert.equal(await remoteHeads(origin), beforeRemote);
  assert.equal(
    readFileSync(join(integration, "owned.txt"), "utf8"),
    "owned change\n",
  );
});
