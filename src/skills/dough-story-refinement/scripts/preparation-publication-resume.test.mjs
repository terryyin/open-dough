// Git mechanics (not guidance-following): resume classifies a retained
// preparation candidate from the fetched remote. An unpublished candidate is
// pushed once from the owned workspace. A candidate the remote never
// accepted does not remove the workspace. Native agent evidence is not this
// file.
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { test } from "node:test";
import {
  assertCheckoutUnchanged,
  assertRemoteCandidate,
  captureCheckout,
  git,
  lsRemoteSha,
  maintenanceFromInspection,
  plantHumanEdit,
  pushCandidate,
  revParse,
} from "../../dough-execute-plan/scripts/publication-test-fixtures.mjs";
import {
  closeOrRetainWorkspace,
  createPreparationFixture,
  worktreeCount,
} from "./preparation-publication-test-fixtures.mjs";

test("resume pushes a candidate that is not on the remote yet, without a second commit or a change to the human edit", async (t) => {
  const {
    origin,
    integration,
    preparation,
    preparationBranch,
    preparationSha,
    cleanup,
  } = await createPreparationFixture("preparation-publication-");
  t.after(cleanup);

  await plantHumanEdit(integration);
  const before = await captureCheckout(integration);
  const worktreesBefore = await worktreeCount(integration);

  await git(preparation, "fetch", "origin");
  assert.notEqual(await lsRemoteSha(origin, "refs/heads/main"), preparationSha);
  await pushCandidate(preparation, preparationSha);
  await git(preparation, "fetch", "origin");

  await assertRemoteCandidate(origin, preparationSha);
  assert.equal(await revParse(preparation, "origin/main"), preparationSha);
  assert.equal(await revParse(preparation, preparationBranch), preparationSha);
  assert.equal(await worktreeCount(integration), worktreesBefore);
  assertCheckoutUnchanged(before, await captureCheckout(integration));
  assert.equal(
    maintenanceFromInspection(
      await captureCheckout(integration),
      preparationSha,
    ),
    "deferred",
  );
});

test("an interrupted keep that never reached the remote does not remove the workspace", async (t) => {
  const {
    origin,
    integration,
    preparation,
    preparationBranch,
    trunkSha,
    preparationSha,
    cleanup,
  } = await createPreparationFixture("preparation-publication-");
  t.after(cleanup);

  await plantHumanEdit(integration);
  const before = await captureCheckout(integration);
  const resources = await closeOrRetainWorkspace({
    integration,
    preparation,
    preparationBranch,
    confirmedDisposition: false,
    sessionCreated: true,
  });

  assert.equal(resources.removed, false);
  assert.match(resources.reason, /no confirmed disposition/);
  assert.equal(existsSync(preparation), true);
  assert.equal(await revParse(preparation, preparationBranch), preparationSha);
  assert.equal(await lsRemoteSha(origin, "refs/heads/main"), trunkSha);
  assertCheckoutUnchanged(before, await captureCheckout(integration));
});
