// Git mechanics (not guidance-following): leave-unpublished and discard keep
// their local disposition and do not publish; an explicit keep lands through
// Dough Land (dough-land.test.mjs). Native agent evidence is not this file.
import assert from "node:assert/strict";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import {
  advanceOriginFromAnotherWriter,
  assertCheckoutUnchanged,
  captureCheckout,
  git,
  lsRemoteSha,
  maintenanceFromInspection,
  plantHumanEdit,
  revParse,
} from "../../dough-execute-plan/scripts/publication-test-fixtures.mjs";
import { closeOrRetainWorkspace } from "./dough-land-test-fixtures.mjs";
import { createPreparationFixture } from "./preparation-publication-test-fixtures.mjs";

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
