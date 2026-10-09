// Optional retained comparisons cannot alter publication acceptance or infer
// a historical base for legacy callers. Invalid pairs stop before side effects.
import assert from "node:assert/strict";
import { test } from "node:test";
import { resumeInterruptedPublication } from "./publication-resume.mjs";
import {
  advanceOriginFromAnotherWriter,
  assertCheckoutUnchanged,
  captureCheckout,
  createCleanTrunkFixture,
  git,
  lsRemoteSha,
  revParse,
} from "./publication-test-fixtures.mjs";

const targetRef = "refs/heads/main";

test("an interrupted candidate retains its comparison through its first accepted push", async (t) => {
  const fixture = await createCleanTrunkFixture();
  t.after(fixture.cleanup);
  const published = await resumeInterruptedPublication({
    ownedWorkspace: fixture.execution,
    candidateSha: fixture.candidateSha,
    suffixBase: fixture.trunkSha,
    publishedRevisions: [],
  });
  assert.equal(published.pushCount, 1);
  assert.equal(published.suffixBase, fixture.trunkSha);
  assert.equal(
    await lsRemoteSha(fixture.origin, targetRef),
    published.acceptedSha,
  );
  assert.deepEqual(
    (
      await git(
        fixture.execution,
        "diff",
        "--name-only",
        published.suffixBase,
        published.acceptedSha,
      )
    ).stdout
      .trim()
      .split("\n"),
    ["increment.txt"],
  );
});

test("a retained empty comparison is valid when its two commits are equal", async (t) => {
  const fixture = await createCleanTrunkFixture();
  t.after(fixture.cleanup);
  const published = await resumeInterruptedPublication({
    ownedWorkspace: fixture.execution,
    candidateSha: fixture.trunkSha,
    suffixBase: fixture.trunkSha,
    publishedRevisions: [],
  });
  assert.equal(published.classification, "already-published");
  assert.equal(published.pushCount, 0);
  assert.equal(published.suffixBase, fixture.trunkSha);
  assert.equal(
    (
      await git(
        fixture.execution,
        "diff",
        "--name-only",
        published.suffixBase,
        published.acceptedSha,
      )
    ).stdout,
    "",
  );
});

test("non-commit, moving, missing and unrelated retained comparison ends stop before fetch, push or registration", async (t) => {
  const fixture = await createCleanTrunkFixture();
  t.after(fixture.cleanup);
  const otherWriter = await advanceOriginFromAnotherWriter(fixture.origin);
  await git(fixture.execution, "fetch", "origin");
  const tree = await revParse(fixture.execution, `${fixture.trunkSha}^{tree}`);
  const refsBefore = (await git(fixture.execution, "for-each-ref")).stdout;
  const checkoutBefore = await captureCheckout(fixture.execution);
  const publishedRevisions = [];
  const receipts = [];
  const attempts = [];
  // Leave another advance unfetched; invalid requests must not fetch it.
  const latestWriter = await advanceOriginFromAnotherWriter(fixture.origin, {
    file: "latest-writer.txt",
  });
  for (const comparison of [
    { candidateSha: fixture.candidateSha, suffixBase: tree },
    { candidateSha: tree, suffixBase: fixture.trunkSha },
    { candidateSha: fixture.candidateSha, suffixBase: "HEAD" },
    { candidateSha: fixture.candidateSha, suffixBase: "0".repeat(40) },
    { candidateSha: fixture.candidateSha, suffixBase: otherWriter },
  ]) {
    await assert.rejects(
      resumeInterruptedPublication({
        ownedWorkspace: fixture.execution,
        ...comparison,
        publishedRevisions,
        observer: {
          bound: true,
          receipts,
          register: (...receipt) => receipts.push(receipt),
        },
        onFetchedTarget: () => {
          attempts.push("fetched");
        },
      }),
    );
    assert.deepEqual(publishedRevisions, []);
    assert.deepEqual(receipts, []);
    assert.deepEqual(attempts, []);
    assert.equal(
      (await git(fixture.execution, "for-each-ref")).stdout,
      refsBefore,
    );
    assert.equal(await lsRemoteSha(fixture.origin, targetRef), latestWriter);
    assertCheckoutUnchanged(
      checkoutBefore,
      await captureCheckout(fixture.execution),
    );
  }
});
