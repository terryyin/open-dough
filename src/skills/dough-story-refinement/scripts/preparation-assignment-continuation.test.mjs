// The retained-start command validates the existing assignment through the
// real CLI/Git owner. It cannot fall through into workspace creation or a new
// announcement when the caller's retained evidence is missing or inconsistent.
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { test } from "node:test";
import {
  continuePreparation,
  createPreparationTrunk,
  createWorkspace,
  git,
  identityC,
  lsRemoteSha,
  profileOf,
  refineStoryC,
  remoteFile,
  remoteProfileNames,
  revParse,
  seedC,
  startPreparation,
} from "./preparation-assignment-test-fixtures.mjs";
import { snapshot } from "./preparation-assignment-recovery-fixtures.mjs";

test("retained continuation requires its branch, published allocation and agent, preserving draft and assignment on every refusal", async (t) => {
  const trunk = await createPreparationTrunk();
  t.after(trunk.cleanup);
  const { workspace, branch } = await createWorkspace(trunk, "retained");
  const { receipt: announced } = await startPreparation(
    trunk,
    workspace,
    identityC,
  );
  assert.equal(announced.status, "announced");
  const allocation = announced.allocation;
  const profile = profileOf("Yui");
  const bytes = await remoteFile(trunk, "main", profile);
  refineStoryC(workspace);
  const before = await snapshot(workspace, [seedC, profile]);
  const flags = [
    "--branch",
    branch,
    "--expected-agent",
    announced.agent,
    "--expected-allocation",
    allocation,
  ];
  const continued = await continuePreparation(
    trunk,
    workspace,
    identityC,
    flags,
  );
  assert.equal(
    continued.receipt.status,
    "continued",
    JSON.stringify(continued),
  );
  assert.equal(continued.receipt.allocation, allocation);
  for (const wrong of [
    ["--branch", "prep/other"],
    ["--branch", branch, "--expected-agent", "Akiho-chan"],
    ["--branch", branch, "--expected-allocation", `${allocation}^`],
  ]) {
    const stopped = await continuePreparation(
      trunk,
      workspace,
      identityC,
      wrong,
    );
    assert.equal(stopped.code, 1);
    assert.equal(
      stopped.receipt.status,
      "continuation-refused",
      JSON.stringify(stopped),
    );
    assert.deepEqual(await snapshot(workspace, [seedC, profile]), before);
    assert.equal(
      await revParse(workspace, "refs/worktree/dough/preparation-assignment"),
      allocation,
    );
    assert.equal(
      await lsRemoteSha(trunk.origin, "refs/heads/main"),
      allocation,
    );
    assert.equal(await remoteFile(trunk, "main", profile), bytes);
  }
  // A real allocation whose announcement is absent from remote history is
  // uncertain, not permission to drop it and announce another name.
  await git(trunk.origin, "update-ref", "refs/heads/main", `${allocation}^`);
  const remote = await revParse(trunk.origin, "main");
  const uncertain = await continuePreparation(
    trunk,
    workspace,
    identityC,
    flags,
  );
  assert.equal(uncertain.receipt.status, "continuation-refused");
  assert.deepEqual(await snapshot(workspace, [seedC, profile]), before);
  assert.equal(
    await revParse(workspace, "refs/worktree/dough/preparation-assignment"),
    allocation,
  );
  assert.equal(await lsRemoteSha(trunk.origin, "refs/heads/main"), remote);
  assert.deepEqual(await remoteProfileNames(trunk), []);
});

test("retained continuation never recreates a missing workspace or branch", async (t) => {
  const trunk = await createPreparationTrunk();
  t.after(trunk.cleanup);
  const { workspace, branch } = await createWorkspace(trunk, "missing");
  const { receipt: announced } = await startPreparation(
    trunk,
    workspace,
    identityC,
  );
  assert.equal(announced.status, "announced");
  const profile = profileOf("Yui");
  const bytes = await remoteFile(trunk, "main", profile);
  await git(trunk.integration, "worktree", "remove", workspace);
  await git(trunk.integration, "branch", "-d", branch);
  const worktrees = (
    await git(trunk.integration, "worktree", "list", "--porcelain")
  ).stdout;
  const branches = (
    await git(
      trunk.integration,
      "for-each-ref",
      "--format=%(refname) %(objectname)",
      "refs/heads/",
    )
  ).stdout;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const stopped = await continuePreparation(trunk, workspace, identityC, [
      "--branch",
      branch,
      "--expected-allocation",
      announced.allocation,
      "--expected-agent",
      announced.agent,
    ]);
    assert.equal(stopped.code, 1);
    assert.equal(stopped.receipt.status, "continuation-refused");
    assert.equal(existsSync(workspace), false);
    assert.equal(
      (await git(trunk.integration, "worktree", "list", "--porcelain")).stdout,
      worktrees,
    );
    assert.equal(
      (
        await git(
          trunk.integration,
          "for-each-ref",
          "--format=%(refname) %(objectname)",
          "refs/heads/",
        )
      ).stdout,
      branches,
    );
    assert.equal(
      await lsRemoteSha(trunk.origin, "refs/heads/main"),
      announced.allocation,
    );
    assert.equal(await remoteFile(trunk, "main", profile), bytes);
  }
});
