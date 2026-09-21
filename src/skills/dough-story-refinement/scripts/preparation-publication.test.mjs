// Git mechanics (not guidance-following): an explicit keep publishes the
// retained preparation record from its owned workspace. Draft, discard, and
// leave-unpublished keep that local disposition and do not publish it.
// Native agent evidence is not this file.
import assert from "node:assert/strict";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import {
  advanceOriginFromAnotherWriter,
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
  cloneFile,
  closeOrRetainWorkspace,
  createPreparationFixture,
  worktreeCount,
} from "./preparation-publication-test-fixtures.mjs";

test("a keep instruction publishes the retained record from the owned workspace while a human edit on the default checkout stays deferred", async (t) => {
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
  const disjointSha = await advanceOriginFromAnotherWriter(origin);

  await git(preparation, "fetch", "origin");
  await git(
    preparation,
    "rebase",
    "--onto",
    disjointSha,
    trunkSha,
    preparationBranch,
  );
  const rewrittenSha = await revParse(preparation, preparationBranch);
  assert.notEqual(rewrittenSha, preparationSha);
  assert.equal(
    (
      await git(
        preparation,
        "diff-tree",
        "--no-commit-id",
        "--name-only",
        "-r",
        rewrittenSha,
      )
    ).stdout.trim(),
    "seed-draft.md",
  );

  const worktreesBefore = await worktreeCount(integration);
  await pushCandidate(preparation, rewrittenSha);
  await git(preparation, "fetch", "origin");

  await assertRemoteCandidate(origin, rewrittenSha);
  assert.equal(
    await cloneFile(origin, "seed-draft.md"),
    "SEED-1: refined goal and scope\n",
  );
  assert.equal(
    (await git(origin, "log", "--format=%P", "-1", rewrittenSha)).stdout.trim(),
    disjointSha,
  );
  const after = await captureCheckout(integration);
  assertCheckoutUnchanged(before, after);
  assert.equal(after.head, trunkSha);
  assert.equal(maintenanceFromInspection(after, rewrittenSha), "deferred");
  assert.equal(await revParse(preparation, preparationBranch), rewrittenSha);

  const resources = await closeOrRetainWorkspace({
    integration,
    preparation,
    preparationBranch,
    confirmedDisposition: true,
    sessionCreated: true,
  });
  assert.equal(resources.removed, true);
  assert.equal(existsSync(preparation), false);
  assert.equal(await worktreeCount(integration), worktreesBefore - 1);
  assertCheckoutUnchanged(before, await captureCheckout(integration));
  await assertRemoteCandidate(origin, rewrittenSha);
});

test("an explicit leave-unpublished instruction does not publish and keeps the retained record in the owned workspace", async (t) => {
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
  const disjointSha = await advanceOriginFromAnotherWriter(origin);
  await git(preparation, "fetch", "origin");

  assert.equal(await lsRemoteSha(origin, "refs/heads/main"), disjointSha);
  assert.equal(await revParse(preparation, preparationBranch), preparationSha);
  assert.equal(await revParse(integration, "HEAD"), trunkSha);
  assert.equal((await git(preparation, "status", "--porcelain")).stdout, "");
  assertCheckoutUnchanged(before, await captureCheckout(integration));
  assert.notEqual(
    maintenanceFromInspection(before, disjointSha),
    "already current",
  );

  const resources = await closeOrRetainWorkspace({
    integration,
    preparation,
    preparationBranch,
    confirmedDisposition: false,
    sessionCreated: true,
  });
  assert.equal(resources.removed, false);
  assert.equal(existsSync(preparation), true);
  assert.equal(await revParse(preparation, preparationBranch), preparationSha);
});

test("discard removes the identified retained draft, leaves unrelated workspace content, and does not publish", async (t) => {
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

  writeFileSync(
    join(preparation, "other-session.md"),
    "unrelated untracked draft\n",
  );
  await git(preparation, "reset", "--keep", `${preparationSha}~1`);

  assert.equal(await revParse(preparation, preparationBranch), trunkSha);
  assert.equal(existsSync(join(preparation, "seed-draft.md")), false);
  assert.equal(
    readFileSync(join(preparation, "other-session.md"), "utf8"),
    "unrelated untracked draft\n",
  );
  assert.equal(await lsRemoteSha(origin, "refs/heads/main"), trunkSha);
  assert.equal(await revParse(integration, "HEAD"), trunkSha);
  assert.equal(existsSync(preparation), true);

  const resources = await closeOrRetainWorkspace({
    integration,
    preparation,
    preparationBranch,
    confirmedDisposition: true,
    sessionCreated: true,
  });
  assert.equal(resources.removed, false);
  assert.match(resources.reason, /not clean/);
  assert.equal(existsSync(join(preparation, "other-session.md")), true);
});

test("a reused workspace keeps unrelated committed work while only the named record is published", async (t) => {
  const {
    origin,
    integration,
    preparation,
    preparationBranch,
    preparationSha,
    cleanup,
  } = await createPreparationFixture("preparation-publication-");
  t.after(cleanup);

  writeFileSync(join(preparation, "other-story-draft.md"), "another session\n");
  await git(preparation, "add", "other-story-draft.md");
  await git(
    preparation,
    "commit",
    "-m",
    "another session's own unfinished draft",
  );
  const otherSha = await revParse(preparation, preparationBranch);

  await plantHumanEdit(integration);
  const before = await captureCheckout(integration);
  await pushCandidate(preparation, preparationSha);
  await git(preparation, "fetch", "origin");

  await assertRemoteCandidate(origin, preparationSha);
  assert.notEqual(await lsRemoteSha(origin, "refs/heads/main"), otherSha);
  assert.equal(
    await cloneFile(origin, "seed-draft.md"),
    "SEED-1: refined goal and scope\n",
  );
  assert.equal(existsSync(join(preparation, "other-story-draft.md")), true);
  assert.equal(await revParse(preparation, preparationBranch), otherSha);
  assertCheckoutUnchanged(before, await captureCheckout(integration));

  const resources = await closeOrRetainWorkspace({
    integration,
    preparation,
    preparationBranch,
    confirmedDisposition: true,
    sessionCreated: false,
  });
  assert.equal(resources.removed, false);
  assert.match(resources.reason, /reused or host-owned/);
  assert.equal(await revParse(preparation, preparationBranch), otherSha);
});
