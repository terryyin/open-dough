// Retain the comparison before every real push, including a racing retry.
// These tests consume the pair with Git, rather than trusting fields alone.
import assert from "node:assert/strict";
import { test } from "node:test";
import { publishExecutionIncrement } from "./execution-increment-publication.mjs";
import {
  advanceOriginFromAnotherWriter,
  assertCheckoutUnchanged,
  captureCheckout,
  createCleanTrunkFixture,
  git,
  lsRemoteSha,
} from "./publication-test-fixtures.mjs";

const targetRef = "refs/heads/main";

async function changedPaths(workspace, { suffixBase, candidate }) {
  return (
    await git(workspace, "diff", "--name-only", suffixBase, candidate)
  ).stdout
    .trim()
    .split("\n")
    .filter(Boolean);
}

test("an unchanged suffix is retained before its push and matches the accepted comparison", async (t) => {
  const fixture = await createCleanTrunkFixture();
  t.after(fixture.cleanup);
  const retained = [];
  const published = await publishExecutionIncrement({
    workspace: fixture.execution,
    branch: "exec/story",
    previouslyPublishedBase: fixture.trunkSha,
    targetRef,
    beforePush: async (comparison) => {
      assert.equal(
        await lsRemoteSha(fixture.origin, targetRef),
        fixture.trunkSha,
      );
      assert.deepEqual(await changedPaths(fixture.execution, comparison), [
        "increment.txt",
      ]);
      retained.push(comparison);
    },
  });
  assert.equal(published.ok, true);
  assert.deepEqual(retained, [
    {
      attempt: 0,
      candidate: published.receipt.sha,
      suffixBase: published.suffixBase,
    },
  ]);
  assert.equal(published.suffixBase, fixture.trunkSha);
});

test("a racing retry retains the rewritten candidate and its new base before the second push", async (t) => {
  const fixture = await createCleanTrunkFixture();
  t.after(fixture.cleanup);
  const before = await captureCheckout(fixture.integration);
  const retained = [];
  const validated = [];
  let racingTip;
  const published = await publishExecutionIncrement({
    workspace: fixture.execution,
    branch: "exec/story",
    previouslyPublishedBase: fixture.trunkSha,
    targetRef,
    validate: async (candidate, context) => {
      validated.push({ candidate, suffixBase: context.suffixBase });
      return { ok: true };
    },
    beforePush: async (comparison) => {
      retained.push(comparison);
      assert.deepEqual(await changedPaths(fixture.execution, comparison), [
        "increment.txt",
      ]);
      if (comparison.attempt === 0) {
        assert.equal(
          await lsRemoteSha(fixture.origin, targetRef),
          fixture.trunkSha,
        );
        racingTip = await advanceOriginFromAnotherWriter(fixture.origin);
      } else {
        assert.equal(await lsRemoteSha(fixture.origin, targetRef), racingTip);
      }
    },
  });
  assert.equal(published.ok, true);
  assert.equal(published.reconciliations, 1);
  assert.deepEqual(retained, [
    {
      attempt: 0,
      candidate: fixture.candidateSha,
      suffixBase: fixture.trunkSha,
    },
    { attempt: 1, candidate: published.receipt.sha, suffixBase: racingTip },
  ]);
  assert.deepEqual(validated, [
    { candidate: published.receipt.sha, suffixBase: racingTip },
  ]);
  assert.equal(published.suffixBase, racingTip);
  assert.notEqual(published.receipt.sha, fixture.candidateSha);
  assert.equal(
    await lsRemoteSha(fixture.origin, targetRef),
    published.receipt.sha,
  );
  assertCheckoutUnchanged(before, await captureCheckout(fixture.integration));
});
