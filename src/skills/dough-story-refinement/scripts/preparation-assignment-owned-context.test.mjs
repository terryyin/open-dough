// Preparation with no default checkout: the production `start` command
// announces from an owned worktree of a repository that has no default
// working tree, or creates a new owned workspace at fetched trunk from that
// worktree or the repository's Git directory; the draft is written there and
// continued, and its release is staged beside it; local refresh is not
// applicable. A reused worktree that trunk moved past is fast-forwarded
// first, and one with an ongoing Git operation is not announced from.
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { ownedWorktreeOnly } from "../../dough-execute-plan/scripts/default-checkout-test-fixtures.mjs";
import {
  advanceOriginFromAnotherWriter,
  captureCheckout,
  exec,
} from "../../dough-execute-plan/scripts/publication-test-fixtures.mjs";
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
  assert.match(missing.receipt.error, /--repository/);
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

for (const context of ["workspace", "repository"])
  test(`the owned ${context === "workspace" ? "worktree" : "Git directory"} alone creates a new preparation workspace at fetched trunk and continues its draft`, async (t) => {
    const created = await createPreparationTrunk();
    t.after(created.cleanup);
    const owned = await ownedWorktreeOnly(created, "prep-kept", "prep/kept");
    const trunk = { ...created, integration: null };
    const fetched = await advanceOriginFromAnotherWriter(created.origin);
    const retained = await captureCheckout(owned.workspace);
    const workspace = join(created.fixture, "prep-fresh");
    const branch = "prep/fresh";

    const { code, receipt } = await startPreparation(
      trunk,
      workspace,
      identityC,
      ["--branch", branch, "--repository", owned[context]],
    );
    assert.equal(code, 0, JSON.stringify(receipt));
    assert.equal(receipt.status, "announced");
    assert.deepEqual(receipt.selection, {
      created: true,
      branch,
      startingRevision: fetched,
    });
    assert.deepEqual(receipt.refresh, { result: "not applicable" });
    const announced = receipt.publishedSha;
    assert.equal(
      await lsRemoteSha(created.origin, "refs/heads/main"),
      announced,
    );
    assert.equal(await revParse(created.origin, `${announced}^`), fetched);
    assert.equal(await revParse(workspace, "HEAD"), announced);
    assert.deepEqual(await captureCheckout(owned.workspace), retained);

    refineStoryC(workspace);
    const draft = read(workspace, seedC);
    const resumed = await startPreparation(trunk, workspace, identityC);
    assert.equal(resumed.receipt.status, "continued", JSON.stringify(resumed));
    assert.equal(resumed.receipt.allocation, announced);
    assert.equal(resumed.receipt.selection, undefined);
    assert.equal(read(workspace, seedC), draft);
    assert.equal(
      await lsRemoteSha(created.origin, "refs/heads/main"),
      announced,
    );
    assert.deepEqual(await captureCheckout(owned.workspace), retained);
  });

test("a clean owned worktree that trunk moved past is fast-forwarded, announced on the advanced tip, and continues its draft", async (t) => {
  const created = await createPreparationTrunk();
  t.after(created.cleanup);
  const owned = await ownedWorktreeOnly(created, "prep-behind", "prep/behind");
  const trunk = { ...created, integration: null };
  const { workspace } = owned;
  const advanced = await advanceOriginFromAnotherWriter(created.origin);

  const { code, receipt } = await startPreparation(trunk, workspace, identityC);
  assert.equal(code, 0, JSON.stringify(receipt));
  assert.equal(receipt.status, "announced");
  const announced = receipt.publishedSha;
  assert.equal(await lsRemoteSha(created.origin, "refs/heads/main"), announced);
  assert.equal(await revParse(created.origin, `${announced}^`), advanced);
  assert.equal(await revParse(workspace, "HEAD"), announced);
  assert.equal(
    (await git(workspace, "branch", "--show-current")).stdout.trim(),
    owned.branch,
  );

  refineStoryC(workspace);
  const draft = read(workspace, seedC);
  const resumed = await startPreparation(trunk, workspace, identityC);
  assert.equal(resumed.receipt.status, "continued", JSON.stringify(resumed));
  assert.equal(resumed.receipt.allocation, announced);
  assert.equal(read(workspace, seedC), draft);
});

test("an owned worktree stopped mid-rebase is not announced from, and its rebase is preserved", async (t) => {
  const created = await createPreparationTrunk();
  t.after(created.cleanup);
  const owned = await ownedWorktreeOnly(created, "prep-rebase", "prep/rebase");
  const trunk = { ...created, integration: null };
  const { workspace } = owned;
  await exec(
    "git",
    ["-c", "sequence.editor=echo break >", "rebase", "-q", "-i", "HEAD"],
    { cwd: workspace },
  );
  const rebaseState = (
    await git(
      workspace,
      "rev-parse",
      "--path-format=absolute",
      "--git-path",
      "rebase-merge",
    )
  ).stdout.trim();
  assert.equal(existsSync(rebaseState), true);
  const advanced = await advanceOriginFromAnotherWriter(created.origin);
  const before = await captureCheckout(workspace);

  const { code, receipt } = await startPreparation(trunk, workspace, identityC);
  assert.equal(code, 1, JSON.stringify(receipt));
  assert.equal(receipt.status, "workspace-not-isolated");
  assert.match(receipt.error, /ongoing-operation/);
  assert.equal(await lsRemoteSha(created.origin, "refs/heads/main"), advanced);
  assert.deepEqual(await remoteProfileNames(created), []);
  assert.deepEqual(await captureCheckout(workspace), before);
  assert.equal(existsSync(rebaseState), true);
});
