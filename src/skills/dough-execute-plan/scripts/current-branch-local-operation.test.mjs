// Git mechanics (not guidance-following): a local commit or a local merge
// stays local even when a destination and publication authority are present.
// Native agent behavior is not this file.
import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { deliverRecordedCheckout } from "./current-branch-publication.mjs";
import {
  createCleanTrunkFixture,
  git,
  lsRemoteSha,
  recordedCheckoutIdentity,
  remoteHeads,
  revParse,
} from "./publication-test-fixtures.mjs";

const trunkTarget = "refs/heads/main";

function writeOwned(checkout) {
  writeFileSync(join(checkout, "owned.txt"), "owned change\n");
}

test("a local commit request stays local when a destination and publication authority are both present", async (t) => {
  const fixture = await createCleanTrunkFixture();
  t.after(fixture.cleanup);
  const { origin, integration, trunkSha } = fixture;
  writeOwned(integration);
  const beforeRemote = await remoteHeads(origin);
  const beforeIdentity = await recordedCheckoutIdentity(integration);

  const delivered = await deliverRecordedCheckout({
    checkout: integration,
    defaultCheckout: integration,
    declaredOwner: "caller",
    requester: "caller",
    authority: "publish",
    operation: "commit",
    paths: ["owned.txt"],
    message: "local commit",
    targetRef: trunkTarget,
    previouslyPublishedBase: trunkSha,
  });

  assert.equal(delivered.classification, "local");
  assert.equal(delivered.operation, "commit");
  assert.equal(delivered.publication, "pending");
  assert.equal(delivered.receipt, null);
  assert.equal(await remoteHeads(origin), beforeRemote);
  assert.equal(await lsRemoteSha(origin, trunkTarget), trunkSha);
  assert.equal(delivered.sha, await revParse(integration, "HEAD"));
  assert.deepEqual(await recordedCheckoutIdentity(integration), beforeIdentity);
});

test("a local merge request stays local and does not publish", async (t) => {
  const fixture = await createCleanTrunkFixture();
  t.after(fixture.cleanup);
  const { origin, integration, trunkSha } = fixture;
  await git(integration, "checkout", "-b", "local-topic");
  writeFileSync(join(integration, "topic.txt"), "topic\n");
  await git(integration, "add", "topic.txt");
  await git(integration, "commit", "-m", "local topic");
  await git(integration, "checkout", "main");
  const beforeRemote = await remoteHeads(origin);
  const beforeIdentity = await recordedCheckoutIdentity(integration);

  const delivered = await deliverRecordedCheckout({
    checkout: integration,
    defaultCheckout: integration,
    declaredOwner: "caller",
    requester: "caller",
    authority: "publish",
    operation: "merge",
    mergeRef: "local-topic",
    message: "local merge",
    targetRef: trunkTarget,
    previouslyPublishedBase: trunkSha,
  });

  assert.equal(delivered.classification, "local");
  assert.equal(delivered.operation, "merge");
  assert.equal(delivered.publication, "pending");
  assert.equal(delivered.receipt, null);
  assert.equal(await remoteHeads(origin), beforeRemote);
  assert.equal(
    (await git(integration, "log", "--format=%P", "-1")).stdout
      .trim()
      .split(" ").length,
    2,
  );
  assert.equal(
    (await git(integration, "show", "HEAD:topic.txt")).stdout,
    "topic\n",
  );
  assert.equal(await lsRemoteSha(origin, trunkTarget), trunkSha);
  assert.deepEqual(await recordedCheckoutIdentity(integration), beforeIdentity);
  assert.equal(beforeIdentity.branch, "main");
});
