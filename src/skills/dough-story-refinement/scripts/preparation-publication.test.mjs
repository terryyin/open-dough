// Git mechanics (not guidance-following): leave-unpublished keeps its local
// disposition and does not publish; an explicit keep lands through Dough Land
// (dough-land.test.mjs). Native agent evidence is not this file.
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
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
