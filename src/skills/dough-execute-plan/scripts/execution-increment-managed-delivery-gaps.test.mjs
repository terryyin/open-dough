// Managed delivery authority, coverage-gap, and racing-remote cases.
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { test } from "node:test";
import {
  advanceOriginFromAnotherWriter,
  lsRemoteSha,
} from "./publication-test-fixtures.mjs";
import { readRevisionCoverage } from "./ci-mailbox.mjs";
import {
  createManagedFixture,
  git,
} from "./execution-increment-managed-delivery-test-fixtures.mjs";

const trunkTarget = "refs/heads/main";
const repo = "owner/project";

test("an unavailable host bridge reports unobserved coverage and preserves acceptance", async (t) => {
  const fixture = await createManagedFixture();
  t.after(fixture.cleanup);

  const delivered = await fixture.deliverManagedExecutionIncrement({
    ...fixture.requestBase,
    session: null,
    workspace: fixture.execution,
    branch: "exec/story",
    previouslyPublishedBase: fixture.trunkSha,
    targetRef: trunkTarget,
    repo,
  });

  assert.equal(delivered.ok, true);
  assert.equal(delivered.publication, "accepted");
  assert.equal(delivered.observation.state, "unobserved");
  assert.equal(delivered.observation.pendingCi, "unobserved");
  assert.equal(delivered.observation.directory, undefined);
  assert.equal(
    await lsRemoteSha(fixture.origin, trunkTarget),
    delivered.receipt.sha,
  );
  assert.equal(existsSync(fixture.storage), false);
});

test("local-only authority does not push", async (t) => {
  const fixture = await createManagedFixture();
  t.after(fixture.cleanup);
  const before = await lsRemoteSha(fixture.origin, trunkTarget);

  const delivered = await fixture.deliverManagedExecutionIncrement({
    ...fixture.requestBase,
    authority: "local-only",
    workspace: fixture.execution,
    branch: "exec/story",
    previouslyPublishedBase: fixture.trunkSha,
    targetRef: trunkTarget,
    repo,
  });

  assert.equal(delivered.publication, "pending");
  assert.equal(delivered.receipt, null);
  assert.equal(delivered.observation, null);
  assert.equal(await lsRemoteSha(fixture.origin, trunkTarget), before);
  assert.equal(existsSync(fixture.storage), false);
});

test("managed delivery still reconciles a racing remote tip before acceptance", async (t) => {
  const fixture = await createManagedFixture();
  t.after(async () => {
    await fixture.stopObserver(fixture.observerDirectory);
    fixture.cleanup();
  });

  const disjointSha = await advanceOriginFromAnotherWriter(fixture.origin);
  const delivered = await fixture.deliverManagedExecutionIncrement({
    ...fixture.requestBase,
    workspace: fixture.execution,
    branch: "exec/story",
    previouslyPublishedBase: fixture.trunkSha,
    targetRef: trunkTarget,
    repo,
  });
  fixture.observerDirectory = delivered.observation.directory;

  assert.notEqual(delivered.receipt.sha, fixture.candidateSha);
  assert.equal(
    await lsRemoteSha(fixture.origin, trunkTarget),
    delivered.receipt.sha,
  );
  assert.equal(
    (
      await git(
        fixture.execution,
        "log",
        "--format=%P",
        "-1",
        delivered.receipt.sha,
      )
    ).stdout.trim(),
    disjointSha,
  );
  assert.equal(
    readRevisionCoverage(delivered.observation.directory)[0].sha,
    delivered.receipt.sha.toLowerCase(),
  );
});
