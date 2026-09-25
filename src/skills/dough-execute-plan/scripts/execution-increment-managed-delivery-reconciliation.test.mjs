// Managed delivery reconciliation: another writer advances the target; only
// the owned unpublished suffix is replayed; a changed candidate requires
// applicable proof before push; resumption attaches the exact accepted SHA.
import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { readRevisionCoverage } from "./ci-mailbox.mjs";
import {
  createManagedFixture,
  git,
} from "./execution-increment-managed-delivery-test-fixtures.mjs";
import {
  advanceOriginFromAnotherWriter,
  assertCheckoutUnchanged,
  captureCheckout,
  lsRemoteSha,
  plantHumanEdit,
} from "./publication-test-fixtures.mjs";

const trunkTarget = "refs/heads/main";
const repo = "owner/project";

test("unvalidated reconciled candidate does not push and returns needs-validation", async (t) => {
  const fixture = await createManagedFixture();
  t.after(fixture.cleanup);

  await plantHumanEdit(fixture.integration);
  const before = await captureCheckout(fixture.integration);
  const disjointSha = await advanceOriginFromAnotherWriter(fixture.origin);

  const delivered = await fixture.deliverManagedExecutionIncrement({
    ...fixture.requestBase,
    workspace: fixture.execution,
    branch: "exec/story",
    previouslyPublishedBase: fixture.trunkSha,
    targetRef: trunkTarget,
    repo,
    defaultCheckout: fixture.integration,
  });

  assert.equal(delivered.ok, false);
  assert.equal(delivered.publication, "reconciled");
  assert.equal(delivered.status, "needs-validation");
  assert.equal(delivered.receipt, null);
  assert.equal(delivered.remoteTip, disjointSha);
  assert.equal(delivered.preRebaseSha, fixture.candidateSha);
  assert.notEqual(delivered.candidate, fixture.candidateSha);
  assert.equal(await lsRemoteSha(fixture.origin, trunkTarget), disjointSha);
  assert.equal(
    (
      await git(
        fixture.execution,
        "log",
        "--format=%P",
        "-1",
        delivered.candidate,
      )
    ).stdout.trim(),
    disjointSha,
  );
  assertCheckoutUnchanged(before, await captureCheckout(fixture.integration));
});

test("validated reconciled candidate pushes and attaches the exact accepted SHA", async (t) => {
  const fixture = await createManagedFixture();
  t.after(fixture.cleanup);

  await plantHumanEdit(fixture.integration);
  const before = await captureCheckout(fixture.integration);
  const disjointSha = await advanceOriginFromAnotherWriter(fixture.origin);

  const first = await fixture.deliverManagedExecutionIncrement({
    ...fixture.requestBase,
    workspace: fixture.execution,
    branch: "exec/story",
    previouslyPublishedBase: fixture.trunkSha,
    targetRef: trunkTarget,
    repo,
    defaultCheckout: fixture.integration,
  });
  assert.equal(first.status, "needs-validation");

  const delivered = await fixture.deliverManagedExecutionIncrement({
    ...fixture.requestBase,
    workspace: fixture.execution,
    branch: "exec/story",
    previouslyPublishedBase: first.remoteTip,
    validatedCandidate: first.candidate,
    targetRef: trunkTarget,
    repo,
    defaultCheckout: fixture.integration,
  });

  assert.equal(delivered.ok, true);
  assert.equal(delivered.publication, "accepted");
  assert.equal(delivered.receipt.sha, first.candidate);
  assert.notEqual(delivered.receipt.sha, fixture.candidateSha);
  assert.notEqual(delivered.receipt.sha, disjointSha);
  assert.equal(await lsRemoteSha(fixture.origin, trunkTarget), first.candidate);
  assert.equal(
    readRevisionCoverage(delivered.observation.directory)[0].sha,
    first.candidate.toLowerCase(),
  );
  assert.equal(delivered.maintenance, "deferred");
  assertCheckoutUnchanged(before, await captureCheckout(fixture.integration));

  // A later remote descendant does not erase acceptance.
  const later = await advanceOriginFromAnotherWriter(fixture.origin, {
    file: "later-descendant.txt",
    body: "later\n",
    message: "later remote descendant",
  });
  assert.notEqual(later, delivered.receipt.sha);
  await git(fixture.execution, "fetch", "origin");
  await git(
    fixture.execution,
    "merge-base",
    "--is-ancestor",
    delivered.receipt.sha,
    "origin/main",
  );
  assert.equal(
    readRevisionCoverage(delivered.observation.directory)[0].sha,
    delivered.receipt.sha.toLowerCase(),
  );
});

test("unrelated staged, tracked, and untracked work is preserved across reconciled delivery", async (t) => {
  const fixture = await createManagedFixture();
  t.after(fixture.cleanup);

  await plantHumanEdit(fixture.integration);
  writeFileSync(
    join(fixture.integration, "integration-untracked.txt"),
    "keep\n",
  );
  writeFileSync(join(fixture.execution, "exec-untracked.txt"), "exec keep\n");
  const before = await captureCheckout(fixture.integration);
  await advanceOriginFromAnotherWriter(fixture.origin);

  const delivered = await fixture.deliverManagedExecutionIncrement({
    ...fixture.requestBase,
    workspace: fixture.execution,
    branch: "exec/story",
    previouslyPublishedBase: fixture.trunkSha,
    targetRef: trunkTarget,
    repo,
    defaultCheckout: fixture.integration,
    validate: async () => ({ ok: true }),
  });

  assert.equal(delivered.ok, true);
  assertCheckoutUnchanged(before, await captureCheckout(fixture.integration));
  assert.equal(
    readFileSync(
      join(fixture.integration, "integration-untracked.txt"),
      "utf8",
    ),
    "keep\n",
  );
  assert.equal(
    readFileSync(join(fixture.execution, "exec-untracked.txt"), "utf8"),
    "exec keep\n",
  );
  assert.match(before.status, /human-staged\.txt/);
  assert.match(before.status, /human-unstaged\.txt/);
});
