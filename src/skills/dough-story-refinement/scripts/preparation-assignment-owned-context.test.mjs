// Preparation with no default checkout: the production `start` command
// announces from an owned worktree of a repository that has no default
// working tree, the draft is written there and continued, and its release is
// staged beside it; local refresh is not applicable.
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { ownedWorktreeOnly } from "../../dough-execute-plan/scripts/default-checkout-test-fixtures.mjs";
import {
  abandonLostPreparation,
  createPreparationTrunk,
  git,
  identityC,
  lsRemoteSha,
  profileOf,
  read,
  refineStoryC,
  releasePreparation,
  remoteProfileNames,
  revParse,
  seedC,
  startPreparation,
} from "./preparation-assignment-test-fixtures.mjs";

test("an owned worktree without a default checkout announces preparation, continues its draft, and stages its release", async (t) => {
  const created = await createPreparationTrunk();
  t.after(created.cleanup);
  const owned = await ownedWorktreeOnly(created, "prep-c", "prep/c");
  const trunk = { ...created, integration: null };
  const { workspace } = owned;

  const absent = join(created.fixture, "prep-absent");
  const missing = await startPreparation(trunk, absent, identityC, [
    "--branch",
    "prep/absent",
  ]);
  assert.equal(missing.receipt.status, "invalid-request");
  assert.match(missing.receipt.error, /--integration/);
  assert.equal(existsSync(absent), false);
  const lost = await abandonLostPreparation(trunk, profileOf("Yui"));
  assert.equal(lost.receipt.status, "invalid-request");
  assert.match(lost.receipt.error, /missing integration/);

  const { code, receipt } = await startPreparation(trunk, workspace, identityC);
  assert.equal(code, 0, JSON.stringify(receipt));
  assert.equal(receipt.status, "announced");
  assert.equal(receipt.selection, undefined);
  assert.deepEqual(receipt.refresh, { result: "not applicable" });
  const announced = receipt.publishedSha;
  assert.equal(await lsRemoteSha(created.origin, "refs/heads/main"), announced);
  assert.equal(
    await revParse(created.origin, `${announced}^`),
    created.trunkSha,
  );
  assert.equal(await revParse(workspace, "HEAD"), announced);
  assert.deepEqual(await remoteProfileNames(created), [profileOf("Yui")]);

  refineStoryC(workspace);
  const draft = read(workspace, seedC);
  const resumed = await startPreparation(trunk, workspace, identityC);
  assert.equal(resumed.receipt.status, "continued", JSON.stringify(resumed));
  assert.equal(resumed.receipt.allocation, announced);
  assert.equal(read(workspace, seedC), draft);

  const release = await releasePreparation(workspace, identityC);
  assert.equal(release.receipt.status, "release-staged");
  assert.equal(
    (await git(workspace, "diff", "--cached", "--name-status")).stdout,
    `D\t${profileOf("Yui")}\n`,
  );
  assert.equal(read(workspace, seedC), draft);
  assert.equal(await lsRemoteSha(created.origin, "refs/heads/main"), announced);
});
